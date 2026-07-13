/**
 * polyfills.ts — loaded FIRST (before any Storybook code) in index.ts.
 *
 * Hermes does not implement `DOMException`, but Storybook's core router/globals
 * reference it at module-init time, which crashes the JS runtime on launch
 * ("ReferenceError: Property 'DOMException' doesn't exist"). This minimal shim
 * satisfies those references. Harmless on engines that already provide it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = typeof global !== 'undefined' ? global : globalThis;

if (typeof g.DOMException === 'undefined') {
  function DOMException(this: Error, message?: string, name?: string) {
    const err = new Error(message);
    (err as Error & { name: string }).name = name || 'Error';
    return err as unknown as void;
  }
  g.DOMException = DOMException;
}

export {};
