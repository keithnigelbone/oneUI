/**
 * assembleAsset.test.ts — BUNDLE-01 unit coverage.
 *
 * The four behaviors that prove the asset is a renderable, zero-egress,
 * deterministic, self-contained HTML string:
 *
 *   1. self-contained: `<!doctype html>` + a `<script>` with NO bare
 *      `from '@oneui/ui'`, `from 'react'`, or `from 'react-dom/client'` imports
 *      (esbuild resolves/inlines them all).
 *   2. brand CSS inlined: `<style id="oneui-foundation-tokens">` with
 *      `@layer brand` content + a token-CSS `<style>` block; NO `<link>` to any
 *      CDN/url.
 *   3. deterministic: same IR + brandId → byte-identical asset on repeat calls.
 *   4. mounts: the script references `createRoot` and renders `GeneratedArtifact`
 *      into `#root`.
 *
 * The fixture mirrors `compiler.ts` output: `import React from 'react';` +
 * `import { Button } from '@oneui/ui';` + `export function GeneratedArtifact()`.
 */

import { describe, it, expect } from 'vitest';
import { assembleAsset } from './assembleAsset';

/** A tiny generated artifact, shaped exactly like `compile()` emits (compiler.ts). */
const FAKE_ARTIFACT_TSX = `import React from 'react';
import { Button } from '@oneui/ui';

export function GeneratedArtifact() {
  return (
    <Button>Hi</Button>
  );
}
`;

describe('assembleAsset (BUNDLE-01)', () => {
  it('Test 1 — self-contained: one HTML doc with no bare @oneui/ui / react / react-dom imports in the script', async () => {
    const html = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });

    expect(html.toLowerCase()).toContain('<!doctype html>');

    // Extract the script body and assert no UNRESOLVED bare imports survived.
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const script = scriptMatch![1];

    expect(script).not.toMatch(/from\s*['"]@oneui\/ui['"]/);
    expect(script).not.toMatch(/from\s*['"]react['"]/);
    expect(script).not.toMatch(/from\s*['"]react-dom\/client['"]/);
    // Nothing should remain importable from the original virtual alias either.
    expect(script).not.toMatch(/from\s*['"]oneui-bundle['"]/);
  });

  it('Test 2 — brand CSS inlined: @layer brand block + token CSS, no external <link>', async () => {
    const html = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });

    // Foundation/brand CSS block present and carries @layer brand content.
    expect(html).toContain('<style id="oneui-foundation-tokens">');
    expect(html).toMatch(/@layer\s+brand/);

    // A token-CSS style block exists.
    expect(html).toContain('<style id="oneui-tokens">');

    // Zero-egress proof surface (PREV-01 / Pitfall 4): assert against the
    // document MARKUP (everything before the bundled <script>) — the bundled
    // React iife legitimately contains `link`/url string literals in its DOM
    // tables and error messages, which are not network fetches.
    const markup = html.slice(0, html.indexOf('<script>'));
    expect(markup).not.toMatch(/<link\b/i);

    // No CDN url (@import / url(https:...)) inside the INLINED CSS.
    const styleBlocks = [...markup.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => m[1])
      .join('\n');
    expect(styleBlocks).not.toMatch(/@import/i);
    expect(styleBlocks).not.toMatch(/url\(\s*['"]?https?:/i);
  });

  it('Test 3 — deterministic: same IR + brandId → byte-identical asset', async () => {
    const a = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });
    const b = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });
    expect(a).toBe(b);
  });

  it('Test 4 — mounts: script references createRoot and renders GeneratedArtifact into #root', async () => {
    const html = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });

    // The host element exists.
    expect(html).toContain('id="root"');

    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const script = scriptMatch![1];

    // esbuild minifies, so assert on stable identifiers, not formatting.
    expect(script).toContain('createRoot');
    expect(script).toContain('GeneratedArtifact');
  });

  it('Test 5 — preview document is scrollable and establishes the root Surface context', async () => {
    const html = await assembleAsset({ bundle: FAKE_ARTIFACT_TSX, brandId: 'jio' });

    expect(html).toContain('<style id="oneui-preview-document">');
    expect(html).toContain(
      '<body data-surface="default" data-surface-step="2500" data-appearance="primary">',
    );

    const documentCssMatch = html.match(
      /<style id="oneui-preview-document">([\s\S]*?)<\/style>/,
    );
    expect(documentCssMatch).not.toBeNull();
    const documentCss = documentCssMatch![1];

    expect(documentCss).toContain('overflow-y: auto');
    expect(documentCss).toContain('overflow-x: hidden');
    expect(documentCss).toContain('background: var(--Surface-Fill-Default, var(--Surface-Main))');
    expect(documentCss).not.toMatch(/body\s*{[\s\S]*overflow:\s*hidden/);
  });
});
