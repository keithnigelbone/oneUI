import { useEffect, useMemo, useState } from 'react';
import * as Font from 'expo-font';
import type { NativeCustomFontDescriptor } from '@oneui/ui-native';

interface UseBrandFontsResult {
  /** True once every font in `descriptors` has finished loading (or failed). */
  ready: boolean;
  /** Surfaced for diagnostics; never throws. */
  error: Error | null;
}

/**
 * Loads brand-uploaded custom fonts via `expo-font` so React Native can
 * resolve the `fontFamily` strings emitted by `buildNativeTypography`.
 *
 * Re-runs when the descriptor list changes (e.g. switching brands). Already-
 * loaded family names are skipped — `Font.isLoaded` short-circuits the
 * network call.
 */
export function useBrandFonts(
  descriptors: NativeCustomFontDescriptor[] | undefined,
): UseBrandFontsResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Stabilise the dependency: re-run only when the *set* of (familyName,
  // fileUrl) pairs changes, not on every render.
  const fingerprint = useMemo(
    () =>
      (descriptors ?? [])
        .map((d) => `${d.familyName}:${d.fileUrl}`)
        .sort()
        .join('|'),
    [descriptors],
  );

  useEffect(() => {
    const list = descriptors ?? [];
    const toLoad: Record<string, string> = {};
    for (const d of list) {
      if (!d.familyName || !d.fileUrl) continue;
      if (Font.isLoaded(d.familyName)) continue;
      toLoad[d.familyName] = d.fileUrl;
    }

    // Short-circuit: nothing to load. Avoid the false→true state flap that
    // would briefly hide the theme behind a loading spinner on every brand
    // switch when fonts are already cached.
    if (Object.keys(toLoad).length === 0) {
      setReady(true);
      setError(null);
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    Font.loadAsync(toLoad)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        // Mark ready anyway so the UI doesn't hang on font failure — RN will
        // fall back to the system font for the missing family.
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
    // `fingerprint` is derived from `descriptors` and stable across reference
    // changes with identical content — it is the only correct trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint]);

  return { ready, error };
}
