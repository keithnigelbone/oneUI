/**
 * Unit tests for generatePublicBarrel (scripts/generate-public-barrel.ts).
 *
 * The generator drops `export … from './components/<Name>'` blocks for any
 * component folder not on the released-component allowlist
 * (packages/ui/src/registry/releasedComponents.ts), and keeps every other
 * re-export verbatim. These tests lock in the invariants the two reviews
 * flagged as fragile:
 *   - single- AND double-quoted specifiers are both filtered
 *   - nested Platform/ paths are dropped (filtered by their first segment)
 *   - non-component exports (providers, hooks, registry, …) pass through
 *   - released components are always kept
 *
 * `generatePublicBarrel` is pure and side-effect-free to import — the
 * script's `main()` is guarded behind an `import.meta.url` check.
 */

import { describe, it, expect } from 'vitest';
import { generatePublicBarrel } from '../generate-public-barrel';
import {
  RELEASED_COMPONENTS,
  PUBLIC_INFRA_COMPONENT_MODULES,
} from '../../packages/ui/src/registry/releasedComponents';

// A released component and an infra module that must always survive.
const KEPT = RELEASED_COMPONENTS[0]; // e.g. 'Avatar'
const KEPT_INFRA = PUBLIC_INFRA_COMPONENT_MODULES[0]; // 'BrandProvider'

describe('generatePublicBarrel', () => {
  it('drops an unreleased component export (single-quoted)', () => {
    const src = [
      `export { Carousel } from './components/Carousel';`,
      `export { ${KEPT} } from './components/${KEPT}';`,
    ].join('\n');
    const out = generatePublicBarrel(src);
    expect(out).not.toContain('./components/Carousel');
    expect(out).toContain(`./components/${KEPT}`);
  });

  it('drops an unreleased component export written with double quotes', () => {
    const src = `export { Carousel } from "./components/Carousel";`;
    const out = generatePublicBarrel(src);
    expect(out).not.toContain('Carousel');
  });

  it('drops `export type` blocks for unreleased components', () => {
    const src = `export type { CarouselProps } from './components/Carousel';`;
    const out = generatePublicBarrel(src);
    expect(out).not.toContain('Carousel');
  });

  it('drops nested Platform/ component paths (filtered by first segment)', () => {
    const src = `export { Shell } from './components/Platform/Shell';`;
    const out = generatePublicBarrel(src);
    expect(out).not.toContain('Platform/Shell');
  });

  it('keeps released components and infra modules', () => {
    const src = [
      `export { ${KEPT} } from './components/${KEPT}';`,
      `export { ${KEPT_INFRA} } from './components/${KEPT_INFRA}';`,
    ].join('\n');
    const out = generatePublicBarrel(src);
    expect(out).toContain(`./components/${KEPT}`);
    expect(out).toContain(`./components/${KEPT_INFRA}`);
  });

  it('passes non-component re-exports through untouched', () => {
    const src = [
      `export { COMPONENT_REGISTRY } from './registry/componentRegistry';`,
      `export { useBrandCSS } from './hooks/useBrandCSS';`,
      `export { ASTRenderer } from './runtime';`,
      `export { Carousel } from './components/Carousel';`,
    ].join('\n');
    const out = generatePublicBarrel(src);
    expect(out).toContain('./registry/componentRegistry');
    expect(out).toContain('./hooks/useBrandCSS');
    expect(out).toContain('./runtime');
    expect(out).not.toContain('./components/Carousel');
  });

  it('prepends the GENERATED banner', () => {
    const out = generatePublicBarrel('');
    expect(out).toContain('GENERATED FILE — DO NOT EDIT.');
  });
});
