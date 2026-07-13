/**
 * register-snapshot.ts — one-time Daytona snapshot registration for the
 * zero-egress preview pipeline (Plan 03.1-05 live-gate prerequisite).
 *
 * `image.ts` documents that the custom Playwright image must be registered ONCE
 * as the named snapshot `PREVIEW_SNAPSHOT_NAME` via the `daytona.snapshot`
 * service; `DaytonaExecutor.render` then reuses it with `create({ snapshot })`
 * so per-run create skips the cold build (RESEARCH Pattern 3 / Pitfall 2).
 * This script IS that one-time setup step (it was referenced but never built —
 * without it `create({ snapshot: 'oneui-preview-v1' })` fails fast with a
 * snapshot-not-found error and every Daytona preview run errors).
 *
 * Run it once (and again only on a Playwright version bump):
 *
 *   # DAYTONA_API_KEY must be available (read automatically from
 *   # apps/platform/.env.local or the root .env.local if not already exported)
 *   pnpm --filter @oneui/experience-builder-preview register-snapshot
 *   # rebuild an existing snapshot:
 *   pnpm --filter @oneui/experience-builder-preview register-snapshot -- --force
 *
 * Idempotent: skips when the snapshot already exists unless `--force` is passed.
 * NOTE: a first build runs a cold AMD64 image build on Daytona — several minutes.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Daytona } from '@daytonaio/sdk';
import {
  buildDaytonaImage,
  PLAYWRIGHT_VERSION,
  PREVIEW_SNAPSHOT_NAME,
} from '../src/daytona/image';

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Load `DAYTONA_API_KEY` from the nearest `.env.local` when it isn't already in
 * the process env, so the script "just works" with the key the Lab already uses.
 * Minimal parser — no dotenv dependency; the SDK reads the env var itself.
 */
function ensureApiKey(): void {
  if (process.env.DAYTONA_API_KEY) return;
  const candidates = [
    resolve(HERE, '../../../apps/platform/.env.local'),
    resolve(HERE, '../../../.env.local'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*DAYTONA_API_KEY\s*=\s*(.+?)\s*$/);
      if (match) {
        process.env.DAYTONA_API_KEY = match[1].replace(/^['"]|['"]$/g, '');
        console.log(`• Loaded DAYTONA_API_KEY from ${file}`);
        return;
      }
    }
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    // Build the image descriptor only — no API key, no Daytona calls. Confirms
    // the recipe + imports load before committing to a multi-minute live build.
    buildDaytonaImage();
    console.log(
      `✔ dry-run OK — would register snapshot "${PREVIEW_SNAPSHOT_NAME}" ` +
        `(Playwright ${PLAYWRIGHT_VERSION}) from buildDaytonaImage(). ` +
        'Re-run without --dry-run to perform the live build.',
    );
    return;
  }

  ensureApiKey();

  if (!process.env.DAYTONA_API_KEY) {
    console.error(
      '✖ DAYTONA_API_KEY is not set. Add it to apps/platform/.env.local (or export it) and re-run.',
    );
    process.exit(1);
  }

  const daytona = new Daytona();

  if (process.argv.includes('--list')) {
    // Diagnostic: isolate read permission vs create permission. If list works
    // but create returns "Access denied", the key lacks snapshot-create scope.
    const result = await daytona.snapshot.list(1, 10);
    console.log(
      `✔ snapshot.list OK — total: ${result.total}; names: ` +
        JSON.stringify(result.items.map((s) => s.name)),
    );
    return;
  }

  if (!force) {
    try {
      const existing = await daytona.snapshot.get(PREVIEW_SNAPSHOT_NAME);
      console.log(
        `✔ Snapshot "${PREVIEW_SNAPSHOT_NAME}" already exists (state: ${existing.state}). ` +
          'Nothing to do — pass --force to rebuild (e.g. after a Playwright bump).',
      );
      return;
    } catch {
      // Not found — fall through to create.
    }
  }

  console.log(
    `• Building + registering snapshot "${PREVIEW_SNAPSHOT_NAME}" ` +
      `(Playwright ${PLAYWRIGHT_VERSION}). A cold image build runs on Daytona and ` +
      'can take several minutes — logs stream below:\n',
  );

  await daytona.snapshot.create(
    { name: PREVIEW_SNAPSHOT_NAME, image: buildDaytonaImage() },
    { onLogs: (chunk) => process.stdout.write(chunk), timeout: 0 },
  );

  console.log(
    `\n✔ Snapshot "${PREVIEW_SNAPSHOT_NAME}" registered. ` +
      'The Lab Daytona path can now reuse it via create({ snapshot }).',
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('✖ Snapshot registration failed:', message);
  process.exit(1);
});
