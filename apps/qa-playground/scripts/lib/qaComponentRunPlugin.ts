/**
 * Dev-only Vite plugin: run `pnpm qa:component -- <slug>` from the QA playground UI
 * with stdout/stderr streamed over SSE.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';

import { getQaComponent, listQaComponentSlugs } from '../qa-component-registry.mts';

type RunStatus = 'running' | 'success' | 'failed';

type RunRecord = {
  id: string;
  slug: string;
  status: RunStatus;
  exitCode: number | null;
  logs: string[];
  listeners: Set<(event: RunStreamEvent) => void>;
  process: ChildProcess | null;
  lineBuffer: string;
};

type RunStreamEvent =
  | { type: 'log'; line: string }
  | { type: 'done'; ok: boolean; exitCode: number; dashboardOk: boolean };

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function writeSse(res: ServerResponse, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

class QaComponentRunManager {
  private runs = new Map<string, RunRecord>();
  private activeRunId: string | null = null;

  startRun(
    appRoot: string,
    options: { slug?: string; all?: boolean },
  ): { runId: string } | { error: string; status: number } {
    if (this.activeRunId) {
      return { error: 'A component test run is already in progress.', status: 409 };
    }

    const all = options.all === true;
    const slug = options.slug?.trim() ?? '';

    if (all && slug) {
      return { error: 'Use either slug or all, not both.', status: 400 };
    }
    if (!all && !slug) {
      return { error: 'Missing slug or all in request body.', status: 400 };
    }
    if (!all && !getQaComponent(slug)) {
      return { error: `Unknown component slug: "${slug}"`, status: 404 };
    }

    const repoRoot = path.resolve(appRoot, '../..');
    const tsxCli = path.join(repoRoot, 'node_modules/tsx/dist/cli.mjs');
    const scriptPath = path.join(appRoot, 'scripts/run-qa-component.mts');
    const runId = randomUUID();
    const runLabel = all ? '--all' : slug;

    const record: RunRecord = {
      id: runId,
      slug: runLabel,
      status: 'running',
      exitCode: null,
      logs: [],
      listeners: new Set(),
      process: null,
      lineBuffer: '',
    };

    this.runs.set(runId, record);
    this.activeRunId = runId;

    const childArgs = all
      ? [tsxCli, scriptPath, '--all']
      : [tsxCli, scriptPath, slug];

    const child = spawn(process.execPath, childArgs, {
      cwd: appRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    record.process = child;

    this.appendLog(record, `$ pnpm qa:component -- ${runLabel}\n`);

    const onChunk = (chunk: Buffer) => {
      this.appendChunk(record, chunk.toString('utf8'));
    };

    child.stdout?.on('data', onChunk);
    child.stderr?.on('data', onChunk);

    child.on('close', (code) => {
      void this.finishRun(appRoot, record, code);
    });

    child.on('error', (error) => {
      void this.finishRun(appRoot, record, 1, error.message);
    });

    return { runId };
  }

  private async finishRun(
    appRoot: string,
    record: RunRecord,
    code: number | null,
    processError?: string,
  ): Promise<void> {
    if (record.lineBuffer.length > 0) {
      this.pushLine(record, record.lineBuffer);
      record.lineBuffer = '';
    }

    if (processError) {
      this.appendLog(record, `\nProcess error: ${processError}\n`);
    }

    const exitCode = code ?? 1;
    record.exitCode = exitCode;
    record.status = exitCode === 0 ? 'success' : 'failed';
    record.process = null;

    this.appendLog(record, '\nRegenerating QA dashboard…\n');
    const dashboardOk = await this.regenerateDashboard(appRoot, record);
    if (dashboardOk) {
      this.appendLog(record, 'Dashboard updated.\n');
    } else {
      this.appendLog(record, 'Dashboard regenerate failed — reload manually after fixing.\n');
    }

    this.activeRunId = null;
    this.emit(record, { type: 'done', ok: exitCode === 0, exitCode, dashboardOk });
  }

  private regenerateDashboard(appRoot: string, record: RunRecord): Promise<boolean> {
    const repoRoot = path.resolve(appRoot, '../..');
    const tsxCli = path.join(repoRoot, 'node_modules/tsx/dist/cli.mjs');
    const scriptPath = path.join(appRoot, 'scripts/generate-qa-dashboard.mts');

    return new Promise((resolve) => {
      const child = spawn(process.execPath, [tsxCli, scriptPath], {
        cwd: appRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const onChunk = (chunk: Buffer) => {
        this.appendChunk(record, chunk.toString('utf8'));
      };

      child.stdout?.on('data', onChunk);
      child.stderr?.on('data', onChunk);
      child.on('close', (code) => resolve((code ?? 1) === 0));
      child.on('error', () => resolve(false));
    });
  }

  getRun(runId: string): RunRecord | undefined {
    return this.runs.get(runId);
  }

  subscribe(runId: string, listener: (event: RunStreamEvent) => void): (() => void) | null {
    const record = this.runs.get(runId);
    if (!record) return null;

    for (const line of record.logs) {
      listener({ type: 'log', line });
    }

    if (record.status !== 'running') {
      listener({
        type: 'done',
        ok: record.status === 'success',
        exitCode: record.exitCode ?? 1,
        dashboardOk: true,
      });
      return () => {};
    }

    record.listeners.add(listener);
    return () => record.listeners.delete(listener);
  }

  private appendChunk(record: RunRecord, chunk: string) {
    record.lineBuffer += chunk;
    const parts = record.lineBuffer.split('\n');
    record.lineBuffer = parts.pop() ?? '';
    for (const part of parts) {
      this.pushLine(record, part);
    }
  }

  private pushLine(record: RunRecord, line: string) {
    const normalized = line.endsWith('\n') ? line : `${line}\n`;
    this.appendLog(record, normalized);
  }

  private appendLog(record: RunRecord, line: string) {
    record.logs.push(line);
    this.emit(record, { type: 'log', line });
  }

  private emit(record: RunRecord, event: RunStreamEvent) {
    for (const listener of record.listeners) {
      listener(event);
    }
  }
}

function parseRunIdFromStreamPath(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/^\/api\/qa\/component-run\/([^/?#]+)\/stream$/);
  return match?.[1] ?? null;
}

export function qaComponentRunPlugin(appRoot: string): Plugin {
  const manager = new QaComponentRunManager();

  return {
    name: 'qa-component-run',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (req.method === 'GET' && url === '/api/qa/components') {
          sendJson(res, 200, { slugs: listQaComponentSlugs() });
          return;
        }

        if (req.method === 'POST' && url === '/api/qa/component-run') {
          try {
            const body = (await readJsonBody(req)) as { slug?: string; all?: boolean };
            const all = body.all === true;
            const slug = typeof body.slug === 'string' ? body.slug.trim() : '';

            if (!all && !slug) {
              sendJson(res, 400, { error: 'Provide slug or { all: true } in request body.' });
              return;
            }

            const result = manager.startRun(appRoot, { slug: slug || undefined, all });
            if ('error' in result) {
              sendJson(res, result.status, { error: result.error });
              return;
            }

            sendJson(res, 202, { runId: result.runId, slug: all ? '__all__' : slug, all });
          } catch {
            sendJson(res, 400, { error: 'Invalid JSON body.' });
          }
          return;
        }

        const runId = parseRunIdFromStreamPath(url);
        if (req.method === 'GET' && runId) {
          const record = manager.getRun(runId);
          if (!record) {
            sendJson(res, 404, { error: `Unknown run id: ${runId}` });
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          });
          res.write(': connected\n\n');

          const unsubscribe = manager.subscribe(runId, (event) => {
            if (event.type === 'log') {
              writeSse(res, 'log', { line: event.line });
              return;
            }
            writeSse(res, 'done', {
              ok: event.ok,
              exitCode: event.exitCode,
              dashboardOk: event.dashboardOk,
            });
            res.end();
          });

          req.on('close', () => {
            unsubscribe?.();
          });
          return;
        }

        next();
      });
    },
  };
}
