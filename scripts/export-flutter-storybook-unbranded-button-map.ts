/**
 * Generates `packages/ui_flutter/lib/brand/default_component_properties_map.dart`.
 *
 * Parity with web Storybook **no-brand** mode (`preview.ts` `hasBrand=false`): Button still
 * renders from manifest defaults merged like `buildAllComponentCustomPropertiesFlat(empty)`.
 *
 * Run from repo root: `pnpm exec tsx scripts/export-flutter-storybook-unbranded-button-map.ts`
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAllComponentCustomPropertiesFlat } from '../packages/ui/src/utils/componentTokenMapCore';

/** Dart string literal (`r''` when no quotes/backslashes/etc.). */
function dartStringLit(s: string): string {
  if (!/(\\|'|\r|\n|\$)/u.test(s)) {
    return `r'${s}'`;
  }
  const escaped = s
    .replace(/\\/gu, String.raw`\\`)
    .replace(/'/gu, String.raw`\'`)
    .replace(/\$/gu, String.raw`\$`);
  return `'$escaped'`;
}

const flat = buildAllComponentCustomPropertiesFlat({
  componentThemeSelections: [],
  recipeSelections: [],
  tokenOverrides: [],
});

const prefixes = [
  '--Button-',
  '--IconButton-',
  '--SelectableSingleTextButton-',
  '--SelectableIconButton-',
  '--Badge-',
  '--Input-',
  '--LinearProgressIndicator-',
  '--Avatar-',
  '--CounterBadge-',
  '--IndicatorBadge-',
] as const;

/**
 * Flutter-only defaults not yet emitted by `buildAllComponentCustomPropertiesFlat`.
 * Preserved across regenerations for IconButton/SelectableSingleTextButton/
 * SelectableIconButton condensed aliases, Badge slot padding, Input role aliases,
 * and InputField/DynamicText/Feedback spacing.
 * SingleTextButton defaults live in `single_text_button_default_component_tokens.dart`.
 */
const supplementalFlutterComponentTokenDefaults: Record<string, string> = {
  '--IconButton-containerSize-10-condensed': 'var(--Spacing-8)',
  '--IconButton-containerSize-12-condensed': 'var(--Spacing-10)',
  '--IconButton-containerSize-14-condensed': 'var(--Spacing-12)',
  '--IconButton-containerSize-4-condensed': 'var(--Spacing-4)',
  '--IconButton-containerSize-6-condensed': 'var(--Spacing-4-5)',
  '--IconButton-containerSize-8-condensed': 'var(--Spacing-6)',
  '--SelectableSingleTextButton-height-l-condensed': 'var(--Spacing-8)',
  '--SelectableSingleTextButton-height-m-condensed': 'var(--Spacing-6)',
  '--SelectableSingleTextButton-height-s-condensed': 'var(--Spacing-4-5)',
  '--SelectableSingleTextButton-minHeight-l': 'var(--Spacing-12)',
  '--SelectableSingleTextButton-minHeight-l-condensed': 'var(--Spacing-8)',
  '--SelectableSingleTextButton-minHeight-m': 'var(--Spacing-10)',
  '--SelectableSingleTextButton-minHeight-m-condensed': 'var(--Spacing-6)',
  '--SelectableSingleTextButton-minHeight-s': 'var(--Spacing-8)',
  '--SelectableSingleTextButton-minHeight-s-condensed': 'var(--Spacing-4-5)',
  '--SelectableSingleTextButton-padding-l': 'var(--Spacing-2)',
  '--SelectableSingleTextButton-padding-l-condensed': 'var(--Spacing-0-5)',
  '--SelectableSingleTextButton-padding-m': 'var(--Spacing-1)',
  '--SelectableSingleTextButton-padding-m-condensed': 'var(--Spacing-0-5)',
  '--SelectableSingleTextButton-padding-s': 'var(--Spacing-0-5)',
  '--SelectableSingleTextButton-padding-s-condensed': 'var(--Spacing-0-5)',
  '--SelectableIconButton-containerSize-10-condensed': 'var(--Spacing-8)',
  '--SelectableIconButton-containerSize-12-condensed': 'var(--Spacing-10)',
  '--SelectableIconButton-containerSize-14-condensed': 'var(--Spacing-12)',
  '--SelectableIconButton-containerSize-4-condensed': 'var(--Spacing-4)',
  '--SelectableIconButton-containerSize-6-condensed': 'var(--Spacing-4-5)',
  '--SelectableIconButton-containerSize-8-condensed': 'var(--Spacing-6)',
  '--Badge-paddingHorizontal-xs-slot': 'var(--Spacing-0-5)',
  '--Badge-paddingHorizontal-s-slot': 'var(--Spacing-0-5)',
  '--Badge-paddingHorizontal-m-slot': 'var(--Spacing-1)',
  '--Badge-paddingHorizontal-l-slot': 'var(--Spacing-1)',
  '--Badge-paddingHorizontal-xl-slot': 'var(--Spacing-1-5)',
  '--Badge-paddingVertical-xl': 'var(--Spacing-1)',
  '--Input-borderWidthFocus': 'var(--Spacing-0-5)',
  '--Input-rootStackGap': 'var(--Spacing-1-5)',
  '--Input-borderRadius-pill': 'var(--Shape-Pill)',
  '--Input-roleBold': 'var(--Primary-Bold)',
  '--Input-roleBoldHigh': 'var(--Primary-Bold-High)',
  '--Input-roleHigh': 'var(--Primary-High)',
  '--Input-roleLow': 'var(--Primary-Low)',
  '--Input-roleMediumText': 'var(--Primary-Medium-Text)',
  '--Input-roleStrokeMedium': 'var(--Primary-Stroke-Medium)',
  '--Input-roleStrokeLow': 'var(--Primary-Stroke-Low)',
  '--Input-roleTintedA11y': 'var(--Primary-TintedA11y)',
  '--Input-roleHover': 'var(--Primary-Hover)',
  '--Input-roleSubtle': 'var(--Primary-Minimal)',
  '--InputField-gap': 'var(--Spacing-1-5)',
  '--InputField-labelGap': 'var(--Spacing-0-5)',
  '--InputField-labelIconGap': 'var(--Spacing-0-5)',
  '--InputDynamicText-gap': 'var(--Spacing-1-5)',
  '--InputDynamicText-contentMinHeight-l': 'var(--Spacing-6)',
  '--InputFeedback-gap': 'var(--Spacing-1)',
  '--InputFeedback-borderRadius-s': 'var(--Shape-1-5)',
  '--InputFeedback-borderRadius-m': 'var(--Shape-2)',
  '--InputFeedback-borderRadius-l': 'var(--Shape-2-5)',
};

const btn = {
  ...Object.fromEntries(
    Object.entries(flat).filter(([k]) => prefixes.some((p) => k.startsWith(p)))
  ),
  ...supplementalFlutterComponentTokenDefaults,
} as Record<string, string>;

const dartPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'packages',
  'ui_flutter',
  'lib',
  'brand',
  'default_component_properties_map.dart'
);

let body = '// GENERATED FILE — run `pnpm exec tsx scripts/export-flutter-storybook-unbranded-button-map.ts`\n';
body +=
  '// From `buildAllComponentCustomPropertiesFlat(empty)` (Button, IconButton, SelectableSingleTextButton, SelectableIconButton, Badge, Input, LinearProgressIndicator, Avatar, CounterBadge, IndicatorBadge) + Flutter supplemental defaults.\n';
body += '// SingleTextButton defaults: `single_text_button_default_component_tokens.dart`.\n\n';
body += 'const Map<String, String> kDefaultComponentTokenProperties = {\n';
for (const [k, v] of Object.entries(btn).sort(([a], [b]) => a.localeCompare(b))) {
  body += `  ${dartStringLit(k)}: ${dartStringLit(v)},\n`;
}
body += '};\n';

writeFileSync(dartPath, body, 'utf8');
console.log(`Wrote ${Object.keys(btn).length} component token keys → ${dartPath}`);
