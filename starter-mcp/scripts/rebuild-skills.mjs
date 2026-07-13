#!/usr/bin/env node
/**
 * Self-contained skills + corpus rebuild — reads ONLY from `assets/`, never the
 * monorepo. Use this when skill files under assets/skills/ are added/changed
 * directly (e.g. authoritative designer skills baked in by hand), so we don't
 * have to run the full monorepo snapshot generator (which would clobber the
 * hand-fixed invariants.md / shape / surface-mode corrections).
 *
 * Rebuilds:
 *   - skills-index.json        (one entry per dir under assets/skills/)
 *   - search-corpus.json       (keeps non-skill entries, refreshes invariants
 *                               text, regenerates all skill entries)
 *   - manifest.json counts     (skills + corpusEntries)
 *
 *   node scripts/rebuild-skills.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, '..', 'assets');
const SKILLS_DIR = join(ASSETS, 'skills');

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
function writeJson(p, value) {
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

/** Parse minimal YAML frontmatter (name, description, category). */
function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const lines = m[1].split('\n');
  const out = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (key) out[key] = buf.join(' ').trim().replace(/^["'>|]\s*/, '').replace(/"\s*$/, '');
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

/** Recursively list files under a dir, as paths relative to that dir. */
function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      for (const f of listFiles(full)) out.push(`${entry}/${f}`);
    } else {
      out.push(entry);
    }
  }
  return out;
}

/* ---------------------------- rebuild skills ---------------------------- */
const skillDirs = readdirSync(SKILLS_DIR).filter((d) =>
  statSync(join(SKILLS_DIR, d)).isDirectory(),
);

const skillsIndex = [];
const skillCorpus = [];
for (const name of skillDirs.sort()) {
  const dir = join(SKILLS_DIR, name);
  const md = readText(join(dir, 'SKILL.md'));
  if (!md) continue;
  const fm = parseFrontmatter(md);
  const files = listFiles(dir).sort((a, b) => (a === 'SKILL.md' ? -1 : b === 'SKILL.md' ? 1 : a.localeCompare(b)));
  skillsIndex.push({
    name,
    description: fm.description || `${name} skill`,
    category: fm.category,
    files,
  });
  skillCorpus.push({
    id: `skill:${name}`,
    source: 'skill',
    title: name,
    text: md,
    tags: ['skill', name, ...name.split('-')],
  });
}
writeJson(join(ASSETS, 'skills-index.json'), skillsIndex);

/* ---------------------------- rebuild corpus ---------------------------- */
const corpus = readJson(join(ASSETS, 'search-corpus.json')) || [];
// Keep every non-skill entry; refresh the invariants entry text from disk.
const invariantsText = readText(join(ASSETS, 'invariants.md'));
let kept = corpus
  .filter((e) => e.source !== 'skill')
  .map((e) => (e.id === 'invariants' && invariantsText ? { ...e, text: invariantsText } : e));

// MCP-authored top-level docs (not skills, not from monorepo) → ensure a corpus entry.
const docEntries = [
  { id: 'registry-setup', file: 'registry-setup.md', source: 'registry-setup', title: 'JDS feed / registry setup', tags: ['registry', 'npmrc', 'feed', 'auth', 'pat', 'azure', 'install', 'setup'] },
];
for (const d of docEntries) {
  const docText = readText(join(ASSETS, d.file));
  if (!docText) continue;
  kept = kept.filter((e) => e.id !== d.id); // drop stale, re-add fresh
  kept.push({ id: d.id, source: d.source, title: d.title, text: docText, tags: d.tags });
}

const newCorpus = [...skillCorpus, ...kept];
writeJson(join(ASSETS, 'search-corpus.json'), newCorpus);

/* --------------------------- update manifest --------------------------- */
const manifest = readJson(join(ASSETS, 'manifest.json'));
if (manifest) {
  manifest.counts = manifest.counts || {};
  manifest.counts.skills = skillsIndex.length;
  manifest.counts.corpusEntries = newCorpus.length;
  manifest.generatedAt = new Date().toISOString();
  writeJson(join(ASSETS, 'manifest.json'), manifest);
}

console.log('Rebuilt skills + corpus from assets/:');
console.log('  skills:', skillsIndex.map((s) => s.name).join(', '));
console.log('  corpus entries:', newCorpus.length, `(${skillCorpus.length} skill, ${kept.length} other)`);
