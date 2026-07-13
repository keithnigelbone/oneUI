import { describe, expect, it } from 'vitest';
import { precomputeBrandCSSNew, type PrecomputeInput } from '../precompute';

function buildInput(): PrecomputeInput {
  return {
    colorConfig: {
      brandScales: [
        { name: 'Brand', source: 'custom', baseColor: '#e83220' },
      ],
    },
    presetSelection: null,
    appearanceConfig: {
      accentCount: 1,
      background: {
        scaleName: 'Neutral',
        backgroundStep: {
          light: 2500,
          dark: 100,
        },
      },
      accents: [
        {
          role: 'primary',
          label: 'Primary',
          scaleName: 'Brand',
          baseStep: 1600,
        },
      ],
      materials: {
        materialAssignments: {
          primary: 'gold',
        },
      },
    },
    typographyConfig: null,
    materialConfig: {
      activeMetals: {
        bronze: false,
        silver: false,
        gold: true,
        custom: false,
      },
      metallic: {
        gold: {
          shadow: '#111111',
          baseDark: '#222222',
          base: '#333333',
          baseLight: '#444444',
          highlight: '#555555',
        },
      },
    },
  };
}

describe('precomputeBrandCSSNew', () => {
  it('includes the same surface auxiliary blocks needed by runtime injection', () => {
    const result = precomputeBrandCSSNew(buildInput(), 'light');

    expect(result.isValid).toBe(true);
    expect(result.rawCSS).toContain('--Primary-Bold');
    expect(result.rawCSS).toContain('--Material-Metallic-Gold-Fill');
    expect(result.rawCSS).toContain('--Primary-Material-Fill: var(--Material-Metallic-Gold-Fill);');
    expect(result.rawCSS).not.toContain('--Material-Metallic-Silver-Fill');
    expect(result.contextCSS).toContain('[data-surface="bold"]');
    expect(result.contextCSS).toContain('[data-surface-step=');
    expect(result.contextCSS).toContain('[data-surface][data-appearance="primary"]');
    expect(result.contextCSS).toContain('[data-context-boundary]');
    expect(result.contextCSS).toContain('[data-material="transparent"]');
  });

  it('includes material config in the input hash', () => {
    const input = buildInput();
    const changed = {
      ...input,
      materialConfig: {
        metallic: {
          gold: {
            shadow: '#999999',
            baseDark: '#222222',
            base: '#333333',
            baseLight: '#444444',
            highlight: '#555555',
          },
        },
      },
    } satisfies PrecomputeInput;

    expect(precomputeBrandCSSNew(input, 'light').inputHash).not.toBe(
      precomputeBrandCSSNew(changed, 'light').inputHash,
    );
  });
});
