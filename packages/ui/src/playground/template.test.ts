// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { buildPlaygroundFiles } from './template';

describe('buildPlaygroundFiles', () => {
  const baseInput = {
    appCode: 'export default function App() { return null; }',
    foundationCSS: '',
    bundleSource: 'export {};',
    bundleCSS: '',
  };

  it('injects public image assets into Sandpack public files', () => {
    const files = buildPlaygroundFiles({
      ...baseInput,
      publicFiles: {
        '/public/playground-assets/images/ecommerce-hero.svg': '<svg />',
        '/playground-assets/images/ecommerce-hero.svg': '<svg />',
      },
    });

    expect(files['/public/playground-assets/images/ecommerce-hero.svg']?.code).toBe('<svg />');
    expect(files['/playground-assets/images/ecommerce-hero.svg']?.code).toBe('<svg />');
  });

  it('sets the V2 density attribute in HTML and message handling', () => {
    const files = buildPlaygroundFiles({
      ...baseInput,
      density: 'compact',
    });

    expect(files['/public/index.html']?.code).toContain('data-density="compact"');
    expect(files['/public/index.html']?.code).toContain('data-6-Density="compact"');
    expect(files['/index.tsx']?.code).toContain("root.setAttribute('data-6-Density'");
    expect(files['/index.tsx']?.code).toContain("document.documentElement.setAttribute('data-6-Density', msg.value)");
  });
});
