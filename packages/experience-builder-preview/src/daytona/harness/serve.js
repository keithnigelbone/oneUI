/**
 * serve.js — in-box static asset server for the live iframe (PREV-02).
 *
 * Runs INSIDE the Daytona sandbox built by `image.ts`. Binds the preview port and
 * serves ONLY the baked `asset.html` (no directory listing, no traversal) so the
 * canvas iframe can load a signed preview URL minted by the executor's
 * `getSignedPreviewUrl(port)`.
 *
 * NOTE: per the RESEARCH live-iframe-vs-screenshots fork, v1 ships
 * screenshots-only (immediate teardown) — this server is the forward path for the
 * deferred live iframe and is intentionally minimal. It MUST NOT import the
 * Daytona SDK and never reads DAYTONA_API_KEY (threat T-031-04).
 *
 * Args / env: `--port=<n>` or `PORT` env (default 3000, matching
 * DaytonaExecutor's DEFAULT_PREVIEW_PORT).
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

/** Fixed in-box asset baked by image.ts via addLocalDir(..., '/home/pwuser/preview'). */
const PREVIEW_DIR = '/home/pwuser/preview';
const ASSET_FILE = path.join(PREVIEW_DIR, 'asset.html');
const DEFAULT_PORT = 3000;

/** Parse `--key=value` argv into a plain object. */
function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    out[eq === -1 ? arg.slice(2) : arg.slice(2, eq)] = eq === -1 ? true : arg.slice(eq + 1);
  }
  return out;
}

function resolvePort(args) {
  const fromArg = args.port != null ? Number.parseInt(String(args.port), 10) : NaN;
  if (Number.isFinite(fromArg) && fromArg > 0) return fromArg;
  const fromEnv = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : NaN;
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_PORT;
}

const args = parseArgs(process.argv.slice(2));
const port = resolvePort(args);

const server = http.createServer((req, res) => {
  // Only GET/HEAD; everything else is rejected.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  // No traversal: only '/' (and '/asset.html') map to the single baked asset.
  // Every other path 404s — the server can never reach outside PREVIEW_DIR.
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath !== '/' && urlPath !== '/asset.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  fs.readFile(ASSET_FILE, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': Buffer.byteLength(data),
    });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  });
});

server.listen(port, () => {
  console.log('serve.js: listening on port ' + port);
});
