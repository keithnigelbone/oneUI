/**
 * useBrandFonts.test.ts
 *
 * Tests for the hook that loads brand custom fonts via expo-font.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as Font from 'expo-font';

import { useBrandFonts } from './useBrandFonts';
import type { NativeCustomFontDescriptor } from '@oneui/ui-native';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDescriptor(
  familyName: string,
  fileUrl: string,
): NativeCustomFontDescriptor {
  return { _id: familyName, familyName, fileUrl };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useBrandFonts — empty / no descriptors', () => {
  beforeEach(() => {
    vi.mocked(Font.loadAsync).mockClear();
    vi.mocked(Font.isLoaded).mockClear();
    vi.mocked(Font.isLoaded).mockReturnValue(false);
  });

  it('is ready immediately when descriptors is undefined', async () => {
    const { result } = renderHook(() => useBrandFonts(undefined));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.ready).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('is ready immediately when descriptors is an empty array', async () => {
    const { result } = renderHook(() => useBrandFonts([]));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.ready).toBe(true);
    expect(Font.loadAsync).not.toHaveBeenCalled();
  });

  it('is ready immediately when all fonts are already loaded (isLoaded = true)', async () => {
    vi.mocked(Font.isLoaded).mockReturnValue(true);
    const descriptors = [makeDescriptor('JioType', 'https://cdn.example.com/jio.woff2')];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.ready).toBe(true);
    expect(Font.loadAsync).not.toHaveBeenCalled();
  });
});

describe('useBrandFonts — with descriptors to load', () => {
  beforeEach(() => {
    vi.mocked(Font.loadAsync).mockReset();
    vi.mocked(Font.isLoaded).mockReset();
    vi.mocked(Font.isLoaded).mockReturnValue(false);
  });

  it('calls Font.loadAsync with the correct family → url map', async () => {
    vi.mocked(Font.loadAsync).mockResolvedValueOnce();
    const descriptors = [
      makeDescriptor('JioType', 'https://cdn.example.com/jio.woff2'),
    ];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(Font.loadAsync).toHaveBeenCalledWith({
      JioType: 'https://cdn.example.com/jio.woff2',
    });
    expect(result.current.ready).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('loads multiple fonts in a single call', async () => {
    vi.mocked(Font.loadAsync).mockResolvedValueOnce();
    const descriptors = [
      makeDescriptor('FontA', 'https://example.com/a.woff2'),
      makeDescriptor('FontB', 'https://example.com/b.woff2'),
    ];

    renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(Font.loadAsync).toHaveBeenCalledWith({
      FontA: 'https://example.com/a.woff2',
      FontB: 'https://example.com/b.woff2',
    });
  });

  it('starts with ready = false while loading', async () => {
    // Never resolves
    vi.mocked(Font.loadAsync).mockReturnValue(new Promise(() => {}));
    const descriptors = [makeDescriptor('JioType', 'https://example.com/jio.woff2')];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    // Don't await — check the synchronous state
    expect(result.current.ready).toBe(false);
  });

  it('sets ready = true after Font.loadAsync resolves', async () => {
    vi.mocked(Font.loadAsync).mockResolvedValueOnce();
    const descriptors = [makeDescriptor('JioType', 'https://example.com/jio.woff2')];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.ready).toBe(true);
  });
});

describe('useBrandFonts — error handling', () => {
  beforeEach(() => {
    vi.mocked(Font.loadAsync).mockReset();
    vi.mocked(Font.isLoaded).mockReset();
    vi.mocked(Font.isLoaded).mockReturnValue(false);
  });

  it('sets error and still marks ready when Font.loadAsync rejects with an Error', async () => {
    const loadError = new Error('Font load failed');
    vi.mocked(Font.loadAsync).mockRejectedValueOnce(loadError);
    const descriptors = [makeDescriptor('Broken', 'https://example.com/broken.woff2')];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.ready).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Font load failed');
  });

  it('wraps non-Error rejection in an Error', async () => {
    vi.mocked(Font.loadAsync).mockRejectedValueOnce('network error');
    const descriptors = [makeDescriptor('Broken', 'https://example.com/broken.woff2')];

    const { result } = renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('network error');
  });
});

describe('useBrandFonts — fingerprint / re-run behaviour', () => {
  beforeEach(() => {
    vi.mocked(Font.loadAsync).mockReset();
    vi.mocked(Font.isLoaded).mockReset();
    vi.mocked(Font.isLoaded).mockReturnValue(false);
  });

  it('skips descriptors with missing familyName or fileUrl', async () => {
    vi.mocked(Font.loadAsync).mockResolvedValue(undefined);
    const descriptors: NativeCustomFontDescriptor[] = [
      { _id: 'a', familyName: '', fileUrl: 'https://example.com/a.woff2' },
      { _id: 'b', familyName: 'ValidFont', fileUrl: '' },
      { _id: 'c', familyName: 'GoodFont', fileUrl: 'https://example.com/c.woff2' },
    ];

    renderHook(() => useBrandFonts(descriptors));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Only GoodFont should be in the loadAsync call
    expect(Font.loadAsync).toHaveBeenCalledWith({
      GoodFont: 'https://example.com/c.woff2',
    });
  });

  it('re-runs effect when descriptor list changes (fingerprint changes)', async () => {
    vi.mocked(Font.loadAsync).mockResolvedValue(undefined);

    const descA = [makeDescriptor('FontA', 'https://example.com/a.woff2')];
    const descB = [makeDescriptor('FontB', 'https://example.com/b.woff2')];

    const { rerender } = renderHook(
      ({ descs }) => useBrandFonts(descs),
      { initialProps: { descs: descA } },
    );

    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    rerender({ descs: descB });

    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(Font.loadAsync).toHaveBeenCalledTimes(2);
  });
});
