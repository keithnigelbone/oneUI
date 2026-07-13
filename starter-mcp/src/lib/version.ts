/**
 * Resolve the package version at runtime — single source of truth is
 * package.json, so the version string is never hardcoded in src/.
 *
 * Mirrors the walk-up pattern of paths.ts: from this module's directory, walk
 * UP until a parseable package.json with a `version` field is found. This is
 * depth-independent, so it works for all three layouts:
 *   - compiled:  dist/lib/version.js → <pkg>/package.json
 *   - published: node_modules/@jds4/oneui-mcp/dist/lib/version.js → its package.json
 *   - bundled:   dist/index.mjs (esbuild) → the slim package.json pack-plugin
 *                writes next to the bundle (carries the same version)
 * Deliberately NOT filtered by package name — the packed-plugin layout renames
 * the slim manifest, but its version is authoritative for that artifact.
 */
import { fileURLToPath } from 'node:url';
import { dirname, parse, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

function findPackageVersion(start: string): string | null {
  let dir = start;
  const root = parse(dir).root;
  for (;;) {
    const candidate = resolve(dir, 'package.json');
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, 'utf8')) as { version?: unknown };
        if (typeof pkg.version === 'string' && pkg.version) return pkg.version;
      } catch {
        // unparseable — keep walking up
      }
    }
    if (dir === root) return null;
    dir = dirname(dir);
  }
}

export const PACKAGE_VERSION =
  findPackageVersion(dirname(fileURLToPath(import.meta.url))) ?? '0.0.0-unknown';
