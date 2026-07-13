import { describe, expect, it } from 'vitest';
import {
  getComponentThemeFamily,
  validateAttentionHierarchy,
  COMPONENT_THEME_FAMILIES,
} from '../../componentThemes';
import { resolveComponentThemeToOverrides, themeParamKey } from '../recipeResolver';
import { SPACING_LADDER, shiftSpacingToken, parseRampOffset } from '../spacingLadder';
import type { ComponentThemeTokenOverride } from '../../types/componentRecipes';

const actions = getComponentThemeFamily('actions')!;
const selection = getComponentThemeFamily('selection')!;
const navigation = getComponentThemeFamily('navigation')!;
const inputs = getComponentThemeFamily('inputs')!;
const cards = getComponentThemeFamily('cards')!;

function forComponent(overrides: ComponentThemeTokenOverride[], componentName: string) {
  return overrides.filter((override) => override.componentName === componentName);
}

function tokenMap(overrides: ComponentThemeTokenOverride[]) {
  return new Map(overrides.map((override) => [override.tokenName, override.value]));
}

describe('spacingLadder', () => {
  it('shifts along the ladder and clamps at the ends', () => {
    expect(shiftSpacingToken('Spacing-3', 1)).toBe('Spacing-3-5');
    expect(shiftSpacingToken('Spacing-3', -2)).toBe('Spacing-2');
    expect(shiftSpacingToken('Spacing-0', -3)).toBe('Spacing-0');
    expect(shiftSpacingToken('Spacing-40', 5)).toBe('Spacing-40');
  });

  it('returns unknown tokens unchanged', () => {
    expect(shiftSpacingToken('Spacing-Margin', 1)).toBe('Spacing-Margin');
    expect(shiftSpacingToken('not-a-token', 2)).toBe('not-a-token');
  });

  it('parses persisted ramp offsets defensively', () => {
    expect(parseRampOffset('-1')).toBe(-1);
    expect(parseRampOffset('2')).toBe(2);
    expect(parseRampOffset(undefined)).toBe(0);
    expect(parseRampOffset('')).toBe(0);
    expect(parseRampOffset('abc')).toBe(0);
  });

  it('keeps the ladder strictly ordered and half-step aware', () => {
    expect(SPACING_LADDER.indexOf('Spacing-3-5')).toBe(SPACING_LADDER.indexOf('Spacing-3') + 1);
  });
});

describe('family defaults are inert', () => {
  it('emits zero overrides for every family with empty selections', () => {
    for (const family of COMPONENT_THEME_FAMILIES) {
      const overrides = resolveComponentThemeToOverrides(family, {});
      expect(overrides, `family ${family.id} must be inert by default`).toEqual([]);
    }
  });

  it('emits zero overrides when every decision stores its default value', () => {
    for (const family of COMPONENT_THEME_FAMILIES) {
      const selections = Object.fromEntries(
        family.decisions.map((decision) => [decision.id, decision.defaultOption]),
      );
      const overrides = resolveComponentThemeToOverrides(family, selections);
      expect(overrides, `family ${family.id} defaults must be inert`).toEqual([]);
    }
  });
});

describe('custom shape token', () => {
  it('emits the exact shape token to every target shapeTokens entry', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      shapeLanguage: 'custom',
      [themeParamKey('shapeLanguage', 'token')]: 'Shape-3-5',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('borderRadius')).toBe('Shape-3-5');
    const iconButton = tokenMap(forComponent(overrides, 'IconButton'));
    expect(iconButton.get('borderRadius')).toBe('Shape-3-5');
  });

  it('emits multi-token shapes and derived overrides', () => {
    const nav = resolveComponentThemeToOverrides(navigation, {
      shapeLanguage: 'custom',
      [themeParamKey('shapeLanguage', 'token')]: 'Shape-2',
    });
    const webHeader = tokenMap(forComponent(nav, 'WebHeader'));
    expect(webHeader.get('itemBorderRadius')).toBe('Shape-2');
    expect(webHeader.get('searchBorderRadius')).toBe('Shape-2');

    const sel = resolveComponentThemeToOverrides(selection, {
      shapeLanguage: 'custom',
      [themeParamKey('shapeLanguage', 'token')]: 'Shape-1',
    });
    const radio = tokenMap(forComponent(sel, 'Radio'));
    expect(radio.get('borderRadius')).toBe('Shape-1');
    expect(radio.get('borderRadius-l')).toBe('Shape-1');
    expect(radio.get('dotBorderRadius')).toContain('calc(');
  });

  it('is inert when custom is selected without a token param', () => {
    const overrides = resolveComponentThemeToOverrides(actions, { shapeLanguage: 'custom' });
    expect(overrides).toEqual([]);
  });
});

