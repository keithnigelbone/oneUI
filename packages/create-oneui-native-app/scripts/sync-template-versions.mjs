/**
 * sync-template-versions.mjs
 *
 * Resolves published @oneui/* versions from the private registry and
 * rewrites template package.json dependency pins.
 *
 * Falls back to the workspace root package.json if `npm view` fails.
 *
 * Usage:
 *   node scripts/sync-template-versions.mjs
 *   ONEUI_REGISTRY_URL=https://... node scripts/sync-template-versions.mjs
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REGISTRY_HOST = process.env.ONEUI_REGISTRY_HOST ?? 'jio-dsp.pkgs.visualstudio.com';
const REGISTRY_FEED = process.env.ONEUI_REGISTRY_FEED ?? 'JIO-DS-OneUI-Native';
const REGISTRY_URL =
  process.env.ONEUI_REGISTRY_URL ??
  `https://${REGISTRY_HOST}/_packaging/${REGISTRY_FEED}/npm/registry/`;

const TEMPLATE_DIRS = [
  join(__dirname, '../templates/bare'),
  join(__dirname, '../templates/default'),
];

/** Try to resolve the latest published version of a package. Returns null on failure. */
function resolveVersion(pkgName) {
  try {
    const result = execSync(
      `npm view ${pkgName} version --registry ${REGISTRY_URL}`,
      { stdio: 'pipe', timeout: 15_000 },
    );
    return result.toString().trim() || null;
  } catch {
    return null;
  }
}

for (const templateDir of TEMPLATE_DIRS) {
  const pkgPath = join(templateDir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    console.warn(`  skip: could not read ${pkgPath}`);
    continue;
  }

  let changed = false;
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[section];
    if (!deps) continue;
    for (const [name, currentPin] of Object.entries(deps)) {
      if (!name.startsWith('@oneui/')) continue;
      const resolved = resolveVersion(name);
      if (!resolved) {
        console.warn(`  warn: could not resolve ${name} — keeping ${currentPin}`);
        continue;
      }
      const newPin = `^${resolved}`;
      if (newPin !== currentPin) {
        console.log(`  ${name}: ${currentPin} → ${newPin}`);
        deps[name] = newPin;
        changed = true;
      } else {
        console.log(`  ${name}: ${currentPin} (up to date)`);
      }
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`  wrote ${pkgPath}`);
  }
}

console.log('\nDone.');
