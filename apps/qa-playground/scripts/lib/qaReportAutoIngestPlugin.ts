/**
 * Dev-only Vite plugin: when Playwright writes `test-results/<slug>-playwright.json`,
 * re-ingest `public/qa-reports/<slug>-summary.json` so the QA playground UI stays current.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

const PLAYWRIGHT_JSON_SUFFIX = '-playwright.json';
const INGEST_DEBOUNCE_MS = 750;

function slugFromPlaywrightJsonPath(filePath: string): string | null {
  const base = path.basename(filePath);
  if (!base.endsWith(PLAYWRIGHT_JSON_SUFFIX)) return null;
  return base.slice(0, -PLAYWRIGHT_JSON_SUFFIX.length);
}

function runNodeScript(appRoot: string, scriptRelativePath: string, args: string[] = []) {
  const repoRoot = path.resolve(appRoot, '../..');
  const tsxCli = path.join(repoRoot, 'node_modules/tsx/dist/cli.mjs');
  const scriptPath = path.join(appRoot, scriptRelativePath);

  return new Promise<number>((resolve) => {
    const child = spawn(process.execPath, [tsxCli, scriptPath, ...args], {
      cwd: appRoot,
      stdio: 'inherit',
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

export function qaReportAutoIngestPlugin(appRoot: string): Plugin {
  const testResultsDir = path.join(appRoot, 'test-results');
  const summaryDir = path.join(appRoot, 'public', 'qa-reports');
  const pending = new Map<string, ReturnType<typeof setTimeout>>();
  let running = false;
  const queuedSlugs = new Set<string>();

  async function ingestSlug(slug: string, server: ViteDevServer) {
    queuedSlugs.add(slug);
    if (running) return;

    running = true;
    try {
      while (queuedSlugs.size > 0) {
        const nextSlug = queuedSlugs.values().next().value as string;
        queuedSlugs.delete(nextSlug);

        const ingestCode = await runNodeScript(appRoot, 'scripts/ingest-playwright-by-slug.mts', [
          nextSlug,
        ]);
        if (ingestCode !== 0) continue;

        await runNodeScript(appRoot, 'scripts/generate-qa-dashboard.mts');
        server.ws.send({ type: 'full-reload', path: '*' });
      }
    } finally {
      running = false;
    }
  }

  function shouldIngest(slug: string): boolean {
    const playPath = path.join(testResultsDir, `${slug}${PLAYWRIGHT_JSON_SUFFIX}`);
    const summaryPath = path.join(summaryDir, `${slug}-summary.json`);
    if (!existsSync(playPath)) return false;
    if (!existsSync(summaryPath)) return true;
    return statSync(playPath).mtimeMs > statSync(summaryPath).mtimeMs;
  }

  function scheduleIngest(slug: string, server: ViteDevServer) {
    if (!shouldIngest(slug)) return;

    const prev = pending.get(slug);
    if (prev) clearTimeout(prev);
    pending.set(
      slug,
      setTimeout(() => {
        pending.delete(slug);
        void ingestSlug(slug, server);
      }, INGEST_DEBOUNCE_MS),
    );
  }

  function handlePlaywrightJson(filePath: string, server: ViteDevServer) {
    const slug = slugFromPlaywrightJsonPath(filePath);
    if (!slug) return;
    scheduleIngest(slug, server);
  }

  function syncStaleSummaries(server: ViteDevServer) {
    if (!existsSync(testResultsDir)) return;
    for (const name of readdirSync(testResultsDir)) {
      if (!name.endsWith(PLAYWRIGHT_JSON_SUFFIX)) continue;
      const slug = slugFromPlaywrightJsonPath(name);
      if (slug) scheduleIngest(slug, server);
    }
  }

  return {
    name: 'qa-report-auto-ingest',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(testResultsDir);
      server.watcher.on('change', (filePath) => handlePlaywrightJson(filePath, server));
      server.watcher.on('add', (filePath) => handlePlaywrightJson(filePath, server));
      syncStaleSummaries(server);
    },
  };
}
