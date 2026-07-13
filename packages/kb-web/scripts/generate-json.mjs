/**
 * Build-time JSON generator for @jds/kb-web. Mirrors kb-rn's emitter — same
 * manifest/components/schemas layout, with sdk='web' stamped in.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
if (!existsSync(distDir)) {
  console.error('[@jds/kb-web] dist/ not found — run `tsup` first.');
  process.exit(1);
}

const { ALL_COMPONENTS } = await import(join(distDir, 'index.js'));
// Import from the workspace dist EXPLICITLY. `await import('@jds/kb-core')`
// resolves to the package's `"import": "./src/index.ts"` exports condition,
// which Node can't load at runtime. The `./dist/index.js` subpath export
// (added in package.json) bypasses the src->ts resolution.
const { KB_SCHEMA_VERSION, KB_VERSION, BRAND_SET_VERSION } = await import('@jds/kb-core/dist/index.js');

const componentsDir = join(distDir, 'components');
const schemasDir = join(distDir, 'schemas');
if (!existsSync(componentsDir)) mkdirSync(componentsDir, { recursive: true });
if (!existsSync(schemasDir)) mkdirSync(schemasDir, { recursive: true });

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
}

writeFileSync(
  join(distDir, 'components.json'),
  JSON.stringify(ALL_COMPONENTS, null, 2) + '\n',
  'utf8',
);

const manifest = {
  schemaVersion: KB_SCHEMA_VERSION,
  kbVersion: KB_VERSION,
  brandSetVersion: BRAND_SET_VERSION,
  commonKbVersion: KB_VERSION,
  sdk: 'web',
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
};

writeFileSync(join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`[@jds/kb-web] wrote ${ALL_COMPONENTS.length} component metas + manifest to dist/`);
