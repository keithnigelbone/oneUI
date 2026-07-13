/**
 * DaytonaExecutor.ts
 *
 * The PRODUCTION zero-egress `PreviewExecutor` implementation (D-01). It renders
 * an already-compiled artifact in a network-blocked Daytona sandbox that CANNOT
 * reach Convex/auth (PREV-01), screenshots per output profile credential-free
 * (PREV-04), and returns an immutable signed preview URL for the canvas card
 * (PREV-02). Daytona executes/previews/screenshots only — per D-03 it does NOT
 * own React codegen (the IR compiler still owns React + Jio-CSS output) and does
 * NOT relax generation rules.
 *
 * Boundary rule (RESEARCH Pattern 1 / Pattern 2): this is the ONLY module in the
 * package that imports `@daytonaio/sdk`. The seam (`PreviewExecutor.ts`) and the
 * sibling `IframeCspExecutor` stay vendor-free. The CI import-guard can assert
 * `@daytonaio/sdk` appears in `DaytonaExecutor.ts` and nowhere else.
 *
 * Analog: `apps/platform/src/lib/playwrightRenderer.ts` `capturePath` — the
 * per-profile loop, font/transition settle, and PNG-buffer return are mirrored,
 * but re-implemented INSIDE the sandbox (RESEARCH Pitfall 1 / issue #4456: do
 * NOT connect an external CDP — run Playwright in-box).
 *
 * INVARIANTS:
 * - `networkBlockAll: true` is set at CREATE time (Open Q4 — works on ALL
 *   account tiers; post-create `updateNetworkSettings` is a Tier-3/4 dependency
 *   we deliberately avoid). This is the PREV-01 zero-egress guarantee.
 * - The sandbox is created from the pre-registered `PREVIEW_SNAPSHOT_NAME`
 *   snapshot (Plan 02 / RESEARCH Pattern 3) so per-run create skips the cold
 *   Playwright+Chromium build; `onSnapshotCreateLogs` surfaces the slow first
 *   build so it is observable, not a silent hang.
 * - LIFECYCLE (CONTEXT resolved-decision): v1 ships a LIVE in-box iframe AND
 *   per-profile screenshots, so the sandbox is KEPT ALIVE for the preview TTL —
 *   it is NOT torn down per-render. Teardown moves to TTL-expiry via the explicit
 *   `expirePreview(sandboxId)` method (the canvas/scheduler calls it when the
 *   signed URL expires). The ONLY per-render delete is the delete-on-ERROR path
 *   so a mid-run throw never leaks a sandbox (T-031-09). Warm-pool tuning stays
 *   deferred (D-02).
 * - `DAYTONA_API_KEY` is read server-side ONLY by `new Daytona()`. It is NEVER
 *   written into the bundle, the `previewState`, or the screenshot path. The
 *   `previewState.url` carries only the signed preview token (PREV-01/PREV-02).
 * - No external CDP. Capture runs inside the box via `process.executeCommand`
 *   (Playwright-in-box) emitting base64 PNG on stdout. (RESEARCH Pitfall 1,
 *   issue #4456.)
 * - Fonts/CSS are inlined into the self-contained asset (Plan 01 `assembleAsset`)
 *   so `networkBlockAll` holds; if a CDN is genuinely required, pass a pinned
 *   `networkAllowList` CIDR (IPv4 + /N only) via options instead of relaxing the
 *   block (Assumption A4).
 */

import { Daytona } from '@daytonaio/sdk';
import type { Sandbox } from '@daytonaio/sdk';
import type {
  PreviewExecutor,
  PreviewProfile,
  PreviewState,
  RenderInput,
  RenderResult,
} from './PreviewExecutor';
import { assembleAsset } from './bundler/assembleAsset';
import { PREVIEW_SNAPSHOT_NAME, buildDaytonaImage } from './daytona/image';

