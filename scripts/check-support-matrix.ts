#!/usr/bin/env node
/**
 * check-support-matrix.ts
 *
 * Quality gate: every component that ships a Storybook story must also ship
 * the full set of supporting artifacts the design-system tooling assumes.
 *
 * For each component folder under `packages/ui/src/components/**` that
 * contains at least one `*.stories.tsx`, this script asserts ALL SIX of:
 *
 *   1. story        — `<Folder>.stories.tsx` (or any `*.stories.tsx` in folder)
 *   2. test         — `<Folder>.test.tsx`
 *   3. meta         — `<Folder>.meta.ts`
 *   4. tokens       — `<Folder>.tokens.ts`
 *   5. recipe       — `<Folder>.recipe.ts` OR a `recipe` field on the meta
 *   6. schema entry — registered in `packages/ui/src/registry/metaRegistry.ts`
 *                     (since commit 7bc5a2d, registered metas auto-derive
 *                     prop schemas in `packages/shared/src/meta/componentSchemas.ts`,
 *                     so registration there is the load-bearing check)
 *
 * Prints a missing-artifacts table and exits 1 if any gap remains.
 * Exits 0 if every story-bearing component is fully supported.
 *
 * Usage: pnpm check:support-matrix
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = resolve(REPO_ROOT, 'packages/ui/src/components');
const META_REGISTRY_PATH = resolve(
  REPO_ROOT,
  'packages/ui/src/registry/metaRegistry.ts',
);

type Artifact = 'story' | 'test' | 'meta' | 'tokens' | 'recipe' | 'schema';

interface ComponentRow {
  component: string;
  folder: string;
  storyFiles: string[];
  artifacts: Record<Artifact, boolean>;
  missing: Artifact[];
}

/**
 * Walk `packages/ui/src/components/**` and return every directory that
 * contains at least one `*.stories.tsx` file. Sub-component stories (e.g.
 * WebHeader/HeaderItem.stories.tsx) collapse into their parent folder —
 * the parent component owns the meta/tokens/recipe and is what gets
 * registered in metaRegistry.
 */
function findStoryBearingFolders(): Map<string, string[]> {
  const folders = new Map<string, string[]>(); // folder absolute path → story file basenames

  const visit = (dir: string) => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    const stories: string[] = [];
    for (const entry of entries) {
      const full = join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (entry === 'node_modules' || entry === '__tests__') continue;
        visit(full);
      } else if (entry.endsWith('.stories.tsx')) {
        stories.push(entry);
      }
    }
    if (stories.length > 0) {
      folders.set(dir, stories);
    }
  };

  visit(COMPONENTS_DIR);
  return folders;
}

/** Read the metaRegistry.ts source and extract the keys of COMPONENT_META_REGISTRY. */
function loadRegisteredComponents(): Set<string> {
  const src = readFileSync(META_REGISTRY_PATH, 'utf8');
  const start = src.indexOf('COMPONENT_META_REGISTRY');
  if (start < 0) {
    throw new Error(
      `check-support-matrix: could not find COMPONENT_META_REGISTRY in ${META_REGISTRY_PATH}`,
    );
  }
  const open = src.indexOf('{', start);
  // Find matching closing brace.
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) {
    throw new Error(
      'check-support-matrix: could not find end of COMPONENT_META_REGISTRY object',
    );
  }
  const body = src.slice(open + 1, end);
  const keys = new Set<string>();
  // Match `Key: VALUE_META,` style entries (handles bare-word keys only,
  // which is the convention in this registry).
  const rx = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm;
  for (const m of body.matchAll(rx)) {
    keys.add(m[1]);
  }
  return keys;
}

/**
 * If `<Folder>.recipe.ts` is missing, fall back to scanning the meta source
 * for a `recipe:` property. Cheap textual probe — sufficient to detect the
 * inline form documented in the task brief.
 */
function metaHasInlineRecipe(metaPath: string): boolean {
  if (!existsSync(metaPath)) return false;
  const src = readFileSync(metaPath, 'utf8');
  // Strip line comments to avoid matching `// recipe:` mentions.
  const stripped = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return /\brecipe\s*:/.test(stripped);
}

/**
 * Map a component folder to the public component name used as the
 * metaRegistry key. Most folders match 1:1 (folder `Foo` → key `Foo`).
 * Known exception (mirrors the registry comment):
 *   - `Input` folder → `InputField` key (the public aggregator name).
 */
