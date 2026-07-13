/**
 * IframeCspExecutor.ts
 *
 * The MVP de-risk `PreviewExecutor` implementation. It renders a compiled
 * bundle on a SEPARATE, credential-free origin via a short-lived single-use
 * token handoff (PREV-01), then captures a PNG per profile with a
 * credential-free headless Playwright worker (PREV-03/04). Each version gets an
 * immutable preview URL carrying only the opaque token (PREV-02).
 *
 * Analog: `apps/platform/src/lib/playwrightRenderer.ts` — EXACT. This module
 * relocates that verified token-handoff + headless-capture harness behind the
 * `PreviewExecutor` seam. The Daytona production executor (Plan 05) drops in
 * behind the same seam with zero-egress isolation.
 *
 * INVARIANTS:
 * - The workflow NEVER imports this directly — it is injected through
 *   `setPreviewExecutor` (the seam in `PreviewExecutor.ts`).
 * - `playwright` is loaded via a DYNAMIC `import('playwright')` so non-chromium
 *   environments (edge runtime, build) don't blow up. The seam stays
 *   vendor-free; only this impl touches the vendor, and only at call time.
 * - Nothing sensitive ever lands in the preview URL — only `?t=<uuid>`. The
 *   bundle is resolved server-side via `consumeBundleForRender(token)`.
 * - The preview iframe runs `sandbox="allow-scripts"` WITHOUT
 *   `allow-same-origin`, behind a strict CSP (see PREVIEW-DECISION.md). Those
 *   headers live on the render route; this executor only drives the token +
 *   capture.
 */

import { randomUUID } from 'node:crypto';
import type {
  PreviewExecutor,
  PreviewProfile,
  RenderInput,
  RenderResult,
} from './PreviewExecutor';

/**
 * Short-lived in-memory bundle cache keyed by an opaque `randomUUID()`. Passing
 * the bundle via query string would overflow URLs for large compositions and
 * — more importantly — would put the bundle in the address bar. The token is
 * single-use (deleted after a capture run) and self-expires after 60s so
 * nothing leaks. Swap to a signed Redis key if multi-instance becomes a
 * constraint. Mirrors `playwrightRenderer.ts`'s `renderCache`.
 */
const renderCache = new Map<string, { bundle: string; expiresAt: number }>();

/** Token time-to-live. Mirrors `playwrightRenderer.ts`'s `TOKEN_TTL_MS`. */
export const TOKEN_TTL_MS = 60_000;

/**
 * Publish a compiled bundle to the in-memory cache. Returns the opaque token
 * the separate-origin preview route loads via `?t=<token>`. Expires after 60s.
 * (PREV-01 token-handoff — nothing sensitive in the URL.)
 */
