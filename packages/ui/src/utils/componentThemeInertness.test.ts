import { describe, expect, it } from 'vitest';
import { COMPONENT_THEME_FAMILIES } from '@oneui/shared';
import { buildAllComponentCSS, explainComponentTokenSources } from './buildComponentOverrideCSS';
import { COMPONENT_REGISTRY, resolveComponentSlug } from '../registry/componentRegistry';

function getRegistryEntry(componentName: string) {
  const key = resolveComponentSlug(componentName) ?? componentName;
  return COMPONENT_REGISTRY[key] ?? null;
}

const EMPTY_DATA = {
  componentThemeSelections: [],
  recipeSelections: [],
  tokenOverrides: [],
};

describe('global component theme inertness', () => {
  it('all-default family rows produce byte-identical CSS to no rows at all', () => {
    const withoutRows = buildAllComponentCSS(EMPTY_DATA);
    const withDefaultRows = buildAllComponentCSS({
      componentThemeSelections: COMPONENT_THEME_FAMILIES.map((family) => ({
        familyId: family.id,
        selections: Object.fromEntries(
          family.decisions.map((decision) => [decision.id, decision.defaultOption]),
        ),
      })),
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(withDefaultRows).toBe(withoutRows);
  });

  it('empty-selection family rows are also inert', () => {
    const withoutRows = buildAllComponentCSS(EMPTY_DATA);
    const withEmptyRows = buildAllComponentCSS({
      componentThemeSelections: COMPONENT_THEME_FAMILIES.map((family) => ({
        familyId: family.id,
        selections: {},
      })),
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(withEmptyRows).toBe(withoutRows);
  });
});

describe('family metric baselines match component manifests', () => {
  for (const family of COMPONENT_THEME_FAMILIES) {
    for (const target of family.targets) {
      if (!target.metricBaselines) continue;

      it(`${family.id}/${target.componentName} baselines mirror the manifest`, () => {
        const entry = getRegistryEntry(target.componentName);
        expect(entry, `registry entry for ${target.componentName}`).toBeTruthy();
        const manifestTokens = entry!.manifest.tokens;

        for (const [metric, sizes] of Object.entries(target.metricBaselines!)) {
          const tokenDef = manifestTokens[metric];
          expect(tokenDef, `${target.componentName} manifest token ${metric}`).toBeTruthy();

          for (const [size, baseline] of Object.entries(sizes)) {
            const manifestValue =
              size === '' ? tokenDef!.defaultToken : tokenDef!.sizes?.[size];
            expect(
              baseline,
              `${target.componentName}.${metric}${size ? `.${size}` : ''}`,
            ).toBe(manifestValue);
          }
        }
      });

      it(`${family.id}/${target.componentName} metric mirrors exist in the manifest`, () => {
        const entry = getRegistryEntry(target.componentName);
        const manifestTokens = entry!.manifest.tokens;
        for (const mirrors of Object.values(target.metricMirrors ?? {})) {
          for (const mirror of mirrors) {
            expect(manifestTokens[mirror], `${target.componentName} mirror ${mirror}`).toBeTruthy();
          }
        }
      });
    }
  }
});

describe('explainComponentTokenSources', () => {
  it('reports manifest for untouched keys and theme/manual for overridden keys', () => {
    const sources = explainComponentTokenSources({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: { shapeLanguage: 'pill' },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'paddingHorizontal.10',
          value: 'Spacing-3',
        },
      ],
    });

    const button = sources.get('Button');
    expect(button).toBeTruthy();
    expect(button!.get('borderRadius')).toBe('theme');
    expect(button!.get('paddingHorizontal.10')).toBe('manual');
    expect(button!.get('paddingVertical.10')).toBe('manifest');
  });

  it('reports recipe as the source for recipe-owned keys', () => {
    const sources = explainComponentTokenSources({
      componentThemeSelections: [],
      recipeSelections: [
        {
          componentName: 'button',
          selections: { cornerRadius: 'pill' },
        },
      ],
      tokenOverrides: [],
    });

    expect(sources.get('Button')!.get('borderRadius')).toBe('recipe');
  });
});