const FOLDER_TO_REGISTRY_KEY: Record<string, string> = {
  Input: 'InputField',
};

function registryKeyFor(folder: string): string {
  return FOLDER_TO_REGISTRY_KEY[folder] ?? folder;
}

function buildRow(
  folderPath: string,
  storyFiles: string[],
  registered: Set<string>,
): ComponentRow {
  const folder = folderPath.split('/').pop()!;
  const component = folder;
  const file = (suffix: string) => resolve(folderPath, `${folder}${suffix}`);

  const hasStory = storyFiles.length > 0;
  const hasTest = existsSync(file('.test.tsx'));
  const hasMeta = existsSync(file('.meta.ts'));
  const hasTokens = existsSync(file('.tokens.ts'));
  const hasRecipeFile = existsSync(file('.recipe.ts'));
  const hasInlineRecipe = !hasRecipeFile && metaHasInlineRecipe(file('.meta.ts'));
  const hasRecipe = hasRecipeFile || hasInlineRecipe;
  const hasSchema = registered.has(registryKeyFor(folder));

  const artifacts: Record<Artifact, boolean> = {
    story: hasStory,
    test: hasTest,
    meta: hasMeta,
    tokens: hasTokens,
    recipe: hasRecipe,
    schema: hasSchema,
  };

  const missing: Artifact[] = (Object.keys(artifacts) as Artifact[]).filter(
    (k) => !artifacts[k],
  );

  return { component, folder, storyFiles, artifacts, missing };
}

function formatTable(rows: ComponentRow[]): string {
  const failing = rows.filter((r) => r.missing.length > 0);
  if (failing.length === 0) return '';

  const cols: Array<{ key: Artifact; label: string }> = [
    { key: 'story', label: 'story' },
    { key: 'test', label: 'test' },
    { key: 'meta', label: 'meta' },
    { key: 'tokens', label: 'tokens' },
    { key: 'recipe', label: 'recipe' },
    { key: 'schema', label: 'schema' },
  ];

  const nameWidth = Math.max(
    'Component'.length,
    ...failing.map((r) => r.component.length),
  );

  const header =
    'Component'.padEnd(nameWidth) +
    '  ' +
    cols.map((c) => c.label.padEnd(7)).join('');
  const sep = '-'.repeat(header.length);

  const lines = [header, sep];
  for (const row of failing) {
    const cells = cols
      .map((c) => (row.artifacts[c.key] ? 'OK' : 'MISS').padEnd(7))
      .join('');
    lines.push(row.component.padEnd(nameWidth) + '  ' + cells);
  }
  return lines.join('\n');
}

function main(): number {
  const folders = findStoryBearingFolders();
  if (folders.size === 0) {
    console.error(
      `check-support-matrix: no *.stories.tsx files found under ${COMPONENTS_DIR}`,
    );
    return 1;
  }

  const registered = loadRegisteredComponents();

  const rows: ComponentRow[] = [];
  for (const [folderPath, storyFiles] of folders) {
    rows.push(buildRow(folderPath, storyFiles, registered));
  }
  rows.sort((a, b) => a.component.localeCompare(b.component));

  const failing = rows.filter((r) => r.missing.length > 0);

  if (failing.length === 0) {
    console.log(
      `check-support-matrix: OK — all ${rows.length} story-bearing components have story + test + meta + tokens + recipe + schema entry.`,
    );
    return 0;
  }

  console.error(
    `check-support-matrix: FAIL — ${failing.length} of ${rows.length} story-bearing component(s) missing artifacts.\n`,
  );
  console.error(formatTable(rows));
  console.error('');
  console.error('Legend:');
  console.error('  story   — *.stories.tsx in folder');
  console.error('  test    — <Folder>.test.tsx');
  console.error('  meta    — <Folder>.meta.ts');
  console.error('  tokens  — <Folder>.tokens.ts');
  console.error('  recipe  — <Folder>.recipe.ts OR `recipe:` field on meta');
  console.error(
    '  schema  — entry in packages/ui/src/registry/metaRegistry.ts',
  );
  console.error('');
  console.error(
    'Add the missing artifact (or register the meta) and re-run `pnpm check:support-matrix`.',
  );
  return 1;
}

process.exit(main());
