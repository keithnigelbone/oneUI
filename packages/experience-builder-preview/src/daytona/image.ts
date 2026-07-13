/**
 * image.ts — Daytona custom-image recipe for the zero-egress render pipeline.
 *
 * Builds the image that bakes Playwright + Chromium at BUILD time (when the
 * Daytona builder has network) so the RUNTIME sandbox can run
 * `networkBlockAll: true` with no install and still screenshot (PREV-01 / PREV-04,
 * RESEARCH Pattern 3).
 *
 * Version pin (RESEARCH Pitfall 1): the base tag and the `npm i playwright@X` MUST
 * match the repo's resolved Playwright version. The Playwright Docker image bakes
 * Node 24 + browsers into `/ms-playwright` but does NOT include the `playwright`
 * npm package, so the recipe installs it at build time. A version skew between the
 * npm package and the baked browser revision yields
 * "browserType.launch: Executable doesn't exist" at runtime — with no network to
 * recover (`image.test.ts` guards against this by asserting the pinned version
 * equals `node_modules/playwright/package.json`).
 *
 * Snapshot lifecycle (RESEARCH Pattern 3 / Pitfall 2): the image is registered
 * ONCE as a named snapshot (`PREVIEW_SNAPSHOT_NAME`) in a one-time CI/setup step
 * via the `daytona.snapshot` service, then reused at runtime via
 * `daytona.create({ snapshot: PREVIEW_SNAPSHOT_NAME, networkBlockAll: true })` so
 * per-run create skips the (slow, cold) build entirely. The caller (Plan 04)
 * surfaces `onSnapshotCreateLogs` so the first cold build is observable, not a
 * silent hang. Rebuild the snapshot on a Playwright version bump.
 *
 * Architecture (RESEARCH Pitfall 6): the image is built AMD64 server-side via the
 * declarative `Image.base(...)` builder — NOT a locally-built arm64 Dockerfile —
 * so dev-machine architecture never produces an incompatible image.
 *
 * Boundary: this module imports only the `Image` builder from the Daytona SDK
 * (the ONE allowed SDK use here, alongside `DaytonaExecutor.ts`). The in-box
 * harness scripts under `./harness` never import the SDK.
 */

import { Image } from '@daytonaio/sdk';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolved Playwright version (MUST equal `node_modules/playwright/package.json`).
 * Pinned, not `^`, because the runtime sandbox cannot download a mismatched browser
 * revision under zero-egress (RESEARCH Pitfall 1).
 */
export const PLAYWRIGHT_VERSION = '1.59.1';

/**
 * Official Playwright base image — Node 24 + Chromium/Firefox/WebKit baked into
 * `/ms-playwright`. Tag pinned to the resolved Playwright minor (`v<version>-jammy`).
 */
export const DAYTONA_IMAGE_BASE = `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy`;

/**
 * Name of the pre-registered Daytona snapshot built from this recipe. Registered
 * ONCE (CI/setup) and reused at runtime via `create({ snapshot })` to skip the
 * cold build (RESEARCH Pattern 3 / Pitfall 2). Bump on a Playwright version bump.
 */
export const PREVIEW_SNAPSHOT_NAME = 'oneui-preview-v1';

/** In-box directory the harness scripts are baked into (capture/serve/probe read this). */
export const SANDBOX_PREVIEW_DIR = '/home/pwuser/preview';

/** Absolute path to the local `./harness` dir baked into the image. Exported for the test. */
export const HARNESS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'harness');

/**
 * Build the Daytona custom-image recipe. The result is registered as a named
 * snapshot once (see `PREVIEW_SNAPSHOT_NAME`); runtime sandboxes are created from
 * that snapshot under `networkBlockAll: true`.
 *
 * Recipe (RESEARCH Pattern 3):
 *   1. `Image.base(DAYTONA_IMAGE_BASE)` — Node 24 + Chromium baked.
 *   2. `.runCommands('npm i -g playwright@<version>')` — package NOT in the base
 *      image; installed at build time (network OK), matching the baked browser.
 *   3. `.addLocalDir(HARNESS_DIR, SANDBOX_PREVIEW_DIR)` — bake capture/serve/probe.js.
 *   4. `.workdir('/home/pwuser')` — the pwuser home (where `/preview` lives).
 */
export function buildDaytonaImage(): Image {
  return Image.base(DAYTONA_IMAGE_BASE)
    .runCommands(`npm i -g playwright@${PLAYWRIGHT_VERSION}`)
    .addLocalDir(HARNESS_DIR, SANDBOX_PREVIEW_DIR)
    .workdir('/home/pwuser');
}
