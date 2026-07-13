/**
 * lab-ast-executor.ts
 *
 * The Experience Lab's concrete {@link PreviewExecutor} (D-02). It closes the
 * UAT preview gap by reusing the proven `/internal/render-ast` route — the same
 * route the Playwright verify loop drives — instead of standing up a new render
 * surface or requiring Playwright/Daytona at run time.
 *
 * Flow: previewStep passes the already-computed ASTRoot on `RenderInput.ast`.
 * This executor publishes that AST into the in-memory render cache via
 * `publishASTForRender` with a long interactive TTL (30 min — the Playwright
 * verify loop keeps the 60s default; the interactive Lab token must survive the
 * ~45s post-preview run tail + iframe reloads, RC1) behind an opaque UUID token
 * and returns a `previewState.url` of the form `/internal/render-ast?token=<uuid>`
 * that the artifact-card iframe loads inside the real brand CSS cascade.
 *
 * This is the FIRST-PARTY trusted path: the iframe renders OUR ASTRenderer over
 * a server-derived tree on our own origin — no untrusted model code executes.
 * The artifact iframe still stays strict (`allow-scripts`, no `allow-same-origin`);
 * `/internal/render-ast` mounts the brand and icon providers itself so visual
 * fidelity does not depend on relaxing sandbox origin isolation.
 *
 * No Playwright, no HTTP, no external dependency beyond the in-repo render
 * cache. Node runtime only — it executes solely inside the run route
 * (`runtime = 'nodejs'`), never in Edge or the browser.
 */

import type {
  PreviewExecutor,
  PreviewVerificationCheck,
  RenderInput,
  RenderResult,
} from '@oneui/experience-builder-preview';
import {
  captureASTScreenshots,
  publishASTForRender,
  INTERACTIVE_TOKEN_TTL_MS,
} from '@/lib/playwrightRenderer';
import { normalizeRenderDensity, normalizeRenderPlatform } from '@oneui/experience-builder-core';

const PREVIEW_CSS_VARIABLES = [
  '--Surface-Main',
  '--Primary-Bold',
  '--Body-M-FontSize',
  '--Typography-Font-Primary',
] as const;

interface LabAstExecutorOptions {
  /** Origin for the running Next server. Defaults to Playwright helper fallback. */
  baseUrl?: string;
}

/**
 * Renders a compiled Experience Lab artifact by publishing its ASTRoot to the
 * `/internal/render-ast` token cache and returning the live preview URL.
 */
export class LabAstExecutor implements PreviewExecutor {
  constructor(private readonly options: LabAstExecutorOptions = {}) {}

  async render(input: RenderInput): Promise<RenderResult> {
    // The executor is only useful when previewStep ran the IR path and handed
    // us the AST. Without it there is nothing to render — return a safe no-op.
    if (!input.ast) {
      return { screenshots: [], previewState: {}, rendered: false };
    }

    // Publish the server-derived AST behind an opaque UUID token (no PII, no
    // credentials, 30-min interactive TTL so it survives the run tail + iframe
    // reloads, RC1). The render route consumes it via consumeASTForRender.
    const token = publishASTForRender(input.ast, INTERACTIVE_TOKEN_TTL_MS);

    // Carry the brand id so the render route can inject THIS artifact's brand
    // foundation cascade (surfaces/colours/typography). Without it the iframe
    // renders with whatever brand the main app last cached, so tokens collapse
    // and the preview looks broken (black boxes / bare pill buttons).
    const renderPlatform = normalizeRenderPlatform(input.platform);
    const renderDensity = normalizeRenderDensity(input.density);
    const brandParam = input.brandId ? `&brandId=${encodeURIComponent(input.brandId)}` : '';
    const themeParam = input.theme ? `&theme=${encodeURIComponent(input.theme)}` : '';
    const platformParam = `&platform=${encodeURIComponent(renderPlatform)}`;
    const densityParam = `&density=${encodeURIComponent(renderDensity)}`;
    const renderUrl =
      `/internal/render-ast?token=${token}` +
      `${brandParam}${themeParam}${platformParam}${densityParam}`;

    const shouldCapture = process.env.EXPERIENCE_LAB_AST_SCREENSHOTS !== '0';
    let screenshots: RenderResult['screenshots'] = [];
    let screenshotAvailable = false;
    let captureError = '';
    let resolvedCssVariables: Record<string, string> = {};
    let nonBlank = false;
    let rawBrowserDefaultsDetected = false;
    let consoleIssues: string[] = [];
    if (shouldCapture) {
      try {
        const captures = await captureASTScreenshots({
          ast: input.ast,
          ...(this.options.baseUrl ? { baseUrl: this.options.baseUrl } : {}),
          viewports: input.profiles.map((profile) => ({
            width: profile.width,
            height: profile.height,
            label: profile.name,
          })),
          searchParams: {
            ...(input.brandId ? { brandId: input.brandId } : {}),
            ...(input.theme ? { theme: input.theme } : {}),
            platform: renderPlatform,
            density: renderDensity,
          },
          verifyCssVariables: [...PREVIEW_CSS_VARIABLES],
        });
        screenshots = captures.map((capture) => ({
          profile: capture.viewport,
          png: capture.png,
        }));
        nonBlank = captures.some((capture) => capture.renderHealth?.nonBlank ?? true);
        screenshotAvailable = screenshots.length > 0 && nonBlank;
        rawBrowserDefaultsDetected = captures.some(
          (capture) => capture.renderHealth?.rawBrowserDefaultsDetected ?? false,
        );
        consoleIssues = captures.flatMap((capture) => capture.renderHealth?.consoleIssues ?? []);
        resolvedCssVariables = captures[0]?.cssVariables ?? {};
      } catch (err) {
        captureError = err instanceof Error ? err.message : String(err);
      }
    }
    const cssVariables: PreviewVerificationCheck[] = PREVIEW_CSS_VARIABLES.map((name) => {
      const status: PreviewVerificationCheck['status'] =
        shouldCapture && !captureError && resolvedCssVariables[name]
          ? 'passed'
          : shouldCapture
            ? 'failed'
            : 'skipped';
      return {
        name,
        status,
        ...(resolvedCssVariables[name] ? { value: resolvedCssVariables[name] } : {}),
        ...(captureError ? { message: captureError } : {}),
      };
    });
    const cssPassed = cssVariables.every((check) => check.status === 'passed');
    const verificationPassed =
      !shouldCapture ||
      (!captureError &&
        screenshotAvailable &&
        cssPassed &&
        !rawBrowserDefaultsDetected &&
        consoleIssues.length === 0);

    return {
      screenshots,
      previewState: {
        url: renderUrl,
        expiresAt: Date.now() + INTERACTIVE_TOKEN_TTL_MS,
      },
      previewVerification: {
        theme: input.theme ?? 'light',
        ...(input.platform ? { platform: input.platform } : {}),
        ...(input.density ? { density: input.density } : {}),
        screenshotAvailable,
        nonBlank,
        rawBrowserDefaultsDetected,
        consoleIssues,
        cssVariables,
      },
      rendered: verificationPassed,
    };
  }
}
