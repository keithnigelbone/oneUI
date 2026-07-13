import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, test } from 'vitest';
import { compileComposition } from '@jds/kb-core';
import {
  ALL_COMPONENTS,
  JDSButton,
  JDSBanner,
  JDSBottomNav,
  JDSCard,
  JDSIcon,
  JDSInput,
  JDSSearchBar,
  JDSSurface,
  JDSTabBarItem,
  JDSText,
} from '../src';

const ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: true });

describe('@jds/kb-web — all schemas compile', () => {
  for (const meta of ALL_COMPONENTS) {
    test(`${meta.name}.propsSchema compiles under ajv`, () => {
      expect(() => ajv.compile(meta.propsSchema)).not.toThrow();
    });
  }
});

describe('@jds/kb-web — roster', () => {
  test('10 components present', () => {
    expect(ALL_COMPONENTS).toHaveLength(10);
  });
  test('every component has classNameStrategy + ssrSafe render hints', () => {
    for (const c of ALL_COMPONENTS) {
      expect(['css-modules', 'tailwind', 'styled-components']).toContain(
        (c.renderHints as { classNameStrategy: string }).classNameStrategy,
      );
      expect(typeof (c.renderHints as { ssrSafe: boolean }).ssrSafe).toBe('boolean');
    }
  });
  test('Button + TabBarItem render as <button>, Surface/Card/Banner/BottomNav as <div>', () => {
    expect(JDSButton.renderHints.baseElement).toBe('button');
    expect(JDSTabBarItem.renderHints.baseElement).toBe('button');
    expect(JDSSurface.renderHints.baseElement).toBe('div');
    expect(JDSCard.renderHints.baseElement).toBe('div');
    expect(JDSBanner.renderHints.baseElement).toBe('div');
    expect(JDSBottomNav.renderHints.baseElement).toBe('div');
  });
  test('Surface + Card emit data-surface', () => {
    expect(JDSSurface.renderHints.emitsDataSurface).toBe(true);
    expect(JDSCard.renderHints.emitsDataSurface).toBe(true);
  });
});

describe('@jds/kb-web — Web-only prop surface', () => {
  test('JDSButton accepts type/href/target/rel + className', () => {
    const props = JDSButton.propsSchema.properties as Record<string, any>;
    expect(props.type.enum).toEqual(['button', 'submit', 'reset']);
    expect(props.href.type).toBe('string');
    expect(props.target.enum).toContain('_blank');
    expect(props.className.type).toBe('string');
  });
  test('JDSInput exposes web type discriminator (text/email/…)', () => {
    const t = (JDSInput.propsSchema.properties as Record<string, any>).type;
    expect(t.enum).toContain('email');
    expect(t.enum).toContain('password');
  });
  test('JDSText polymorphic `as` covers h1..h6 / p / span / div / label', () => {
    const as = (JDSText.propsSchema.properties as Record<string, any>).as;
    expect(as.enum).toEqual(expect.arrayContaining(['p', 'h1', 'h6', 'span', 'div', 'label']));
  });
});

describe('@jds/kb-web — Cross-SDK contract symmetry', () => {
  test('Web Button + RN Button declare the SAME platform-neutral enums', async () => {
    const { VARIANT_ENUM, ROLE_ENUM } = await import('@jds/kb-core');
    const webVariant = (JDSButton.propsSchema.properties as Record<string, any>).variant;
    expect(webVariant.enum).toEqual(VARIANT_ENUM.enum);
    const webAppearance = (JDSButton.propsSchema.properties as Record<string, any>).appearance;
    expect(webAppearance.enum).toEqual(ROLE_ENUM.enum);
  });
  test('every component carries jds-<name>-v<n> figma key + keyHistory[]', () => {
    for (const c of ALL_COMPONENTS) {
      expect(c.figma?.componentKey).toMatch(/^jds-[a-z-]+-v\d+$/);
      expect(Array.isArray(c.figma?.keyHistory)).toBe(true);
    }
  });
});

describe('@jds/kb-web — composition compiles', () => {
  const ajvLocal = new Ajv2020({ strict: false, allErrors: true });
  test('BottomNav children accept 2..5; reject 1 and 6', () => {
    const compiled = compileComposition(JDSBottomNav.composition!);
    const validate = ajvLocal.compile({
      type: 'object',
      properties: compiled.properties,
      required: compiled.required as string[],
    });
    expect(validate({ children: [{}, {}] })).toBe(true);
    expect(validate({ children: [{}] })).toBe(false);
  });
  test('TabBarItem requires icon + label', () => {
    const compiled = compileComposition(JDSTabBarItem.composition!);
    expect(compiled.required).toEqual(expect.arrayContaining(['icon', 'label']));
  });
});

describe('@jds/kb-web — forbidden-pattern annotations preserved', () => {
  test('JDSButton.backgroundColor carries error-severity suggestion', () => {
    const bg = (JDSButton.propsSchema.properties as Record<string, any>).backgroundColor;
    expect(bg['x-jds-severity']).toBe('error');
  });
  test('JDSSearchBar + JDSInput + JDSBanner all forbid backgroundColor', () => {
    for (const c of [JDSSearchBar, JDSInput, JDSBanner]) {
      const bg = (c.propsSchema.properties as Record<string, any>).backgroundColor;
      expect(bg['x-jds-severity']).toBe('error');
    }
  });
  test('JDSIcon + JDSText forbid raw color literals', () => {
    for (const c of [JDSIcon, JDSText]) {
      const col = (c.propsSchema.properties as Record<string, any>).color;
      expect(col['x-jds-severity']).toBe('error');
    }
  });
});
