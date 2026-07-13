import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Stub window.matchMedia for JSDOM environments
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  if (typeof (window as any).FontFace === 'undefined') {
    class FontFaceStub {
      constructor(public family: string, public source: string, public descriptors?: any) {}
      load() {
        return Promise.resolve(this);
      }
    }
    (window as any).FontFace = FontFaceStub;
  }
}

if (typeof document !== 'undefined') {
  if (!document.fonts) {
    const mockFonts = new Set();
    (document as any).fonts = {
      ready: Promise.resolve(),
      add: (font: any) => mockFonts.add(font),
      has: (font: any) => mockFonts.has(font),
      delete: (font: any) => mockFonts.delete(font),
      clear: () => mockFonts.clear(),
      keys: () => mockFonts.keys(),
      values: () => mockFonts.values(),
      entries: () => mockFonts.entries(),
      forEach: (cb: any) => mockFonts.forEach(cb),
    };
  }
}
