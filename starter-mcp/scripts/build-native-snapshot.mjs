#!/usr/bin/env node
/**
 * Authoring-time NATIVE snapshot generator (React Native / @oneui/ui-native).
 *
 * Peer of build-snapshot.mjs (web). Where the web snapshot is baked from
 * docs/components/generated/*.docs.json, the native component catalog is baked
 * from the purpose-built RN knowledge base `@jds/kb-rn` (packages/kb-rn) — the
 * design system's official "KB for AI codegen" contract. Its metas already carry
 * RN-correct prop schemas, importPaths, a11y + render hints, so this script only
 * ADAPTS that shape into the component JSON the MCP tools read, and writes it to
 * `assets/native/`.
 *
 * Prereq: build kb-rn first so its dist/ exists:
 *   pnpm --filter @jds/kb-core build && pnpm --filter @jds/kb-rn build
 * Then:
 *   node scripts/build-native-snapshot.mjs
 *
 * Re-run whenever kb-rn changes. The generated assets are committed and shipped;
 * the published MCP never reads the monorepo.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const REPO = resolve(PKG, '..');
const KB_DIST = join(REPO, 'packages', 'kb-rn', 'dist');
const NATIVE_ASSETS = join(PKG, 'assets', 'native');

/** Bare runtime package the agent imports from. */
const IMPORT_PATH = '@oneui/ui-native';

