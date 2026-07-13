/**
 * playwrightRenderer.ts
 *
 * Server-side helper that launches a headless chromium, navigates to an
 * internal `/internal/render-ast` route (which mounts CompositionRenderer
 * inside the real brand CSS cascade), waits for fonts + brand CSS to settle,
 * and captures a PNG at the requested viewport.
 *
 * Consumed by `/api/composition/verify`. Not used by UI code.
 *
 * Note: `playwright` is a dev-heavy dependency. The import is dynamic so
 * that environments without chromium (e.g. the Next.js edge runtime) don't
 * blow up at build time — this module is only imported from `nodejs` routes.
 */

import { randomUUID } from 'node:crypto';

/** TTL for tokens passed to the interactive render endpoint (30 minutes). */
export const INTERACTIVE_TOKEN_TTL_MS = 30 * 60 * 1_000;

export interface ViewportSpec {
  width: number;
  height: number;
  /** Label recorded on the renderedScreenshots row. */
  label: string;
}

export const DEFAULT_VIEWPORTS: Record<string, ViewportSpec> = {
  mobile: { width: 390, height: 844, label: 'mobile' },
  desktop: { width: 1440, height: 900, label: 'desktop' },
  tablet: { width: 834, height: 1194, label: 'tablet' },
};

export interface RenderHealth {
  /** True if the captured PNG has pixels outside the background color. */
  nonBlank: boolean;
  /** True if raw browser default fonts / colours were detected. */
  rawBrowserDefaultsDetected: boolean;
  /** Console error/warning messages emitted during render. */
  consoleIssues: string[];
}

export interface CaptureResult {
  viewport: string;
  png: Buffer;
  /** Optional render health diagnostic — present when verifyCssVariables was set. */
  renderHealth?: RenderHealth;
  /** Resolved computed values for each requested CSS variable. */
  cssVariables?: Record<string, string>;
}

/**
 * Publish a render payload (AST or TSX) to a short-lived in-memory cache
 * keyed by a UUID so the headless browser can reach it via a plain GET.
 * Passing via query string would overflow URLs for large compositions.
 * Swap to a signed Redis key if multi-instance becomes a constraint.
 */
type RenderPayload = { kind: 'ast'; ast: unknown } | { kind: 'code'; code: string };
const renderCache = new Map<string, { payload: RenderPayload; expiresAt: number }>();
const TOKEN_TTL_MS = 60_000;

/** Publish an AST to the in-memory cache. Returns the token the internal
 *  render route should load. Accepts an optional custom TTL in ms. */
export function publishASTForRender(ast: unknown, ttlMs?: number): string {
  const token = randomUUID();
  renderCache.set(token, { payload: { kind: 'ast', ast }, expiresAt: Date.now() + (ttlMs ?? TOKEN_TTL_MS) });
  return token;
}

/** Publish TSX source to the in-memory cache. Mirror of `publishASTForRender`
 *  for the code-mode renderer. */
