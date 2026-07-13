import { fileURLToPath } from 'node:url';
import { dirname, parse, resolve } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Resolve the package's baked `assets/` directory at runtime.
 *
 * `assets/` is a committed sibling of the entrypoint's tree (declared in
 * package.json `files`). We locate it by walking UP from this module's directory
 * until we find an `assets/manifest.json`. This is depth-independent, so it works
 * for BOTH layouts:
 *   - compiled:  `dist/lib/paths.js` → `<pkg>/assets`
 *   - bundled:   `dist/index.mjs` (esbuild single-file) → `<pkg>/assets`
 * This is the ONLY place that knows where the snapshot lives.
 */
const here = dirname(fileURLToPath(import.meta.url));

function findAssetsDir(start: string): string {
  let dir = start;
  const root = parse(dir).root;
  for (;;) {
    const candidate = resolve(dir, 'assets');
    if (existsSync(resolve(candidate, 'manifest.json'))) return candidate;
    if (dir === root) break;
    dir = dirname(dir);
  }
  // Fallback to the historical compiled layout (dist/lib → pkg root).
  return resolve(start, '..', '..', 'assets');
}

export const ASSETS_DIR = findAssetsDir(here);

export function assetPath(...segments: string[]): string {
  return resolve(ASSETS_DIR, ...segments);
}