function readJson(p) {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}
function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}
function writeJson(relUnderNative, value) {
  const p = join(NATIVE_ASSETS, relUnderNative);
  ensureDir(dirname(p));
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

/** Component slug used by the MCP tools: lowercase, alphanumerics only. */
function slugOf(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Render a kb-rn propsSchema property to a human prop `type` string. */
function propType(schema) {
  if (Array.isArray(schema.enum)) return schema.enum.map((v) => (typeof v === 'string' ? `'${v}'` : String(v))).join(' | ');
  if (typeof schema.type === 'string') return schema.type;
  return 'ReactNode';
}

/** kb-rn propsSchema → the MCP's flat `props[]` array. */
function toPropsArray(propsSchema) {
  const props = [];
  const required = new Set(propsSchema.required ?? []);
  for (const [name, schema] of Object.entries(propsSchema.properties ?? {})) {
    const descParts = [];
    if (schema.description) descParts.push(schema.description);
    if (schema['x-jds-suggestion']) {
      const sev = schema['x-jds-severity'] ? `[${schema['x-jds-severity']}] ` : '';
      descParts.push(`${sev}${schema['x-jds-suggestion']}`);
    }
    props.push({
      name,
      type: propType(schema),
      required: required.has(name),
      ...(schema.default !== undefined ? { defaultValue: String(schema.default) } : {}),
      description: descParts.join(' — '),
    });
  }
  return props;
}

/** Light variantLogic so get_component_info(section:"variants") is useful. */
function toVariantLogic(propsSchema) {
  const variant = propsSchema.properties?.variant;
  if (!variant || !Array.isArray(variant.enum)) return undefined;
  return { rules: variant.enum.map((name) => ({ name })) };
}

/** Adapt one kb-rn meta into the MCP component JSON shape (superset-preserving). */
function adapt(meta) {
  const slug = slugOf(meta.name);
  const variantLogic = toVariantLogic(meta.propsSchema ?? {});
  const out = {
    schemaVersion: '1.0.0',
    componentName: meta.name,
    generatedAt: new Date().toISOString(),
    machineReadable: true,
    status: meta.status,
    intentAndPurpose: { intent: meta.description ?? '' },
    compositionRules: {
      requires: meta.propsSchema?.required ?? [],
      allows: [],
      forbids: [],
      childKind: meta.composition?.childKind,
    },
    ...(variantLogic ? { variantLogic } : {}),
    props: toPropsArray(meta.propsSchema ?? {}),
    slots: [],
    propsSchema: meta.propsSchema,
    // Carried through verbatim from kb-rn — richer than the web catalog.
    tokens: meta.tokens,
    a11y: meta.a11y,
    renderHints: meta.renderHints,
    figma: meta.figma,
    codeSnippets: [
      {
        id: 'import-basic',
        title: 'Basic Usage',
        language: 'tsx',
        code: `import { ${meta.name} } from '${IMPORT_PATH}';\n\n<${meta.name} />`,
      },
    ],
    tags: ['machine-readable', 'generated', slug, ...(meta.tags ?? [])],
    importPath: IMPORT_PATH,
  };
  return { slug, name: meta.name, intent: out.intentAndPurpose.intent, tags: out.tags, json: out };
}

/* ------------------------------- run ------------------------------- */

const manifest = readJson(join(KB_DIST, 'manifest.json'));
if (!manifest) {
  console.error(
    `[native-snapshot] kb-rn dist not found at ${KB_DIST}.\n` +
      `Build it first:  pnpm --filter @jds/kb-core build && pnpm --filter @jds/kb-rn build`,
  );
  process.exit(1);
}

// Staleness guard: dist/ is a build artifact. If kb-rn's source roster (JDS*.ts)
// has more components than the built manifest, dist/ is stale — rebuild kb-rn or
// you'll silently bake an outdated catalog. (The npm script rebuilds kb-rn first;
// this catches a direct `node scripts/build-native-snapshot.mjs` invocation.)
const KB_SRC_COMPONENTS = join(REPO, 'packages', 'kb-rn', 'src', 'components');
try {
  const srcCount = readdirSync(KB_SRC_COMPONENTS).filter((f) => /^JDS.*\.ts$/.test(f)).length;
  const distCount = manifest.componentCount ?? (manifest.componentIndex ?? []).length;
  if (srcCount > distCount) {
    console.warn(
      `[native-snapshot] WARNING: kb-rn dist looks STALE — ${srcCount} source components but only ` +
        `${distCount} in dist/manifest.json. Rebuild kb-rn first:\n` +
        `  pnpm --filter @jds/kb-core build && pnpm --filter @jds/kb-rn build\n` +
        `Continuing with the (possibly outdated) dist…`,
    );
  }
} catch {
  /* src not present (published consumer) — skip the guard */
}

// Clean the native catalog so removed components don't linger.
if (existsSync(NATIVE_ASSETS)) {
  for (const f of readdirSync(NATIVE_ASSETS)) {
    if (f === 'components' || f === 'components-index.json') {
      rmSync(join(NATIVE_ASSETS, f), { recursive: true, force: true });
    }
  }
}

const index = [];
for (const entry of manifest.componentIndex ?? []) {
  const meta = readJson(join(KB_DIST, entry.file));
  if (!meta) {
    console.warn(`[native-snapshot] skipped ${entry.name} — could not read ${entry.file}`);
    continue;
  }
  const { slug, name, intent, tags, json } = adapt(meta);
  writeJson(`components/${slug}.json`, json);
  index.push({ name, slug, intent, tags });
}

index.sort((a, b) => a.name.localeCompare(b.name));
writeJson('components-index.json', index);

// Native-snapshot version manifest — mirrors assets/manifest.json (web) so
// staleness of assets/native/* is visible instead of silent. Bump kbVersion
// by rebuilding kb-rn (packages/kb-rn/package.json version) before rebaking.
writeJson('manifest.json', {
  snapshotVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  source: { package: '@jds/kb-rn', kbVersion: manifest.kbVersion, schemaVersion: manifest.schemaVersion },
  counts: { components: index.length },
});

console.log(
  `[native-snapshot] wrote ${index.length} native component(s) to assets/native/\n` +
    `  source: @jds/kb-rn ${manifest.kbVersion} (schema ${manifest.schemaVersion})\n` +
    `  components: ${index.map((c) => c.name).join(', ')}`,
);
