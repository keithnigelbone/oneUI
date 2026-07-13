/**
 * Smoke: JDSButton's propsSchema is a valid JSON Schema (ajv compile passes)
 * and validates the intended-good / intended-bad samples a consumer would feed it.
 */

import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, test } from 'vitest';
import { compileComposition } from '@jds/kb-core';
import {
  JDSButton,
  JDSSurface,
  JDSText,
  JDSIcon,
  JDSCard,
  JDSBottomNavigation,
  JDSBottomNavigationItem,
  JDSSearchBar,
  JDSInput,
  JDSBanner,
  JDSAvatar,
  JDSBadge,
  JDSChip,
  ALL_COMPONENTS,
} from '../src';

const ajv = new Ajv2020({
  strict: false,                 // tolerate x-jds-* annotations
  allErrors: true,
  validateFormats: true,
});

describe('@jds/kb-rn — all schemas compile', () => {
  for (const meta of ALL_COMPONENTS) {
    test(`${meta.name}.propsSchema compiles under ajv`, () => {
      expect(() => ajv.compile(meta.propsSchema)).not.toThrow();
    });
  }
});

describe('@jds/kb-rn — JDSButton validation', () => {
  const validate = ajv.compile(JDSButton.propsSchema);

  test('accepts a canonical bold primary button', () => {
    const ok = validate({
      children: 'Continue',
      variant: 'bold',
      appearance: 'primary',
      size: 10,
    });
    expect(ok).toBe(true);
  });

  test('accepts the attention alias form', () => {
    const ok = validate({ children: 'Cancel', attention: 'low' });
    expect(ok).toBe(true);
  });

  test('rejects raw hex backgroundColor (forbidden pattern)', () => {
    const ok = validate({ children: 'Buy', variant: 'bold', backgroundColor: '#ff0033' });
    expect(ok).toBe(false);
    const violations = validate.errors ?? [];
    expect(violations.some((e) => e.instancePath.includes('backgroundColor'))).toBe(true);
  });

  test('rejects rgb backgroundColor (forbidden pattern)', () => {
    const ok = validate({ children: 'Buy', variant: 'bold', backgroundColor: 'rgb(255, 0, 51)' });
    expect(ok).toBe(false);
  });

  test('requires either variant or attention (oneOf)', () => {
    const ok = validate({ children: 'Hi' });
    expect(ok).toBe(false);
  });

  test('rejects unknown variant', () => {
    const ok = validate({ children: 'Hi', variant: 'gigantic' });
    expect(ok).toBe(false);
  });
});

describe('@jds/kb-rn — x-jds-suggestion annotations preserved', () => {
  test('JDSButton.backgroundColor carries an LLM-actionable suggestion', () => {
    const bg = (JDSButton.propsSchema.properties as Record<string, any>).backgroundColor;
    expect(bg['x-jds-suggestion']).toMatch(/Surface/i);
    expect(bg['x-jds-severity']).toBe('error');
  });
  test('JDSSurface forbids backgroundColor on style', () => {
    const styleProp = (JDSSurface.propsSchema.properties as Record<string, any>).style;
    expect(styleProp['x-jds-severity']).toBe('warn');
  });
  test('JDSText forbids color literals', () => {
    const colorProp = (JDSText.propsSchema.properties as Record<string, any>).color;
    expect(colorProp['x-jds-severity']).toBe('error');
  });
});

describe('@jds/kb-rn — composition rules well-formed', () => {
  test('JDSCard declares 5 fixed slots', () => {
    expect(JDSCard.composition?.childKind).toBe('fixed-slots');
    expect(Object.keys(JDSCard.composition?.slots ?? {})).toEqual(
      expect.arrayContaining(['header', 'media', 'body', 'footer', 'actions']),
    );
  });
  test('JDSButton + JDSText + JDSIcon are leaf components', () => {
    expect(JDSButton.composition?.childKind).toBe('leaf');
    expect(JDSText.composition?.childKind).toBe('leaf');
    expect(JDSIcon.composition?.childKind).toBe('leaf');
  });
  test('JDSSurface is variadic', () => {
    expect(JDSSurface.composition?.childKind).toBe('variadic');
  });
});