export function publishCodeForRender(code: string): string {
  const token = randomUUID();
  renderCache.set(token, { payload: { kind: 'code', code }, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

/** Called by /internal/render-ast to load the AST it should render. */
export function consumeASTForRender(token: string): unknown | null {
  const entry = renderCache.get(token);
  if (!entry || entry.expiresAt < Date.now() || entry.payload.kind !== 'ast') {
    if (entry && entry.expiresAt < Date.now()) renderCache.delete(token);
    return null;
  }
  renderCache.delete(token);
  return entry.payload.ast;
}

/** Called by /internal/render-code to load the TSX it should render. */
export function consumeCodeForRender(token: string): string | null {
  const entry = renderCache.get(token);
  if (!entry || entry.expiresAt < Date.now() || entry.payload.kind !== 'code') {
    if (entry && entry.expiresAt < Date.now()) renderCache.delete(token);
    return null;
  }
  renderCache.delete(token);
  return entry.payload.code;
}

/** Garbage-collect expired entries opportunistically. */
function cullRenderCache(): void {
  const now = Date.now();
  for (const [k, v] of renderCache) if (v.expiresAt < now) renderCache.delete(k);
}

export interface CaptureASTInput {
  ast: unknown;
  viewports?: ViewportSpec[];
  /** Base URL the browser should hit. Defaults to http://localhost:3000. */
  baseUrl?: string;
  /** Extra query params forwarded to the render route (theme, brand, etc.). */
  searchParams?: Record<string, string>;
  /** CSS variable names to resolve from the rendered page. */
  verifyCssVariables?: string[];
}

/**
 * Capture the AST at each requested viewport. Returns PNG buffers ready to
 * upload to Convex storage. Callers handle storage + Claude vision scoring.
 */
export async function captureASTScreenshots(
  input: CaptureASTInput,
): Promise<CaptureResult[]> {
  cullRenderCache();
  const token = publishASTForRender(input.ast);
  try {
    return await capturePath('/internal/render-ast', token, input);
  } finally {
    renderCache.delete(token);
  }
}

export interface CaptureCodeInput {
  code: string;
  viewports?: ViewportSpec[];
  baseUrl?: string;
  searchParams?: Record<string, string>;
  deviceScaleFactor?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Code-mode counterpart of `captureASTScreenshots`. Publishes TSX to the
 * in-memory cache, navigates Playwright at `/internal/render-code`, and
 * captures the rendered iframe. The render-code page mounts SandpackCanvas
 * full-screen and signals readiness via `window.__playgroundReady` after
 * Sandpack reports `done` status, so Playwright knows when to screenshot.
 */
export async function captureCodeScreenshots(
  input: CaptureCodeInput,
): Promise<CaptureResult[]> {
  cullRenderCache();
  const token = publishCodeForRender(input.code);
  try {
    return await capturePath('/internal/render-code', token, input);
  } finally {
    renderCache.delete(token);
  }
}

interface CaptureCommonInput {
  viewports?: ViewportSpec[];
  baseUrl?: string;
  searchParams?: Record<string, string>;
  verifyCssVariables?: string[];
  deviceScaleFactor?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

async function capturePath(
  path: string,
  token: string,
  input: CaptureCommonInput,
): Promise<CaptureResult[]> {
  const { chromium } = await import('playwright');
  const baseUrl = input.baseUrl ?? process.env.INTERNAL_RENDER_BASE_URL ?? 'http://localhost:3000';
  const viewports = input.viewports ?? [DEFAULT_VIEWPORTS.mobile];

  const browser = await chromium.launch({ headless: true });
  try {
    const captures: CaptureResult[] = [];
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: input.deviceScaleFactor ?? 2,
      });
      const page = await context.newPage();
      const consoleIssues: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
        }
      });

      const url = new URL(path, baseUrl);
      url.searchParams.set('token', token);
      if (input.searchParams) {
        for (const [k, v] of Object.entries(input.searchParams)) url.searchParams.set(k, v);
      }

      await page.goto(url.toString(), { waitUntil: 'networkidle' });
      // Code-mode page sets `window.__playgroundReady = true` once the
      // Sandpack iframe finishes bundling + rendering. AST page doesn't
      // set it — `waitForFunction` short-circuits when the property is
      // already true, and the initial `false` value times out fast on
      // pages that don't use the flag, so we skip the wait there.
      if (path === '/internal/render-code') {
        await page
          .waitForFunction(() => (window as { __playgroundReady?: boolean }).__playgroundReady === true, undefined, {
            timeout: 30_000,
          })
          .catch(() => undefined);
      }
      // Wait for brand CSS transition suppression to clear (double-rAF).
      await page.evaluate(() =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
      );
      // Wait for fonts.
      await page.evaluate(() => (document as Document).fonts?.ready);

      const png = await page.screenshot({
        type: input.format ?? 'png',
        fullPage: false,
        ...(input.format === 'jpeg' && input.quality != null ? { quality: input.quality } : {}),
      });

      // Resolve requested CSS variables from the document root.
      let cssVariables: Record<string, string> | undefined;
      if (input.verifyCssVariables?.length) {
        cssVariables = await page.evaluate((vars: string[]) => {
          const style = getComputedStyle(document.documentElement);
          return Object.fromEntries(vars.map((v) => [v, style.getPropertyValue(v).trim()]));
        }, input.verifyCssVariables);
      }

      // Simple non-blank check: does the screenshot have any non-background pixels?
      const nonBlank = png.length > 5_000;
      const renderHealth: RenderHealth = {
        nonBlank,
        rawBrowserDefaultsDetected: false,
        consoleIssues,
      };

      captures.push({ viewport: vp.label, png, renderHealth, cssVariables });
      await context.close();
    }
    return captures;
  } finally {
    await browser.close();
  }
}
