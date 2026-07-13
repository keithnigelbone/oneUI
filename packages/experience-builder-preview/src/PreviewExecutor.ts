/**
 * PreviewExecutor.ts
 *
 * THE preview seam (D-02). A narrow async interface the Mastra workflow's
 * preview step depends on; concrete implementations (`IframeCspExecutor` now,
 * `DaytonaExecutor` in Plan 05) are swappable behind it.
 *
 * Boundary rule (RESEARCH Pattern 1): this file imports NO `@daytonaio/sdk`
 * and NO `playwright`. Only the impls touch vendors. Keeping the seam
 * vendor-free is what lets the workflow stay testable credential-free (the
 * CI import-guard can assert this file never names a vendor) and lets a mock
 * executor be injected via `setPreviewExecutor` with no Daytona key and no
 * live browser.
 *
 * The seam idiom (module-level swappable impl + `getPreviewExecutor()` /
 * `setPreviewExecutor(impl)` returning a restore fn) is copied verbatim from
 * `experience-builder-agents/src/modelAdapter.ts` (`callModel` /
 * `__setCallModelImpl`). The `RenderInput` / `RenderResult` / `render()` shape
 * is the verbatim contract from RESEARCH § Pattern 1.
 */

/**
 * A single capture profile. PREV-03 desktop/mobile/fixed lifecycle framing
 * maps onto these. `name` is the discriminant the canvas card reads.
 */
export interface PreviewProfile {
  name: 'desktop' | 'mobile' | 'fixed';
  width: number;
  height: number;
}

/** The render request handed to an executor. */
export interface RenderInput {
  /** Compiled React + Jio CSS bundle string OR the AST/IR to render. */
  bundle: string;
  brandId: string;
  profiles: PreviewProfile[];
  /** Requested theme forwarded to first-party render targets. */
  theme?: 'light' | 'dark' | string;
  /** Requested platform mode forwarded to first-party render targets. */
  platform?: string;
  /** Requested density mode forwarded to first-party render targets. */
  density?: string;
  /** Optional precomputed brand foundation CSS for isolated preview assets. */
  brandCss?: string;
  /**
   * Compiled AST when the workflow passes it directly (avoids re-deriving from
   * the bundle). Optional; executors that don't need it ignore it.
   */
  ast?: unknown;
}

export interface PreviewVerificationCheck {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  value?: string;
  message?: string;
}

/** Runtime preview verification summary exposed to the Lab workbench/card. */
export interface PreviewVerification {
  theme: string;
  platform?: string;
  density?: string;
  cssVariables: PreviewVerificationCheck[];
  screenshotAvailable: boolean;
  nonBlank?: boolean;
  rawBrowserDefaultsDetected?: boolean;
  consoleIssues?: string[];
}

/**
 * Immutable, per-version preview state surfaced to the canvas card (PREV-02).
 * `url` carries only an opaque token (`?t=<uuid>`) — never anything sensitive.
 * `expiresAt` is the epoch-ms TTL boundary after which the token is dead.
 */
export interface PreviewState {
  url?: string;
  expiresAt?: number;
  /**
   * Legacy marker retained for old persisted preview states. Lab artifact
   * iframes no longer relax their sandbox for this flag; every first-party AST
   * preview must provide its own brand/icon runtime context.
   */
  sameOrigin?: boolean;
  /**
   * The live preview sandbox handle (Daytona path only). Additive + optional —
   * the frozen seam shape is unchanged. v1's live in-box iframe keeps a Daytona
   * sandbox ALIVE for the preview TTL; this handle lets a TTL-expiry scheduler
   * call `DaytonaExecutor.expirePreview(sandboxId)` to tear it down (T-031-09).
   * It is a sandbox identifier, NEVER a secret — the `DAYTONA_API_KEY` never
   * appears in `previewState` (PREV-01). Absent for the first-party
   * `LabAstExecutor` / `IframeCspExecutor` paths.
   */
  sandboxId?: string;
}

/** The render result. */
export interface RenderResult {
  /** Per-profile PNG screenshot for the judge (PREV-04). */
  screenshots: Array<{ profile: string; png: Buffer }>;
  /** Immutable live preview URL/state for the canvas card (PREV-02). */
  previewState: PreviewState;
  /** True iff the artifact actually rendered (VAL-06 render-success). */
  rendered: boolean;
  /** Runtime verification for theme/token/screenshot readiness. */
  previewVerification?: PreviewVerification;
}

/**
 * The preview seam. The workflow depends ONLY on this interface; it never
 * imports a concrete executor or any vendor.
 */
export interface PreviewExecutor {
  render(input: RenderInput): Promise<RenderResult>;
}

/**
 * Default executor: until a concrete impl is injected, `render()` throws a
 * descriptive error. Production wires `IframeCspExecutor` (or, in Plan 05,
 * `DaytonaExecutor`) via `setPreviewExecutor`; tests inject a mock. This keeps
 * the seam file itself vendor-free — no impl is imported here.
 */
const _unconfiguredExecutor: PreviewExecutor = {
  render() {
    return Promise.reject(
      new Error(
        'No PreviewExecutor configured. Call setPreviewExecutor(impl) with ' +
          'IframeCspExecutor (or a test mock) before invoking render().'
      )
    );
  },
};

/**
 * Module-level seam (dependency-injection-for-tests idiom, mirrors
 * `modelAdapter.ts:_callModelImpl`). Production swaps in a real executor;
 * tests swap in a deterministic mock via `setPreviewExecutor`.
 */
let _previewExecutorImpl: PreviewExecutor = _unconfiguredExecutor;

/** Return the active preview executor (real in prod, mock in tests). */
export function getPreviewExecutor(): PreviewExecutor {
  return _previewExecutorImpl;
}

/**
 * Override the active `PreviewExecutor`. Used both in production wiring (inject
 * `IframeCspExecutor`) and in tests (inject a credential-free mock). Returns a
 * restore function that reinstates the previous impl — call it in a test
 * `finally` so suites don't leak state across cases.
 */
export function setPreviewExecutor(impl: PreviewExecutor): () => void {
  const previous = _previewExecutorImpl;
  _previewExecutorImpl = impl;
  return () => {
    _previewExecutorImpl = previous;
  };
}
