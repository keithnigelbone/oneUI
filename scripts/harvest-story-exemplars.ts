#!/usr/bin/env node
/**
 * harvest-story-exemplars.ts
 *
 * Walks every *.stories.tsx in packages/ui and emits a flat
 * StoryExemplar[] array to packages/shared/src/meta/storyExemplars.generated.ts.
 *
 * Each exemplar teaches the Design Composition Agent how a component is
 * actually *used*: variant + slot composition, not just its prop signature.
 *
 * Extraction strategy (ts-morph):
 *   1. Read each stories.tsx SourceFile.
 *   2. Infer the component name from the default export's `title` property
 *      (falls back to the filename).
 *   3. For every named export whose initializer is an ObjectLiteral, treat
 *      it as a story. Pull: args (object literal), render (arrow body
 *      source), name override, tags array, parameters.docs.description.story.
 *   4. Filter: opt-in via `tags: ['exemplar']` on the story or on Meta;
 *      otherwise heuristic name match (Default | Basic | Primary | Example
 *      | *Composition* | *Showcase* | Playground).
 *   5. Emit StoryExemplar[] with stable sort order.
 *
 * Non-goals: type-safe evaluation of `render` bodies, cross-file stitching
 * of shared render helpers. If a story's render function references an
 * external helper, the helper name survives in the source string and is
 * still useful to the LLM as a hint.
 *
 * Run: `pnpm harvest:exemplars`. CI gate (future) diffs the generated
 * file — drift means authors added stories without re-running the harvest.
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project, SyntaxKind, Node, type ObjectLiteralExpression } from 'ts-morph';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const STORIES_GLOB = 'packages/ui/src/components/**/*.stories.tsx';
const OUT_PATH = resolve(REPO_ROOT, 'packages/shared/src/meta/storyExemplars.generated.ts');

const NAME_HEURISTIC = /^(Default|Basic|Primary|Example|Playground)$|Composition|Showcase/;

interface StoryExemplar {
  component: string;
  storyName: string;
  description?: string;
  args?: Record<string, unknown>;
  renderSource?: string;
  tags?: string[];
  sourceFile: string;
}

// ---------------------------------------------------------------------------
// Object literal → plain JSON (best-effort)
// ---------------------------------------------------------------------------

function objectLiteralToJSON(obj: ObjectLiteralExpression): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const prop of obj.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) continue;
    const nameNode = prop.getNameNode();
    const key = Node.isIdentifier(nameNode) || Node.isStringLiteral(nameNode)
      ? nameNode.getText().replace(/^['"]|['"]$/g, '')
      : nameNode.getText();
    const init = prop.getInitializer();
    if (!init) continue;
    out[key] = nodeToValue(init);
  }
  return out;
}

function nodeToValue(n: Node): unknown {
  if (Node.isStringLiteral(n) || Node.isNoSubstitutionTemplateLiteral(n)) {
    return n.getLiteralText();
  }
  if (Node.isNumericLiteral(n)) return Number(n.getText());
  if (n.getKind() === SyntaxKind.TrueKeyword) return true;
  if (n.getKind() === SyntaxKind.FalseKeyword) return false;
  if (n.getKind() === SyntaxKind.NullKeyword) return null;
  if (Node.isObjectLiteralExpression(n)) return objectLiteralToJSON(n);
  if (Node.isArrayLiteralExpression(n)) {
    return n.getElements().map(nodeToValue);
  }
  // JSX, spread, function expressions etc. — preserve as source text so the
  // LLM can read it literally. Prefixed with `__raw__:` so callers can
  // distinguish from legitimate strings.
  return `__raw__:${n.getText()}`;
}

// ---------------------------------------------------------------------------
// Component name from Meta's `title` field
// ---------------------------------------------------------------------------

function inferComponentFromMeta(meta: ObjectLiteralExpression | null, filename: string): string {
  if (meta) {
    const titleProp = meta.getProperty('title');
    if (titleProp && Node.isPropertyAssignment(titleProp)) {
      const v = titleProp.getInitializer();
      if (v && (Node.isStringLiteral(v) || Node.isNoSubstitutionTemplateLiteral(v))) {
        const title = v.getLiteralText();
        const tail = title.split('/').pop();
        if (tail) return tail;
      }
    }
    // Fallback: `component` property
    const compProp = meta.getProperty('component');
    if (compProp && Node.isPropertyAssignment(compProp)) {
      const v = compProp.getInitializer();
      if (v && Node.isIdentifier(v)) return v.getText();
    }
  }
  return basename(filename).replace(/\.stories\.tsx$/, '');
}

// ---------------------------------------------------------------------------
// Per-file extraction
// ---------------------------------------------------------------------------