/** The port the in-box preview server listens on. */
const DEFAULT_PREVIEW_PORT = 3000;
/** Signed preview URL TTL handed to the canvas card (PREV-02). */
const DEFAULT_PREVIEW_TTL_SECONDS = 300;
/**
 * Where the self-contained HTML asset (Plan 01 `assembleAsset` output) is written
 * inside the sandbox. The in-box `capture.js` + `serve.js` harness (Plan 02) both
 * read `preview/asset.html` (resolved against the baked `/home/pwuser` workdir).
 */
const SANDBOX_ASSET_PATH = 'preview/asset.html';

export interface DaytonaExecutorOptions {
  /**
   * Port the in-sandbox preview server binds. The signed preview URL (PREV-02)
   * is minted against this port.
   */
  previewPort?: number;
  /** Signed preview URL lifetime in seconds. */
  previewTtlSeconds?: number;
  /**
   * Optional pinned allow-list (comma-separated CIDR, IPv4 + /N only) used INSTEAD
   * of full block when the rendered artifact genuinely needs a CDN (Assumption
   * A4). When set, `networkBlockAll` is omitted and `networkAllowList` is passed.
   * Leave undefined for the default zero-egress (`networkBlockAll: true`) path.
   */
  networkAllowList?: string;
  /**
   * First-build escape hatch. Set `true` to build the image inline from
   * `buildDaytonaImage()` (surfacing the slow cold build via
   * `onSnapshotCreateLogs`) INSTEAD of reusing the pre-registered named snapshot.
   * Default `false`: reuse `PREVIEW_SNAPSHOT_NAME` so per-run create skips the
   * build (RESEARCH Pattern 3). Use this once to seed the snapshot, then leave it
   * unset for the fast steady-state path.
   */
  buildImage?: boolean;
  /**
   * Callback for the (slow, cold) snapshot/image build logs, surfaced so a first
   * build is observable rather than a silent hang (CONTEXT / RESEARCH Pattern 3).
   */
  onSnapshotCreateLogs?: (chunk: string) => void;
  /**
   * Test seam: inject a pre-built `Daytona` client (credential-free in tests).
   * Production leaves this undefined so `new Daytona()` reads `DAYTONA_API_KEY`
   * from the server environment.
   */
  client?: Pick<Daytona, 'create'>;
}

/**
 * The Daytona production preview executor. Implements the vendor-free
 * `PreviewExecutor` seam; `@daytonaio/sdk` is imported only here.
 */
export class DaytonaExecutor implements PreviewExecutor {
  private readonly client: Pick<Daytona, 'create'>;
  private readonly previewPort: number;
  private readonly previewTtlSeconds: number;
  private readonly networkAllowList?: string;
  private readonly buildImage: boolean;
  private readonly onSnapshotCreateLogs?: (chunk: string) => void;

  constructor(options: DaytonaExecutorOptions = {}) {
    // `new Daytona()` reads DAYTONA_API_KEY server-side only — never reaches the
    // bundle/previewState/screenshot path (PREV-01). Tests inject a mock client.
    this.client = options.client ?? new Daytona();
    this.previewPort = options.previewPort ?? DEFAULT_PREVIEW_PORT;
    this.previewTtlSeconds =
      options.previewTtlSeconds ?? DEFAULT_PREVIEW_TTL_SECONDS;
    this.networkAllowList = options.networkAllowList;
    this.buildImage = options.buildImage ?? false;
    this.onSnapshotCreateLogs = options.onSnapshotCreateLogs;
  }

