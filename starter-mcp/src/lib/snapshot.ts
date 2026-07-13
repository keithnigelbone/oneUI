/**
 * Reads the baked, offline knowledge snapshot from `assets/`.
 * The snapshot is produced at authoring time by `scripts/build-snapshot.mjs`
 * and committed to the package, so this module never touches the monorepo.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { assetPath } from './paths.js';

export interface SnapshotManifest {
  snapshotVersion: string;
  generatedAt: string;
  designSystem: { version: string };
  counts: Record<string, number>;
}

export interface SkillIndexEntry {
  name: string;
  description: string;
  category?: string;
  files: string[]; // relative paths under assets/skills/<name>/
}

export interface ComponentIndexEntry {
  name: string;
  slug: string;
  intent?: string;
  tags?: string[];
}

export interface BrandIndexEntry {
  slug: string;
  name: string;
  synthetic: boolean;
  latest: string | null;
  hasSpec: boolean;
  primaryColor?: string;
  fontFamily?: string;
}

export interface CorpusEntry {
  id: string;
  source: string; // skill | invariants | surface-guide | component | brand-spec | doc
  title: string;
  text: string;
  tags: string[];
}

function readJson<T>(rel: string, fallback: T): T {
  const p = assetPath(rel);
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function readText(rel: string): string | null {
  const p = assetPath(rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

export function getManifest(): SnapshotManifest | null {
  return readJson<SnapshotManifest | null>('manifest.json', null);
}

export function getSkillIndex(): SkillIndexEntry[] {
  return readJson<SkillIndexEntry[]>('skills-index.json', []);
}

export function getSkill(name: string): { meta: SkillIndexEntry; body: string } | null {
  const entry = getSkillIndex().find((s) => s.name === name);
  if (!entry) return null;
  const body = readText(`skills/${name}/SKILL.md`);
  if (body === null) return null;
  return { meta: entry, body };
}

export function getSkillReference(name: string, refRelPath: string): string | null {
  if (refRelPath.includes('..') || refRelPath.includes('\\')) return null;
  const skillsBase = assetPath('skills');
  const resolved = resolve(skillsBase, name, refRelPath);
  if (!resolved.startsWith(skillsBase + '/') && resolved !== skillsBase) return null;
  return readText(`skills/${name}/${refRelPath}`);
}

/**
 * Read the component index. `subdir` selects a platform's baked catalog:
 * '' (default) = web/react at the assets root; 'native' = assets/native/ (RN).
 * Maps to the active PlatformPack's `assetSubdir` (see lib/platforms.ts).
 */
export function getComponentIndex(subdir = ''): ComponentIndexEntry[] {
  const rel = subdir ? `${subdir}/components-index.json` : 'components-index.json';
  return readJson<ComponentIndexEntry[]>(rel, []);
}

export function getComponent(slug: string, subdir = ''): Record<string, unknown> | null {
  if (slug.includes('..') || slug.includes('/')) return null;
  if (subdir.includes('..') || subdir.includes('/')) return null;
  const rel = subdir ? `${subdir}/components/${slug}.json` : `components/${slug}.json`;
  return readJson<Record<string, unknown> | null>(rel, null);
}

export function getBrandIndex(): BrandIndexEntry[] {
  return readJson<BrandIndexEntry[]>('brands-index.json', []);
}

export function getBrandTokens(slug: string): Record<string, unknown> | null {
  if (slug.includes('..') || slug.includes('/')) return null;
  return readJson<Record<string, unknown> | null>(`brand-tokens/${slug}.json`, null);
}

export function getBrandSpec(slug: string): string | null {
  if (slug.includes('..') || slug.includes('/')) return null;
  return readText(`brand-specs/${slug}.DESIGN.md`);
}

export function getCoreInvariants(): string | null {
  return readText('invariants.md');
}

export function getSurfaceGuide(): string | null {
  return readText('surface-guide.md');
}

export function getRegistrySetup(): string | null {
  return readText('registry-setup.md');
}

export function getPrdTemplate(): string | null {
  return readText('prd-template.md');
}

export function getCorpus(): CorpusEntry[] {
  return readJson<CorpusEntry[]>('search-corpus.json', []);
}

/** Sanity check used by the MCP at startup. */
export function snapshotAvailable(): boolean {
  return existsSync(assetPath('manifest.json'));
}

export function listAssetFiles(rel: string): string[] {
  const p = assetPath(rel);
  if (!existsSync(p)) return [];
  return readdirSync(p);
}