function extractFromFile(filePath: string, project: Project): StoryExemplar[] {
  const sf = project.addSourceFileAtPath(filePath);
  let metaLiteral: ObjectLiteralExpression | null = null;
  let metaTags: string[] | undefined;

  // Locate default export (`export default ...`) — may be a variable ref or
  // an inline object literal.
  for (const ed of sf.getExportAssignments()) {
    const expr = ed.getExpression();
    if (Node.isObjectLiteralExpression(expr)) {
      metaLiteral = expr;
    } else if (Node.isIdentifier(expr)) {
      const decl = sf.getVariableDeclaration(expr.getText());
      const init = decl?.getInitializer();
      if (init && Node.isObjectLiteralExpression(init)) {
        metaLiteral = init;
      } else if (init && Node.isAsExpression(init)) {
        // `const meta = { ... } satisfies Meta<...>` or `as Meta<...>`
        const inner = init.getExpression();
        if (Node.isObjectLiteralExpression(inner)) metaLiteral = inner;
      }
    }
    break;
  }

  // Pull `tags` from meta if present
  if (metaLiteral) {
    const tagsProp = metaLiteral.getProperty('tags');
    if (tagsProp && Node.isPropertyAssignment(tagsProp)) {
      const v = tagsProp.getInitializer();
      if (v && Node.isArrayLiteralExpression(v)) {
        metaTags = v.getElements()
          .map((e) => (Node.isStringLiteral(e) ? e.getLiteralText() : null))
          .filter((x): x is string => Boolean(x));
      }
    }
  }

  const component = inferComponentFromMeta(metaLiteral, filePath);
  const out: StoryExemplar[] = [];

  // Walk named exports — only const declarations with object-literal (or
  // satisfies) initializers qualify as stories.
  for (const decl of sf.getVariableDeclarations()) {
    if (!decl.isExported()) continue;
    if (decl.getName() === 'meta') continue;
    let init = decl.getInitializer();
    if (!init) continue;
    if (Node.isAsExpression(init) || Node.isSatisfiesExpression(init)) {
      init = init.getExpression();
    }
    if (!Node.isObjectLiteralExpression(init)) continue;

    const storyExportName = decl.getName();
    const obj = init;

    // storyName override
    let storyName = storyExportName;
    const nameProp = obj.getProperty('name');
    if (nameProp && Node.isPropertyAssignment(nameProp)) {
      const v = nameProp.getInitializer();
      if (v && (Node.isStringLiteral(v) || Node.isNoSubstitutionTemplateLiteral(v))) {
        storyName = v.getLiteralText();
      }
    }

    // tags
    let storyTags: string[] | undefined;
    const tagsProp = obj.getProperty('tags');
    if (tagsProp && Node.isPropertyAssignment(tagsProp)) {
      const v = tagsProp.getInitializer();
      if (v && Node.isArrayLiteralExpression(v)) {
        storyTags = v.getElements()
          .map((e) => (Node.isStringLiteral(e) ? e.getLiteralText() : null))
          .filter((x): x is string => Boolean(x));
      }
    }
    const effectiveTags = [...(metaTags ?? []), ...(storyTags ?? [])];

    // Opt-in filter — 'exemplar' tag OR heuristic name match. Everything
    // else is skipped so the generated file stays focused.
    const optedIn =
      effectiveTags.includes('exemplar') || NAME_HEURISTIC.test(storyName);
    if (!optedIn) continue;

    // args
    let args: Record<string, unknown> | undefined;
    const argsProp = obj.getProperty('args');
    if (argsProp && Node.isPropertyAssignment(argsProp)) {
      const v = argsProp.getInitializer();
      if (v && Node.isObjectLiteralExpression(v)) {
        args = objectLiteralToJSON(v);
      }
    }

    // render function body (source text, not evaluated)
    let renderSource: string | undefined;
    const renderProp = obj.getProperty('render');
    if (renderProp && Node.isPropertyAssignment(renderProp)) {
      const v = renderProp.getInitializer();
      if (v) renderSource = v.getText();
    }

    // description: parameters.docs.description.story
    let description: string | undefined;
    const paramsProp = obj.getProperty('parameters');
    if (paramsProp && Node.isPropertyAssignment(paramsProp)) {
      const pInit = paramsProp.getInitializer();
      if (pInit && Node.isObjectLiteralExpression(pInit)) {
        const docsProp = pInit.getProperty('docs');
        if (docsProp && Node.isPropertyAssignment(docsProp)) {
          const dInit = docsProp.getInitializer();
          if (dInit && Node.isObjectLiteralExpression(dInit)) {
            const descProp = dInit.getProperty('description');
            if (descProp && Node.isPropertyAssignment(descProp)) {
              const descInit = descProp.getInitializer();
              if (descInit && Node.isObjectLiteralExpression(descInit)) {
                const storyDescProp = descInit.getProperty('story');
                if (storyDescProp && Node.isPropertyAssignment(storyDescProp)) {
                  const sv = storyDescProp.getInitializer();
                  if (sv && (Node.isStringLiteral(sv) || Node.isNoSubstitutionTemplateLiteral(sv))) {
                    description = sv.getLiteralText();
                  }
                }
              }
            }
          }
        }
      }
    }

    out.push({
      component,
      storyName,
      description,
      args,
      renderSource: renderSource?.slice(0, 2000), // hard cap per-exemplar
      tags: effectiveTags.length > 0 ? effectiveTags : undefined,
      sourceFile: filePath.replace(REPO_ROOT + '/', ''),
    });
  }

  // Clean up so ts-morph doesn't accumulate state across many files
  project.removeSourceFile(sf);
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const project = new Project({
    tsConfigFilePath: resolve(REPO_ROOT, 'packages/ui/tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  const files = globSync(STORIES_GLOB, { cwd: REPO_ROOT, absolute: true });
  console.log(`[harvest] scanning ${files.length} stories files`);

  const allExemplars: StoryExemplar[] = [];
  const perComponent = new Map<string, number>();
  let parseErrors = 0;

  for (const file of files) {
    try {
      const exemplars = extractFromFile(file, project);
      for (const ex of exemplars) {
        allExemplars.push(ex);
        perComponent.set(ex.component, (perComponent.get(ex.component) ?? 0) + 1);
      }
    } catch (err) {
      parseErrors++;
      console.warn(`[harvest] parse error in ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Stable sort: component, then storyName
  allExemplars.sort((a, b) =>
    a.component.localeCompare(b.component) || a.storyName.localeCompare(b.storyName),
  );

  // Surface components with zero exemplars so authors know where to opt in.
  const componentNamesInFiles = new Set(
    files.map((f) => basename(f).replace(/\.stories\.tsx$/, '')),
  );
  const zeroExemplarComponents = [...componentNamesInFiles]
    .filter((c) => !perComponent.has(c))
    .sort();

  const header = `/**
 * storyExemplars.generated.ts
 *
 * AUTO-GENERATED by scripts/harvest-story-exemplars.ts.
 * Do not edit by hand — re-run \`pnpm harvest:exemplars\` instead.
 *
 * Exemplars teach the Design Composition Agent how each component is used
 * in a real context (variant combinations, slot compositions, content).
 * Stories opt in via \`tags: ['exemplar']\` or a canonical name
 * (Default, Basic, Primary, Example, Playground, *Composition*, *Showcase*).
 *
 * Coverage: ${allExemplars.length} exemplars across ${perComponent.size} components.
 * Components with zero exemplars (add \`tags: ['exemplar']\` to opt stories in):
 *   ${zeroExemplarComponents.join(', ') || '(none)'}
 */

export interface StoryExemplar {
  /** PascalCase component name (matches COMPONENT_REGISTRY keys). */
  component: string;
  /** Export identifier or explicit \`name\` override on the story object. */
  storyName: string;
  /** Optional story description pulled from \`parameters.docs.description.story\`. */
  description?: string;
  /** Extracted \`args\` object literal (best-effort JSON). Non-serializable
   *  values are wrapped as \`__raw__:<source>\`. */
  args?: Record<string, unknown>;
  /** Source text of the story's \`render\` function (truncated at 2000 chars)
   *  so the LLM sees how slots are composed. Absent when the story relies
   *  purely on \`args\`. */
  renderSource?: string;
  /** Tags from Meta + story, de-duplicated. */
  tags?: string[];
  /** Relative path to the source file, useful for debugging regressions. */
  sourceFile: string;
}

`;

  const body = `export const STORY_EXEMPLARS: StoryExemplar[] = ${JSON.stringify(allExemplars, null, 2)};\n`;

  const footer = `
/** Quick lookup: component → exemplars. */
export function getExemplarsForComponent(name: string): StoryExemplar[] {
  return STORY_EXEMPLARS.filter((e) => e.component === name);
}

/** Bulk lookup: multiple components → deduplicated exemplars. */
export function getExemplarsForComponents(names: readonly string[]): StoryExemplar[] {
  const wanted = new Set(names);
  return STORY_EXEMPLARS.filter((e) => wanted.has(e.component));
}
`;

  writeFileSync(OUT_PATH, header + body + footer, 'utf8');

  console.log(
    `[harvest] wrote ${allExemplars.length} exemplars across ${perComponent.size} components → ${OUT_PATH}`,
  );
  if (zeroExemplarComponents.length > 0) {
    console.log(
      `[harvest] ${zeroExemplarComponents.length} components have zero exemplars:`,
      zeroExemplarComponents.join(', '),
    );
  }
  if (parseErrors > 0) {
    console.warn(`[harvest] ${parseErrors} files failed to parse`);
    process.exit(1);
  }
}

main();
