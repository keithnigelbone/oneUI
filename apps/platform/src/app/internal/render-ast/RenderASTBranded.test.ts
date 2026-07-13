import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('/internal/render-ast branded runtime wiring', () => {
  it('mounts the brand CSS and icon provider context used by generated AST previews', () => {
    const source = readFileSync(join(__dirname, 'RenderASTBranded.tsx'), 'utf8');
    const pageSource = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    const cssSource = readFileSync(join(__dirname, 'brandCss.ts'), 'utf8');

    expect(source).toContain('IconProvider');
    expect(source).toContain('JioIconsInit');
    expect(source).toContain('FoundationStyleProvider');
    expect(source).toContain('data-render-target');
    expect(source).toContain('data-surface="default"');
    expect(source).toContain('data-surface-step="2500"');
    expect(source).toContain('renderPlatformForViewportWidth');
    expect(source).toContain('useResponsiveRenderPlatform');
    expect(source).toContain("overflowX: 'clip'");
    expect(source).toContain("background: 'var(--Surface-Fill-Default, var(--Surface-Main))'");
    expect(source).not.toContain("overflow: 'hidden'");
    expect(source).not.toContain('DESIGN_VIEWPORT_WIDTH');
    expect(source).not.toContain('scale(calc');
    expect(source).toContain('data-theme={resolvedTheme}');
    expect(source).toContain('data-density={resolvedDensity}');
    expect(source).toContain("document.documentElement.setAttribute('data-theme'");

    expect(pageSource).toContain('generateInitialRenderBrandCSS');
    expect(pageSource).toContain('oneui-initial-render-foundation-tokens');
    expect(pageSource).toContain('api.foundations.getBrandOverviewData');

    expect(cssSource).toContain('generateNewRootCSS');
    expect(cssSource).toContain('generateNewContextCSS');
    expect(cssSource).toContain('generateNewStepLookupCSSSplit');
    expect(cssSource).toContain("wrapCSSForInjection(rawCSS, 'global'");
  });
});
