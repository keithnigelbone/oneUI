/**
 * capture.js — in-box Playwright screenshot harness (PREV-04).
 *
 * Runs INSIDE the network-blocked Daytona sandbox built by `image.ts`, under the
 * baked Node 24 + `npm i playwright@1.59.1` (matching the v1.59.1-jammy browser
 * revision). It MUST NOT import the Daytona SDK — only `DaytonaExecutor.ts` may.
 *
 * Mirrors `apps/platform/src/lib/playwrightRenderer.ts` `capturePath`: per-profile
 * viewport framing, double-rAF transition settle + `document.fonts.ready`, then a
 * non-fullpage PNG. The ONE deliberate divergence: it loads the asset via
 * `file://` with `waitUntil:'load'` (NOT `networkidle`) — under `networkBlockAll`
 * there is no network to idle and `networkidle` hangs (RESEARCH Pitfall 3).
 *
 * Boundary (RESEARCH Pattern 4 / threat T-031-04): ONLY base64 PNG image bytes
 * cross the stdout boundary. The script reads no credentials and never touches
 * DAYTONA_API_KEY. On any failure it exits 1 so the executor surfaces a
 * preview-error rather than a silent blank capture.
 *
 * Arg shape mirrors DaytonaExecutor.buildCaptureCommand:
 *   node capture.js --bundle=<path> --width=<n> --height=<n> --format=png-base64
 * (`--bundle` is accepted for forward-compat with the executor's existing command
 * shape but the asset is loaded from the fixed in-box path the image bakes.)
 */

'use strict';

const { chromium } = require('playwright');

/** The fixed in-box asset path baked by image.ts via addLocalDir(..., '/home/pwuser/preview'). */
const ASSET_URL = 'file:///home/pwuser/preview/asset.html';

/** Parse `--key=value` argv into a plain object (mirrors the executor's command shape). */
function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq === -1) {
      out[arg.slice(2)] = true;
    } else {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const width = Number.parseInt(args.width, 10);
  const height = Number.parseInt(args.height, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`capture.js: invalid viewport --width=${args.width} --height=${args.height}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    // deviceScaleFactor:2 mirrors playwrightRenderer.ts for crisp captures.
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // file:// under zero-egress: 'load' (NOT networkidle — RESEARCH Pitfall 3).
    await page.goto(ASSET_URL, { waitUntil: 'load' });

    // Double-rAF: let brand-CSS transition suppression clear (playwrightRenderer.ts:194-199).
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    // Fonts settle (playwrightRenderer.ts:200-201).
    await page.evaluate(() => document.fonts && document.fonts.ready);

    const png = await page.screenshot({ type: 'png', fullPage: false });
    // ONLY image bytes cross the boundary — base64 on stdout (threat T-031-04).
    process.stdout.write(png.toString('base64'));

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  // Diagnostics to stderr (never stdout, which carries only the PNG); exit non-zero.
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
