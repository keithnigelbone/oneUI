/**
 * render-diagnostic.ts — exercise DaytonaExecutor.render() end-to-end against the
 * live account with a MINIMAL artifact, and report success or the real error.
 * Debugging harness for the Lab `preview` step (the browser only sees
 * `Run completed: error`).
 *
 *   pnpm --filter @oneui/experience-builder-preview render-diagnostic
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DaytonaExecutor } from '../src/DaytonaExecutor';

const HERE = dirname(fileURLToPath(import.meta.url));

function ensureApiKey(): void {
  if (process.env.DAYTONA_API_KEY) return;
  for (const file of [
    resolve(HERE, '../../../apps/platform/.env.local'),
    resolve(HERE, '../../../.env.local'),
  ]) {
    if (!existsSync(file)) continue;
    const m = readFileSync(file, 'utf8').match(/^\s*DAYTONA_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) {
      process.env.DAYTONA_API_KEY = m[1].replace(/^['"]|['"]$/g, '');
      return;
    }
  }
}

const MINIMAL_BUNDLE = `export function GeneratedArtifact() {
  return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Daytona render diagnostic OK</div>;
}`;

async function main(): Promise<void> {
  ensureApiKey();
  if (!process.env.DAYTONA_API_KEY) { console.error('✖ DAYTONA_API_KEY not set'); process.exit(1); }

  const executor = new DaytonaExecutor();
  console.log('• Calling DaytonaExecutor.render()…');
  const t0 = Date.now();
  try {
    const result = await executor.render({
      bundle: MINIMAL_BUNDLE,
      brandId: 'diagnostic',
      profiles: [{ name: 'desktop', width: 1440, height: 900 }],
    });
    console.log(`✔ render OK in ${Date.now() - t0}ms`);
    console.log('  rendered:', result.rendered);
    console.log('  screenshots:', result.screenshots.map((s) => `${s.profile}:${s.png.length}B`));
    console.log('  previewState.url:', result.previewState.url);
    console.log('  previewState.sandboxId:', result.previewState.sandboxId);
    if (result.previewState.sandboxId) {
      await executor.expirePreview(result.previewState.sandboxId).catch(() => {});
      console.log('  (sandbox torn down)');
    }
  } catch (err) {
    console.error(`✖ render FAILED in ${Date.now() - t0}ms`);
    console.error('  ', err instanceof Error ? err.stack : String(err));
    process.exit(1);
  }
}

main();
