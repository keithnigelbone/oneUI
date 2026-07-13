import { describe, expect, it } from 'vitest';
import { buildAllComponentCSS } from './buildComponentOverrideCSS';

describe('buildAllComponentCSS', () => {
  it('scopes Button role and color theme overrides to the Button element', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            defaultAppearance: 'primary',
            emphasisStyle: 'outline',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    const rootBlock = css.match(/:root\s\{[\s\S]*?\n  \}/)?.[0] ?? '';
    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-roleTintedA11y: var(--Primary-TintedA11y);');
    expect(buttonBlock).toContain('--Button-backgroundColor-bold: transparent;');
    expect(buttonBlock).toContain(
      '--Button-textColor-bold: var(--Button-roleTintedA11y-bold, var(--_btn-default-accent-a11y));',
    );
    expect(buttonBlock).toContain(
      '--Button-cssDecorationColor-bold: var(--Button-roleTintedA11y-bold, var(--_btn-default-accent-a11y));',
    );
    expect(rootBlock).not.toContain('--Button-roleTintedA11y');
    expect(rootBlock).not.toContain('--Button-textColor-bold');
  });

  it('nests Button-scoped overrides under preview scopes', () => {
    const css = buildAllComponentCSS(
      {
        componentThemeSelections: [
          {
            familyId: 'actions',
            selections: {
              emphasisStyle: 'tonal',
            },
          },
        ],
        recipeSelections: [],
        tokenOverrides: [],
      },
      { selector: '.editor-preview-scope' },
    );

    expect(css).toContain('.editor-preview-scope [data-oneui-component="Button"]');
    expect(css).toContain(
      '--Button-backgroundColor-bold: var(--Button-roleSubtle-bold, var(--_btn-subtle));',
    );
  });

  it('emits state-scoped material stroke overrides for Button', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'strokeImage.bold-hover',
          value: 'Material-Metallic-Gold-Stroke',
          scope: 'variant-state',
          target: { variant: 'bold', state: 'hover' },
          channel: 'stroke',
          valueKind: 'material',
        },
        {
          componentName: 'button',
          tokenName: 'borderColor.bold-hover',
          value: 'Material-Metallic-Gold-StrokeColor',
          scope: 'variant-state',
          target: { variant: 'bold', state: 'hover' },
          channel: 'stroke',
          valueKind: 'material',
        },
      ],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-strokeImage-bold-hover: var(--Material-Metallic-Gold-Stroke);');
    expect(buttonBlock).toContain('--Button-borderColor-bold-hover: var(--Material-Metallic-Gold-StrokeColor);');
    expect(buttonBlock).toContain('--Button-solidStrokeColor-bold-hover: transparent;');
    expect(buttonBlock).toContain('--Button-cssDecorationInsetStrokeWidth-bold-hover: var(--Spacing-0);');
    expect(buttonBlock).toContain('--Button-cssDecorationUnderlineWidth-bold-hover: var(--Spacing-0);');
    expect(buttonBlock).toContain('--Button-cssDecorationColor-bold-hover: transparent;');
  });

  it('emits structured rest-state material fill overrides for Button', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Material-Metallic-Gold-Fill',
          scope: 'variant',
          target: { variant: 'bold' },
          channel: 'fill',
          valueKind: 'material',
        },
      ],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-backgroundColor-bold: var(--Material-Metallic-Gold-Fill);');
  });

  it('emits scoped interaction paint overrides when Convex metadata is unavailable', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'borderColor.bold-hover',
          value: 'Material-Metallic-Gold-StrokeColor',
          scope: 'variant-state',
        },
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Primary-Bold',
          scope: 'variant',
        },
      ],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-borderColor-bold-hover: var(--Material-Metallic-Gold-StrokeColor);');
    expect(buttonBlock).toContain('--Button-backgroundColor-bold: var(--_btn-bold);');
    expect(buttonBlock).not.toContain('--Button-backgroundColor-bold: var(--Primary-Bold);');
  });

  it('keeps Button role-token paint overrides appearance-relative', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Primary-Bold',
          scope: 'variant',
          target: { variant: 'bold' },
          channel: 'fill',
          valueKind: 'token',
        },
        {
          componentName: 'button',
          tokenName: 'backgroundColor.subtle',
          value: 'Primary-Subtle',
          scope: 'variant',
          target: { variant: 'subtle' },
          channel: 'fill',
          valueKind: 'token',
        },
        {
          componentName: 'button',
          tokenName: 'textColor.subtle',
          value: 'Primary-TintedA11y',
          scope: 'variant',
          target: { variant: 'subtle' },
          channel: 'text',
          valueKind: 'token',
        },
      ],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-backgroundColor-bold: var(--_btn-bold);');
    expect(buttonBlock).toContain('--Button-backgroundColor-subtle: var(--_btn-subtle);');
    expect(buttonBlock).toContain('--Button-textColor-subtle: var(--_btn-default-accent-a11y);');
    expect(buttonBlock).not.toContain('var(--Primary-Bold)');
    expect(buttonBlock).not.toContain('var(--Primary-Subtle)');
    expect(buttonBlock).not.toContain('var(--Primary-TintedA11y)');
  });

  it('skips stale local color overrides that are not structured interaction paint', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Material-Metallic-Gold-Fill',
        },
      ],
    });

    expect(css).not.toContain('--Button-backgroundColor-bold: var(--Material-Metallic-Gold-Fill);');
  });

  it('keeps state-scoped decoration suppression for Button stroke overrides', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            emphasisStyle: 'outline',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'cssDecorationInsetStrokeWidth.bold-hover',
          value: 'Spacing-0',
          scope: 'variant-state',
          target: { variant: 'bold', state: 'hover' },
          channel: 'stroke',
          valueKind: 'none',
        },
        {
          componentName: 'button',
          tokenName: 'cssDecorationUnderlineWidth.bold-hover',
          value: 'Spacing-0',
          scope: 'variant-state',
          target: { variant: 'bold', state: 'hover' },
          channel: 'stroke',
          valueKind: 'none',
        },
        {
          componentName: 'button',
          tokenName: 'cssDecorationColor.bold-hover',
          value: 'transparent',
          scope: 'variant-state',
          target: { variant: 'bold', state: 'hover' },
          channel: 'stroke',
          valueKind: 'none',
        },
      ],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-cssDecorationInsetStrokeWidth-bold-hover: var(--Spacing-0);');
    expect(buttonBlock).toContain('--Button-cssDecorationUnderlineWidth-bold-hover: var(--Spacing-0);');
    expect(buttonBlock).toContain('--Button-cssDecorationColor-bold-hover: transparent;');
  });

  describe('Tira retail capsule coercion (shape decision wins)', () => {
    const rootBlockOf = (css: string) => css.match(/:root\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    it('forces pill radii for Tira when no explicit shape decision', () => {
      const css = buildAllComponentCSS(
        { componentThemeSelections: [], recipeSelections: [], tokenOverrides: [] },
        { brandSlug: 'tira', brandName: 'Tira' }
      );
      const root = rootBlockOf(css);
      expect(root).toContain('--Button-borderRadius: var(--Shape-Pill);');
      expect(root).toContain('--IconButton-borderRadius: var(--Shape-Pill);');
    });

    it('respects an explicit Actions shape decision over the capsule default', () => {
      const css = buildAllComponentCSS(
        {
          componentThemeSelections: [
            { familyId: 'actions', selections: { shapeLanguage: 'sharp' } },
          ],
          recipeSelections: [],
          tokenOverrides: [],
        },
        { brandSlug: 'tira', brandName: 'Tira' }
      );
      const root = rootBlockOf(css);
      // 'sharp' → Shape-0; the capsule coercion must NOT overwrite it.
      expect(root).toContain('--Button-borderRadius: var(--Shape-0);');
      expect(root).not.toContain('--Button-borderRadius: var(--Shape-Pill);');
    });

    it('still forces pill over a legacy MANUAL radius (stale data must not defeat the capsule)', () => {
      // Tira historically persisted stale non-pill radii as manual token
      // overrides — the exact data the coercion exists to override. A manual
      // override must NOT count as a genuine shape decision, or the capsule is
      // silently defeated by legacy data.
      const css = buildAllComponentCSS(
        {
          componentThemeSelections: [],
          recipeSelections: [],
          tokenOverrides: [{ componentName: 'button', tokenName: 'borderRadius', value: 'Shape-2' }],
        },
        { brandSlug: 'tira', brandName: 'Tira' }
      );
      const root = rootBlockOf(css);
      expect(root).toContain('--Button-borderRadius: var(--Shape-Pill);');
      expect(root).not.toContain('--Button-borderRadius: var(--Shape-2);');
    });

    it('respects a recipe shape decision over the capsule default', () => {
      const css = buildAllComponentCSS(
        {
          componentThemeSelections: [],
          recipeSelections: [{ componentName: 'button', selections: { cornerRadius: 'none' } }],
          tokenOverrides: [],
        },
        { brandSlug: 'tira', brandName: 'Tira' }
      );
      const root = rootBlockOf(css);
      // 'none' → Shape-0; a recipe shape decision defeats the capsule default.
      expect(root).toContain('--Button-borderRadius: var(--Shape-0);');
      expect(root).not.toContain('--Button-borderRadius: var(--Shape-Pill);');
    });

    it('applies a sharp shape decision for non-Tira brands (baseline, no coercion)', () => {
      const css = buildAllComponentCSS(
        {
          componentThemeSelections: [
            { familyId: 'actions', selections: { shapeLanguage: 'sharp' } },
          ],
          recipeSelections: [],
          tokenOverrides: [],
        },
        { brandSlug: 'jio-default', brandName: 'Jio' }
      );
      const root = rootBlockOf(css);
      expect(root).toContain('--Button-borderRadius: var(--Shape-0);');
    });
  });
});
