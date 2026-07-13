/**
 * DaytonaExecutor.test.ts
 *
 * A CREDENTIAL-FREE, real-shape contract test for the production zero-egress
 * executor. The `@daytonaio/sdk` `Daytona` client is mocked (vi.mock) so the
 * suite runs with NO `DAYTONA_API_KEY` and NO live sandbox — proving the
 * executor's contract without touching the vendor or the network.
 *
 * The mock fake-sandbox records the REAL per-call shapes (RESEARCH Wave 0 gap:
 * the previous mock was too coarse). It captures:
 *   - `create` params  → `{ snapshot, networkBlockAll }` (or `{ image, ... }`)
 *   - `fs.uploadFile`   → the asset Buffer + path (assert it is the assembled HTML)
 *   - `process.executeCommand` → every command string (serve.js vs capture.js)
 *   - `getSignedPreviewUrl` → the live-iframe URL minting (PREV-02)
 *   - `delete` → lifecycle teardown (kept-alive on success, deleted on error)
 *
 * Covers the six behaviors in the plan:
 *   1. asset uploaded   — the assembleAsset HTML lands at preview/asset.html
 *   2. create shape     — `{ snapshot, networkBlockAll:true }` (PREV-01), not bare image
 *   3. capture          — one executeCommand per profile → base64 PNG → Buffer (PREV-04)
 *   4. live iframe       — serve.js started + getSignedPreviewUrl; previewState has
 *                          url + expiresAt and NO `sameOrigin` (PREV-01 strict)
 *   5. keep-alive        — NOT deleted per-render on the happy path; explicit
 *                          expirePreview() tears down; a mid-run THROW deletes (no leak)
 *   6. no leak           — DAYTONA_API_KEY canary never appears in previewState (PREV-01)
 *
 * The live zero-egress NETWORK PROBE (PREV-01) — spinning a real sandbox and
 * confirming it cannot reach the Convex URL — is a MANUAL verification per
 * 03-VALIDATION.md (requires real credentials + a live sandbox).
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RenderInput } from './PreviewExecutor';
import { DEFAULT_PROFILES } from './lifecycle';
import { PREVIEW_SNAPSHOT_NAME } from './daytona/image';

/** A fake signed preview URL whose token is the ONLY sensitive-looking material. */
const SIGNED_PREVIEW_URL =
  'https://3000-sandbox-abc.proxy.daytona.io/?token=signed-opaque-token';

/** A canary "secret" we assert never appears in any returned state. */
const CANARY_SECRET = 'sk-daytona-canary-secret-do-not-leak';

// assembleAsset is real (Plan 01) but slow to esbuild; stub it to a deterministic
// self-contained HTML string so this suite stays a fast, hermetic contract test
// of the executor's PIPELINE (not the bundler — that has its own suite).
const ASSEMBLED_HTML =
  '<!doctype html><html><head><style>/* inlined brand css */</style></head>' +
  '<body><div id="root"></div><script>/* inlined react bundle */</script></body></html>';
const assembleAssetSpy = vi.fn();
vi.mock('./bundler/assembleAsset', () => ({
  assembleAsset: (input: unknown) => assembleAssetSpy(input),
}));

// ─── Mock @daytonaio/sdk so the suite is credential-free ──────────────────────
const createSpy = vi.fn();
const getSpy = vi.fn();
const uploadFileSpy = vi.fn();
const executeCommandSpy = vi.fn();
const getSignedPreviewUrlSpy = vi.fn();
const deleteSpy = vi.fn();

vi.mock('@daytonaio/sdk', () => {
  class Daytona {
    create(params: unknown, options?: unknown) {
      return createSpy(params, options);
    }
    // Production `Daytona` exposes `get(id)` — `expirePreview` resolves the
    // kept-alive sandbox through it for TTL-expiry teardown (T-031-09).
    get(id: string) {
      return getSpy(id);
    }
  }
  return { Daytona };
});

