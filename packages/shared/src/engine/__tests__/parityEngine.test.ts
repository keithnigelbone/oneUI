/**
 * parityEngine.test.ts
 *
 * Tests for the Figma <-> OneUI Token Parity Engine.
 */

import { describe, it, expect } from 'vitest';
import type { FigmaVariable, FigmaVariableCollection } from '../../types/figma';
import type { ComponentTokenManifest } from '../../types/componentTokens';
import {
  inferCSSTokenName,
  buildMappingTable,
  compareTokenValues,
  checkComponentParity,
  summarizeParity,
  buildSpacingParityMatrix,
} from '../parityEngine';
import type { ParityEntry, ParityMapping } from '../parityEngine';

// ============================================================================
// Test helpers — mock data factories
// ============================================================================

function makeFigmaVar(overrides: Partial<FigmaVariable> & { name: string }): FigmaVariable {
  return {
    id: `var-${overrides.name}`,
    key: `key-${overrides.name}`,
    variableCollectionId: 'col-1',
    resolvedType: 'FLOAT',
    valuesByMode: {},
    hiddenFromPublishing: false,
    scopes: [],
    ...overrides,
  };
}

function makeCollection(overrides: Partial<FigmaVariableCollection> & { id: string; name: string }): FigmaVariableCollection {
  return {
    key: `key-${overrides.id}`,
    modes: [{ modeId: 'mode-1', name: 'Default' }],
    defaultModeId: 'mode-1',
    remote: false,
    hiddenFromPublishing: false,
    variableIds: [],
    ...overrides,
  };
}

// ============================================================================
// inferCSSTokenName
// ============================================================================

describe('inferCSSTokenName', () => {
  it('resolves from codeSyntax.WEB with -- prefix', () => {
    const figmaVar = makeFigmaVar({
      name: 'spacing/xl',
      codeSyntax: { WEB: '--Spacing-5' },
    });
    expect(inferCSSTokenName(figmaVar)).toBe('Spacing-5');
  });

  it('resolves from codeSyntax.WEB with var() wrapper', () => {
    const figmaVar = makeFigmaVar({
      name: 'spacing/xl',
      codeSyntax: { WEB: 'var(--Spacing-5)' },
    });
    expect(inferCSSTokenName(figmaVar)).toBe('Spacing-5');
  });

  it('resolves from codeSyntax.WEB without -- prefix', () => {
    const figmaVar = makeFigmaVar({
      name: 'spacing/xl',
      codeSyntax: { WEB: 'Spacing-5' },
    });
    expect(inferCSSTokenName(figmaVar)).toBe('Spacing-5');
  });

  it('convention-based: spacing/xl -> Spacing-5', () => {
    const figmaVar = makeFigmaVar({ name: 'spacing/xl' });
    expect(inferCSSTokenName(figmaVar)).toBe('Spacing-5');
  });

  it('convention-based: color/primary/fg-bold -> Color-Primary-FG-Bold', () => {
    const figmaVar = makeFigmaVar({ name: 'color/primary/fg-bold' });
    expect(inferCSSTokenName(figmaVar)).toBe('Color-Primary-FG-Bold');
  });

  it('convention-based: button/padding-horizontal/10 -> Button-paddingHorizontal-10', () => {
    const figmaVar = makeFigmaVar({ name: 'button/padding-horizontal/10' });
    expect(inferCSSTokenName(figmaVar)).toBe('Button-paddingHorizontal-10');
  });

  it('convention-based: button/border-radius -> Button-borderRadius', () => {
    const figmaVar = makeFigmaVar({ name: 'button/border-radius' });
    expect(inferCSSTokenName(figmaVar)).toBe('Button-borderRadius');
  });

  it('convention-based: single segment', () => {
    const figmaVar = makeFigmaVar({ name: 'spacing' });
    expect(inferCSSTokenName(figmaVar)).toBe('Spacing');
  });

  it('returns null for empty name', () => {
    const figmaVar = makeFigmaVar({ name: '' });
    expect(inferCSSTokenName(figmaVar)).toBeNull();
  });

  it('returns null for whitespace-only name', () => {
    const figmaVar = makeFigmaVar({ name: '   ' });
    expect(inferCSSTokenName(figmaVar)).toBeNull();
  });

  it('codeSyntax.WEB takes precedence over convention', () => {
    const figmaVar = makeFigmaVar({
      name: 'some/random/path',
      codeSyntax: { WEB: '--My-Custom-Token' },
    });
    expect(inferCSSTokenName(figmaVar)).toBe('My-Custom-Token');
  });

  it('convention-based: multi-hyphen segments capitalize each part', () => {
    const figmaVar = makeFigmaVar({ name: 'surface/bg-subtle' });
    expect(inferCSSTokenName(figmaVar)).toBe('Surface-BG-Subtle');
  });
});

