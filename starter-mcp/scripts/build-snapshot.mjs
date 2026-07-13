#!/usr/bin/env node
/**
 * Authoring-time snapshot generator.
 *
 * Reads OneUI monorepo sources and bakes a self-contained knowledge snapshot
 * into `starter-mcp/assets/`. The generated assets are committed and shipped;
 * the PUBLISHED package never reads the monorepo. Re-run on each design-system
 * release:  `npm run build:snapshot`
 *
 * Sources:
 *   - skills      ← .claude/skills/<name>/ (+ root SKILL.md = oneui-multi-brand)
 *   - invariants  ← packages/shared/src/agent/knowledgeSources.ts (CORE_INVARIANTS)
 *   - surface     ← docs/surface-context-awareness.md
 *   - components  ← docs/components/generated/*.docs.json
 *   - brands      ← cdn-dist/brands/* + docs/exports/*.DESIGN.md
 */
import {
  cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, '..');
const REPO = resolve(PKG, '..');
const ASSETS = join(PKG, 'assets');

const SKILL_ALLOWLIST = ['oneui', 'design-composition', 'surface-context', 'figma-to-native'];
// Subdirs of a skill copied verbatim into the snapshot (and listed in files[]).
const SKILL_SUBDIRS = ['references', 'rules', 'evals', 'assets'];
const SPEC_SLUGS = ['jio', 'reliance', 'tira', 'swadesh', 'oneui-system'];

const corpus = [];
const counts = {};

/* ----------------------------- helpers ----------------------------- */
function readText(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}
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
function writeJson(rel, value) {
  const p = join(ASSETS, rel);
  ensureDir(dirname(p));
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
function writeText(rel, value) {
  const p = join(ASSETS, rel);
  ensureDir(dirname(p));
  writeFileSync(p, value, 'utf8');
}
/** Replace { value, attribution } wrappers with their value, recursively. */
function flatten(node) {
  if (Array.isArray(node)) return node.map(flatten);
  if (node && typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.length === 2 && keys.includes('value') && keys.includes('attribution')) {
      return flatten(node.value);
    }
    const out = {};
    for (const k of keys) out[k] = flatten(node[k]);
    return out;
  }
  return node;
}
/** Parse minimal YAML frontmatter (name, description, category). */
function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const block = m[1];
  const lines = block.split('\n');
  const out = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (key) out[key] = buf.join(' ').trim().replace(/^["'>|]\s*/, '');
    key = null;
    buf = [];
  };
  for (const line of lines) {
    const top = line.match(/^([a-zA-Z_]+):\s?(.*)$/);
    if (top && !line.startsWith(' ')) {
      flush();
      key = top[1];
      buf = top[2] ? [top[2]] : [];
    } else if (key && line.trim()) {
      buf.push(line.trim());
    }
  }
  flush();
  return out;
}

