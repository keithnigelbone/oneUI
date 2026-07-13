// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildAllComponentCSS } from './buildComponentOverrideCSS';

const mk = (tokenName: string, value: string, variant: string, state: string | undefined, channel: string) => ({
  componentName: 'Button',
  tokenName: state ? `${tokenName}.${variant}-${state}` : `${tokenName}.${variant}`,
  value,
  scope: state ? 'variant-state' : 'variant',
  target: { variant, state },
  channel,
  valueKind: value.startsWith('Material-') ? 'material' : 'token',
});

describe('Reliance button overrides — semantic-preserving paint rewrite', () => {
  it('keeps TintedA11y text dark-accent when hover fill is a light surface', () => {
    const css = buildAllComponentCSS({
      recipeSelections: [],
      tokenOverrides: [
        mk('backgroundColor', 'Primary-Minimal', 'bold', 'hover', 'fill'),
        mk('textColor', 'Primary-TintedA11y', 'bold', 'hover', 'text'),
        mk('textColor', 'Primary-Bold-TintedA11y', 'bold', undefined, 'text'),
      ],
    });
    // Text picked as TintedA11y must stay the accent intermediate, NOT on-bold high
    expect(css).toContain('--Button-textColor-bold-hover: var(--_btn-default-accent-a11y);');
    // Rest-state on-bold text still maps to the on-bold intermediate
    expect(css).toContain('--Button-textColor-bold: var(--_btn-bold-high);');
    // Minimal has no intermediate → raw role token, element-scoped (context-aware)
    expect(css).toContain('--Button-backgroundColor-bold-hover: var(--Primary-Minimal);');
  });

  it('emits material stroke tokens raw and scoped to the Button element', () => {
    const css = buildAllComponentCSS({
      recipeSelections: [],
      tokenOverrides: [
        mk('borderColor', 'Material-Metallic-Gold-StrokeColor', 'bold', 'hover', 'stroke'),
        mk('borderColor', 'Primary-Stroke-Medium', 'subtle', undefined, 'stroke'),
        mk('borderColor', 'Primary-High', 'ghost', undefined, 'stroke'),
      ],
    });
    expect(css).toContain('[data-oneui-component="Button"]');
    expect(css).toContain('--Button-borderColor-bold-hover: var(--Material-Metallic-Gold-StrokeColor);');
    // Stroke-Medium has no intermediate → raw role token
    expect(css).toContain('--Button-borderColor-subtle: var(--Primary-Stroke-Medium);');
    // High-intensity stroke maps to the appearance-relative high intermediate
    expect(css).toContain('--Button-borderColor-ghost: var(--_btn-default-high);');
  });
});