// ============================================================================
// buildMappingTable
// ============================================================================

describe('buildMappingTable', () => {
  const spacingCollection = makeCollection({
    id: 'col-spacing',
    name: 'Spacing',
  });

  const colorCollection = makeCollection({
    id: 'col-colors',
    name: 'Colors',
  });

  it('maps variables using codeSyntax.WEB', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({
        name: 'spacing/xl',
        variableCollectionId: 'col-spacing',
        codeSyntax: { WEB: '--Spacing-5' },
      }),
    ];

    const result = buildMappingTable(vars, [spacingCollection]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({
      figmaVariableName: 'spacing/xl',
      cssTokenName: 'Spacing-5',
      category: 'spacing',
      mappingSource: 'codeSyntax',
    }));
  });

  it('maps variables using convention-based inference', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({
        name: 'spacing/m',
        variableCollectionId: 'col-spacing',
      }),
    ];

    const result = buildMappingTable(vars, [spacingCollection]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({
      figmaVariableName: 'spacing/m',
      cssTokenName: 'Spacing-4',
      category: 'spacing',
      mappingSource: 'auto',
    }));
  });

  it('applies manual mappings with highest priority', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({
        name: 'my-custom-var',
        variableCollectionId: 'col-spacing',
        codeSyntax: { WEB: '--Wrong-Token' },
      }),
    ];

    const manualMappings = { 'my-custom-var': 'Correct-Token' };
    const result = buildMappingTable(vars, [spacingCollection], manualMappings);
    expect(result).toHaveLength(1);
    expect(result[0].cssTokenName).toBe('Correct-Token');
    expect(result[0].mappingSource).toBe('manual');
  });

  it('infers category from collection name', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({
        name: 'primary/fg-bold',
        variableCollectionId: 'col-colors',
      }),
    ];

    const result = buildMappingTable(vars, [colorCollection]);
    expect(result[0].category).toBe('color');
  });

  it('infers category from scopes when collection unknown', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({
        name: 'some/fill',
        variableCollectionId: 'unknown-col',
        scopes: ['ALL_FILLS'],
      }),
    ];

    const result = buildMappingTable(vars, []);
    expect(result[0].category).toBe('color');
  });

  it('handles multiple variables in one call', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({ name: 'spacing/xs', variableCollectionId: 'col-spacing' }),
      makeFigmaVar({ name: 'spacing/m', variableCollectionId: 'col-spacing' }),
      makeFigmaVar({ name: 'primary/default', variableCollectionId: 'col-colors' }),
    ];

    const result = buildMappingTable(vars, [spacingCollection, colorCollection]);
    expect(result).toHaveLength(3);
  });

  it('skips variables with empty names', () => {
    const vars: FigmaVariable[] = [
      makeFigmaVar({ name: '', variableCollectionId: 'col-spacing' }),
    ];
    const result = buildMappingTable(vars, [spacingCollection]);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// compareTokenValues
// ============================================================================

describe('compareTokenValues', () => {
  describe('spacing comparison', () => {
    it('matches exact pixel values', () => {
      const resolved = { 'Spacing-4': '16px' };
      expect(compareTokenValues('16px', 'Spacing-4', resolved, 'spacing')).toBe('matched');
    });

    it('matches values without px suffix', () => {
      const resolved = { 'Spacing-4': '16px' };
      expect(compareTokenValues('16', 'Spacing-4', resolved, 'spacing')).toBe('matched');
    });

    it('matches within 1px tolerance', () => {
      const resolved = { 'Spacing-4': '16px' };
      expect(compareTokenValues('17px', 'Spacing-4', resolved, 'spacing')).toBe('matched');
      expect(compareTokenValues('15px', 'Spacing-4', resolved, 'spacing')).toBe('matched');
    });

    it('reports mismatch beyond 1px tolerance', () => {
      const resolved = { 'Spacing-4': '16px' };
      expect(compareTokenValues('18px', 'Spacing-4', resolved, 'spacing')).toBe('mismatched');
      expect(compareTokenValues('14px', 'Spacing-4', resolved, 'spacing')).toBe('mismatched');
    });

    it('reports mismatch for unresolved token', () => {
      expect(compareTokenValues('16px', 'Unknown-Token', {}, 'spacing')).toBe('mismatched');
    });
  });

  describe('color comparison', () => {
    it('matches identical hex colors', () => {
      const resolved = { 'Primary-FG-Bold': '#ff5500' };
      expect(compareTokenValues('#ff5500', 'Primary-FG-Bold', resolved, 'color')).toBe('matched');
    });

    it('matches hex colors case-insensitively', () => {
      const resolved = { 'Primary-FG-Bold': '#FF5500' };
      expect(compareTokenValues('#ff5500', 'Primary-FG-Bold', resolved, 'color')).toBe('matched');
    });

    it('expands shorthand hex and matches', () => {
      const resolved = { 'Primary-FG-Bold': '#ff5500' };
      expect(compareTokenValues('#f50', 'Primary-FG-Bold', resolved, 'color')).toBe('matched');
    });

    it('reports mismatch for different hex colors', () => {
      const resolved = { 'Primary-FG-Bold': '#ff5500' };
      expect(compareTokenValues('#00ff00', 'Primary-FG-Bold', resolved, 'color')).toBe('mismatched');
    });

    it('matches oklch values with rounding', () => {
      const resolved = { 'MyToken': 'oklch(0.65432 0.12345 250.123)' };
      // Same when rounded to 4 decimal places
      expect(compareTokenValues(
        'oklch(0.65432 0.12345 250.123)',
        'MyToken',
        resolved,
        'color'
      )).toBe('matched');
    });
  });

  describe('generic comparison', () => {
    it('matches identical string values', () => {
      const resolved = { 'Font-Primary': 'Inter' };
      expect(compareTokenValues('Inter', 'Font-Primary', resolved, 'typography')).toBe('matched');
    });

    it('matches case-insensitively', () => {
      const resolved = { 'Font-Primary': 'Inter' };
      expect(compareTokenValues('inter', 'Font-Primary', resolved, 'typography')).toBe('matched');
    });

    it('trims whitespace', () => {
      const resolved = { 'Font-Primary': 'Inter' };
      expect(compareTokenValues('  Inter  ', 'Font-Primary', resolved, 'typography')).toBe('matched');
    });
  });
});

// ============================================================================
// checkComponentParity
// ============================================================================

describe('checkComponentParity', () => {
  const buttonManifest: ComponentTokenManifest = {
    componentName: 'Button',
    version: '1.0',
    tokens: {
      paddingHorizontal: {
        category: 'spacing',
        defaultToken: 'Spacing-5',
        sizes: {
          '6': 'Spacing-2-5',
          '10': 'Spacing-5',
        },
      },
      backgroundColor: {
        category: 'color',
        defaultToken: 'Primary-FG-Bold',
      },
      borderRadius: {
        category: 'shape',
        defaultToken: 'Shape-Pill',
      },
    },
    totalTokens: 3,
    categories: { spacing: 1, color: 1, shape: 1 },
  };

  const resolvedValues: Record<string, string> = {
    'Spacing-2-5': '4px',
    'Spacing-5': '24px',
    'Primary-FG-Bold': '#ff5500',
    'Shape-Pill': '9999px',
    'button/padding-horizontal/6': '4px',
    'button/padding-horizontal/10': '24px',
    'button/background-color': '#ff5500',
  };

  it('creates entries for sized tokens', () => {
    const mappings: ParityMapping[] = [
      {
        figmaVariableName: 'button/padding-horizontal/6',
        cssTokenName: 'Button-paddingHorizontal-6',
        category: 'spacing',
        mappingSource: 'auto',
      },
      {
        figmaVariableName: 'button/padding-horizontal/10',
        cssTokenName: 'Button-paddingHorizontal-10',
        category: 'spacing',
        mappingSource: 'auto',
      },
    ];

    const entries = checkComponentParity(buttonManifest, mappings, resolvedValues);
    const paddingEntries = entries.filter((e) => e.tokenProperty === 'paddingHorizontal');
    expect(paddingEntries).toHaveLength(2);
    expect(paddingEntries.every((e) => e.status === 'matched')).toBe(true);
  });

  it('marks tokens missing in Figma when no mapping found', () => {
    const entries = checkComponentParity(buttonManifest, [], resolvedValues);
    expect(entries.length).toBeGreaterThan(0);
    const missingEntries = entries.filter((e) => e.status === 'missing-in-figma');
    expect(missingEntries.length).toBeGreaterThan(0);
  });

  it('marks Figma-only tokens as missing-in-tool', () => {
    const mappings: ParityMapping[] = [
      {
        figmaVariableName: 'button/extra-prop',
        cssTokenName: 'Button-extraProp',
        componentName: 'Button',
        category: 'spacing',
        mappingSource: 'auto',
      },
    ];

    const entries = checkComponentParity(buttonManifest, mappings, resolvedValues);
    const missingInTool = entries.filter((e) => e.status === 'missing-in-tool');
    expect(missingInTool).toHaveLength(1);
    expect(missingInTool[0].tokenProperty).toBe('extraProp');
  });

  it('handles non-sized tokens', () => {
    const mappings: ParityMapping[] = [
      {
        figmaVariableName: 'button/background-color',
        cssTokenName: 'Button-backgroundColor',
        category: 'color',
        mappingSource: 'auto',
      },
    ];

    const entries = checkComponentParity(buttonManifest, mappings, resolvedValues);
    const bgEntry = entries.find((e) => e.tokenProperty === 'backgroundColor');
    expect(bgEntry).toBeDefined();
    expect(bgEntry!.status).toBe('matched');
    expect(bgEntry!.figmaValue).toBe('#ff5500');
  });
});

// ============================================================================
// summarizeParity
// ============================================================================

describe('summarizeParity', () => {
  it('counts entries by status', () => {
    const entries: ParityEntry[] = [
      { category: 'spacing', status: 'matched', tokenProperty: 'a' },
      { category: 'spacing', status: 'matched', tokenProperty: 'b' },
      { category: 'color', status: 'mismatched', tokenProperty: 'c' },
      { category: 'spacing', status: 'missing-in-figma', tokenProperty: 'd' },
      { category: 'spacing', status: 'missing-in-tool', tokenProperty: 'e' },
      { category: 'spacing', status: 'unmapped', tokenProperty: 'f' },
    ];

    const summary = summarizeParity(entries);
    expect(summary).toEqual({
      matched: 2,
      mismatched: 1,
      missingInFigma: 1,
      missingInTool: 1,
      unmapped: 1,
      total: 6,
    });
  });

  it('handles empty entries', () => {
    const summary = summarizeParity([]);
    expect(summary).toEqual({
      matched: 0,
      mismatched: 0,
      missingInFigma: 0,
      missingInTool: 0,
      unmapped: 0,
      total: 0,
    });
  });

  it('handles all-matched entries', () => {
    const entries: ParityEntry[] = [
      { category: 'spacing', status: 'matched' },
      { category: 'spacing', status: 'matched' },
      { category: 'spacing', status: 'matched' },
    ];

    const summary = summarizeParity(entries);
    expect(summary.matched).toBe(3);
    expect(summary.total).toBe(3);
    expect(summary.mismatched).toBe(0);
  });
});

// ============================================================================
// buildSpacingParityMatrix
// ============================================================================

describe('buildSpacingParityMatrix', () => {
  it('builds a matrix from spacing entries with sizes', () => {
    const entries: ParityEntry[] = [
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'paddingHorizontal',
        size: '6',
        figmaValue: '4px',
        toolValue: '4px',
      },
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'paddingHorizontal',
        size: '10',
        figmaValue: '24px',
        toolValue: '24px',
      },
      {
        category: 'spacing',
        status: 'mismatched',
        tokenProperty: 'paddingVertical',
        size: '6',
        figmaValue: '2px',
        toolValue: '4px',
      },
    ];

    const matrix = buildSpacingParityMatrix(entries);
    expect(matrix.rows).toHaveLength(2);

    const padHRow = matrix.rows.find((r) => r.tokenProperty === 'paddingHorizontal');
    expect(padHRow).toBeDefined();
    expect(padHRow!.slot).toBeNull();
    expect(Object.keys(padHRow!.sizes)).toEqual(['6', '10']);
    expect(padHRow!.sizes['6'].figmaValue).toBe('4px');
    expect(padHRow!.sizes['6'].status).toBe('matched');
    expect(padHRow!.sizes['10'].toolValue).toBe('24px');

    const padVRow = matrix.rows.find((r) => r.tokenProperty === 'paddingVertical');
    expect(padVRow).toBeDefined();
    expect(padVRow!.sizes['6'].status).toBe('mismatched');
  });

  it('groups by slot when present', () => {
    const entries: ParityEntry[] = [
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'iconGap',
        slot: 'start',
        size: '10',
        figmaValue: '8px',
        toolValue: '8px',
      },
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'iconGap',
        slot: 'end',
        size: '10',
        figmaValue: '8px',
        toolValue: '8px',
      },
    ];

    const matrix = buildSpacingParityMatrix(entries);
    expect(matrix.rows).toHaveLength(2);
    expect(matrix.rows.map((r) => r.slot).sort()).toEqual(['end', 'start']);
  });

  it('filters out non-spacing entries', () => {
    const entries: ParityEntry[] = [
      {
        category: 'color',
        status: 'matched',
        tokenProperty: 'backgroundColor',
        figmaValue: '#ff0000',
        toolValue: '#ff0000',
      },
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'gap',
        size: '10',
        figmaValue: '8px',
        toolValue: '8px',
      },
    ];

    const matrix = buildSpacingParityMatrix(entries);
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].tokenProperty).toBe('gap');
  });

  it('returns empty matrix for no spacing entries', () => {
    const entries: ParityEntry[] = [
      { category: 'color', status: 'matched', tokenProperty: 'bg' },
    ];
    const matrix = buildSpacingParityMatrix(entries);
    expect(matrix.rows).toHaveLength(0);
  });

  it('handles entries without size using "default" key', () => {
    const entries: ParityEntry[] = [
      {
        category: 'spacing',
        status: 'matched',
        tokenProperty: 'gap',
        figmaValue: '16px',
        toolValue: '16px',
      },
    ];

    const matrix = buildSpacingParityMatrix(entries);
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].sizes['default']).toBeDefined();
    expect(matrix.rows[0].sizes['default'].figmaValue).toBe('16px');
  });
});
