/**
 * Tiny CORS-enabled static server for the cdn-dist/ output.
 *
 * Run:  pnpm tsx cdn-release-full-pipeline/cdn-poc/serve.ts
 *       pnpm tsx cdn-release-full-pipeline/cdn-poc/serve.ts --port=4040
 *
 * Endpoints:
 *   GET /manifest.json
 *   GET /brands/<slug>/<version>/brand.css
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..', 'cdn-dist');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);
const PORT = Number(args.port ?? 4040);

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

if (!existsSync(ROOT)) {
  console.error(`✗ ${ROOT} doesn't exist — run \`pnpm build:brand-css\` first.`);
  process.exit(1);
}

const server = createServer((req, res) => {
  // CORS — needed because the consumer app runs on a different origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const safePath = url.replace(/\.\.\//g, '');
  let filePath = join(ROOT, safePath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'manifest.json');
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404: ${safePath}`);
    return;
  }

  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log(`→ CDN PoC serving ${ROOT}`);
  console.log(`→ http://localhost:${PORT}/manifest.json`);
  console.log(`→ http://localhost:${PORT}/brands/<slug>/1.0.0/brand.css`);
});
