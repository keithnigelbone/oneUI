/**
 * Build-time JSON generator for @jds/kb-rn.
 *
 * Emits (under dist/):
 *   - manifest.json                    — the per-package KBManifest
 *   - components.json                  — flat array of all metas
 *   - components/<Name>.json           — one file per component (full meta)
 *   - schemas/<Name>.props.schema.json — the propsSchema fragment alone
 *   - kb-graph.json                    — node/edge graph of component+token+figma
 *                                        relationships (for graph traversal /
 *                                        token-efficient agent queries)
 *
 * Iteration source: ALL_COMPONENTS exported from src/index.ts. Re-imported
 * from the freshly-built dist/index.js so the JSON matches what consumers
 * see at runtime (no stale src/ values).
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

if (!existsSync(distDir)) {
  // eslint-disable-next-line no-console
  console.error('[@jds/kb-rn] dist/ not found. Run `tsup` first (build script does this for you).');
  process.exit(1);
}

const { ALL_COMPONENTS } = await import(join(distDir, 'index.js'));
// Import from the workspace dist EXPLICITLY. `await import('@jds/kb-core')`
// resolves to the package's `"import": "./src/index.ts"` exports condition,
// which Node can't load at runtime. The `./dist/index.js` subpath export
// (added in package.json) bypasses the src->ts resolution.
const { KB_SCHEMA_VERSION, KB_VERSION, BRAND_SET_VERSION, buildKbGraph, compileComposition } =
  await import('@jds/kb-core/dist/index.js');

const componentsDir = join(distDir, 'components');
const schemasDir = join(distDir, 'schemas');
if (!existsSync(componentsDir)) mkdirSync(componentsDir, { recursive: true });
if (!existsSync(schemasDir)) mkdirSync(schemasDir, { recursive: true });

// 1. Per-component JSON + isolated props schema
for (const meta of ALL_COMPONENTS) {
  writeFileSync(
    join(componentsDir, `${meta.name}.json`),
    JSON.stringify(meta, null, 2) + '\n',
    'utf8',
  );
  writeFileSync(
    join(schemasDir, `${meta.name}.props.schema.json`),
    JSON.stringify(meta.propsSchema, null, 2) + '\n',
    'utf8',
  );
  // Composition → AJV-validatable nesting schema (so a consumer can validate
  // "is this child allowed in this slot?"). Previously the compiler was unused.
  if (meta.composition) {
    writeFileSync(
      join(schemasDir, `${meta.name}.composition.schema.json`),
      JSON.stringify(compileComposition(meta.composition), null, 2) + '\n',
      'utf8',
    );
  }
}

// 2. Flat array
writeFileSync(
  join(distDir, 'components.json'),
  JSON.stringify(ALL_COMPONENTS, null, 2) + '\n',
  'utf8',
);

// 3. Manifest with figma reverse-index
const manifest = {
  schemaVersion: KB_SCHEMA_VERSION,
  kbVersion: KB_VERSION,
  brandSetVersion: BRAND_SET_VERSION,
  commonKbVersion: KB_VERSION,
  sdk: 'rn',
  generatedAt: new Date().toISOString(),
  componentCount: ALL_COMPONENTS.length,
  componentIndex: ALL_COMPONENTS.map((c) => ({
    name: c.name,
    status: c.status,
    file: `components/${c.name}.json`,
  })),
  figmaReverseIndex: ALL_COMPONENTS
    .filter((c) => c.figma)
    .map((c) => ({
      componentKey: c.figma.componentKey,
      keyHistory: c.figma.keyHistory ?? [],
      variantProperties: c.figma.variantProperties ?? {},
      jdsName: c.name,
    })),
  // Pointer so any consumer (an MCP server / AI IDE) can discover the
  // relationship graph without hard-coding the filename.
  graphFile: 'kb-graph.json',
};

writeFileSync(
  join(distDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
  'utf8',
);

// 4. Relationship graph — component/token/figma/source nodes + edges. Lets an
// agent traverse "what composes into X / what uses token Y / which component is
// figma key Z" without opening component source files.
const graph = buildKbGraph(ALL_COMPONENTS, {
  sdk: 'rn',
  schemaVersion: KB_SCHEMA_VERSION,
  kbVersion: KB_VERSION,
  generatedAt: manifest.generatedAt,
});
writeFileSync(join(distDir, 'kb-graph.json'), JSON.stringify(graph, null, 2) + '\n', 'utf8');

// eslint-disable-next-line no-console
console.log(
  `[@jds/kb-rn] wrote ${ALL_COMPONENTS.length} component metas + manifest + kb-graph (${graph.stats.nodes} nodes, ${graph.stats.edges} edges) to dist/`,
);