  async render(input: RenderInput): Promise<RenderResult> {
    // Plan 01: assemble ONE self-contained, zero-egress HTML asset from the
    // compiler's TSX (real React inlined, `@oneui/ui` resolved, brand CSS inlined).
    // Daytona only executes/previews it (D-03) — it never authors codegen.
    const html = await assembleAsset({
      bundle: input.bundle,
      brandId: input.brandId,
      ...(input.brandCss ? { brandCss: input.brandCss } : {}),
      ast: input.ast,
    });

    // PREV-01: zero-egress sandbox set at CREATE time (works on all tiers,
    // Open Q4). When a pinned allow-list is provided (Assumption A4) we pass it
    // INSTEAD of the full block; the default path is full zero-egress.
    const networkParams = this.networkAllowList
      ? { networkAllowList: this.networkAllowList }
      : { networkBlockAll: true };

    // RESEARCH Pattern 3: reuse the pre-registered named snapshot so per-run
    // create skips the cold Playwright+Chromium build. The `buildImage` escape
    // hatch builds inline from `buildDaytonaImage()` to seed the snapshot the
    // first time (surfacing the slow build via `onSnapshotCreateLogs` — which the
    // SDK only honours on the from-image create overload).
    const sandbox = (
      this.buildImage
        ? await this.client.create(
            { image: buildDaytonaImage(), ...networkParams },
            {
              ...(this.onSnapshotCreateLogs
                ? { onSnapshotCreateLogs: this.onSnapshotCreateLogs }
                : {}),
            },
          )
        : await this.client.create({
            snapshot: PREVIEW_SNAPSHOT_NAME,
            ...networkParams,
          })
    ) as Sandbox;

    try {
      // Write the self-contained asset into the box at the harness-expected path
      // (`preview/asset.html`). The asset inlines Jio fonts/CSS so
      // `networkBlockAll` holds — Daytona only executes/previews it (D-03).
      await sandbox.fs.uploadFile(Buffer.from(html, 'utf8'), SANDBOX_ASSET_PATH);

      // Render + screenshot per profile INSIDE the box — no external CDP
      // (Pitfall 1 / issue #4456).
      const screenshots = await this.captureInBox(sandbox, input.profiles);

      // CONTEXT resolved-decision: v1 ALSO serves a live in-box iframe. Start the
      // static `serve.js` server on the preview port (backgrounded — it must keep
      // listening for the TTL), then mint the immutable signed preview URL.
      await this.startPreviewServer(sandbox);

      // Immutable signed preview URL for the canvas card (PREV-02). The url
      // carries only the signed token — never the API key (PREV-01).
      const signed = await sandbox.getSignedPreviewUrl(
        this.previewPort,
        this.previewTtlSeconds,
      );

      // Untrusted sandbox path: previewState OMITS `sameOrigin`, so the canvas
      // iframe defaults to strict 'allow-scripts' (no same-origin) — the
      // untrusted asset cannot reach the Lab origin's credentials (PREV-01).
      const previewState: PreviewState = {
        url: signed.url,
        expiresAt: Date.now() + this.previewTtlSeconds * 1_000,
        // `sandboxId` lets the TTL-expiry scheduler call `expirePreview` to tear
        // the kept-alive sandbox down (T-031-09). It is the sandbox handle, NOT a
        // secret — the API key never appears here (PREV-01, no-leak canary test).
        sandboxId: sandbox.id,
      };

      return {
        screenshots,
        previewState,
        rendered: screenshots.length > 0,
      };
    } catch (err) {
      // Delete-on-ERROR ONLY: a mid-run throw must never leak a sandbox
      // (T-031-09). The HAPPY path deliberately keeps the sandbox alive for the
      // TTL (CONTEXT resolved-decision) — teardown then happens via
      // `expirePreview` at TTL-expiry, NOT here.
      try {
        await sandbox.delete();
      } catch {
        // Best-effort cleanup — surface the ORIGINAL render error, not a
        // secondary teardown failure.
      }
      throw err;
    }
  }

  /**
   * TTL-expiry teardown (T-031-09). The canvas/scheduler calls this when the
   * signed preview URL minted by `render()` expires, reconciling the kept-alive
   * sandbox lifecycle with eventual deletion. Idempotent-friendly: a delete on an
   * already-gone sandbox is swallowed so a double-expire never throws. Warm-pool
   * reuse tuning stays deferred (D-02).
   */
  async expirePreview(sandboxId: string): Promise<void> {
    const client = this.client as { get?: (id: string) => Promise<Sandbox> };
    if (typeof client.get !== 'function') {
      // No `get` on the injected client (e.g. a minimal test client) — nothing to
      // resolve. Production `Daytona` exposes `get(id)`.
      return;
    }
    try {
      const sandbox = await client.get(sandboxId);
      await sandbox.delete();
    } catch {
      // Best-effort: the sandbox may already be gone (already expired/torn down).
    }
  }