describe('@jds/kb-rn — figma mapping invariants', () => {
  test('every component has a stable componentKey + keyHistory', () => {
    for (const meta of ALL_COMPONENTS) {
      expect(meta.figma?.componentKey).toMatch(/^jds-[a-z-]+-v\d+$/);
      expect(Array.isArray(meta.figma?.keyHistory)).toBe(true);
    }
  });
});

describe('@jds/kb-rn — extended roster (Coffee Shop chassis)', () => {
  test('ALL_COMPONENTS includes the full chassis roster', () => {
    const names = ALL_COMPONENTS.map((c) => c.name).sort();
    expect(names).toEqual(
      [
        'AgentPulse',
        'Avatar',
        'Badge',
        'Banner',
        'BottomNavigation',
        'BottomNavigationItem',
        'Button',
        'Card',
        'Checkbox',
        'CheckboxField',
        'Chip',
        'ChipGroup',
        'CircularProgressIndicator',
        'Container',
        'CounterBadge',
        'Divider',
        'Icon',
        'IconButton',
        'IconContained',
        'Image',
        'IndicatorBadge',
        'Input',
        'InputDynamicText',
        'InputFeedback',
        'InputField',
        'LinkButton',
        'Logo',
        'Modal',
        'PaginationDots',
        'Progress',
        'Radio',
        'RadioField',
        'Scrim',
        'Select',
        'SearchBar',
        'Separator',
        'Spinner',
        'Surface',
        'Switch',
        'Tabs',
        'Text',
        'Tooltip',
        'TouchSlider',
      ].sort(),
    );
  });

  test('JDSBottomNavigation is variadic (2..5)', () => {
    expect(JDSBottomNavigation.composition?.childKind).toBe('variadic');
    expect(JDSBottomNavigation.composition?.variadic).toEqual({
      accepts: ['BottomNavigationItem'],
      min: 2,
      max: 5,
    });
  });

  test('JDSBottomNavigationItem has fixed icon + label slots required', () => {
    expect(JDSBottomNavigationItem.composition?.childKind).toBe('fixed-slots');
    expect(Object.keys(JDSBottomNavigationItem.composition?.slots ?? {})).toEqual(
      expect.arrayContaining(['icon', 'label', 'badge']),
    );
    expect(JDSBottomNavigationItem.composition?.slots?.icon.cardinality).toBe('single');
    expect(JDSBottomNavigationItem.composition?.slots?.label.cardinality).toBe('single');
    expect(JDSBottomNavigationItem.composition?.slots?.badge.cardinality).toBe('optional');
  });

  test('JDSBanner enforces tone enum', () => {
    const tone = (JDSBanner.propsSchema.properties as Record<string, any>).tone;
    expect(tone.enum).toEqual(['informative', 'positive', 'warning', 'negative']);
  });

  test('JDSInput exposes RN keyboardType discriminator', () => {
    const kb = (JDSInput.propsSchema.properties as Record<string, any>).keyboardType;
    expect(kb.enum).toContain('email-address');
    expect(kb.enum).toContain('numeric');
  });

  test('JDSSearchBar default placeholder is "Search…"', () => {
    const ph = (JDSSearchBar.propsSchema.properties as Record<string, any>).placeholder;
    expect(ph.default).toBe('Search…');
  });
});

