/**
 * Registry of QA Playground components with Playwright + ingest metadata.
 * Used by `scripts/run-qa-component.mts` for parameterized functional / a11y / all runs.
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const QA_PLAYGROUND_ROOT = join(__dirname, '..');
export const E2E_DIR = join(QA_PLAYGROUND_ROOT, 'e2e');

export type QaSuiteKind = 'functional' | 'a11y' | 'all';

export type QaComponentEntry = {
  slug: string;
  /** Playwright config filename relative to qa-playground root. */
  configFile: string;
  /** Run `pnpm playwright:install` + macOS browser cache before tests. */
  needsPlaywrightInstall?: boolean;
};

/** Configs excluded from auto-discovery (non-component QA bundles). */
const EXCLUDED_CONFIG_SLUGS = new Set(['applitools', 'badge', 'badge.visual', 'figma-pipeline']);

function discoverFromPlaywrightConfigs(): QaComponentEntry[] {
  const entries: QaComponentEntry[] = [];
  for (const name of readdirSync(QA_PLAYGROUND_ROOT)) {
    const m = name.match(/^playwright\.(.+)\.config\.ts$/);
    if (!m) continue;
    const slug = m[1]!;
    if (EXCLUDED_CONFIG_SLUGS.has(slug)) continue;
    entries.push({
      slug,
      configFile: name,
      needsPlaywrightInstall: slug === 'chip' || slug === 'chip-group' || slug === 'modal',
    });
  }
  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Button is scoped in `playwright.button.config.ts` (not the catch-all default config). */
const BUTTON_ENTRY: QaComponentEntry = {
  slug: 'button',
  configFile: 'playwright.button.config.ts',
};

/** Badge has its own config; `badge.visual` stays excluded (Applitools-only). */
const BADGE_ENTRY: QaComponentEntry = {
  slug: 'badge',
  configFile: 'playwright.badge.config.ts',
};

export const QA_COMPONENTS: QaComponentEntry[] = [
  BUTTON_ENTRY,
  BADGE_ENTRY,
  ...discoverFromPlaywrightConfigs(),
];

export function getQaComponent(slug: string): QaComponentEntry | undefined {
  return QA_COMPONENTS.find((c) => c.slug === slug);
}

export function listQaComponentSlugs(): string[] {
  return QA_COMPONENTS.map((c) => c.slug);
}

export function hasAccessibilitySpec(slug: string): boolean {
  return existsSync(join(E2E_DIR, `${slug}-accessibility.spec.ts`));
}

export function hasFunctionalQaSpec(slug: string): boolean {
  return existsSync(join(E2E_DIR, `${slug}-qa.spec.ts`));
}

export function hasFigmaMatrixSpec(slug: string): boolean {
  return existsSync(join(E2E_DIR, `${slug}-figma-matrix.spec.ts`));
}

export function functionalSpecPaths(slug: string): string[] {
  const paths: string[] = [];
  if (hasFunctionalQaSpec(slug)) paths.push(`e2e/${slug}-qa.spec.ts`);
  if (hasFigmaMatrixSpec(slug)) paths.push(`e2e/${slug}-figma-matrix.spec.ts`);
  return paths;
}

export function accessibilitySpecPath(slug: string): string | undefined {
  const p = join(E2E_DIR, `${slug}-accessibility.spec.ts`);
  return existsSync(p) ? `e2e/${slug}-accessibility.spec.ts` : undefined;
}

export function ingestScriptPath(slug: string): string {
  return join(QA_PLAYGROUND_ROOT, 'scripts', `ingest-${slug}-playwright-json.mts`);
}

export function ingestScriptExists(slug: string): boolean {
  return existsSync(ingestScriptPath(slug));
}
