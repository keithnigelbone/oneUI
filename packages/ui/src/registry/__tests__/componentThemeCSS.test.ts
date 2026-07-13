import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllComponentCSS } from '../../utils/buildComponentOverrideCSS';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('buildAllComponentCSS component theme merge', () => {
  it('applies family themes before component recipes and manual overrides', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            shapeLanguage: 'pill',
          },
        },
      ],
      recipeSelections: [
        {
          componentName: 'button',
          selections: {
            cornerRadius: 'small',
          },
        },
      ],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'borderRadius',
          value: 'Shape-0',
        },
      ],
    });

    expect(css).toContain('--Button-borderRadius: var(--Shape-0);');
  });

  it('does not emit local manual color overrides from component token rows', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Negative-Bold',
        },
        {
          componentName: 'button',
          tokenName: 'textColor.bold',
          value: 'Negative-Bold-High',
        },
      ],
    });

    expect(css).not.toContain('--Button-backgroundColor-bold');
    expect(css).not.toContain('--Button-textColor-bold');
    expect(css).not.toContain('Negative-Bold');
  });

  it('keeps global family color selections even when stale local color rows exist', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            emphasisStyle: 'tonal',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'backgroundColor.bold',
          value: 'Negative-Bold',
        },
      ],
    });

    expect(css).toContain(
      '--Button-backgroundColor-bold: var(--Button-roleSubtle-bold, var(--_btn-subtle));',
    );
    expect(css).not.toContain('--Button-backgroundColor-bold: var(--Negative-Bold);');
  });

  it('ignores family-owned Button recipe shape when action shape is active', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
      ],
      recipeSelections: [
        {
          componentName: 'button',
          selections: {
            cornerRadius: 'pill',
          },
        },
      ],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-borderRadius: var(--Shape-0);');
    expect(css).not.toContain('--Button-borderRadius: var(--Shape-Pill);');
  });

  it('normalizes component slugs before resolving recipes', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [],
      recipeSelections: [
        {
          componentName: 'input',
          selections: {
            cornerRadius: 'pill',
          },
        },
      ],
      tokenOverrides: [],
    });

    expect(css).toContain('--Input-borderRadius: var(--Shape-Pill);');
  });

  it('keeps action outline styles visible by referencing scope-resolvable role tokens', () => {
    // See componentThemes.ts for why the values must resolve at the scope.
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            emphasisStyle: 'outline',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-backgroundColor-bold: transparent;');
    expect(css).toContain('--Button-backgroundColor-bold-hover: transparent;');
    expect(css).toContain('--Button-backgroundColor-bold-pressed: transparent;');
    expect(css).toContain(
      '--Button-textColor-bold: var(--Button-roleTintedA11y-bold, var(--_btn-default-accent-a11y));'
    );
    expect(css).toContain('--Button-borderColor-bold: transparent;');
    expect(css).toContain('--Button-borderWidth-bold: 0px;');
    expect(css).toContain(
      '--Button-cssDecorationColor-bold: var(--Button-roleTintedA11y-bold, var(--_btn-default-accent-a11y));'
    );
    expect(css).toContain(
      '--Button-cssDecorationInsetStrokeWidth-bold: var(--Button-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--Button-cssDecorationStrokeStyle-bold: var(--Button-cssDecorationStrokeStyle, solid);'
    );
    expect(css).toContain('--IconButton-backgroundColor-bold: transparent;');
    expect(css).toContain('--IconButton-backgroundColor-bold-hover: transparent;');
    expect(css).toContain('--IconButton-backgroundColor-bold-pressed: transparent;');
    expect(css).toContain(
      '--IconButton-iconColor-bold: var(--IconButton-roleTintedA11y-bold, var(--IconButton-roleTintedA11y, var(--Primary-TintedA11y)));'
    );
    expect(css).toContain('--IconButton-borderColor-bold: transparent;');
    expect(css).toContain('--IconButton-borderWidth-bold: 0px;');
    expect(css).toContain(
      '--IconButton-cssDecorationColor-bold: var(--IconButton-roleTintedA11y-bold, var(--IconButton-roleTintedA11y, var(--Primary-TintedA11y)));'
    );
    expect(css).toContain(
      '--IconButton-cssDecorationInsetStrokeWidth-bold: var(--IconButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--IconButton-cssDecorationStrokeStyle-bold: var(--IconButton-cssDecorationStrokeStyle, solid);'
    );
    expect(css).toContain('var(--_btn-');
    expect(css).not.toContain('var(--_ib-');
  });

  it('emits family shape selections for action, selection, and navigation components', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
        {
          familyId: 'selection',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
        {
          familyId: 'navigation',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-borderRadius: var(--Shape-0);');
    expect(css).toContain('--IconButton-borderRadius: var(--Shape-0);');
    expect(css).toContain('--FAB-borderRadius: var(--Shape-0);');
    expect(css).toContain('--Chip-borderRadius: var(--Shape-0);');
    expect(css).toContain('--SelectableButton-borderRadius: var(--Shape-0);');
    expect(css).toContain('--SelectableIconButton-borderRadius: var(--Shape-0);');
    expect(css).toContain('--SelectableSingleTextButton-borderRadius: var(--Shape-0);');
    expect(css).toContain('--SingleTextButton-borderRadius: var(--Shape-0);');
    expect(css).toContain('--Tabs-itemRadius: var(--Shape-0);');
    expect(css).toContain('--WebHeader-itemBorderRadius: var(--Shape-0);');
    expect(css).toContain('--WebHeader-searchBorderRadius: var(--Shape-0);');
    expect(css).toContain('--BottomNavigation-itemBorderRadius: var(--Shape-0);');
    expect(css).toContain('--SegmentedControl-itemRadiusRectangular: var(--Shape-0);');
  });

  it('emits an exact custom shape token for the whole family', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            shapeLanguage: 'custom',
            'shapeLanguage:token': 'Shape-3-5',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-borderRadius: var(--Shape-3-5);');
    expect(css).toContain('--IconButton-borderRadius: var(--Shape-3-5);');
    expect(css).toContain('--FAB-borderRadius: var(--Shape-3-5);');
  });

  it('emits per-variant role slots for attention-level roles, scoped on the element', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            mediumAttentionRole: 'neutral',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    const buttonBlock = css.match(/\[data-oneui-component="Button"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';
    const iconButtonBlock =
      css.match(/\[data-oneui-component="IconButton"\]\s\{[\s\S]*?\n  \}/)?.[0] ?? '';

    expect(buttonBlock).toContain('--Button-roleSubtle-subtle: var(--Neutral-Subtle);');
    expect(buttonBlock).toContain('--Button-roleBold-subtle: var(--Neutral-Bold);');
    expect(buttonBlock).toContain('--Button-roleTintedA11y-subtle: var(--Neutral-TintedA11y);');
    expect(iconButtonBlock).toContain('--IconButton-roleSubtle-subtle: var(--Neutral-Subtle);');
    // High/Low levels stay untouched.
    expect(buttonBlock).not.toContain('--Button-roleSubtle-bold');
    expect(buttonBlock).not.toContain('--Button-roleSubtle-ghost');
  });

  it('composes attention style and role on the same level', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            mediumAttentionStyle: 'solid',
            mediumAttentionRole: 'neutral',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    // Style writes the paint hooks routed through the per-variant slots…
    expect(css).toContain(
      '--Button-backgroundColor-subtle: var(--Button-roleBold-subtle, var(--_btn-bold));'
    );
    // …and the role fills those slots, so medium renders solid Neutral.
    expect(css).toContain('--Button-roleBold-subtle: var(--Neutral-Bold);');
    expect(css).toContain('--Button-roleBoldHover-subtle: var(--Neutral-Bold-Hover);');
  });

  it('emits ramped per-size padding with pinned cells for custom control scale', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            controlScale: 'custom',
            'controlScale:ramp:paddingHorizontal': '-1',
            'controlScale:cell:paddingHorizontal.10': 'Spacing-3',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    // Ramp shifts every size one ladder step down from the factory baseline…
    expect(css).toContain('--Button-paddingHorizontal-6: var(--Spacing-2-5);');
    expect(css).toContain('--Button-paddingHorizontal-8: var(--Spacing-3-5);');
    expect(css).toContain('--Button-paddingHorizontal-12: var(--Spacing-5-5);');
    // …except the pinned cell, which wins.
    expect(css).toContain('--Button-paddingHorizontal-10: var(--Spacing-3);');
    // Start/End mirrors track the same values.
    expect(css).toContain('--Button-paddingHorizontalStart-10: var(--Spacing-3);');
    expect(css).toContain('--Button-paddingHorizontalEnd-12: var(--Spacing-5-5);');
  });

  it('keeps card container shape independent from action shape', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            shapeLanguage: 'pill',
          },
        },
        {
          familyId: 'cards',
          selections: {
            shapeLanguage: 'sharp',
            elevationLevel: 'raised',
            strokeEmphasis: 'subtle',
            surfaceTone: 'subtle',
            density: 'roomy',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-borderRadius: var(--Shape-Pill);');
    expect(css).toContain('--Card-borderRadius: var(--Shape-0);');
    expect(css).toContain('--Card-boxShadow: var(--Elevation-1);');
    expect(css).toContain('--Card-borderWidth: var(--Stroke-S);');
    expect(css).toContain('--Card-borderColor: var(--Neutral-Stroke-Low);');
    expect(css).toContain('--Card-backgroundColor: var(--Neutral-Subtle);');
    expect(css).toContain('--Card-padding: var(--Spacing-5);');
    expect(css).toContain('--Card-gap: var(--Spacing-4);');
  });

  it('uses card container tokens for the agents hub cards', () => {
    const agentsCardCss = readFileSync(
      resolve(
        __dirname,
        '../../../../../apps/platform/src/app/(platform)/(studio)/agents/page.module.css'
      ),
      'utf8'
    );

    expect(agentsCardCss).toContain('var(--Card-borderRadius');
    expect(agentsCardCss).toContain('var(--Card-boxShadow');
    expect(agentsCardCss).not.toContain('var(--Button-borderRadius');
  });

  it('renders the global theme card preview with the real Card component', () => {
    // Previously the preview hand-rolled the --Card-* token API in CSS; it now
    // uses the real <Card>, so the Containers family theme drives it directly.
    const pageSrc = readFileSync(
      resolve(
        __dirname,
        '../../../../../apps/platform/src/app/(platform)/(studio)/components/page.tsx'
      ),
      'utf8'
    );
    // The CARD_PREVIEW_ITEMS map renders a real <Card> (not a hand-authored article).
    expect(pageSrc).toContain('<Card key={item.title}');

    // The layout class must not re-implement the container geometry — Card owns it.
    const globalThemeCss = readFileSync(
      resolve(
        __dirname,
        '../../../../../apps/platform/src/app/(platform)/(studio)/components/global-theme.module.css'
      ),
      'utf8'
    );
    const agentCardBlock = globalThemeCss.slice(
      globalThemeCss.indexOf('.agentPreviewCard {'),
      globalThemeCss.indexOf('}', globalThemeCss.indexOf('.agentPreviewCard {'))
    );
    expect(agentCardBlock).not.toContain('--Card-backgroundColor');
    expect(agentCardBlock).not.toContain('--Card-borderRadius');
  });

  it('emits decoration impact only for SVG ornament action components', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            decorationImpact: 'balanced',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-ornamentHeightScale: 0.75;');
    expect(css).not.toContain('--Chip-ornamentHeightScale');
    expect(css).not.toContain('--SelectableButton-ornamentHeightScale');
    expect(css).not.toContain('--IconButton-ornamentHeightScale');
    expect(css).not.toContain('--SingleTextButton-ornamentHeightScale');
  });

  it('emits CSS-only decoration only for components that support the selected style', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            cssDecoration: 'underline',
            cssDecorationTargets:
              'Button,IconButton,SelectableButton,SelectableIconButton,SelectableSingleTextButton,SingleTextButton,Chip,Input,Badge,CounterBadge',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain(
      '--Button-cssDecorationUnderlineWidth: var(--Button-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain('--Button-cssDecorationStrokeWidth: var(--Stroke-L);');
    expect(css).toContain('--Button-cssDecorationStrokeStyle: solid;');
    expect(css).toContain(
      '--IconButton-cssDecorationUnderlineWidth: var(--IconButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--Chip-cssDecorationUnderlineWidth: var(--Chip-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--SelectableButton-cssDecorationUnderlineWidth: var(--SelectableButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--SelectableIconButton-cssDecorationUnderlineWidth: var(--SelectableIconButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--SelectableSingleTextButton-cssDecorationUnderlineWidth: var(--SelectableSingleTextButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--SingleTextButton-cssDecorationUnderlineWidth: var(--SingleTextButton-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--Badge-cssDecorationUnderlineWidth: var(--Badge-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain(
      '--CounterBadge-cssDecorationUnderlineWidth: var(--CounterBadge-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).not.toContain('--FAB-cssDecorationUnderlineWidth');
    expect(css).not.toContain('--Input-cssDecorationUnderlineWidth');
  });

  it('defaults CSS-only action decoration to Button when no targets are selected', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            cssDecoration: 'inset-stroke',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain(
      '--Button-cssDecorationInsetStrokeWidth: var(--Button-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).not.toContain(
      '--IconButton-cssDecorationInsetStrokeWidth: var(--IconButton-cssDecorationStrokeWidth'
    );
    expect(css).not.toContain(
      '--Chip-cssDecorationInsetStrokeWidth: var(--Chip-cssDecorationStrokeWidth'
    );
    expect(css).not.toContain(
      '--SelectableButton-cssDecorationInsetStrokeWidth: var(--SelectableButton-cssDecorationStrokeWidth'
    );
    expect(css).not.toContain(
      '--Input-cssDecorationInsetStrokeWidth: var(--Input-cssDecorationStrokeWidth'
    );
    expect(css).not.toContain(
      '--Badge-cssDecorationInsetStrokeWidth: var(--Badge-cssDecorationStrokeWidth'
    );
  });

  it('emits CSS-only decoration stroke and corner controls per selected target', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            cssDecoration: 'cut-corner',
            cssDecorationTargets: 'Chip',
            cssDecorationStrokeWidth: 'Stroke-3XL',
            cssDecorationStrokeStyle: 'dashed',
            cssDecorationCornerSize: 'deep',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Chip-cssDecorationStrokeWidth: var(--Stroke-3XL);');
    expect(css).toContain('--Chip-cssDecorationStrokeStyle: dashed;');
    expect(css).toContain('--Chip-cssDecorationCornerSize: var(--Spacing-6);');
    expect(css).toContain(
      '--Chip-cssDecorationInsetStrokeWidth: var(--Chip-cssDecorationStrokeWidth, var(--Stroke-L));'
    );
    expect(css).toContain('--Chip-cssDecorationClipPath: polygon(var(--Chip-cssDecorationCornerSize, var(--Spacing-2)) 0');
    expect(css).toContain('--Button-cssDecorationClipPath: none;');
    expect(css).toContain('--IconButton-cssDecorationClipPath: none;');
    expect(css).not.toContain('--Button-cssDecorationClipPath: polygon');
    expect(css).not.toContain('--IconButton-cssDecorationClipPath: polygon');
  });

  it('keeps legacy CSS-only decoration weight selections mapped to stroke tokens', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            cssDecoration: 'inset-stroke',
            cssDecorationWeight: 'strong',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-cssDecorationStrokeWidth: var(--Stroke-XL);');
    expect(css).toContain('--Button-cssDecorationStrokeStyle: solid;');
  });

  it('keeps platform chrome shape wired to component override variables', () => {
    const files = [
      '../../components/Platform/SecondaryNav/SecondaryNav.module.css',
      '../../components/Platform/ModeNav/ModeNav.module.css',
      '../../components/Platform/TopBar/TopBar.module.css',
      '../../components/Platform/TopBar/PlatformSelector.module.css',
      '../../components/Platform/TopBar/ComponentPlatformSelector.module.css',
      '../../components/Platform/BrandPicker/BrandPicker.module.css',
      '../../components/BottomNavigation/BottomNavigation.module.css',
      '../../components/ToggleGroup/ToggleGroup.module.css',
      '../../components/Select/Select.module.css',
    ].map((file) => readFileSync(resolve(__dirname, file), 'utf8'));

    expect(files.join('\n')).toContain('--SelectableButton-borderRadius');
    expect(files.join('\n')).toContain('--Button-borderRadius');
    expect(files.join('\n')).toContain('--IconButton-borderRadius');
    expect(files.join('\n')).toContain('--BottomNavigation-itemBorderRadius');
    expect(files.join('\n')).toContain('--ToggleGroup-borderRadius');
    expect(files.join('\n')).toContain('--Select-borderRadius');
    expect(files.join('\n')).toContain('--Input-borderRadius');
  });

  it('keeps tonal/quiet emphasis values resolvable at the brand scope', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            emphasisStyle: 'tonal',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain(
      '--Button-backgroundColor-bold: var(--Button-roleSubtle-bold, var(--_btn-subtle));',
    );
    expect(css).toContain(
      '--Button-backgroundColor-bold-hover: var(--Button-roleSubtleHover-bold, var(--_btn-subtle-hover));',
    );
    expect(css).toContain(
      '--Button-backgroundColor-bold-pressed: var(--Button-roleSubtlePressed-bold, var(--_btn-subtle-pressed));',
    );
    expect(css).toContain(
      '--Button-textColor-bold: var(--Button-roleTintedA11y-bold, var(--_btn-default-accent-a11y));',
    );
    expect(css).toContain('var(--_btn-');
    expect(css).not.toContain('var(--_ib-');
  });

  it('emits outline-compatible quiet action state fills', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            emphasisStyle: 'quiet',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-backgroundColor-bold: transparent;');
    expect(css).toContain(
      '--Button-backgroundColor-bold-hover: var(--Button-roleHover-bold, var(--_btn-default-hover));'
    );
    expect(css).toContain(
      '--Button-backgroundColor-bold-pressed: var(--Button-rolePressed-bold, var(--_btn-default-pressed));'
    );
    expect(css).toContain('--IconButton-backgroundColor-bold: transparent;');
    expect(css).toContain(
      '--IconButton-backgroundColor-bold-hover: var(--IconButton-roleHover-bold, var(--IconButton-roleHover, var(--Primary-Hover)));'
    );
    expect(css).toContain(
      '--IconButton-backgroundColor-bold-pressed: var(--IconButton-rolePressed-bold, var(--IconButton-rolePressed, var(--Primary-Pressed)));'
    );
    expect(css).not.toContain('--Button-backgroundColor-bold-hover: var(--Button-roleBoldHover');
    expect(css).not.toContain('--Button-backgroundColor-bold-pressed: var(--Button-roleBoldPressed');
    expect(css).not.toContain('--IconButton-backgroundColor-bold-hover: var(--IconButton-roleBoldHover');
    expect(css).not.toContain('--IconButton-backgroundColor-bold-pressed: var(--IconButton-roleBoldPressed');
  });

  it('emits family default appearance role slots for actions, selection, and inputs', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            defaultAppearance: 'secondary',
          },
        },
        {
          familyId: 'selection',
          selections: {
            defaultAppearance: 'secondary',
          },
        },
        {
          familyId: 'inputs',
          selections: {
            defaultAppearance: 'secondary',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Button-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--IconButton-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--IconButton-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--FAB-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--FAB-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Chip-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Chip-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--SelectableButton-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--SelectableButton-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--SelectableIconButton-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--SelectableIconButton-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--SelectableSingleTextButton-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--SelectableSingleTextButton-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Input-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Input-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Checkbox-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Checkbox-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Radio-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Radio-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Switch-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Switch-roleBoldHigh: var(--Secondary-Bold-High);');
    expect(css).toContain('--Stepper-roleBold: var(--Secondary-Bold);');
    expect(css).toContain('--Stepper-roleBoldHigh: var(--Secondary-Bold-High);');
  });

  it('keeps on-bold high CSS fallbacks aligned with Bold-High token semantics', () => {
    const onBoldHighCssFiles = [
      '../../components/Button/Button.module.css',
      '../../components/IconButton/IconButton.module.css',
      '../../components/FAB/FAB.module.css',
      '../../components/Chip/Chip.module.css',
      '../../components/SelectableButton/SelectableButton.module.css',
      '../../components/SelectableIconButton/SelectableIconButton.module.css',
      '../../components/SelectableSingleTextButton/SelectableSingleTextButton.module.css',
      '../../components/SingleTextButton/SingleTextButton.module.css',
      '../../components/Stepper/Stepper.module.css',
      '../../components/Badge/Badge.module.css',
      '../../components/CounterBadge/CounterBadge.module.css',
      '../../components/IconContained/IconContained.module.css',
      '../../components/ListItem/ListItem.module.css',
      '../../components/Pagination/PaginationItemPage.module.css',
      '../../components/Checkbox/Checkbox.module.css',
      '../../components/Radio/Radio.module.css',
      '../../components/Switch/Switch.module.css',
      '../../components/TouchSlider/TouchSlider.module.css',
    ];

    for (const file of onBoldHighCssFiles) {
      const css = readFileSync(resolve(__dirname, file), 'utf8');

      expect(css, file).not.toMatch(
        /var\(--([A-Za-z]+(?:-[A-Za-z]+)*)-Bold-High,\s*var\(--\1-Bold-TintedA11y/
      );
    }

    const buttonCss = readFileSync(
      resolve(__dirname, '../../components/Button/Button.module.css'),
      'utf8'
    );

    expect(buttonCss).toMatch(
      /var\(--Primary-Bold-TintedA11y,\s*var\(--Primary-Bold-High/
    );
  });

  it('scopes component CSS for docs pages without relying on inline manifest defaults', () => {
    const css = buildAllComponentCSS(
      {
        componentThemeSelections: [
          {
            familyId: 'selection',
            selections: {
              defaultAppearance: 'secondary',
            },
          },
        ],
        recipeSelections: [],
        tokenOverrides: [],
      },
      { selector: '[data-component-brand-scope]' }
    );
    const switchPage = readFileSync(
      resolve(
        __dirname,
        '../../../../../apps/platform/src/app/(platform)/(studio)/components/switch/SwitchPageContent.tsx'
      ),
      'utf8'
    );

    expect(css).toContain('[data-component-brand-scope]');
    expect(css).toContain('--Switch-roleBold: var(--Secondary-Bold);');
    expect(switchPage).not.toContain('expandManifestDefaults');
    expect(switchPage).not.toContain('manifestDefaults');
    expect(switchPage).toContain('const previewTokenStyles = overrideStyles;');
  });

  it('drops unknown override tokens except explicit component theme role slots', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            defaultAppearance: 'secondary',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [
        {
          componentName: 'button',
          tokenName: 'notInManifest',
          value: 'Shape-Pill',
        },
      ],
    });

    expect(css).toContain('--Button-roleBold: var(--Secondary-Bold);');
    expect(css).not.toContain('--Button-notInManifest');
  });

  it('makes roomy control scale larger than component defaults', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'actions',
          selections: {
            controlScale: 'roomy',
          },
        },
        {
          familyId: 'selection',
          selections: {
            controlScale: 'roomy',
          },
        },
        {
          familyId: 'inputs',
          selections: {
            controlScale: 'roomy',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Button-minHeight-10: var(--Spacing-12);');
    expect(css).toContain('--Button-paddingHorizontal-10: var(--Spacing-6);');
    expect(css).toContain('--Input-height-10: var(--Spacing-12);');
    expect(css).toContain('--Input-paddingHorizontal-10: var(--Spacing-4-5);');
    expect(css).toContain('--Checkbox-boxSize-m: var(--Spacing-6);');
    expect(css).toContain('--Radio-boxSize-m: var(--Spacing-6);');
    expect(css).toContain('--Radio-dotSize-m: var(--Spacing-3);');
    expect(css).toContain('--Switch-trackWidth-m: var(--Spacing-10);');
    expect(css).toContain('--Switch-knobSize-m: var(--Spacing-5);');
    expect(css).toContain('--Stepper-height-m: var(--Spacing-10);');
    expect(css).toContain('--Stepper-buttonSize-m: var(--Spacing-10);');
    expect(css).toContain('--Stepper-iconSize-m: var(--Spacing-6);');
  });

  it('applies display family shape and text-case across badges, counter, indicator, slider, and pagination dots', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'display',
          selections: {
            shapeLanguage: 'sharp',
            textCase: 'uppercase',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Badge-borderRadius: var(--Shape-0);');
    expect(css).toContain('--CounterBadge-borderRadius: var(--Shape-0);');
    expect(css).toContain('--IndicatorBadge-borderRadius: var(--Shape-0);');
    expect(css).toContain('--Slider-trackBorderRadius: var(--Shape-0);');
    expect(css).toContain('--Slider-knobBorderRadius: var(--Shape-0);');
    expect(css).toContain('--PaginationDots-borderRadius: var(--Shape-0);');
    expect(css).toContain('--PaginationDots-motionEasing: var(--Motion-Easing-Transition-Moderate);');
    expect(css).toContain('--Badge-textTransform: uppercase;');
    expect(css).toContain('--Badge-letterSpacing: 0.05em;');
    expect(css).toContain('--CounterBadge-textTransform: uppercase;');
  });

  it('applies input and selection family shapes to fields and selection controls', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'inputs',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
        {
          familyId: 'selection',
          selections: {
            shapeLanguage: 'sharp',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Input-borderRadius-10: var(--Shape-0);');
    expect(css.match(/--Input-borderRadius-10:/g)).toHaveLength(1);
    expect(css).toContain('--Checkbox-borderRadius-m: var(--Shape-0);');
    expect(css).toContain('--Radio-borderRadius-m: var(--Shape-0);');
    expect(css).toContain('--Radio-dotBorderRadius-m: max(var(--Spacing-0), calc(var(--Radio-borderRadius-m');
    expect(css).toContain('--Switch-borderRadius: var(--Shape-0);');
    expect(css).toContain('--Switch-thumbBorderRadius: var(--Shape-0);');
    expect(css).not.toContain('--Switch-thumbBorderRadius: max(var(--Spacing-0), calc(var(--Switch-borderRadius');
  });

  it('keeps Checkbox rounded shape squarer than Radio rounded shape', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'selection',
          selections: {
            shapeLanguage: 'rounded',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Checkbox-borderRadius-m: var(--Shape-1-5);');
    expect(css).toContain('--Checkbox-borderRadius-l: var(--Shape-2);');
    expect(css).toContain('--Radio-borderRadius-m: var(--Shape-2);');
    expect(css).toContain('--Radio-dotBorderRadius-m: max(var(--Spacing-0), calc(var(--Radio-borderRadius-m');
  });

  it('keeps Switch track and thumb shapes consistent for rounded selection themes', () => {
    const css = buildAllComponentCSS({
      componentThemeSelections: [
        {
          familyId: 'selection',
          selections: {
            shapeLanguage: 'rounded',
          },
        },
      ],
      recipeSelections: [],
      tokenOverrides: [],
    });

    expect(css).toContain('--Switch-borderRadius: var(--Shape-3);');
    expect(css).toContain('--Switch-thumbBorderRadius: var(--Shape-3);');
    expect(css).not.toContain('--Switch-thumbBorderRadius: max(');
  });
});