/* --------------------------- preflight ---------------------------- */
// The reset below WIPES the committed assets/ directory before rebuilding, so
// every required monorepo source must be verified BEFORE any destruction. A
// missing source (fresh checkout without cdn-dist/, docs pipeline not run)
// must abort here — not silently bake an empty/partial snapshot.
{
  const preflightProblems = [];
  const compDirCheck = join(REPO, 'docs', 'components', 'generated');
  if (!existsSync(compDirCheck) || !readdirSync(compDirCheck).some((f) => f.endsWith('.docs.json'))) {
    preflightProblems.push(
      `No component docs at ${compDirCheck} — the docs pipeline must generate *.docs.json first.`,
    );
  }
  const brandIndexCheck = readJson(join(REPO, 'cdn-dist', 'brands', 'index.json'));
  if (!brandIndexCheck || !Array.isArray(brandIndexCheck.brands) || brandIndexCheck.brands.length === 0) {
    preflightProblems.push(
      `No brand index at ${join(REPO, 'cdn-dist', 'brands', 'index.json')} — cdn-dist/brands is produced ` +
      'by the cdn-release pipeline (see cdn-release-full-pipeline/) and is not committed to this repo.',
    );
  }
  if (!existsSync(join(REPO, '.claude', 'skills'))) {
    preflightProblems.push(`No skills source at ${join(REPO, '.claude', 'skills')}.`);
  }
  if (preflightProblems.length) {
    console.error('✗ Snapshot sources missing — aborting BEFORE touching assets/ (it would be wiped):');
    for (const p of preflightProblems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

/* ----------------------------- reset ----------------------------- */
// Capture the previously-baked skill names BEFORE the wipe so drift can be
// flagged after re-baking (see below / audit finding M-2).
const previousSkillNames = (readJson(join(ASSETS, 'skills-index.json')) || [])
  .map((s) => s.name)
  .sort();
if (existsSync(ASSETS)) rmSync(ASSETS, { recursive: true, force: true });
ensureDir(ASSETS);

/* ----------------------------- skills ----------------------------- */
const skillsIndex = [];
const skillsRoot = join(REPO, '.claude', 'skills');

function bakeSkill(name, srcDir) {
  const skillMd = readText(join(srcDir, 'SKILL.md'));
  if (!skillMd) return;
  const fm = parseFrontmatter(skillMd);
  // Never ship contributor/internal skills to consumers (the MCP is end-user facing).
  if (fm.visibility === 'internal') {
    console.log(`Skipped internal skill: ${name}`);
    return;
  }
  const files = ['SKILL.md'];
  writeText(`skills/${name}/SKILL.md`, skillMd);
  // copy supporting subdirs (references / rules / evals / assets) verbatim
  for (const sub of SKILL_SUBDIRS) {
    const subDir = join(srcDir, sub);
    if (!existsSync(subDir)) continue;
    for (const f of readdirSync(subDir)) {
      if (f.startsWith('.')) continue;
      cpSync(join(subDir, f), join(ASSETS, `skills/${name}/${sub}/${f}`));
      files.push(`${sub}/${f}`);
    }
  }
  skillsIndex.push({
    name,
    description: fm.description || `${name} skill`,
    category: fm.category,
    files,
  });
  corpus.push({
    id: `skill:${name}`,
    source: 'skill',
    title: name,
    text: skillMd,
    tags: ['skill', name, ...name.split('-')],
  });
}

for (const name of SKILL_ALLOWLIST) {
  const dir = join(skillsRoot, name);
  if (existsSync(dir)) bakeSkill(name, dir);
}
// root SKILL.md = oneui-multi-brand (internal/contributor skill — filtered out below)
const rootSkill = readText(join(skillsRoot, 'SKILL.md'));
if (rootSkill) {
  const fm = parseFrontmatter(rootSkill);
  const name = fm.name || 'oneui-multi-brand';
  if (fm.visibility === 'internal') {
    console.log(`Skipped internal skill: ${name} (root SKILL.md)`);
  } else {
    writeText(`skills/${name}/SKILL.md`, rootSkill);
    skillsIndex.push({ name, description: fm.description || 'OneUI multi-brand skill', category: fm.category, files: ['SKILL.md'] });
    corpus.push({ id: `skill:${name}`, source: 'skill', title: name, text: rootSkill, tags: ['skill', 'brand', 'multi-brand'] });
  }
}
writeJson('skills-index.json', skillsIndex);
counts.skills = skillsIndex.length;

// Flag skill-set drift vs the previous snapshot. SKILL_ALLOWLIST and the
// .claude/skills dir naming have diverged from committed assets before, so any
// change to the baked skill set is surfaced loudly for the person regenerating
// to confirm — silent churn here ships the wrong skills to consumers.
{
  const nowSkillNames = skillsIndex.map((s) => s.name).sort();
  const added = nowSkillNames.filter((n) => !previousSkillNames.includes(n));
  const removed = previousSkillNames.filter((n) => !nowSkillNames.includes(n));
  if (previousSkillNames.length && (added.length || removed.length)) {
    console.warn(
      '\n⚠ Skill set changed vs the previous snapshot — confirm this is intended before committing:' +
        (added.length ? `\n   + added:   ${added.join(', ')}` : '') +
        (removed.length ? `\n   - removed: ${removed.join(', ')}` : '') +
        '\n   (check SKILL_ALLOWLIST here vs the .claude/skills dir names / frontmatter.)\n',
    );
  }
}

/* --------------------------- invariants --------------------------- */
const ksPath = join(REPO, 'packages', 'shared', 'src', 'agent', 'knowledgeSources.ts');
const ksSrc = readText(ksPath);
let invariants = null;
if (ksSrc) {
  const marker = 'export const CORE_INVARIANTS = `';
  const start = ksSrc.indexOf(marker);
  if (start !== -1) {
    let i = start + marker.length;
    let out = '';
    while (i < ksSrc.length) {
      const c = ksSrc[i];
      if (c === '\\') {
        out += ksSrc[i + 1];
        i += 2;
        continue;
      }
      if (c === '`') break;
      out += c;
      i++;
    }
    invariants = out;
  }
}
if (invariants) {
  writeText('invariants.md', invariants);
  corpus.push({ id: 'invariants', source: 'invariants', title: 'Core design system rules', text: invariants, tags: ['invariants', 'rules', 'tokens', 'surface', 'shape', 'typography'] });
  counts.invariants = 1;
} else {
  console.warn('WARN: could not extract CORE_INVARIANTS');
  counts.invariants = 0;
}

/* -------------------------- surface guide -------------------------- */
const surfaceDoc = readText(join(REPO, 'docs', 'surface-context-awareness.md'));
if (surfaceDoc) {
  writeText('surface-guide.md', surfaceDoc);
  corpus.push({ id: 'surface-guide', source: 'surface-guide', title: 'Surface context guide', text: surfaceDoc, tags: ['surface', 'data-surface', 'bold', 'subtle', 'context'] });
  counts.surfaceGuide = 1;
}

/* --------------------------- PRD template --------------------------- */
// Self-contained: sourced from the package's own docs/prd-template.md (blank
// template + worked example). Served by get_prd_template + oneui://prd-template.
// Not added to the search corpus — it's a fill-in template, not design guidance.
const prdTemplate = readText(join(PKG, 'docs', 'prd-template.md'));
if (prdTemplate) {
  writeText('prd-template.md', prdTemplate);
  counts.prdTemplate = 1;
}

/* --------------------------- components --------------------------- */
// Only bake RELEASED components — never WIP. Source of truth is vendored from
// packages/ui/src/registry/releasedComponents.ts (see released-components.mjs).
const { RELEASED_SLUGS, normalizeComponent } = await import('./released-components.mjs');
const compDir = join(REPO, 'docs', 'components', 'generated');
const componentsIndex = [];
const skippedWip = [];
if (existsSync(compDir)) {
  for (const f of readdirSync(compDir)) {
    if (!f.endsWith('.docs.json')) continue;
    const raw = readJson(join(compDir, f));
    if (!raw) continue;
    const data = flatten(raw);
    const slug = f.replace('.docs.json', '');
    const name = data.componentName || slug;
    // Skip components not on the released allowlist (WIP).
    if (!RELEASED_SLUGS.has(normalizeComponent(slug)) && !RELEASED_SLUGS.has(normalizeComponent(name))) {
      skippedWip.push(name);
      continue;
    }
    const markdown = data.generatedMarkdown || '';
    delete data.generatedMarkdown;
    data.importPath = '@jds4/oneui-react';
    writeJson(`components/${slug}.json`, data);
    const intent = data.intentAndPurpose?.intent || undefined;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    componentsIndex.push({ name, slug, intent, tags });
    const text = [
      name,
      typeof intent === 'string' ? intent : '',
      JSON.stringify(data.compositionRules || {}),
      JSON.stringify(data.variantLogic || {}),
      markdown,
    ].join('\n');
    corpus.push({ id: `component:${slug}`, source: 'component', title: name, text, tags: ['component', name.toLowerCase(), ...tags] });
  }
}
componentsIndex.sort((a, b) => a.name.localeCompare(b.name));
writeJson('components-index.json', componentsIndex);
counts.components = componentsIndex.length;
if (skippedWip.length) console.log(`Skipped ${skippedWip.length} WIP component(s): ${skippedWip.join(', ')}`);

/* ----------------------------- brands ----------------------------- */
// cdn-dist v2 layout (schemaVersion 2):
//   brands/index.json          → { brands: string[] }            (slugs)
//   brands/<slug>/index.json    → { latest, versions, themes? }   (themes: jio only)
//   brands/<slug>/latest.json   → { branding, themeConfig, fonts, version }
// Only the real published brands ship here (no synthetic demo brands).
const brandsRoot = join(REPO, 'cdn-dist', 'brands');
const brandIndexFile = readJson(join(brandsRoot, 'index.json'));
const brandsIndex = [];
// Re-bake brand-tokens from scratch so stale/removed brands never linger.
rmSync(join(ASSETS, 'brand-tokens'), { recursive: true, force: true });
if (brandIndexFile && Array.isArray(brandIndexFile.brands)) {
  for (const slug of brandIndexFile.brands) {
    const brandDir = join(brandsRoot, slug);
    const meta = readJson(join(brandDir, 'index.json')) || {};
    const latest = readJson(join(brandDir, 'latest.json'));
    if (!latest) continue;
    const themeConfig = latest.themeConfig;
    const fonts = latest.fonts;
    let primaryColor;
    try {
      const primary = themeConfig?.appearances?.primary;
      if (primary?.palette && primary?.baseStep != null) primaryColor = primary.palette[String(primary.baseStep)];
    } catch { /* ignore */ }
    let fontFamily;
    try {
      fontFamily = fonts?.typography?.config?.fontFamily || fonts?.customFonts?.[0]?.familyName;
    } catch { /* ignore */ }
    if (themeConfig) writeJson(`brand-tokens/${slug}.json`, themeConfig);
    const hasSpec = SPEC_SLUGS.includes(slug);
    const entry = {
      slug,
      name: latest.branding?.brandName || slug,
      latest: meta.latest ?? latest.version ?? null,
      hasSpec,
      primaryColor,
      fontFamily,
    };
    // Surface a brand's theme variants (jio ships these) so the catalog can list them.
    if (Array.isArray(meta.themes) && meta.themes.length) entry.themes = meta.themes;
    brandsIndex.push(entry);
  }
}
brandsIndex.sort((a, b) => a.slug.localeCompare(b.slug));
writeJson('brands-index.json', brandsIndex);
counts.brands = brandsIndex.length;

/* -------------------------- brand specs -------------------------- */
const exportsDir = join(REPO, 'docs', 'exports');
let specCount = 0;
for (const slug of SPEC_SLUGS) {
  const spec = readText(join(exportsDir, `${slug}.DESIGN.md`));
  if (!spec) continue;
  writeText(`brand-specs/${slug}.DESIGN.md`, spec);
  specCount++;
  corpus.push({ id: `brand-spec:${slug}`, source: 'brand-spec', title: `${slug} design spec`, text: spec, tags: ['brand', slug, 'spec', 'tokens', 'color', 'typography'] });
}
counts.brandSpecs = specCount;

/* ----------------------------- corpus ----------------------------- */
writeJson('search-corpus.json', corpus);
counts.corpusEntries = corpus.length;

/* ---------------------------- manifest ---------------------------- */
const dsVersion = brandIndexFile?.schemaVersion ? `cdn-v${brandIndexFile.schemaVersion}` : 'unknown';
writeJson('manifest.json', {
  snapshotVersion: '0.1.0',
  generatedAt: new Date().toISOString(),
  designSystem: { version: String(dsVersion) },
  counts,
});

console.log('OneUI MCP snapshot generated:');
console.log(JSON.stringify(counts, null, 2));
console.log(`→ ${ASSETS}`);
