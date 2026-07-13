/**
 * _useCurrentPlatform.ts
 *
 * Reads the live `data-Breakpoint` value that the preview decorator sets on
 * `<html>` (wired in `.storybook/preview.ts`). Any foundation story that
 * needs to create its OWN locally-scoped platform×density subtree must pair
 * `data-6-Density` with the current platform — scale.css attribute selectors
 * require both attributes on the same element, otherwise nothing matches
 * and the subtree silently inherits the ancestor values.
 */
import { useLayoutEffect, useState } from 'react';

export function useCurrentPlatform(): string {
  const [platform, setPlatform] = useState<string>(() => {
    if (typeof document === 'undefined') return 'L';
    return document.documentElement.getAttribute('data-Breakpoint') ?? 'L';
  });

  useLayoutEffect(() => {
    const read = () => {
      const v = document.documentElement.getAttribute('data-Breakpoint');
      if (v) setPlatform(v);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-Breakpoint'],
    });
    return () => observer.disconnect();
  }, []);

  return platform;
}
