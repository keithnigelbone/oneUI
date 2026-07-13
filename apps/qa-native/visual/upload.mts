/**
 * upload.mts — push the per-section screenshots to Applitools Eyes.
 *
 * One Eyes test per screen (testName = route), one checkpoint per section
 * (tag = section testID), all grouped under a single batch. Reads
 * `manifest.json` + the PNGs captured by Maestro in `visual/screenshots/`.
 *
 * Usage:
 *   tsx visual/upload.mts            # all screens in the manifest
 *   tsx visual/upload.mts Button     # only the named screen(s)
 *
 * Requires APPLITOOLS_API_KEY in the environment. Set
 * APPLITOOLS_BATCH_ACCEPT_NEW=true to auto-accept brand-new baselines.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-images';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(__dirname, 'manifest.json');
const SHOTS_DIR = resolve(__dirname, 'screenshots');

const APP_NAME = 'OneUI qa-native';
const BATCH_NAME = 'OneUI qa-native — RN component sections';
// Dedicated Eyes server for this org (matches the jioeyes dashboard). Override
// with APPLITOOLS_SERVER_URL if your account lives elsewhere.
const SERVER_URL = process.env.APPLITOOLS_SERVER_URL ?? 'https://jioeyes.applitools.com';

interface SectionEntry { id: string; tag: string; file: string }
interface ScreenEntry { route: string; sections: SectionEntry[] }

const apiKey = process.env.APPLITOOLS_API_KEY;
if (!apiKey) {
  console.error('✗ APPLITOOLS_API_KEY is not set. Export it and re-run.');
  process.exit(1);
}
if (!existsSync(MANIFEST)) {
  console.error(`✗ ${MANIFEST} not found — run "pnpm visual:gen" first.`);
  process.exit(1);
}

const manifest: ScreenEntry[] = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const filter = process.argv.slice(2);
const screens = filter.length
  ? manifest.filter((s) => filter.includes(s.route))
  : manifest;

if (screens.length === 0) {
  console.error(`✗ No screens matched ${JSON.stringify(filter)}.`);
  process.exit(1);
}

const batch = new BatchInfo(BATCH_NAME);
let checkpoints = 0;
let missing = 0;
const failures: string[] = [];

for (const screen of screens) {
  const eyes = new Eyes();
  eyes.setApiKey(apiKey);
  eyes.setServerUrl(SERVER_URL);
  eyes.setBatch(batch);

  try {
    await eyes.open(APP_NAME, screen.route);
    for (const sec of screen.sections) {
      const path = resolve(SHOTS_DIR, sec.file);
      if (!existsSync(path)) {
        console.warn(`  ⚠ missing screenshot: ${sec.file} (skipped)`);
        missing++;
        continue;
      }
      await eyes.check(sec.tag, Target.image(readFileSync(path)));
      checkpoints++;
    }
    const results = await eyes.close(false);
    const status = typeof results?.getStatus === 'function' ? results.getStatus() : 'Unknown';
    const url = typeof results?.getUrl === 'function' ? results.getUrl() : undefined;
    console.log(`✓ ${screen.route} — ${screen.sections.length} sections uploaded · status=${status}`);
    if (url) console.log(`   ${url}`);
  } catch (err) {
    failures.push(`${screen.route}: ${(err as Error).message}`);
    console.error(`✗ ${screen.route}: ${(err as Error).message}`);
    await eyes.abort();
  }
}

console.log(
  `\nDone. ${checkpoints} checkpoints across ${screens.length} screens` +
    (missing ? `, ${missing} missing screenshots` : '') +
    `. View results in the Applitools dashboard (batch: "${BATCH_NAME}").`,
);
if (failures.length) process.exit(1);