  /**
   * Start the in-box static preview server (`serve.js`, Plan 02) on the preview
   * port, backgrounded so it keeps listening while the signed URL is live. The
   * command nohup-backgrounds the node process and returns immediately; the
   * server serves ONLY `asset.html` (no traversal) for the live iframe (PREV-02).
   */
  private async startPreviewServer(sandbox: Sandbox): Promise<void> {
    const result = await sandbox.process.executeCommand(
      this.buildServeCommand(),
    );
    if (result.exitCode !== 0) {
      throw new Error(
        `In-box preview server (serve.js) failed to start ` +
          `(exit ${result.exitCode}).`,
      );
    }
  }

  /**
   * Build the backgrounded serve.js launch command. `nohup … &` detaches the
   * static server so `executeCommand` returns immediately while the server keeps
   * listening on the preview port for the TTL.
   */
  private buildServeCommand(): string {
    return (
      `nohup node preview/serve.js --port=${this.previewPort} ` +
      `> preview/serve.log 2>&1 &`
    );
  }

  /**
   * Capture one PNG per profile INSIDE the sandbox. Mirrors
   * `playwrightRenderer.ts`'s per-profile loop (viewport framing, font/transition
   * settle, PNG return) but runs the headless render in-box via
   * `process.executeCommand` — the command emits a base64 PNG on stdout which we
   * decode to a Buffer. No external CDP connection (Pitfall 1 / issue #4456).
   */
  private async captureInBox(
    sandbox: Sandbox,
    profiles: PreviewProfile[],
  ): Promise<Array<{ profile: string; png: Buffer }>> {
    const captures: Array<{ profile: string; png: Buffer }> = [];
    for (const profile of profiles) {
      const result = await sandbox.process.executeCommand(
        this.buildCaptureCommand(profile),
      );
      if (result.exitCode !== 0) {
        throw new Error(
          `In-box capture for profile "${profile.name}" failed ` +
            `(exit ${result.exitCode}).`,
        );
      }
      // The in-box renderer prints the PNG as base64 on stdout so nothing
      // sensitive crosses the boundary — only image bytes.
      const png = Buffer.from(result.result.trim(), 'base64');
      captures.push({ profile: profile.name, png });
    }
    return captures;
  }

  /**
   * Build the in-box capture command for a profile. Runs a headless render of
   * the uploaded bundle at the profile's viewport and prints a base64 PNG. The
   * renderer is Playwright-in-box (or Daytona's native screenshot CLI) — the
   * point is it executes INSIDE the network-blocked sandbox, never via an
   * external CDP endpoint.
   */
  private buildCaptureCommand(profile: PreviewProfile): string {
    // Deterministic, side-effect-free invocation: the in-box harness reads the
    // uploaded bundle, frames the viewport, settles fonts/transitions, then
    // emits base64 PNG. Kept as a single command so it is trivially mockable
    // and carries no secrets.
    //
    // NODE_PATH: the image installs Playwright GLOBALLY (`npm i -g playwright`),
    // but `capture.js` does `require('playwright')`, and Node's `require` does
    // NOT search the global modules dir — only local `node_modules` up the tree.
    // Without this, capture.js fails with `Cannot find module 'playwright'`
    // (exit 1) even though the package is installed. `$(npm root -g)` resolves
    // the global root (e.g. /usr/lib/node_modules) so the require succeeds.
    return [
      'NODE_PATH="$(npm root -g)"',
      'node',
      'preview/capture.js',
      `--bundle=${SANDBOX_ASSET_PATH}`,
      `--width=${profile.width}`,
      `--height=${profile.height}`,
      '--format=png-base64',
    ].join(' ');
  }
}