// Imported AFTER the mocks are declared (vi.mock is hoisted) so the executor
// binds to the mocked client + bundler.
import { DaytonaExecutor } from './DaytonaExecutor';

/** Build a fake sandbox whose methods are the shared spies. */
function makeFakeSandbox(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'sandbox-abc',
    fs: { uploadFile: uploadFileSpy },
    process: { executeCommand: executeCommandSpy },
    getSignedPreviewUrl: getSignedPreviewUrlSpy,
    delete: deleteSpy,
    ...overrides,
  };
}

const INPUT: RenderInput = {
  bundle: "import { Button } from '@oneui/ui'; export const GeneratedArtifact = () => null;",
  brandId: 'jio',
  brandCss: '@layer brand { :root { --Primary-Bold: #0f3cff; } }',
  profiles: [...DEFAULT_PROFILES],
};

/** Which executeCommand calls drove capture.js vs serve.js. */
function commandStrings(): string[] {
  return executeCommandSpy.mock.calls.map((c) => String(c[0]));
}

describe('DaytonaExecutor (credential-free, mocked SDK + bundler)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DAYTONA_API_KEY;

    assembleAssetSpy.mockResolvedValue(ASSEMBLED_HTML);
    createSpy.mockResolvedValue(makeFakeSandbox());
    getSpy.mockResolvedValue(makeFakeSandbox());
    uploadFileSpy.mockResolvedValue(undefined);
    // capture.js prints base64 PNG on stdout (exit 0); serve.js is backgrounded
    // and returns exit 0 immediately. The default covers both.
    executeCommandSpy.mockResolvedValue({
      exitCode: 0,
      result: Buffer.from('fake-png-bytes').toString('base64'),
    });
    getSignedPreviewUrlSpy.mockResolvedValue({
      url: SIGNED_PREVIEW_URL,
      token: 'signed-opaque-token',
    });
    deleteSpy.mockResolvedValue(undefined);
  });

  // ─── 1. asset uploaded ──────────────────────────────────────────────────────
  it('assembles the self-contained asset and uploads it as HTML (BUNDLE-01 wiring)', async () => {
    const executor = new DaytonaExecutor();
    await executor.render(INPUT);

    expect(assembleAssetSpy).toHaveBeenCalledTimes(1);
    expect(assembleAssetSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        bundle: INPUT.bundle,
        brandId: INPUT.brandId,
        brandCss: INPUT.brandCss,
      }),
    );

    expect(uploadFileSpy).toHaveBeenCalledTimes(1);
    const [buf, dest] = uploadFileSpy.mock.calls[0];
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect((buf as Buffer).toString('utf8')).toContain('<!doctype html>');
    expect(String(dest)).toMatch(/asset\.html$/);
  });

  // ─── 2. create shape ────────────────────────────────────────────────────────
  it('creates the sandbox from the named snapshot with networkBlockAll:true (PREV-01)', async () => {
    const executor = new DaytonaExecutor();
    await executor.render(INPUT);

    expect(createSpy).toHaveBeenCalledTimes(1);
    const [params] = createSpy.mock.calls[0];
    expect(params).toMatchObject({
      snapshot: PREVIEW_SNAPSHOT_NAME,
      networkBlockAll: true,
    });
    // NOT the bare default image.
    expect(params).not.toEqual({});
  });

  // ─── 3. capture ─────────────────────────────────────────────────────────────
  it('runs capture.js once per profile and decodes the base64 stdout to a PNG Buffer (PREV-04)', async () => {
    const executor = new DaytonaExecutor();
    const result = await executor.render(INPUT);

    const captureCmds = commandStrings().filter((c) => c.includes('capture.js'));
    expect(captureCmds).toHaveLength(DEFAULT_PROFILES.length);
    // Each capture carries the profile viewport.
    for (const profile of DEFAULT_PROFILES) {
      expect(captureCmds.some((c) => c.includes(`--width=${profile.width}`))).toBe(
        true,
      );
    }

    expect(result.screenshots).toHaveLength(DEFAULT_PROFILES.length);
    for (const shot of result.screenshots) {
      expect(typeof shot.profile).toBe('string');
      expect(Buffer.isBuffer(shot.png)).toBe(true);
      expect((shot.png as Buffer).length).toBeGreaterThan(0);
    }
    expect(result.rendered).toBe(true);
  });

  // ─── 4. live iframe ─────────────────────────────────────────────────────────
  it('starts serve.js and mints a signed live preview URL with NO sameOrigin (PREV-02 + PREV-01)', async () => {
    const executor = new DaytonaExecutor();
    const result = await executor.render(INPUT);

    // serve.js is started on the preview port.
    const serveCmds = commandStrings().filter((c) => c.includes('serve.js'));
    expect(serveCmds).toHaveLength(1);
    expect(serveCmds[0]).toContain('3000');

    // The signed live URL is minted against the preview port + TTL.
    expect(getSignedPreviewUrlSpy).toHaveBeenCalledTimes(1);
    const [port, ttl] = getSignedPreviewUrlSpy.mock.calls[0];
    expect(port).toBe(3000);
    expect(typeof ttl).toBe('number');

    expect(result.previewState.url).toBe(SIGNED_PREVIEW_URL);
    expect(typeof result.previewState.expiresAt).toBe('number');
    // PREV-01: untrusted path MUST omit sameOrigin (strict allow-scripts).
    expect('sameOrigin' in result.previewState).toBe(false);
  });

  // ─── 5. keep-alive / teardown ─────────────────────────────────────────────────
  it('keeps the sandbox ALIVE on the happy path (no per-render delete) and tears down via expirePreview', async () => {
    const executor = new DaytonaExecutor();
    const result = await executor.render(INPUT);

    // Happy path: NOT torn down per-render (kept alive for the TTL, CONTEXT decision).
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(result.previewState.sandboxId).toBe('sandbox-abc');

    // Explicit TTL-expiry teardown deletes the live sandbox.
    await executor.expirePreview('sandbox-abc');
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('tears down the sandbox on a mid-run throw so no sandbox leaks (delete-on-error)', async () => {
    executeCommandSpy.mockReset();
    // First command (a capture) blows up mid-run.
    executeCommandSpy.mockRejectedValueOnce(new Error('capture exploded'));

    const executor = new DaytonaExecutor();
    await expect(executor.render(INPUT)).rejects.toThrow('capture exploded');

    // The error path deletes the sandbox exactly once (no leak).
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('throws and tears down when an in-box capture exits non-zero (no silent partial render)', async () => {
    executeCommandSpy.mockReset();
    executeCommandSpy.mockResolvedValueOnce({ exitCode: 1, result: '' });

    const executor = new DaytonaExecutor();
    await expect(executor.render(INPUT)).rejects.toThrow(/capture .* failed/i);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  // ─── 6. no leak ─────────────────────────────────────────────────────────────
  it('never leaks a secret/API key into previewState (PREV-01) — only the signed token', async () => {
    process.env.DAYTONA_API_KEY = CANARY_SECRET;
    try {
      const executor = new DaytonaExecutor();
      const result = await executor.render(INPUT);

      const serialized = JSON.stringify(result.previewState);
      expect(serialized).not.toContain(CANARY_SECRET);
      expect(result.previewState.url).toBe(SIGNED_PREVIEW_URL);
    } finally {
      delete process.env.DAYTONA_API_KEY;
    }
  });

  it('supports a pinned networkAllowList instead of full block (Assumption A4)', async () => {
    const executor = new DaytonaExecutor({ networkAllowList: '10.0.0.0/24' });
    await executor.render(INPUT);

    const [params] = createSpy.mock.calls[0];
    expect(params).toMatchObject({
      snapshot: PREVIEW_SNAPSHOT_NAME,
      networkAllowList: '10.0.0.0/24',
    });
    expect((params as Record<string, unknown>).networkBlockAll).toBeUndefined();
  });
});
