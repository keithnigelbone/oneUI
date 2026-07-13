/**
 * useGoogleFonts.ts
 * Hook for dynamically loading Google Fonts and custom fonts
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { FontMetadata } from '@oneui/shared';
import { getGoogleFontsUrl } from '@oneui/shared';

export interface UseGoogleFontsReturn {
  /** Set of loaded font IDs */
  loadedFonts: Set<string>;
  /** Set of currently loading font IDs */
  loadingFonts: Set<string>;
  /** Load a font */
  loadFont: (font: FontMetadata) => void;
  /** Check if a font is loaded */
  isFontLoaded: (fontId: string) => boolean;
  /** Check if a font is loading */
  isFontLoading: (fontId: string) => boolean;
}

/**
 * Hook to manage dynamic loading of Google Fonts and custom fonts
 */
export function useGoogleFonts(
  initialLoadedFonts: string[] = ['inter']
): UseGoogleFontsReturn {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(
    () => new Set(initialLoadedFonts)
  );
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(() => new Set());

  // Track added link elements to avoid duplicates
  const addedLinksRef = useRef<Set<string>>(new Set());

  // Load a font
  const loadFont = useCallback((font: FontMetadata) => {
    // Skip if already loaded or loading
    if (loadedFonts.has(font.id) || loadingFonts.has(font.id)) {
      return;
    }

    // Skip if link already added
    if (addedLinksRef.current.has(font.id)) {
      return;
    }

    // Custom fonts are loaded via @font-face in CSS
    if (font.source === 'custom') {
      // For custom fonts, we assume they're already loaded via @font-face
      // Just mark them as loaded after a brief delay to allow CSS parsing
      setLoadingFonts((prev) => new Set(prev).add(font.id));
      addedLinksRef.current.add(font.id);

      // Use document.fonts API if available
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.ready.then(() => {
          setLoadedFonts((prev) => new Set(prev).add(font.id));
          setLoadingFonts((prev) => {
            const next = new Set(prev);
            next.delete(font.id);
            return next;
          });
        });
      } else {
        // Fallback: assume loaded after short delay
        setTimeout(() => {
          setLoadedFonts((prev) => new Set(prev).add(font.id));
          setLoadingFonts((prev) => {
            const next = new Set(prev);
            next.delete(font.id);
            return next;
          });
        }, 100);
      }
      return;
    }

    // Uploaded fonts are loaded via FontFace API from Convex storage URL
    if (font.source === 'uploaded' && font.customFontPath) {
      setLoadingFonts((prev) => new Set(prev).add(font.id));
      addedLinksRef.current.add(font.id);

      // Resolve the set of weight files to load. A variable font is a single
      // file covering the whole 100–900 range; a static family has one file
      // per weight (Regular + Bold + …). `weightFiles` carries every uploaded
      // file; fall back to the single primary path for legacy metadata.
      const weightFiles =
        !font.isVariable && font.weightFiles && font.weightFiles.length > 0
          ? font.weightFiles
          : [{ weight: font.weights[0] || 400, url: font.customFontPath!, format: undefined as string | undefined }];

      // Inject @font-face rules BEFORE starting the load so the browser declares
      // the font family at the same time as (or before) the brand CSS references
      // --Typography-Font-Primary. Without this, the brand CSS injects first
      // (useInsertionEffect), the browser sees an unknown font family and
      // commits to the fallback, then document.fonts.add() triggers a re-render
      // with different metrics — the visible "jump".
      //
      // font-display:swap (not optional): the typography editor's whole purpose
      // is previewing an uploaded font, so the font MUST become visible once it
      // loads. `optional` gives a ~100 ms block period and then permanently
      // commits the fallback with no late swap — a freshly uploaded static font
      // that isn't cached simply never appears in the preview. `swap` shows the
      // fallback immediately and swaps in the real font the instant it loads.
      const quotedName = font.name.includes(' ') ? `'${font.name}'` : font.name;
      // One @font-face per file: a variable file declares the full range so any
      // requested weight interpolates; each static file declares its own weight
      // so Regular vs Bold resolve to the correct file instead of faux-bolding.
      const faceDescriptors = font.isVariable
        ? [{ weight: '100 900', url: weightFiles[0].url }]
        : weightFiles.map((f) => ({ weight: String(f.weight), url: f.url }));

      const styleId = `font-face-${font.id}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = faceDescriptors
          .map(
            (d) =>
              `@font-face {\n  font-family: ${quotedName};\n  src: url(${d.url});\n  font-weight: ${d.weight};\n  font-style: normal;\n  font-display: swap;\n}`
          )
          .join('\n');
        document.head.appendChild(style);
      }

      // Use the FontFace API to dynamically load every weight so
      // document.fonts.has() and other programmatic font checks work correctly.
      // Load each weight INDEPENDENTLY (allSettled, not all): one corrupt or
      // 404-ing weight file must not discard the weights that loaded fine. The
      // family counts as loaded if at least one face succeeds; only when EVERY
      // face fails do we tear down the injected <style> so a later retry can
      // re-inject fresh (the getElementById guard otherwise blocks re-injection
      // and the browser keeps re-fetching dead URLs every render).
      Promise.allSettled(
        faceDescriptors.map((d) => {
          const fontFace = new FontFace(font.name, `url(${d.url})`, {
            weight: d.weight,
            style: 'normal',
            display: 'swap',
          });
          return fontFace.load().then((loadedFace) => {
            document.fonts.add(loadedFace);
          });
        })
      ).then((results) => {
        const anyLoaded = results.some((r) => r.status === 'fulfilled');
        setLoadingFonts((prev) => {
          const next = new Set(prev);
          next.delete(font.id);
          return next;
        });
        if (anyLoaded) {
          setLoadedFonts((prev) => new Set(prev).add(font.id));
          const failed = results.filter((r) => r.status === 'rejected').length;
          if (failed > 0) {
            console.warn(`Some weights of ${font.name} failed to load (${failed}/${results.length})`);
          }
        } else {
          console.error(`Failed to load uploaded font: ${font.name}`);
          document.getElementById(styleId)?.remove();
          addedLinksRef.current.delete(font.id);
        }
      });

      return;
    }

    // Google Fonts loading
    const url = getGoogleFontsUrl(font);
    if (!url) {
      console.warn(`No Google Fonts URL for font: ${font.id}`);
      return;
    }

    // Mark as loading
    setLoadingFonts((prev) => new Set(prev).add(font.id));
    addedLinksRef.current.add(font.id);

    // Create link element
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';

    link.onload = () => {
      // Wait for fonts to be parsed
      if (document.fonts) {
        document.fonts.ready.then(() => {
          setLoadedFonts((prev) => new Set(prev).add(font.id));
          setLoadingFonts((prev) => {
            const next = new Set(prev);
            next.delete(font.id);
            return next;
          });
        });
      } else {
        setLoadedFonts((prev) => new Set(prev).add(font.id));
        setLoadingFonts((prev) => {
          const next = new Set(prev);
          next.delete(font.id);
          return next;
        });
      }
    };

    link.onerror = () => {
      console.error(`Failed to load font: ${font.name}`);
      setLoadingFonts((prev) => {
        const next = new Set(prev);
        next.delete(font.id);
        return next;
      });
      addedLinksRef.current.delete(font.id);
    };

    document.head.appendChild(link);
  }, [loadedFonts, loadingFonts]);

  // Check if a font is loaded
  const isFontLoaded = useCallback(
    (fontId: string) => loadedFonts.has(fontId),
    [loadedFonts]
  );

  // Check if a font is loading
  const isFontLoading = useCallback(
    (fontId: string) => loadingFonts.has(fontId),
    [loadingFonts]
  );

  return {
    loadedFonts,
    loadingFonts,
    loadFont,
    isFontLoaded,
    isFontLoading,
  };
}