export function publishBundleForRender(bundle: string): string {
  const token = randomUUID();
  renderCache.set(token, { bundle, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

/**
 * Server-side resolve of a published bundle. Called by the preview origin's
 * render route. Returns `null` for unknown / expired tokens (and culls the
 * expired entry). Never exposed to the browser JS context.
 */
export function consumeBundleForRender(token: string): string | null {
  const entry = renderCache.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    if (entry && entry.expiresAt < Date.now()) renderCache.delete(token);
    return null;
  }
  return entry.bundle;
}

/** Opportunistically garbage-collect expired tokens. */
function cullRenderCache(): void {
  const now = Date.now();
  for (const [k, v] of renderCache) if (v.expiresAt < now) renderCache.delete(k);
}

/** Minimal structural shape of the Playwright surface this impl touches. */
interface PlaywrightPageLike {
  goto(url: string, opts: { waitUntil: string }): Promise<unknown>;
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
  screenshot(opts: { type: 'png'; fullPage: boolean }): Promise<Buffer>;
}
interface PlaywrightContextLike {
  newPage(): Promise<PlaywrightPageLike>;
  close(): Promise<void>;
}
interface PlaywrightBrowserLike {
  newContext(opts: {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
  }): Promise<PlaywrightContextLike>;
  close(): Promise<void>;
}

export interface IframeCspExecutorOptions {
  /**
   * The credential-free SEPARATE preview origin (e.g.
   * `https://preview.<host>`). Defaults to `PREVIEW_ORIGIN` env, then a
   * localhost dev origin. NEVER the authenticated Lab origin.
   */
  previewOrigin?: string;
  /** Render route path on the preview origin. */
  renderPath?: string;
}

/**
 * The IframeCsp preview executor. Implements the vendor-free `PreviewExecutor`
 * seam; the only vendor (`playwright`) is loaded lazily inside `render()`.
 */
export class IframeCspExecutor implements PreviewExecutor {
  private readonly previewOrigin: string;
  private readonly renderPath: string;

  constructor(options: IframeCspExecutorOptions = {}) {
    this.previewOrigin =
      options.previewOrigin ??
      process.env.PREVIEW_ORIGIN ??
      'http://localhost:3100';
    this.renderPath = options.renderPath ?? '/r';
  }

  /** Build the immutable, credential-free preview URL (only `?t=<token>`). */
  private buildPreviewUrl(token: string): string {
    const url = new URL(this.renderPath, this.previewOrigin);
    url.searchParams.set('t', token);
    return url.toString();
  }

  async render(input: RenderInput): Promise<RenderResult> {
    cullRenderCache();
    // PREV-01: stash the bundle behind an opaque token; nothing sensitive in
    // the URL. The token + its expiry ARE the immutable preview state (PREV-02).
    const token = publishBundleForRender(input.bundle);
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const url = this.buildPreviewUrl(token);

    try {
      const screenshots = await this.capture(url, input.profiles);
      return {
        screenshots,
        // Untrusted compiled-bundle path: previewState OMITS `sameOrigin`, so the
        // canvas iframe defaults to strict 'allow-scripts' (no same-origin) —
        // credential isolation preserved (PREV-01).
        previewState: { url, expiresAt },
        rendered: true,
      };
    } finally {
      // Single-use: drop the token as soon as the capture run completes.
      renderCache.delete(token);
    }
  }

  /**
   * Capture one PNG per profile. Mirrors `playwrightRenderer.ts:145-200`:
   * dynamic `import('playwright')`, per-profile credential-free context at
   * `deviceScaleFactor: 2`, `networkidle` nav, then the load-bearing brand-CSS
   * settle wait (double-rAF transition suppression + `document.fonts.ready`)
   * before the screenshot.
   */
  private async capture(
    url: string,
    profiles: PreviewProfile[],
  ): Promise<Array<{ profile: string; png: Buffer }>> {
    // Dynamic import keeps the seam + edge builds vendor-free; only resolved
    // when an actual capture runs (never in tests — they inject a mock).
    const { chromium } = (await import('playwright')) as {
      chromium: { launch(opts: { headless: boolean }): Promise<PlaywrightBrowserLike> };
    };

    const browser = await chromium.launch({ headless: true });
    try {
      const captures: Array<{ profile: string; png: Buffer }> = [];
      for (const profile of profiles) {
        // PREV-04: credential-free context — no auth/Convex context is ever
        // passed to the preview origin.
        const context = await browser.newContext({
          viewport: { width: profile.width, height: profile.height },
          deviceScaleFactor: 2,
        });
        const page = await context.newPage();

        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for brand-CSS transition suppression to clear (double-rAF) —
        // load-bearing for brand-CSS settle / FOUC correctness.
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
        );
        // Wait for fonts so type metrics are stable before the snapshot.
        await page.evaluate(
          () => (document as Document).fonts?.ready as unknown as Promise<unknown>,
        );

        const png = await page.screenshot({ type: 'png', fullPage: false });
        captures.push({ profile: profile.name, png });
        await context.close();
      }
      return captures;
    } finally {
      await browser.close();
    }
  }
}