describe('custom scale ramp + pinned cells', () => {
  it('shifts every per-size baseline by the ramp offset, preserving the ramp', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'ramp:paddingHorizontal')]: '-1',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('paddingHorizontal.6')).toBe('Spacing-2-5');
    expect(button.get('paddingHorizontal.8')).toBe('Spacing-3-5');
    expect(button.get('paddingHorizontal.10')).toBe('Spacing-4-5');
    expect(button.get('paddingHorizontal.12')).toBe('Spacing-5-5');
    // Untouched metrics stay inert.
    expect(button.has('minHeight.10')).toBe(false);
    expect(button.has('paddingVertical.10')).toBe(false);
  });

  it('mirrors Button paddingHorizontal to Start/End with the same size suffix', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'ramp:paddingHorizontal')]: '1',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('paddingHorizontalStart.10')).toBe(button.get('paddingHorizontal.10'));
    expect(button.get('paddingHorizontalEnd.12')).toBe(button.get('paddingHorizontal.12'));
  });

  it('lets pinned cells win over ramp output', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'ramp:paddingHorizontal')]: '-1',
      [themeParamKey('controlScale', 'cell:paddingHorizontal.10')]: 'Spacing-3',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('paddingHorizontal.10')).toBe('Spacing-3');
    expect(button.get('paddingHorizontalStart.10')).toBe('Spacing-3');
    // Other sizes keep the ramp value.
    expect(button.get('paddingHorizontal.12')).toBe('Spacing-5-5');
  });

  it('applies pinned cells without any ramp offset', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'cell:minHeight.12')]: 'Spacing-14',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('minHeight.12')).toBe('Spacing-14');
    expect(button.size).toBe(1);
  });

  it('supports base-only metrics (Card padding via density)', () => {
    const overrides = resolveComponentThemeToOverrides(cards, {
      density: 'custom',
      [themeParamKey('density', 'ramp:padding')]: '1',
    });
    const card = tokenMap(forComponent(overrides, 'Card'));
    expect(card.get('padding')).toBe('Spacing-5');
  });

  it('ignores cells for metrics a target does not expose', () => {
    const overrides = resolveComponentThemeToOverrides(inputs, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'cell:knobSize.10')]: 'Spacing-5',
    });
    expect(forComponent(overrides, 'InputField')).toEqual([]);
  });

  it('emits per-size keys only — never a base fan-out for per-size metrics', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      controlScale: 'custom',
      [themeParamKey('controlScale', 'ramp:paddingHorizontal')]: '2',
    });
    const button = forComponent(overrides, 'Button');
    expect(button.some((o) => o.tokenName === 'paddingHorizontal')).toBe(false);
    expect(button.every((o) => o.tokenName.includes('.'))).toBe(true);
  });
});

describe('attention styles', () => {
  it('treats legacy emphasisStyle as an alias for highAttentionStyle', () => {
    const legacy = resolveComponentThemeToOverrides(actions, { emphasisStyle: 'tonal' });
    const modern = resolveComponentThemeToOverrides(actions, { highAttentionStyle: 'tonal' });
    expect(legacy).toEqual(modern);
    const button = tokenMap(forComponent(legacy, 'Button'));
    expect(button.get('backgroundColor.bold')).toContain('--_btn-subtle');
  });

  it('prefers the explicit highAttentionStyle over the legacy alias', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      emphasisStyle: 'tonal',
      highAttentionStyle: 'outline',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('backgroundColor.bold')).toBe('transparent');
  });

  it('restyles the subtle variant for mediumAttentionStyle', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      mediumAttentionStyle: 'solid',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('backgroundColor.subtle')).toContain('--_btn-bold');
    expect(button.get('backgroundColor.subtle-hover')).toContain('--_btn-bold-hover');
    expect(button.get('textColor.subtle')).toContain('--_btn-bold-high');
    // High level untouched.
    expect(button.has('backgroundColor.bold')).toBe(false);
  });

  it('routes ghost outline through the inset stroke instead of cssDecoration', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      lowAttentionStyle: 'outline',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('borderWidth.ghost')).toContain('--Button-cssDecorationStrokeWidth');
    expect(button.get('solidStrokeColor.ghost')).toContain('roleTintedA11y-ghost');
    expect(button.has('cssDecorationInsetStrokeWidth.ghost')).toBe(false);
  });

  it('routes every styled value through a per-variant role slot', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      mediumAttentionStyle: 'quiet',
    });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('backgroundColor.subtle-hover')).toContain('--Button-roleHover-subtle');
    expect(button.get('textColor.subtle')).toContain('--Button-roleTintedA11y-subtle');
  });
});

