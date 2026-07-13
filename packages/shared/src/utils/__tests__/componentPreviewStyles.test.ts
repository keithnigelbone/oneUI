import { describe, expect, it } from 'vitest';
import {
  buildComponentPreviewStyles,
  mergeComponentPreviewOverrides,
} from '../componentPreviewStyles';
import type { ComponentTokenManifest } from '../../types/componentTokens';

const manifestTokens: ComponentTokenManifest['tokens'] = {
  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-2',
    sizes: {
      '8': 'Shape-2',
      '10': 'Shape-2',
      '12': 'Shape-3',
    },
    description: 'Radius',
    cssProperty: 'border-radius',
  },
};

describe('mergeComponentPreviewOverrides', () => {
  it('fans out base overrides over manifest size defaults', () => {
    const merged = mergeComponentPreviewOverrides(
      manifestTokens,
      new Map([['borderRadius', { selectedToken: 'Shape-0' }]])
    );
    const styles = buildComponentPreviewStyles('Input', merged, manifestTokens);

    expect(styles['--Input-borderRadius']).toBe('var(--Shape-0)');
    expect(styles['--Input-borderRadius-8']).toBe('var(--Shape-0)');
    expect(styles['--Input-borderRadius-10']).toBe('var(--Shape-0)');
    expect(styles['--Input-borderRadius-12']).toBe('var(--Shape-0)');
  });

  it('fans a base override out to state variables so hover/pressed inherit it', () => {
    // A base borderWidth override must reach --Button-borderWidth-bold-hover etc.,
    // otherwise the saved brand CSS per-state default (0px) wins on hover/pressed
    // and an applied stroke is invisible on those states.
    const strokeManifest: ComponentTokenManifest['tokens'] = {
      borderWidth: {
        category: 'stroke',
        defaultToken: '0px',
        variants: { bold: '0px', subtle: '0px', ghost: '0px' },
        states: {
          hover: { bold: '0px', subtle: '0px', ghost: '0px' },
          pressed: { bold: '0px', subtle: '0px', ghost: '0px' },
        },
        description: 'Border width',
        cssProperty: 'border-width',
      },
    };
    const merged = mergeComponentPreviewOverrides(
      strokeManifest,
      new Map([['borderWidth', { selectedToken: 'Stroke-L' }]])
    );
    const styles = buildComponentPreviewStyles('Button', merged, strokeManifest);

    expect(styles['--Button-borderWidth']).toBe('var(--Stroke-L)');
    expect(styles['--Button-borderWidth-bold']).toBe('var(--Stroke-L)');
    expect(styles['--Button-borderWidth-bold-hover']).toBe('var(--Stroke-L)');
    expect(styles['--Button-borderWidth-ghost-pressed']).toBe('var(--Stroke-L)');
  });

  it('keeps explicit modifier overrides above a base fan-out', () => {
    const merged = mergeComponentPreviewOverrides(
      manifestTokens,
      new Map([
        ['borderRadius', { selectedToken: 'Shape-0' }],
        ['borderRadius.10', { selectedToken: 'Shape-Pill' }],
      ])
    );
    const styles = buildComponentPreviewStyles('Input', merged, manifestTokens);

    expect(styles['--Input-borderRadius-8']).toBe('var(--Shape-0)');
    expect(styles['--Input-borderRadius-10']).toBe('var(--Shape-Pill)');
  });

  it('emits variant-state modifier variables for outline action states', () => {
    const styles = buildComponentPreviewStyles(
      'Button',
      new Map([
        ['backgroundColor.bold-hover', { selectedToken: 'transparent' }],
        ['backgroundColor.bold-pressed', { selectedToken: 'transparent' }],
      ]),
      {
        backgroundColor: {
          category: 'color',
          defaultToken: 'Primary-Bold',
          description: 'Background',
          cssProperty: 'background-color',
        },
      }
    );

    expect(styles['--Button-backgroundColor-bold-hover']).toBe('transparent');
    expect(styles['--Button-backgroundColor-bold-pressed']).toBe('transparent');
  });

  it('emits material token references for state-scoped image channels', () => {
    const styles = buildComponentPreviewStyles(
      'Button',
      new Map([
        ['strokeImage.bold-hover', { selectedToken: 'Material-Metallic-Gold-Stroke' }],
        ['backgroundColor.bold-hover', { selectedToken: 'Material-Metallic-Gold-Fill' }],
      ]),
      {
        strokeImage: {
          category: 'decoration',
          defaultToken: 'none',
          description: 'Stroke image',
          cssProperty: 'background-image',
        },
        backgroundColor: {
          category: 'color',
          defaultToken: 'Primary-Bold',
          description: 'Background',
          cssProperty: 'background',
        },
      }
    );

    expect(styles['--Button-strokeImage-bold-hover']).toBe('var(--Material-Metallic-Gold-Stroke)');
    expect(styles['--Button-solidStrokeColor-bold-hover']).toBe('transparent');
    expect(styles['--Button-cssDecorationInsetStrokeWidth-bold-hover']).toBe('var(--Spacing-0)');
    expect(styles['--Button-cssDecorationUnderlineWidth-bold-hover']).toBe('var(--Spacing-0)');
    expect(styles['--Button-cssDecorationColor-bold-hover']).toBe('transparent');
    expect(styles['--Button-backgroundColor-bold-hover']).toBe('var(--Material-Metallic-Gold-Fill)');
  });
});
