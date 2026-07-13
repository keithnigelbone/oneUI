/**
 * image.test.ts — version-pin + recipe guards for the Daytona custom image.
 *
 * The single most dangerous failure mode of the zero-egress path is a Playwright
 * version skew between the npm package installed in the image and the browser
 * revision baked into the base tag: at runtime, under `networkBlockAll`, there is
 * no network to download the right browser, so the sandbox dies with
 * "browserType.launch: Executable doesn't exist" (RESEARCH Pitfall 1). These
 * tests fail loudly the moment the pin drifts from the repo's resolved Playwright
 * version, and assert the harness the image bakes actually exists.
 */

import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DAYTONA_IMAGE_BASE,
  HARNESS_DIR,
  PLAYWRIGHT_VERSION,
  PREVIEW_SNAPSHOT_NAME,
  SANDBOX_PREVIEW_DIR,
  buildDaytonaImage,
} from './image';

/** The Playwright version actually resolved in the repo (the source of truth). */
const require = createRequire(import.meta.url);
const resolvedPlaywrightVersion = (
  require('playwright/package.json') as { version: string }
).version;

describe('Daytona image version pin (RESEARCH Pitfall 1)', () => {
  it('pins PLAYWRIGHT_VERSION to the repo-resolved playwright version', () => {
    // If this fails, the image npm install would mismatch the baked browser.
    expect(PLAYWRIGHT_VERSION).toBe(resolvedPlaywrightVersion);
  });

  it('targets the matching v<version>-jammy Playwright base image', () => {
    expect(DAYTONA_IMAGE_BASE).toBe(
      `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy`,
    );
    // Tag must end with the resolved version's -jammy suffix.
    expect(DAYTONA_IMAGE_BASE.endsWith(`v${resolvedPlaywrightVersion}-jammy`)).toBe(
      true,
    );
  });
});

describe('Daytona image recipe', () => {
  it('exposes a stable named-snapshot constant', () => {
    expect(PREVIEW_SNAPSHOT_NAME).toBe('oneui-preview-v1');
  });

  it('bakes Playwright + the harness into the image (build-time install)', () => {
    const image = buildDaytonaImage();
    const dockerfile = image.dockerfile;

    // Base tag pinned to the resolved Playwright version.
    expect(dockerfile).toContain(DAYTONA_IMAGE_BASE);
    // Playwright npm installed at build time (the base image omits the package).
    expect(dockerfile).toContain(`playwright@${PLAYWRIGHT_VERSION}`);
    // Harness baked to the in-box preview dir the scripts read.
    expect(dockerfile).toContain(SANDBOX_PREVIEW_DIR);
  });

  it('references the local harness dir via addLocalDir context', () => {
    const image = buildDaytonaImage();
    // addLocalDir registers the local harness dir as an image build context.
    const baked = image.contextList.some((c) => c.sourcePath === HARNESS_DIR);
    expect(baked).toBe(true);
  });
});

describe('baked harness scripts exist', () => {
  it('contains capture.js, serve.js, and probe.js', () => {
    expect(existsSync(HARNESS_DIR)).toBe(true);
    for (const script of ['capture.js', 'serve.js', 'probe.js']) {
      expect(existsSync(join(HARNESS_DIR, script))).toBe(true);
    }
  });
});
