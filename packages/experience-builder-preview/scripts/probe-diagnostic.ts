/**
 * probe-diagnostic.ts — PREV-01 zero-egress proof. Spins a networkBlockAll
 * sandbox from the registered snapshot and runs the in-box probe.js against the
 * Convex deployment URL; PASS = exit 0 + EGRESS-BLOCKED (the outbound fetch was
 * refused). Debugging/verification harness.
 *
 *   pnpm --filter @oneui/experience-builder-preview probe-diagnostic
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Daytona } from '@daytonaio/sdk';
import { PREVIEW_SNAPSHOT_NAME } from '../src/daytona/image';

const HERE = dirname(fileURLToPath(import.meta.url));

function readEnv(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  for (const file of [
    resolve(HERE, '../../../apps/platform/.env.local'),
    resolve(HERE, '../../../.env.local'),
  ]) {
    if (!existsSync(file)) continue;
    const m = readFileSync(file, 'utf8').match(
      new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`, 'm'),
    );
    if (m) return m[1].replace(/^['"]|['"]$/g, '');
  }
  return undefined;
}

async function main(): Promise<void> {
  const apiKey = readEnv('DAYTONA_API_KEY');
  if (apiKey) process.env.DAYTONA_API_KEY = apiKey;
  if (!process.env.DAYTONA_API_KEY) { console.error('✖ DAYTONA_API_KEY not set'); process.exit(1); }

  const target = readEnv('NEXT_PUBLIC_CONVEX_URL') ?? 'https://example.com';
  console.log(`• probe target (Convex URL): ${target}`);

  const daytona = new Daytona();
  const sandbox: any = await daytona.create({
    snapshot: PREVIEW_SNAPSHOT_NAME,
    networkBlockAll: true,
  });
  console.log(`• networkBlockAll sandbox id=${sandbox.id}`);
  try {
    const r = await sandbox.process.executeCommand(
      `node preview/probe.js ${target} 2>&1; echo "PROBE_EXIT=$?"`,
    );
    console.log('• probe.js output:\n' + (r.result ?? '').toString().slice(0, 2000));
  } finally {
    await sandbox.delete().catch(() => {});
    console.log('• sandbox torn down');
  }
}

main().catch((e) => { console.error('✖ probe diag error:', e instanceof Error ? e.stack : String(e)); process.exit(1); });
