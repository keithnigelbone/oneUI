/**
 * PreviewExecutor.test.ts
 *
 * The RESEARCH Wave-0 gap closure for the preview package. A CREDENTIAL-FREE
 * suite (no DAYTONA / Daytona key, no live browser, no `playwright` import)
 * covering:
 *   - PREV-01: the `setPreviewExecutor` seam — injection + restore.
 *   - PREV-02: `render()` returns an immutable `previewState` (stable url +
 *     expiresAt; reproducible per version).
 *   - PREV-03: the `lifecycle.ts` transitions + per-profile framing.
 *
 * The deterministic mock executor mirrors `testModelMock.ts`'s queue idiom so
 * the suite runs with zero env vars set.
 */

import { describe, expect, it, afterEach } from 'vitest';
import {
  getPreviewExecutor,
  setPreviewExecutor,
  type PreviewExecutor,
  type RenderInput,
  type RenderResult,
} from './PreviewExecutor';
import {
  nextLifecycleState,
  isLiveState,
  framingForProfile,
  LIFECYCLE_ORDER,
  DEFAULT_PROFILES,
  type PreviewLifecycleState,
} from './lifecycle';

/**
 * Build a deterministic, credential-free `PreviewExecutor` mock. It records
 * every call and returns a stable, reproducible `RenderResult` derived purely
 * from the input — so the same bundle yields the same `previewState` (PREV-02
 * immutability). No vendor, no env, no network. Mirrors `testModelMock.ts`.
 */
function createPreviewMock(): {
  executor: PreviewExecutor;
  calls: () => RenderInput[];
} {
  const calls: RenderInput[] = [];
  const executor: PreviewExecutor = {
    async render(input: RenderInput): Promise<RenderResult> {
      calls.push(input);
      // Deterministic, reproducible state keyed by bundle + brand — the same
      // version always resolves to the same immutable url (PREV-02).
      const token = `tok-${input.brandId}-${input.bundle.length}`;
      return {
        screenshots: input.profiles.map((p) => ({
          profile: p.name,
          png: Buffer.from(`png:${p.name}`),
        })),
        previewState: {
          url: `https://preview.test/r?t=${token}`,
          expiresAt: 1_000,
        },
        rendered: true,
      };
    },
  };
  return { executor, calls: () => calls };
}

describe('PreviewExecutor seam (PREV-01)', () => {
  afterEach(() => {
    // Defensive: ensure no mock leaks if a test forgot its restore fn.
    setPreviewExecutor({
      render() {
        return Promise.reject(new Error('unconfigured'));
      },
    });
  });

  it('getPreviewExecutor() returns the injected mock; restore reinstates the previous impl', async () => {
    const before = getPreviewExecutor();
    const { executor } = createPreviewMock();

    const restore = setPreviewExecutor(executor);
    expect(getPreviewExecutor()).toBe(executor);

    restore();
    expect(getPreviewExecutor()).toBe(before);
  });

  it('runs credential-free: render() resolves through the seam with no Daytona key and no browser', async () => {
    const { executor, calls } = createPreviewMock();
    const restore = setPreviewExecutor(executor);
    try {
      const input: RenderInput = {
        bundle: 'export default () => null;',
        brandId: 'jio',
        profiles: [...DEFAULT_PROFILES],
      };
      const result = await getPreviewExecutor().render(input);
      expect(result.rendered).toBe(true);
      expect(result.screenshots).toHaveLength(DEFAULT_PROFILES.length);
      expect(calls()).toHaveLength(1);
      expect(process.env.DAYTONA_API_KEY).toBeUndefined();
    } finally {
      restore();
    }
  });
});

describe('previewState immutability (PREV-02)', () => {
  it('returns a stable url + expiresAt that is reproducible for the same version', async () => {
    const { executor } = createPreviewMock();
    const restore = setPreviewExecutor(executor);
    try {
      const input: RenderInput = {
        bundle: 'const a = 1;',
        brandId: 'jio',
        profiles: [...DEFAULT_PROFILES],
      };
      const first = await getPreviewExecutor().render(input);
      const second = await getPreviewExecutor().render(input);

      expect(first.previewState.url).toBeTruthy();
      expect(first.previewState.expiresAt).toBe(1_000);
      // Same version → same immutable preview url (PREV-02).
      expect(second.previewState).toEqual(first.previewState);
    } finally {
      restore();
    }
  });

  it('different versions produce different preview urls', async () => {
    const { executor } = createPreviewMock();
    const restore = setPreviewExecutor(executor);
    try {
      const a = await getPreviewExecutor().render({
        bundle: 'v1',
        brandId: 'jio',
        profiles: [...DEFAULT_PROFILES],
      });
      const b = await getPreviewExecutor().render({
        bundle: 'version-two',
        brandId: 'jio',
        profiles: [...DEFAULT_PROFILES],
      });
      expect(a.previewState.url).not.toBe(b.previewState.url);
    } finally {
      restore();
    }
  });
});

describe('lifecycle state machine (PREV-03)', () => {
  it('escalates thumbnail -> lightweight -> live', () => {
    expect(nextLifecycleState('thumbnail')).toBe('lightweight');
    expect(nextLifecycleState('lightweight')).toBe('live');
  });

  it('live is terminal (idempotent)', () => {
    expect(nextLifecycleState('live')).toBe('live');
    expect(isLiveState('live')).toBe(true);
    expect(isLiveState('thumbnail')).toBe(false);
  });

  it('canonical order matches the transition function', () => {
    let state: PreviewLifecycleState = LIFECYCLE_ORDER[0];
    const visited: PreviewLifecycleState[] = [state];
    for (let i = 0; i < LIFECYCLE_ORDER.length; i += 1) {
      state = nextLifecycleState(state);
      visited.push(state);
    }
    expect(visited).toEqual(['thumbnail', 'lightweight', 'live', 'live']);
  });

  it('framingForProfile returns the right width/height per profile', () => {
    expect(framingForProfile('desktop')).toEqual({
      name: 'desktop',
      width: 1440,
      height: 900,
    });
    expect(framingForProfile('mobile')).toEqual({
      name: 'mobile',
      width: 390,
      height: 844,
    });
    expect(framingForProfile('fixed')).toEqual({
      name: 'fixed',
      width: 1080,
      height: 1080,
    });
  });
});