describe('attention roles', () => {
  it('emits per-variant role slots for the chosen level only', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      mediumAttentionRole: 'neutral',
    });
    const button = forComponent(overrides, 'Button');
    const map = tokenMap(button);
    expect(map.get('roleSubtle.subtle')).toBe('var(--Neutral-Subtle)');
    expect(map.get('roleBold.subtle')).toBe('var(--Neutral-Bold)');
    expect(map.get('roleTintedA11y.subtle')).toBe('var(--Neutral-TintedA11y)');
    expect(button.every((o) => o.tokenName.endsWith('.subtle'))).toBe(true);
    // IconButton receives the same slots (component-agnostic token names).
    expect(tokenMap(forComponent(overrides, 'IconButton')).get('roleSubtle.subtle')).toBe(
      'var(--Neutral-Subtle)',
    );
  });

  it('keeps inherit inert', () => {
    const overrides = resolveComponentThemeToOverrides(actions, {
      highAttentionRole: 'inherit',
      mediumAttentionRole: 'inherit',
      lowAttentionRole: 'inherit',
    });
    expect(overrides).toEqual([]);
  });
});

describe('defaultAppearance', () => {
  it('is inert at its new inherit default', () => {
    const overrides = resolveComponentThemeToOverrides(actions, { defaultAppearance: 'inherit' });
    expect(overrides).toEqual([]);
  });

  it('still emits the full role slot table for explicit selections', () => {
    const overrides = resolveComponentThemeToOverrides(actions, { defaultAppearance: 'secondary' });
    const button = tokenMap(forComponent(overrides, 'Button'));
    expect(button.get('roleBold')).toBe('var(--Secondary-Bold)');
    expect(button.get('roleTintedA11y')).toBe('var(--Secondary-TintedA11y)');
  });
});

describe('taxonomy v2', () => {
  it('moves navigation components out of actions', () => {
    const actionNames = actions.targets.map((target) => target.componentName);
    expect(actionNames).toEqual(['Button', 'IconButton', 'FAB', 'SingleTextButton']);
    const navNames = navigation.targets.map((target) => target.componentName);
    expect(navNames).toEqual(['Tabs', 'WebHeader', 'BottomNavigation', 'SegmentedControl']);
  });

  it('moves chips and toggles into the selection family', () => {
    const names = selection.targets.map((target) => target.componentName);
    expect(names).toEqual([
      'Chip',
      'SelectableButton',
      'SelectableIconButton',
      'SelectableSingleTextButton',
      'Checkbox',
      'Radio',
      'Switch',
    ]);
  });

  it('keeps the stored cards id with the Containers label and adds ListItem', () => {
    expect(cards.id).toBe('cards');
    expect(cards.label).toBe('Containers');
    expect(cards.targets.map((target) => target.componentName)).toEqual(['Card', 'ListItem']);
  });
});

describe('validateAttentionHierarchy', () => {
  it('accepts the factory ladder', () => {
    expect(validateAttentionHierarchy({}).level).toBe('ok');
  });

  it('errors when medium outweighs high', () => {
    const result = validateAttentionHierarchy({
      highAttentionStyle: 'tonal',
      mediumAttentionStyle: 'solid',
    });
    expect(result.level).toBe('error');
    expect(result.messages[0]).toMatch(/Medium attention cannot outweigh/);
  });

  it('errors when low outweighs medium', () => {
    const result = validateAttentionHierarchy({ lowAttentionStyle: 'solid' });
    expect(result.level).toBe('error');
  });

  it('warns when adjacent levels tie', () => {
    const result = validateAttentionHierarchy({ mediumAttentionStyle: 'solid' });
    expect(result.level).toBe('warn');
    expect(result.messages[0]).toMatch(/identical at rest/);
  });

  it('reads the legacy emphasisStyle alias for the high level', () => {
    const result = validateAttentionHierarchy({ emphasisStyle: 'quiet' });
    expect(result.level).toBe('error');
  });
});
