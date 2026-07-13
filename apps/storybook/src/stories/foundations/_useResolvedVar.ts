/**
 * _useResolvedVar.ts
 *
 * Reads a CSS custom property's resolved pixel value from a ref element,
 * re-reading whenever `<html>` attributes change (platform / density /
 * theme toolbar updates) AND whenever the element's own attributes change
 * (local scoping overrides).
 *
 * Returns a ref to attach to the element whose scope defines the value,
 * plus the current resolved string (e.g. "16px", "1.125rem").
 */
import { useEffect, useRef, useState, type RefObject } from 'react';

export function useResolvedVar(varName: string): [RefObject<HTMLDivElement>, string] {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const v = getComputedStyle(el).getPropertyValue(varName).trim();
      setValue(v);
    };
    read();
    const htmlObserver = new MutationObserver(read);
    htmlObserver.observe(document.documentElement, { attributes: true });
    const selfObserver = new MutationObserver(read);
    selfObserver.observe(el, { attributes: true });
    return () => {
      htmlObserver.disconnect();
      selfObserver.disconnect();
    };
  }, [varName]);

  return [ref, value];
}
