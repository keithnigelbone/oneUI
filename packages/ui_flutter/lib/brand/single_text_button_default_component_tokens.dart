/// Flutter-maintained `--SingleTextButton-*` manifest defaults for Storybook /
/// unbranded merge (`mergeComponentTokenManifestFallback`).
///
/// Mirrors web `SingleTextButton.module.css` + `SingleTextButton.tokens.ts` without
/// requiring React `componentDesignRegistry` entries. CSS uses `minHeight` /
/// `padding`; the TS manifest emits `height` / `paddingHorizontal` — both aliases
/// are listed so Convex partial snapshots still resolve.
const Map<String, String> kSingleTextButtonDefaultComponentTokenProperties = {
  '--SingleTextButton-borderRadius': 'var(--Shape-Pill)',
  '--SingleTextButton-fontFamily': 'var(--Label-FontFamily)',
  '--SingleTextButton-fontSize': 'var(--Label-M-FontSize)',
  '--SingleTextButton-fontSize-s': 'var(--Label-S-FontSize)',
  '--SingleTextButton-fontSize-m': 'var(--Label-M-FontSize)',
  '--SingleTextButton-fontSize-l': 'var(--Label-L-FontSize)',
  '--SingleTextButton-fontWeight': 'var(--Label-FontWeight-High)',
  '--SingleTextButton-lineHeight': 'var(--Label-M-LineHeight)',
  '--SingleTextButton-lineHeight-s': 'var(--Label-S-LineHeight)',
  '--SingleTextButton-lineHeight-m': 'var(--Label-M-LineHeight)',
  '--SingleTextButton-lineHeight-l': 'var(--Label-L-LineHeight)',
  '--SingleTextButton-textTransform': 'none',
  '--SingleTextButton-letterSpacing': 'normal',
  '--SingleTextButton-minHeight': 'var(--Spacing-10)',
  '--SingleTextButton-minHeight-s': 'var(--Spacing-8)',
  '--SingleTextButton-minHeight-m': 'var(--Spacing-10)',
  '--SingleTextButton-minHeight-l': 'var(--Spacing-12)',
  '--SingleTextButton-height': 'var(--Spacing-10)',
  '--SingleTextButton-height-s': 'var(--Spacing-8)',
  '--SingleTextButton-height-m': 'var(--Spacing-10)',
  '--SingleTextButton-height-l': 'var(--Spacing-12)',
  '--SingleTextButton-padding': 'var(--Spacing-1)',
  '--SingleTextButton-padding-s': 'var(--Spacing-0-5)',
  '--SingleTextButton-padding-m': 'var(--Spacing-1)',
  '--SingleTextButton-padding-l': 'var(--Spacing-2)',
  '--SingleTextButton-paddingHorizontal': 'var(--Spacing-1)',
  '--SingleTextButton-paddingHorizontal-s': 'var(--Spacing-0-5)',
  '--SingleTextButton-paddingHorizontal-m': 'var(--Spacing-1)',
  '--SingleTextButton-paddingHorizontal-l': 'var(--Spacing-2)',
  '--SingleTextButton-transitionDuration': 'var(--Motion-Duration-M)',
  '--SingleTextButton-transitionEasing': 'var(--Motion-Easing-Transition-Moderate)',
  '--SingleTextButton-cssDecorationClipPath': 'none',
  '--SingleTextButton-cssDecorationColor': 'currentColor',
  '--SingleTextButton-cssDecorationInsetStrokeWidth': 'var(--Spacing-0)',
  '--SingleTextButton-cssDecorationStrokeStyle': 'solid',
  '--SingleTextButton-cssDecorationStrokeWidth': 'var(--Stroke-L)',
  '--SingleTextButton-cssDecorationUnderlineWidth': 'var(--Spacing-0)',
};
