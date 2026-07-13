/**
 * Writes `e2e/applitools-brand-cases.generated.json` before Playwright loads test files.
 *
 * Run via `pnpm run test:applitools` in `@oneui/button-figma-validation`.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveApplitoolsBrandCases } from '../e2e/resolveApplitoolsBrandCases';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const monorepoRoot = path.join(appRoot, '..', '..');
const outPath = path.join(appRoot, 'e2e/applitools-brand-cases.generated.json');

function applyDotEnvFile(filePath: string, overrideExisting: boolean): void {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\n/)) {
    const line = rawLine.replace(/\r$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const stripped = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eq = stripped.indexOf('=');
    if (eq === -1) continue;
    const key = stripped.slice(0, eq).trim();
    if (!key) continue;
    let value = stripped.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (overrideExisting || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

applyDotEnvFile(path.join(monorepoRoot, '.env.local'), true);
applyDotEnvFile(path.join(monorepoRoot, '.env'), false);

const cases = await resolveApplitoolsBrandCases();
writeFileSync(outPath, `${JSON.stringify(cases, null, 0)}\n`, 'utf8');
// eslint-disable-next-line no-console
console.log(`[applitools] wrote ${cases.length} brand case(s) → ${outPath}`);
