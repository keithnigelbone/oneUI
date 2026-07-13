/**
 * smoke-existing-builder.ts
 *
 * The LAB-03 isolation gate (Pitfall 3): assert the EXISTING `(builder)` canvas
 * route still BOOTS unaffected after the Experience Lab work landed. The
 * Experience Lab is one-way isolated — it may add code + a nav entry, but it
 * must NEVER break, re-mount, or become a dependency of the existing Builder.
 *
 * This gate proves two things, fast and deterministically, without standing up
 * a full Next.js server (which would require Next's webpack alias + CSS-module
 * graph — too heavy and brittle for a CI smoke gate):
 *
 *   1. BOOT — the existing Builder canvas route (`page.tsx`) and its canvas
 *      module (`CanvasContent.tsx`) exist and PARSE cleanly: a renderable
 *      default-export route component, no syntax errors in the route's own
 *      module. Combined with `pnpm typecheck` in `ci:gates` (which compiles the
 *      full Builder graph), this is the deterministic "the route still boots"
 *      proof — a Lab change that broke the Builder route would fail here or in
 *      typecheck.
 *
 *   2. ISOLATION — the existing Builder source tree (`(builder)/` route +
 *      `design-tools/ExperienceCanvas/`) contains ZERO imports of any
 *      `experience-builder-*` package or the `(experience-lab)` route. The Lab
 *      must never leak into the Builder's dependency graph (the eslint
 *      boundary's runtime complement).
 *
 * Joins `check:single-ai` in `ci:gates`. Exit 0 = Builder still boots + stays
 * isolated; exit 1 = the Lab broke or entangled the existing Builder.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const REPO_ROOT = resolve(__dirname, '..');
const PLATFORM_SRC = join(REPO_ROOT, 'apps/platform/src');
const BUILDER_PAGE = join(PLATFORM_SRC, 'app/(platform)/(builder)/canvas/page.tsx');
const BUILDER_CANVAS = join(PLATFORM_SRC, 'app/(platform)/(builder)/canvas/CanvasContent.tsx');
const BUILDER_TREES = [
  join(PLATFORM_SRC, 'app/(platform)/(builder)'),
  join(PLATFORM_SRC, 'design-tools/ExperienceCanvas'),
];

/** Import paths the existing Builder must NEVER reference (one-way isolation). */
const FORBIDDEN_IN_BUILDER = [
  '@oneui/experience-builder-',
  '(experience-lab)',
];

function fail(message: string): never {
  // eslint-disable-next-line no-console
  console.error(`✗ smoke:builder — ${message}`);
  process.exit(1);
}

function pass(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`✓ smoke:builder — ${message}`);
}

// ---------------------------------------------------------------------------
// 1. BOOT — the Builder route + canvas module exist and parse cleanly, and the
//    route exposes a renderable default-export component.
// ---------------------------------------------------------------------------

/** Parse a source file; return diagnostics array (empty = clean parse). */
function parseFile(file: string): readonly ts.Diagnostic[] {
  const source = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // `parseDiagnostics` is internal but is the canonical way to surface syntax
  // errors from a standalone SourceFile parse.
  return (sf as unknown as { parseDiagnostics?: ts.Diagnostic[] }).parseDiagnostics ?? [];
}

/** Does the source file export a default function/component? */
function hasDefaultComponentExport(file: string): boolean {
  const source = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  sf.forEachChild((node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      found = true;
    }
    // `export default function …` or `export default Foo`
    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      found = true;
    }
  });
  return found;
}

function assertBuilderBoots(): void {
  for (const file of [BUILDER_PAGE, BUILDER_CANVAS]) {
    if (!existsSync(file)) {
      fail(`existing Builder module is missing: ${file}`);
    }
    const diagnostics = parseFile(file);
    if (diagnostics.length > 0) {
      const first = diagnostics[0];
      const msg = ts.flattenDiagnosticMessageText(first.messageText, '\n');
      fail(`existing Builder module failed to parse (${file}): ${msg}`);
    }
  }

  if (!hasDefaultComponentExport(BUILDER_PAGE)) {
    fail('existing Builder route has no renderable default-export component');
  }

  pass('existing (builder) canvas route + CanvasContent parse cleanly and expose a route component');
}

// ---------------------------------------------------------------------------
// 2. ISOLATION — no Lab imports leak into the existing Builder tree.
// ---------------------------------------------------------------------------

function* walkSourceFiles(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* walkSourceFiles(full);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      yield full;
    }
  }
}

function assertBuilderIsolation(): void {
  const offenders: string[] = [];
  for (const tree of BUILDER_TREES) {
    for (const file of walkSourceFiles(tree)) {
      const src = readFileSync(file, 'utf8');
      // Only inspect import/from statements, not comments that merely name the
      // boundary (the isolation docs reference these tokens on purpose).
      const importLines = src
        .split('\n')
        .filter((line) => /\b(import|from|require)\b/.test(line) && !line.trimStart().startsWith('*') && !line.trimStart().startsWith('//'));
      for (const line of importLines) {
        for (const forbidden of FORBIDDEN_IN_BUILDER) {
          if (line.includes(`'${forbidden}`) || line.includes(`"${forbidden}`) || line.includes(`(${forbidden}`) ) {
            offenders.push(`${file}: ${line.trim()}`);
          }
        }
      }
    }
  }

  if (offenders.length > 0) {
    fail(
      'the existing Builder imports Experience Lab code (LAB-03 isolation broken):\n  ' +
        offenders.join('\n  '),
    );
  }

  pass('existing Builder tree imports zero Experience Lab code (one-way isolation intact)');
}

function main(): void {
  assertBuilderBoots();
  assertBuilderIsolation();
  pass('LAB-03 isolation gate passed');
  process.exit(0);
}

main();
