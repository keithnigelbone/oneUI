/**
 * Runtime auto-sync of the "released" surface from the INSTALLED @jds4/oneui-react.
 *
 * The published package (>= 0.1.0-alpha.6) ships the canonical release gates:
 *   - dist/registry/releasedComponents.mjs → RELEASED_COMPONENTS + PUBLIC_INFRA_COMPONENT_MODULES
 *     (which COMPONENTS are public) — used to filter the catalog.
 *   - dist/index.public.d.ts → the gated public barrel (which NAMES are importable,
 *     incl. compound parts like TabGroup/TabItem) — used by the validator.
 *
 * Reading these from the user's node_modules means the MCP always matches whatever
 * package VERSION is installed, and updates automatically on `npm update` — no manual
 * step. Falls back to the baked/vendored lists when the package isn't installed or
 * predates the release gates (offline-safe). Still zero network; reads local files only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Default = the React pack's package path. Other platforms pass their own subdir
 *  (from `PLATFORMS[id].pkgSubdir` in lib/platforms.ts). */
const DEFAULT_PKG_SUBDIR = ['node_modules', '@jds4', 'oneui-react'];

/** Normalise a component name/slug for matching (lowercase, alphanumerics only). */
export function normalizeComponent(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pkgDir(projectRoot: string, pkgSubdir: string[]): string | null {
  const d = resolve(projectRoot, ...pkgSubdir);
  return existsSync(d) ? d : null;
}

/** Cache key scoped by both project root AND package path (platform-aware). */
function cacheKey(projectRoot: string, pkgSubdir: string[]): string {
  return `${pkgSubdir.join('/')}::${projectRoot}`;
}

const componentsCache = new Map<string, Set<string> | null>();

/**
 * Released COMPONENT slugs (normalised) from the installed package's
 * registry/releasedComponents (RELEASED_COMPONENTS + infra). null if unavailable.
 */
export async function getInstalledReleasedComponents(
  projectRoot: string,
  pkgSubdir: string[] = DEFAULT_PKG_SUBDIR,
): Promise<Set<string> | null> {
  const key = cacheKey(projectRoot, pkgSubdir);
  if (componentsCache.has(key)) return componentsCache.get(key) ?? null;
  let result: Set<string> | null = null;
  const dir = pkgDir(projectRoot, pkgSubdir);
  if (dir) {
    for (const file of ['dist/registry/releasedComponents.mjs', 'dist/registry/releasedComponents.cjs']) {
      const p = resolve(dir, file);
      if (!existsSync(p)) continue;
      try {
        const mod = (await import(pathToFileURL(p).href)) as {
          RELEASED_COMPONENTS?: string[];
          PUBLIC_INFRA_COMPONENT_MODULES?: string[];
        };
        const names = [
          ...(mod.RELEASED_COMPONENTS ?? []),
          ...(mod.PUBLIC_INFRA_COMPONENT_MODULES ?? []),
        ];
        if (names.length) {
          result = new Set(names.map(normalizeComponent));
          break;
        }
      } catch {
        /* ignore — fall back */
      }
    }
  }
  componentsCache.set(key, result);
  return result;
}

const exportsCache = new Map<string, Set<string> | null>();

/**
 * Released public-barrel export NAMES from the installed package's
 * dist/index.public.d.ts (incl. compound parts + infra). null if unavailable.
 */
export function getInstalledReleasedExports(
  projectRoot: string,
  pkgSubdir: string[] = DEFAULT_PKG_SUBDIR,
): Set<string> | null {
  const key = cacheKey(projectRoot, pkgSubdir);
  if (exportsCache.has(key)) return exportsCache.get(key) ?? null;
  let result: Set<string> | null = null;
  const dir = pkgDir(projectRoot, pkgSubdir);
  if (dir) {
    const p = resolve(dir, 'dist/index.public.d.ts');
    if (existsSync(p)) {
      try {
        const src = readFileSync(p, 'utf8');
        const names = new Set<string>();
        for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
          for (let n of m[1].split(',')) {
            n = n.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()!.trim();
            if (/^[A-Z][A-Za-z0-9]+$/.test(n)) names.add(n);
          }
        }
        for (const m of src.matchAll(/export\s+declare\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9]+)/g)) {
          names.add(m[1]);
        }
        if (names.size) result = names;
      } catch {
        /* ignore — fall back */
      }
    }
  }
  exportsCache.set(key, result);
  return result;
}