describe('@jds/kb-rn — Avatar, Badge, and Chip metadata matches native contracts', () => {
  test('JDSAvatar documents the native content prop, not a stale variant prop', () => {
    const props = JDSAvatar.propsSchema.properties as Record<string, any>;
    expect(props.content?.enum).toEqual(['image', 'icon', 'text']);
    expect(props.content?.default).toBe('image');
    expect(props.variant).toBeUndefined();
    expect(props.src.description).toMatch(/content="image"/);
  });

  test('JDSAvatar documents Surface appearance inheritance', () => {
    const props = JDSAvatar.propsSchema.properties as Record<string, any>;
    expect(props.appearance.description).toMatch(/nearest <Surface appearance>/);
    expect(props.appearance.description).toMatch(/root fallback.*primary/i);
    expect(JDSAvatar.tags).toContain('inherits-appearance');
  });

  test('JDSBadge documents Surface appearance inheritance without stale no-inheritance copy', () => {
    const props = JDSBadge.propsSchema.properties as Record<string, any>;
    expect(props.appearance.description).toMatch(/nearest <Surface appearance>/);
    expect(props.appearance.description).toMatch(/root fallback.*sparkle/i);
    expect(props.appearance.description).not.toMatch(/does not yet carry appearance/i);
    expect(JDSBadge.tags).toContain('inherits-appearance');
  });

  test('JDSChip documents Surface appearance inheritance', () => {
    const props = JDSChip.propsSchema.properties as Record<string, any>;
    expect(props.appearance.description).toMatch(/nearest <Surface appearance>/);
    expect(props.appearance.description).toMatch(/root fallback.*primary/i);
    expect(JDSChip.tags).toContain('inherits-appearance');
  });
});

describe('@jds/kb-rn — composition compiler integration (D.a)', () => {
  const ajvLocal = new Ajv2020({ strict: false, allErrors: true });

  test('compiled BottomNavigation children accept 2..5 array, reject 1 and 6', () => {
    const compiled = compileComposition(JDSBottomNavigation.composition!);
    const validate = ajvLocal.compile({
      type: 'object',
      properties: compiled.properties,
      required: compiled.required as string[],
    });
    expect(validate({ children: [{}, {}] })).toBe(true);
    expect(validate({ children: [{}, {}, {}, {}, {}] })).toBe(true);
    expect(validate({ children: [{}] })).toBe(false);
    expect(validate({ children: [{}, {}, {}, {}, {}, {}] })).toBe(false);
  });

  test('compiled BottomNavigationItem requires icon + label, rejects without them', () => {
    const compiled = compileComposition(JDSBottomNavigationItem.composition!);
    expect(compiled.required).toEqual(expect.arrayContaining(['icon', 'label']));
    const validate = ajvLocal.compile({
      type: 'object',
      properties: compiled.properties,
      required: compiled.required as string[],
    });
    expect(validate({ icon: {}, label: 'Home' })).toBe(true);
    expect(validate({ icon: {} })).toBe(false);
  });

  test('compiled Banner has body required + title/icon/action optional', () => {
    const compiled = compileComposition(JDSBanner.composition!);
    expect(compiled.required).toEqual(['body']);
  });

  test('every leaf component compiles to a schema that rejects array children', () => {
    for (const meta of ALL_COMPONENTS) {
      if (meta.composition?.childKind !== 'leaf') continue;
      const compiled = compileComposition(meta.composition);
      const validate = ajvLocal.compile({
        type: 'object',
        properties: compiled.properties,
        required: compiled.required as string[],
      });
      expect(validate({ children: ['a', 'b'] })).toBe(false);
    }
  });
});

describe('@jds/kb-rn — shared-fragment hybrid design (E.d)', () => {
  test('JDSButton.appearance enum matches the @jds/kb-core ROLE_ENUM', async () => {
    const { ROLE_ENUM } = await import('@jds/kb-core');
    const a = (JDSButton.propsSchema.properties as Record<string, any>).appearance;
    expect(a.enum).toEqual(ROLE_ENUM.enum);
    expect(a.default).toBe(ROLE_ENUM.default);
  });

  test('JDSButton.variant enum matches @jds/kb-core VARIANT_ENUM', async () => {
    const { VARIANT_ENUM } = await import('@jds/kb-core');
    const v = (JDSButton.propsSchema.properties as Record<string, any>).variant;
    expect(v.enum).toEqual(VARIANT_ENUM.enum);
  });

  test('forbidden-color suggestion is reused from kb-core, not redefined', async () => {
    const { FORBIDDEN_COLOR_LITERAL } = await import('@jds/kb-core');
    const banner = (JDSBanner.propsSchema.properties as Record<string, any>).backgroundColor;
    expect(banner['x-jds-suggestion']).toBe(FORBIDDEN_COLOR_LITERAL['x-jds-suggestion']);
    expect(banner['x-jds-severity']).toBe('error');
  });
});
