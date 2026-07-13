#!/usr/bin/env node
/**
 * Sync the baked component catalog to the RELEASED allowlist only — no WIP.
 * Reads only from assets/ + the vendored released-components list, so it never
 * touches the monorepo and never clobbers hand-fixed invariants/surface assets.
 *
 * Rebuilds, from the per-component JSON files in assets/components/:
 *   - assets/components-index.json   (released-only, name/slug/intent/tags)
 *   - the component entries in assets/search-corpus.json (released-only)
 *   - assets/manifest.json counts
 * and removes any non-released component JSON file.
 *
 * So adding a component = drop assets/components/<slug>.json + add it to
 * released-components.mjs + run `node scripts/sync-released-components.mjs`.
 */
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELEASED_SLUGS, normalizeComponent } from './released-components.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, '..', 'assets');
const COMP_DIR = join(ASSETS, 'components');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n', 'utf8');

const isReleasedSlug = (slug) => RELEASED_SLUGS.has(normalizeComponent(slug));

const index = [];
const componentCorpus = [];
const dropped = [];
let removed = 0;

for (const f of readdirSync(COMP_DIR)) {
  if (!f.endsWith('.json')) continue;
  const slug = f.replace(/\.json$/, '');
  const data = readJson(join(COMP_DIR, f));
  const name = data.componentName || slug;
  if (!isReleasedSlug(slug) && !RELEASED_SLUGS.has(normalizeComponent(name))) {
    rmSync(join(COMP_DIR, f));
    removed++;
    dropped.push(name);
    continue;
  }
  const intent =
    typeof data.intentAndPurpose?.intent === 'string' ? data.intentAndPurpose.intent : undefined;
  const tags = Array.isArray(data.tags) ? data.tags : [];
  index.push({ name, slug, intent, tags });
  componentCorpus.push({
    id: `component:${slug}`,
    source: 'component',
    title: name,
    text: [
      name,
      intent ?? '',
      JSON.stringify(data.compositionRules || {}),
      JSON.stringify(data.variantLogic || {}),
    ].join('\n'),
    tags: ['component', name.toLowerCase(), ...tags],
  });
}

index.sort((a, b) => a.name.localeCompare(b.name));
writeJson(join(ASSETS, 'components-index.json'), index);

/* rebuild corpus: keep non-component entries, replace component entries */
const corpusPath = join(ASSETS, 'search-corpus.json');
if (existsSync(corpusPath)) {
  const corpus = readJson(corpusPath).filter((e) => e.source !== 'component');
  const newCorpus = [...corpus, ...componentCorpus];
  writeJson(corpusPath, newCorpus);

  const manifestPath = join(ASSETS, 'manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    manifest.counts = manifest.counts || {};
    manifest.counts.components = index.length;
    manifest.counts.corpusEntries = newCorpus.length;
    manifest.generatedAt = new Date().toISOString();
    writeJson(manifestPath, manifest);
  }
}

console.log('Synced MCP catalog to released-only:');
console.log('  kept:', index.length, 'components');
console.log('  dropped (WIP):', dropped.length ? dropped.join(', ') : '(none)');
console.log('  files removed:', removed);
