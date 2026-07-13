/**
 * Dev-server middleware: Notion bugs API
 * - GET    /api/notion/bugs
 * - GET    /api/notion/bugs/:pageId
 * - PATCH  /api/notion/bugs/:pageId
 * - POST   /api/notion/bugs/bulk-status
 */
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin, type ViteDevServer } from 'vite';

import { fetchNotionBugs } from './notionBugsApi';
import {
  bulkUpdateNotionBugStatus,
  fetchNotionBugDetail,
  updateNotionBugStatus,
} from './notionBugUpdates';

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function parseBugRoute(urlPath: string): { kind: 'list' } | { kind: 'detail'; pageId: string } | { kind: 'bulk' } | null {
  if (urlPath === '/api/notion/bugs') return { kind: 'list' };
  if (urlPath === '/api/notion/bugs/bulk-status') return { kind: 'bulk' };
  const match = urlPath.match(/^\/api\/notion\/bugs\/([^/]+)$/);
  if (match?.[1]) return { kind: 'detail', pageId: decodeURIComponent(match[1]) };
  return null;
}

export function notionBugsApiPlugin(appRoot: string): Plugin {
  const repoRoot = path.resolve(appRoot, '../..');

  return {
    name: 'notion-bugs-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const notionEnv = () =>
        loadEnv(server.config.mode, server.config.envDir || repoRoot, '');

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const urlPath = req.url?.split('?')[0];
        if (!urlPath?.startsWith('/api/notion/bugs')) {
          next();
          return;
        }

        const route = parseBugRoute(urlPath);
        if (!route) {
          next();
          return;
        }

        try {
          if (route.kind === 'list' && req.method === 'GET') {
            const payload = await fetchNotionBugs(notionEnv());
            sendJson(res, 200, payload);
            return;
          }

          if (route.kind === 'detail' && req.method === 'GET') {
            const detail = await fetchNotionBugDetail(route.pageId, notionEnv());
            sendJson(res, 200, detail);
            return;
          }

          if (route.kind === 'detail' && req.method === 'PATCH') {
            const body = (await readJsonBody(req)) as { status?: string };
            const status = body.status?.trim();
            if (!status) {
              sendJson(res, 400, { error: 'Missing status in request body.' });
              return;
            }
            const result = await updateNotionBugStatus(route.pageId, status, notionEnv());
            sendJson(res, 200, result);
            return;
          }

          if (route.kind === 'bulk' && req.method === 'POST') {
            const body = (await readJsonBody(req)) as { pageIds?: string[]; status?: string };
            const pageIds = Array.isArray(body.pageIds) ? body.pageIds.filter(Boolean) : [];
            const status = body.status?.trim();
            if (!status || pageIds.length === 0) {
              sendJson(res, 400, { error: 'Provide pageIds and status in request body.' });
              return;
            }
            const result = await bulkUpdateNotionBugStatus(pageIds, status, notionEnv());
            sendJson(res, 200, result);
            return;
          }

          sendJson(res, 405, { error: `Method ${req.method} not allowed for ${urlPath}` });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Request failed';
          const status = message.includes('no longer exists') ? 404 : 500;
          sendJson(res, status, { error: message });
        }
      });
    },
  };
}
