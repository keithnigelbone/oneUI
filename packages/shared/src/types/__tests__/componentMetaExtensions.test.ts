import { describe, expect, test } from 'vitest';
import {
  COMPONENT_TOKEN_COLOR_ROLES,
  COMPONENT_TOKEN_SURFACE_MODES,
  SDK_IDS,
  type ComponentMeta,
  type ComponentDeprecationInfo,
  type ComponentFigmaMapping,
  type ComponentPlatformsMatrix,
  type ComponentTokenConsumption,
  type ForbiddenPatternsMap,
} from '../../index';

describe('B3 — ComponentMeta extension fields are all optional + additive', () => {
  test('an existing-shape ComponentMeta with NONE of the new fields still type-checks', () => {
    const m: ComponentMeta = {
      name: 'Legacy',
      slug: 'legacy',
      displayName: 'Legacy',
      description: 'no new fields populated',
      category: 'display',
      props: [],
      slots: [],
      previewMatrix: { variants: [], variantLabels: {} },
      surfaceAware: false,
      multiAccent: false,
    };
    expect(m.figma).toBeUndefined();
    expect(m.platforms).toBeUndefined();
    expect(m.tokens).toBeUndefined();
    expect(m.forbiddenPatterns).toBeUndefined();
    expect(m.deprecation).toBeUndefined();
    expect(m.schemaVersion).toBeUndefined();
  });

  test('a ComponentMeta with EVERY new field populated type-checks', () => {
    const figma: ComponentFigmaMapping = {
      componentKey: 'jds-button-v4',
      variantProperties: { Variant: 'Bold' },
      keyHistory: [],
    };
    const platforms: ComponentPlatformsMatrix = {
      web: { status: 'stable' },
      rn: { status: 'beta' },
    };
    const tokens: ComponentTokenConsumption = {
      color: ['primary', 'secondary'],
      surface: ['bold', 'subtle', 'ghost'],
      typography: ['label.M', 'label.L'],
      spacing: ['XS', 'S', 'M'],
      shape: ['pill'],
      motion: ['motion.duration.discreet.short'],
      elevation: [0, 1],
    };
    const forbiddenPatterns: ForbiddenPatternsMap = {
      backgroundColor: {
        regexps: ['^#', '^rgba?\\(', '^oklch\\('],
        suggestion: 'Use appearance + variant + Surface mode instead.',
        severity: 'error',
      },
    };
    const deprecation: ComponentDeprecationInfo = {
      since: '5.0.0',
      useInstead: 'CTAButton',
      migrationNote: 'CTAButton splits action + link semantics.',
      autoMigrationCodemod: './codemods/button-to-cta.ts',
      codemodTestFixture: './codemods/__fixtures__/button-to-cta/',
    };
    const m: ComponentMeta = {
      name: 'Button',
      slug: 'button',
      displayName: 'Button',
      description: 'Full extension set',
      category: 'actions',
      props: [],
      slots: [],
      previewMatrix: { variants: ['bold', 'subtle', 'ghost'], variantLabels: { bold: 'Bold', subtle: 'Subtle', ghost: 'Ghost' } },
      surfaceAware: true,
      multiAccent: true,
      schemaVersion: '5.0.0',
      platforms,
      figma,
      tokens,
      forbiddenPatterns,
      deprecation,
    };
    expect(m.platforms!.web?.status).toBe('stable');
    expect(m.figma!.keyHistory).toEqual([]);
    expect(m.tokens!.surface).toContain('bold');
    expect(m.forbiddenPatterns!.backgroundColor!.severity).toBe('error');
    expect(m.deprecation!.useInstead).toBe('CTAButton');
    expect(m.schemaVersion).toBe('5.0.0');
  });
});

describe('B3 — vocabulary constants', () => {
  test('SDK_IDS = 5 SDKs', () => {
    expect(SDK_IDS).toEqual(['web', 'rn', 'ios', 'android', 'flutter']);
  });
  test('11 color roles', () => {
    expect(COMPONENT_TOKEN_COLOR_ROLES).toHaveLength(11);
    expect(COMPONENT_TOKEN_COLOR_ROLES).toContain('sparkle');
    expect(COMPONENT_TOKEN_COLOR_ROLES).toContain('brand-bg');
  });
  test('7 surface modes', () => {
    expect(COMPONENT_TOKEN_SURFACE_MODES).toHaveLength(7);
    expect(COMPONENT_TOKEN_SURFACE_MODES).toContain('ghost');
    expect(COMPONENT_TOKEN_SURFACE_MODES).toContain('elevated');
  });
});
