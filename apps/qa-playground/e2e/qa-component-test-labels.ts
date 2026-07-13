/**
 * Playwright test titles: describe what each test *does* (action + scope).
 * Outcomes are asserted in code; bug ids use qaAnnotate() for the dashboard.
 */

export type QaBandLabel = { id: string; title: string };

function wcagBand(label: string): string {
  return `WCAG 2.1 AA axe scan — ${label} band`;
}

// —— Icon Button ——
export const ICON_BUTTON_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'icon-button-qa-default', title: wcagBand('Default') },
  { id: 'icon-button-qa-size', title: wcagBand('Size (2XS–XL)') },
  { id: 'icon-button-qa-attention', title: wcagBand('Attention (high · medium · low)') },
  { id: 'icon-button-qa-appearance', title: wcagBand('Appearance (colour roles)') },
  { id: 'icon-button-qa-layout', title: wcagBand('Layout (1:1 · 3:2 · full width)') },
  { id: 'icon-button-qa-condensed', title: wcagBand('Condensed') },
  { id: 'icon-button-qa-states', title: wcagBand('Disabled and loading') },
  { id: 'icon-button-qa-interaction', title: wcagBand('Interaction') },
  { id: 'icon-button-qa-surface', title: wcagBand('Surface context') },
  { id: 'icon-button-qa-edge', title: wcagBand('Edge (invalid size)') },
] as const;

export const ICON_BUTTON_BUG_BAND = 'icon-button-qa-bug-repro' as const;
export const ICON_BUTTON_BUG_AXE_TEST = wcagBand('icon-only, no aria-label');
export const ICON_BUTTON_BUG_ID = 'BUG-ICONBUTTON-001' as const;
export const ICON_BUTTON_UNLABELLED_ACCESSIBLE_NAME_TEST =
  'Unlabelled icon button must expose accessible name';

export const ICON_BUTTON_WCAG_PAGE_TEST =
  'WCAG 2.1 AA tag scan + JSON artefact + HTML report (exclude unlabelled band)';
export const ICON_BUTTON_SECTION508_TEST =
  'Section 508 tag run on story bands (exclude unlabelled band)';
export const ICON_BUTTON_BUTTON_NAME_TEST =
  'axe button-name rule — Test Scenarios page (exclude unlabelled band)';
export const ICON_BUTTON_COLOR_CONTRAST_TEST = 'axe color-contrast rule — appearance band';
export const ICON_BUTTON_KEYBOARD_ENTER_TEST = 'Keyboard Enter — interactive icon button';
export const ICON_BUTTON_FIGMA_WCAG_TEST =
  'WCAG 2.1 AA axe scan — Figma size×attention and master matrix grids';

// —— Icon Contained ——
export const ICON_CONTAINED_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'icon-contained-qa-default', title: wcagBand('Default') },
  { id: 'icon-contained-qa-size', title: wcagBand('Size (XS–XL)') },
  { id: 'icon-contained-qa-attention', title: wcagBand('Attention') },
  { id: 'icon-contained-qa-appearance', title: wcagBand('Appearance (colour roles)') },
  { id: 'icon-contained-qa-a11y', title: wcagBand('Accessibility (labelled vs decorative)') },
  { id: 'icon-contained-qa-bug-repro', title: wcagBand('Decorative (no aria-label)') },
  { id: 'icon-contained-qa-disabled', title: wcagBand('Disabled') },
  { id: 'icon-contained-qa-surface', title: wcagBand('Surface context') },
] as const;

export const ICON_CONTAINED_DECORATIVE_BAND = 'icon-contained-qa-bug-repro' as const;
/** @deprecated Use {@link ICON_CONTAINED_DECORATIVE_BAND}. */
export const ICON_CONTAINED_BUG_BAND = ICON_CONTAINED_DECORATIVE_BAND;
export const ICON_CONTAINED_DECORATIVE_AXE_TEST = wcagBand('decorative band (no aria-label)');
/** @deprecated Use {@link ICON_CONTAINED_DECORATIVE_AXE_TEST}. */
export const ICON_CONTAINED_BUG_AXE_TEST = ICON_CONTAINED_DECORATIVE_AXE_TEST;
export const ICON_CONTAINED_DECORATIVE_A11Y_TEST =
  'Decorative icon is aria-hidden and not exposed as role=img';
/** @deprecated Use {@link ICON_CONTAINED_DECORATIVE_A11Y_TEST}. */
export const ICON_CONTAINED_UNLABELLED_ACCESSIBLE_NAME_TEST = ICON_CONTAINED_DECORATIVE_A11Y_TEST;

export const ICON_CONTAINED_COLOR_CONTRAST_TEST = 'axe color-contrast rule — appearance band';
export const ICON_CONTAINED_COLOR_CONTRAST_EACH_APPEARANCE_TEST =
  'axe color-contrast rule — each appearance cell';
export const ICON_CONTAINED_FIGMA_WCAG_TEST = 'WCAG 2.1 AA axe scan — Figma size×attention grid';
export const ICON_CONTAINED_ROLE_IMG_ALT_TEST = 'role-img-alt rule — default labelled icon';
export const ICON_CONTAINED_ARIA_VALIDITY_BAND_TEST = 'ARIA validity rules — accessibility band';
export const ICON_CONTAINED_SVG_DECORATIVE_SCAN_TEST =
  'Inner SVG aria-hidden on labelled IconContained icons';
export const ICON_CONTAINED_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const ICON_CONTAINED_ACCESSIBLE_NAME_DEFAULT_TEST =
  'Default IconContained exposes accessible name “Heart”';
export const ICON_CONTAINED_ACCESSIBLE_NAME_LABELLED_TEST =
  'Accessibility band labelled icon exposes accessible name “Favourited”';

// —— Image ——
export const IMAGE_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'image-qa-default', title: wcagBand('Default') },
  { id: 'image-qa-aspect', title: wcagBand('Aspect ratio') },
  { id: 'image-qa-fit', title: wcagBand('Object fit') },
  { id: 'image-qa-interactive', title: wcagBand('Interactive') },
  { id: 'image-qa-fallback', title: wcagBand('Fallback') },
  { id: 'image-qa-loading', title: wcagBand('Loading (lazy · eager)') },
  { id: 'image-qa-a11y', title: wcagBand('Labelled alt text') },
  { id: 'image-qa-radius', title: wcagBand('Radius override') },
] as const;

export const IMAGE_BUG_BAND = 'image-qa-bug-repro' as const;
export const IMAGE_BUG_ROLE_TEST =
  'Interactive disabled image renders as a disabled button';
export const IMAGE_BUG_AXE_TEST = wcagBand('bug repro (interactive + disabled)');
export const IMAGE_BUG_ID = 'BUG-IMAGE-001' as const;
export const IMAGE_INTERACTIVE_DISABLED_BEHAVIOR_TEST =
  'Interactive + disabled must not behave as enabled button';

export const IMAGE_FALLBACK_CONTRAST_TEST =
  'axe color-contrast rule — fallback band (after broken image)';
export const IMAGE_IMAGE_ALT_TEST =
  'axe image-alt rule — Test Scenarios page (exclude bug repro band)';
export const IMAGE_KEYBOARD_ENTER_TEST = 'Keyboard Enter — interactive image';
export const IMAGE_KEYBOARD_SPACE_TEST = 'Keyboard Space — interactive image';
export const IMAGE_FIGMA_WCAG_TEST = 'WCAG 2.1 AA axe scan — Figma aspect-ratio grid';
export const IMAGE_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const IMAGE_ACCESSIBLE_NAME_LABELLED_TEST =
  'Accessibility band labelled image exposes aria-label “Taj Mahal at sunrise”';

// —— Input ——
export const INPUT_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'input-qa-default', title: wcagBand('Default') },
  { id: 'input-qa-placeholder', title: wcagBand('Placeholder') },
  { id: 'input-qa-size', title: wcagBand('Size (S · M · L · XS)') },
  { id: 'input-qa-attention', title: wcagBand('Attention') },
  { id: 'input-qa-appearance', title: wcagBand('Appearance (colour roles)') },
  { id: 'input-qa-shape', title: wcagBand('Shape') },
  { id: 'input-qa-states', title: wcagBand('States (idle · filled · readonly · disabled · feedback)') },
  { id: 'input-qa-adornments', title: wcagBand('Adornments') },
  { id: 'input-qa-slots', title: wcagBand('Start/end slots') },
  { id: 'input-qa-types', title: wcagBand('HTML input types') },
  { id: 'input-qa-validation', title: wcagBand('Validation (max length · pattern)') },
  { id: 'input-qa-layout', title: wcagBand('Layout (full width · autoFocus)') },
  { id: 'input-qa-labeled', title: wcagBand('Label association') },
  { id: 'input-qa-combos', title: wcagBand('Figma combination matrix') },
] as const;

export const INPUT_LABEL_RULE_TEST = 'axe label rule — Test Scenarios page';
export const INPUT_COLOR_CONTRAST_TEST = 'axe color-contrast rule — Test Scenarios page';
export const INPUT_ARIA_VALIDITY_TEST = 'ARIA validity rules — Test Scenarios page';
export const INPUT_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const INPUT_ACCESSIBLE_NAME_LABELED_TEST =
  'Labeled input exposes accessible name matching visible label “Email”';
export const INPUT_FEEDBACK_SHELL_INVALID_TEST =
  'Feedback state shell exposes data-invalid for error styling';
export const INPUT_FEEDBACK_ARIA_INVALID_TEST =
  'BUG-INPUT-001 — feedback state control exposes aria-invalid="true"';
export const INPUT_BUG_ID = 'BUG-INPUT-001' as const;

// —— Input Dynamic Text ——
export const IDT_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'idt-qa-default', title: wcagBand('Default') },
  { id: 'idt-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'idt-qa-content-end', title: wcagBand('Content × end slots') },
  { id: 'idt-qa-states', title: wcagBand('States & behaviour') },
  { id: 'idt-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const IDT_COLOR_CONTRAST_TEST = 'axe color-contrast rule — Test Scenarios story bands';
export const IDT_ARIA_VALIDITY_TEST = 'ARIA validity rules — Test Scenarios story bands';
export const IDT_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const IDT_END_ARIA_LABEL_TEST =
  'endAriaLabel override exposes accessible name on trailing button';
export const IDT_BUG_ID = 'BUG-IDT-001' as const;
export const IDT_DISABLED_CONTRAST_TEST =
  'axe color-contrast rule — disabled row (idt-disabled) must meet WCAG AA';

// —— Single text button ——
export const SINGLE_TEXT_BUTTON_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'single-text-button-qa-default', title: wcagBand('Default') },
  { id: 'single-text-button-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'single-text-button-qa-attention', title: wcagBand('Attention') },
  { id: 'single-text-button-qa-condensed', title: wcagBand('Condensed') },
  { id: 'single-text-button-qa-states', title: wcagBand('Disabled and loading') },
  { id: 'single-text-button-qa-interaction', title: wcagBand('Interaction') },
  { id: 'single-text-button-qa-edge', title: wcagBand('Edge (long label)') },
] as const;

export const SINGLE_TEXT_BUTTON_BUG_BAND = 'single-text-button-qa-bug-repro' as const;
export const SINGLE_TEXT_BUTTON_BUG_AXE_TEST = wcagBand(
  'bug repro (loading, no aria-label on button)',
);
export const SINGLE_TEXT_BUTTON_BUG_ID = 'BUG-SINGLETEXT-001' as const;

export const SINGLE_TEXT_BUTTON_BUTTON_NAME_TEST =
  'axe button-name rule — Test Scenarios page (exclude bug repro band)';
export const SINGLE_TEXT_BUTTON_LOADING_NAME_TEST =
  'Accessible name readout — loading button with aria-label';
export const SINGLE_TEXT_BUTTON_KEYBOARD_SPACE_TEST =
  'Keyboard Space — interactive text button';
export const SINGLE_TEXT_BUTTON_FIGMA_WCAG_TEST =
  'WCAG 2.1 AA axe scan — Figma size×attention and condensed grids';

export const STB_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const STB_COLOR_CONTRAST_TEST = 'color-contrast — attention band, zero serious/critical';
export const STB_ARIA_VALIDITY_TEST = 'ARIA validity — showcase bands, zero serious/critical';
export const STB_PAGE_LANG_TEST = 'page lang on <html>';
export const STB_ROUTE_TEST = 'playground route responds';

// —— Selectable Single Text Button ——
export const SSTB_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'default', title: wcagBand('Default') },
  { id: 'size', title: wcagBand('Size (S · M · L)') },
  { id: 'attention', title: wcagBand('Attention (high · medium · low)') },
  { id: 'appearance', title: wcagBand('Appearance (auto + 8 roles)') },
  { id: 'condensed', title: wcagBand('Condensed') },
  { id: 'disabled', title: wcagBand('Disabled') },
  { id: 'loading', title: wcagBand('Loading') },
  { id: 'accent', title: wcagBand('Accent (documentation only)') },
  { id: 'content', title: wcagBand('Content (text vs spinner)') },
  { id: 'size-appearance-matrix', title: wcagBand('Size × appearance matrix') },
  { id: 'size-attention-matrix', title: wcagBand('Size × attention matrix') },
  { id: 'attention-appearance-matrix', title: wcagBand('Attention × appearance matrix') },
  { id: 'condensed-size', title: wcagBand('Condensed × size matrix') },
  { id: 'combinations', title: wcagBand('Key combinations') },
  { id: 'accent-appearance-matrix', title: wcagBand('Accent × appearance (documentation only)') },
  { id: 'content-loading', title: wcagBand('Content × loading dependency') },
] as const;

export const SSTB_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const SSTB_COLOR_CONTRAST_TEST = 'color-contrast — appearance band, zero serious/critical';
export const SSTB_ARIA_VALIDITY_TEST = 'ARIA validity — showcase bands, zero serious/critical';
export const SSTB_PAGE_LANG_TEST = 'page lang on <html>';
export const SSTB_ROUTE_TEST = 'playground route responds';

// —— Selectable button ——
export const SELECTABLE_BUTTON_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'selectable-button-qa-default', title: wcagBand('Default') },
  { id: 'selectable-button-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'selectable-button-qa-elevation', title: wcagBand('Elevation / attention') },
  { id: 'selectable-button-qa-contained', title: wcagBand('Contained and inline') },
  { id: 'selectable-button-qa-icons', title: wcagBand('Start and end icons') },
  { id: 'selectable-button-qa-toggle', title: wcagBand('Toggle') },
  { id: 'selectable-button-qa-states', title: wcagBand('Disabled and loading') },
] as const;

export const SELECTABLE_BUTTON_BUTTON_NAME_TEST =
  'axe button-name rule — Test Scenarios page';
export const SELECTABLE_BUTTON_COLOR_CONTRAST_TEST =
  'axe color-contrast rule — elevation band';
export const SELECTABLE_BUTTON_TOGGLE_KEYBOARD_TEST =
  'Keyboard Space and aria-pressed — toggle button';
export const SELECTABLE_BUTTON_FIGMA_WCAG_TEST =
  'WCAG 2.1 AA axe scan — Figma validation grid';
export const SELECTABLE_BUTTON_WCAG_PAGE_TEST =
  'WCAG 2.1 AA tag scan — Test Scenarios story bands + JSON artefact';

// —— Selectable Icon Button ——
export const SIB_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'size', title: wcagBand('Size (2XS · XS · S · M · L · XL)') },
  { id: 'attention', title: wcagBand('Attention (high · medium · low)') },
  { id: 'shape', title: wcagBand('Shape (1:1 · 2:3)') },
  { id: 'appearance', title: wcagBand('Appearance (auto + 8 roles)') },
  { id: 'selected', title: wcagBand('Selected (false · true)') },
  { id: 'condensed-contained', title: wcagBand('Condensed × contained dependency') },
  { id: 'fullwidth-contained', title: wcagBand('fullWidth × contained dependency') },
  { id: 'disabled', title: wcagBand('Disabled') },
  { id: 'loading', title: wcagBand('Loading') },
  { id: 'accent', title: wcagBand('Accent (code-only demo)') },
  { id: 'content', title: wcagBand('Content (icon vs spinner)') },
  { id: 'size-appearance-matrix', title: wcagBand('Size × appearance matrix') },
  { id: 'size-selected-matrix', title: wcagBand('Size × selected matrix') },
  { id: 'attention-appearance-matrix', title: wcagBand('Attention × appearance matrix') },
  { id: 'combinations', title: wcagBand('Key combinations') },
] as const;

export const SIB_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const SIB_COLOR_CONTRAST_TEST = 'color-contrast — appearance band, zero serious/critical';
export const SIB_ARIA_VALIDITY_TEST = 'ARIA validity — zero serious/critical';
export const SIB_PAGE_LANG_TEST = 'page lang on <html>';
export const SIB_ROUTE_TEST = 'playground route responds';

// —— Icon (primitive) ——
export const ICON_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'icon-qa-default', title: wcagBand('Default') },
  { id: 'icon-qa-size', title: wcagBand('Size') },
  { id: 'icon-qa-appearance', title: wcagBand('Appearance') },
  { id: 'icon-qa-emphasis', title: wcagBand('Emphasis') },
  { id: 'icon-qa-a11y', title: wcagBand('Accessibility') },
  { id: 'icon-qa-react-element', title: wcagBand('React element slot') },
  { id: 'icon-qa-surface-context', title: wcagBand('Surface context') },
  { id: 'icon-qa-icon-names', title: wcagBand('Semantic icon names') },
  { id: 'icon-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const ICON_APPEARANCE_CONTRAST_IDS = [
  'icon-appearance-neutral-high',
  'icon-appearance-primary-high',
  'icon-appearance-secondary-high',
  'icon-appearance-sparkle-high',
  'icon-appearance-negative-high',
  'icon-appearance-positive-high',
  'icon-appearance-warning-high',
  'icon-appearance-informative-high',
] as const;

export const ICON_COLOR_CONTRAST_EACH_APPEARANCE_TEST =
  'axe color-contrast rule — each appearance high-emphasis cell';
export const ICON_ARIA_VALIDITY_BAND_TEST = 'axe ARIA validity rules — accessibility band';
export const ICON_SVG_DECORATIVE_SCAN_TEST =
  'DOM scan — SVG nodes inside showcase bands (label, hidden, role, or title)';
export const ICON_REFLOW_320_TEST = 'Viewport 320px — horizontal overflow check per showcase band';
export const ICON_ACCESSIBLE_NAME_DEFAULT_TEST =
  'Accessible name readout — default labelled icon';
export const ICON_ARIA_HIDDEN_DECORATIVE_TEST =
  'DOM inspection — decorative icon aria-hidden on root';
export const ICON_ACCESSIBLE_NAME_LABELLED_TEST =
  'Accessible name readout — labelled accessibility demo icon';

// —— Slider ——
export const SLIDER_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'slider-qa-default', title: wcagBand('Default') },
  { id: 'slider-qa-type', title: wcagBand('Type (continuous · range)') },
  { id: 'slider-qa-knob-style', title: wcagBand('Knob style') },
  { id: 'slider-qa-appearance', title: wcagBand('Appearance') },
  { id: 'slider-qa-steps', title: wcagBand('Steps') },
  { id: 'slider-qa-start-end', title: wcagBand('Start / end slots') },
  { id: 'slider-qa-value', title: wcagBand('Controlled value') },
  { id: 'slider-qa-extra-states', title: wcagBand('Disabled · read-only · vertical · tooltip') },
  { id: 'slider-qa-surface-context', title: wcagBand('Surface context') },
  { id: 'slider-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const SLIDER_APPEARANCE_CONTRAST_IDS = [
  'slider-appearance-auto',
  'slider-appearance-neutral',
  'slider-appearance-primary',
  'slider-appearance-secondary',
  'slider-appearance-sparkle',
  'slider-appearance-negative',
  'slider-appearance-positive',
  'slider-appearance-warning',
  'slider-appearance-informative',
  'slider-appearance-brand-bg',
] as const;

export const SLIDER_COLOR_CONTRAST_EACH_APPEARANCE_TEST =
  'axe color-contrast rule — each appearance row cell';
export const SLIDER_ALL_THUMBS_NAMED_TEST =
  'Accessible name readout — every slider thumb in showcase';
export const SLIDER_DEFAULT_RANGE_ATTRS_TEST =
  'DOM inspection — default slider min, max, aria-valuenow';
export const SLIDER_RANGE_TYPE_THUMBS_TEST =
  'DOM inspection — range type min and max thumb names and values';
export const SLIDER_KEYBOARD_DEFAULT_TEST = 'Keyboard arrows — default slider value change';
export const SLIDER_KEYBOARD_HOME_END_TEST = 'Keyboard Home and End — default slider';
export const SLIDER_DISABLED_KEYBOARD_TEST =
  'Keyboard ArrowRight — disabled slider (value must not change)';
export const SLIDER_SLOT_BUTTON_NAMES_TEST =
  'Accessible name readout — Decrease and Increase IconButtons on default slider';
export const SLIDER_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band (except default)';

export const SLIDER_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const SLIDER_ARIA_VALIDITY_TEST = 'ARIA validity — showcase bands, zero serious/critical';
export const SLIDER_PAGE_LANG_TEST = 'page lang on <html>';
export const SLIDER_ROUTE_TEST = 'playground route responds';

// —— Stepper ——
export const STEPPER_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'stepper-qa-default', title: wcagBand('Default') },
  { id: 'stepper-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'stepper-qa-attention', title: wcagBand('Attention (high · medium · low)') },
  { id: 'stepper-qa-appearance', title: wcagBand('Appearance') },
  { id: 'stepper-qa-accent', title: wcagBand('Accent') },
  { id: 'stepper-qa-condensed', title: wcagBand('Condensed') },
  { id: 'stepper-qa-disabled', title: wcagBand('Disabled') },
  { id: 'stepper-qa-input-text', title: wcagBand('InputText (Figma row)') },
  { id: 'stepper-qa-figma-code-slots', title: wcagBand('Code only — start / end slots') },
  { id: 'stepper-qa-extra-states', title: wcagBand('readOnly · error · required') },
  { id: 'stepper-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const STEPPER_APPEARANCE_CONTRAST_EACH_TEST =
  'axe color-contrast rule — each appearance row cell';
export const STEPPER_ALL_FIELDS_NAMED_TEST =
  'Accessible name readout — every Stepper value field in showcase';
export const STEPPER_DEFAULT_FIELD_NAME_TEST =
  'Accessible name readout — default stepper number field';
export const STEPPER_SIZE_M_FIELD_NAME_TEST =
  'Accessible name readout — stepper-size-M number field';
export const STEPPER_ERROR_ARIA_INVALID_TEST =
  'DOM inspection — stepper-error field aria-invalid';
export const STEPPER_ARROW_UP_FIELD_TEST = 'Keyboard Arrow Up — default stepper value increase';
export const STEPPER_ARROW_DOWN_FIELD_TEST = 'Keyboard Arrow Down — default stepper value decrease';
export const STEPPER_COLOR_CONTRAST_RULE_TEST =
  'axe color-contrast rule — showcase bands, zero serious/critical';
export const STEPPER_NON_TEXT_CONTRAST_TEST =
  'axe non-text-contrast rule — showcase bands (if rule exists)';
export const STEPPER_LABEL_RULE_TEST = 'axe label rule — showcase bands, zero serious/critical';
export const STEPPER_NAME_RULES_TEST =
  'axe name rules (button / input-button / link) — showcase bands';
export const STEPPER_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const STEPPER_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const STEPPER_RESIZE_200_TEST = '200% zoom — showcase steppers remain visible';
export const STEPPER_KEYBOARD_TAB_TEST = 'Tab reaches a focusable control';
export const STEPPER_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const STEPPER_FOCUS_INDICATOR_TEST = 'focused element shows outline or box-shadow';
export const STEPPER_FOCUS_ORDER_TEST = 'focus order — Tab visits multiple distinct targets';
export const STEPPER_SKIP_LINK_TEST = 'skip link — first Tab target visible if present';
export const STEPPER_THEME_ENTER_TEST = 'Mode select activates with Enter when focused';
export const STEPPER_THEME_SPACE_TEST = 'Mode select activates with Space when focused';
export const STEPPER_SVG_ICONS_TEST =
  'DOM scan — SVG nodes inside showcase bands (label, hidden, role, or title)';
export const STEPPER_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const STEPPER_PAGE_LANG_TEST = 'page lang on <html>';

// —— Switch ——
export const SWITCH_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'switch-figma-default', title: wcagBand('Default') },
  { id: 'switch-figma-size-selected', title: wcagBand('size × selected') },
  { id: 'switch-figma-appearance', title: wcagBand('Appearance') },
  { id: 'switch-figma-accent', title: wcagBand('Accent') },
  { id: 'switch-figma-disabled', title: wcagBand('Disabled') },
  { id: 'switch-figma-readonly', title: wcagBand('readOnly') },
  { id: 'switch-figma-selected-interactive', title: wcagBand('selected (controlled)') },
] as const;

export const SWITCH_APPEARANCE_CONTRAST_EACH_TEST =
  'axe color-contrast rule — each appearance spot-check cell';
export const SWITCH_COLOR_CONTRAST_RULE_TEST =
  'axe color-contrast rule — showcase bands, zero serious/critical';
export const SWITCH_DEFAULT_SWITCH_NAME_TEST =
  'Default band switch has role switch and accessible name';
export const SWITCH_DISABLED_NOT_ENABLED_TEST = 'Disabled switch is not enabled';
export const SWITCH_READONLY_ARIA_TEST = 'Read-only switch exposes aria-readonly';
export const SWITCH_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const SWITCH_LABEL_RULE_TEST = 'axe label rule — showcase bands, zero serious/critical';
export const SWITCH_NAME_RULES_TEST = 'axe name rules — showcase bands, zero serious/critical';
export const SWITCH_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const SWITCH_RESIZE_200_TEST = '200% zoom — showcase switches remain visible';
export const SWITCH_KEYBOARD_TAB_TEST = 'Tab reaches a focusable control';
export const SWITCH_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const SWITCH_FOCUS_INDICATOR_TEST = 'focused element shows outline or box-shadow';
export const SWITCH_FOCUS_ORDER_TEST = 'focus order — Tab visits multiple distinct targets';
export const SWITCH_THEME_ENTER_TEST = 'Mode select activates with Enter when focused';
export const SWITCH_THEME_SPACE_TEST = 'Mode select activates with Space when focused';
export const SWITCH_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const SWITCH_PAGE_LANG_TEST = 'page lang on <html>';

// —— Tooltip ——
export const TOOLTIP_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'tooltip-figma-tip-true', title: wcagBand('tip / arrow: true (default)') },
  { id: 'tooltip-figma-tip-false', title: wcagBand('tip / arrow: false') },
  { id: 'tooltip-figma-disabled-false', title: wcagBand('disable / disabled: false') },
  { id: 'tooltip-figma-disabled-true', title: wcagBand('disable / disabled: true') },
  { id: 'tooltip-trigger-hover', title: wcagBand('trigger: hover (default)') },
  { id: 'tooltip-trigger-click', title: wcagBand('trigger: click') },
  { id: 'tooltip-trigger-focus', title: wcagBand('trigger: focus') },
  { id: 'tooltip-controlled-manual', title: wcagBand('open + trigger: manual') },
  { id: 'tooltip-default-open', title: wcagBand('defaultOpen: true') },
  { id: 'tooltip-side-align', title: wcagBand('side + align (low-level positioning API)') },
  { id: 'tooltip-sideOffset', title: wcagBand('sideOffset: 32px gap from trigger') },
  { id: 'tooltip-delay', title: wcagBand('delay: 800ms before show') },
  { id: 'tooltip-closeDelay', title: wcagBand('closeDelay: 800ms before hide') },
  { id: 'tooltip-hoverable-false', title: wcagBand('hoverable: false') },
  { id: 'tooltip-zIndex', title: wcagBand('zIndex: 9999') },
  { id: 'tooltip-maxWidth', title: wcagBand('maxWidth: 120') },
  { id: 'tooltip-registry-scenarios', title: wcagBand('Registry scenario grid') },
] as const;

export const TOOLTIP_COLOR_CONTRAST_RULE_TEST =
  'axe color-contrast rule — open tooltip bubbles, zero serious/critical';
export const TOOLTIP_COLOR_CONTRAST_SHOWCASE_TEST =
  'axe color-contrast rule — showcase bands, zero serious/critical';
export const TOOLTIP_FIGMA_GRID_AXE_TEST =
  'Figma Validation tab — grid cells only (excludes horizontal scroll chrome)';
export const TOOLTIP_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const TOOLTIP_KEYBOARD_TAB_TEST = 'Tab reaches a focusable trigger with visible focus';
export const TOOLTIP_OPEN_TOOLTIP_NAME_TEST = 'Open tooltip exposes role=tooltip with accessible name';
export const TOOLTIP_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const TOOLTIP_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const TOOLTIP_PAGE_LANG_TEST = 'page lang on <html>';

// —— Tabs ——
export const TABS_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'tabs-qa-default', title: wcagBand('Default') },
  { id: 'tabs-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'tabs-qa-orientation', title: wcagBand('Orientation') },
  { id: 'tabs-qa-layout-variants', title: wcagBand('Layout variants (scrollable · full width)') },
  { id: 'tabs-qa-interaction-state', title: wcagBand('interactionState') },
  { id: 'tabs-qa-states', title: wcagBand('TabItem states') },
  { id: 'tabs-qa-controlled', title: wcagBand('Controlled value + panels') },
  { id: 'tabs-qa-code-only', title: wcagBand('Code-only props') },
  { id: 'tabs-qa-appearance-strip', title: wcagBand('Appearance strip') },
  { id: 'tabs-qa-slots', title: wcagBand('start / end slots') },
  { id: 'tabs-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const TABS_COLOR_CONTRAST_RULE_TEST =
  'axe color-contrast rule — showcase bands, zero serious/critical';
export const TABS_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const TABS_KEYBOARD_TAB_TEST = 'Tab reaches a focusable control with visible focus';
export const TABS_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const TABS_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const TABS_PAGE_LANG_TEST = 'page lang on <html>';

// —— Web Header ——
export const WEB_HEADER_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'web-header-qa-default', title: wcagBand('Default (homeBar · fluid · search end)') },
  { id: 'web-header-qa-home-bar', title: wcagBand('homeBar variations') },
  { id: 'web-header-qa-context-bar', title: wcagBand('contextBar variations') },
  { id: 'web-header-qa-search-bar', title: wcagBand('searchBar variations') },
  { id: 'web-header-qa-api-start', title: wcagBand('start=true / false') },
  { id: 'web-header-qa-api-middle', title: wcagBand('middle=fluid / centred') },
  { id: 'web-header-qa-api-primary-nav', title: wcagBand('primaryNavItems=true / false') },
  { id: 'web-header-qa-api-end', title: wcagBand('end=true / false') },
  { id: 'web-header-qa-api-avatar', title: wcagBand('avatar=true / false') },
  { id: 'web-header-qa-end-actions', title: wcagBand('EndActions Button / IconButton') },
  { id: 'web-header-qa-header-item', title: wcagBand('Header.Item slot') },
  { id: 'web-header-qa-negative', title: wcagBand('Negative / edge cases') },
  { id: 'web-header-qa-responsive', title: wcagBand('Responsive platform widths') },
] as const;

export const WEB_HEADER_FIGMA_GRID_AXE_TEST =
  'Figma validation tab — property × platform grid — zero serious/critical';
export const WEB_HEADER_SEARCH_LABEL_TEST = 'search input has accessible label';
export const WEB_HEADER_ICON_BUTTON_NAME_TEST = 'icon buttons in end slot have accessible names';
export const WEB_HEADER_AVATAR_ALT_TEST = 'avatar exposes accessible name';

export const WEB_HEADER_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const WEB_HEADER_LABEL_RULE_TEST = 'axe label rule — showcase bands, zero serious/critical';
export const WEB_HEADER_NAME_RULES_TEST = 'axe name rules — showcase bands, zero serious/critical';
export const WEB_HEADER_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const WEB_HEADER_RESIZE_200_TEST = '200% zoom — showcase headers remain visible';
export const WEB_HEADER_KEYBOARD_TAB_TEST = 'Tab reaches a focusable control';
export const WEB_HEADER_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const WEB_HEADER_FOCUS_INDICATOR_TEST = 'focused element shows outline or box-shadow';
export const WEB_HEADER_FOCUS_ORDER_TEST = 'focus order — Tab visits multiple distinct targets';
export const WEB_HEADER_THEME_ENTER_TEST = 'Mode select activates with Enter when focused';
export const WEB_HEADER_THEME_SPACE_TEST = 'Mode select activates with Space when focused';
export const WEB_HEADER_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const WEB_HEADER_PAGE_LANG_TEST = 'page lang on <html>';
export const WEB_HEADER_PRIMARY_NAV_LANDMARK_TEST =
  'Default mount exposes labelled primary navigation landmark';

// —— Touch Slider ——
export const TOUCH_SLIDER_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'touch-slider-qa-figma-visual-gaps', title: wcagBand('Figma visual gaps') },
  { id: 'touch-slider-qa-default', title: wcagBand('Default') },
  { id: 'touch-slider-qa-orientation', title: wcagBand('Orientation') },
  { id: 'touch-slider-qa-progress-style', title: wcagBand('Progress style') },
  { id: 'touch-slider-qa-appearance', title: wcagBand('Appearance') },
  { id: 'touch-slider-qa-value', title: wcagBand('Value') },
  { id: 'touch-slider-qa-slots', title: wcagBand('Start / end slots') },
  { id: 'touch-slider-qa-states', title: wcagBand('Disabled and read-only') },
  { id: 'touch-slider-qa-edge', title: wcagBand('Edge (min/max · step)') },
  { id: 'touch-slider-qa-surface', title: wcagBand('Surface context') },
  { id: 'touch-slider-qa-interaction', title: wcagBand('Interaction demo') },
  { id: 'touch-slider-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const TOUCH_SLIDER_BUG_BAND = 'touch-slider-qa-default' as const;
export const TOUCH_SLIDER_BUG_ID = 'BUG-TOUCHSLIDER-001' as const;
export const TOUCH_SLIDER_LABEL_RULE_TEST =
  'axe label rule — default instance, zero serious/critical';
export const TOUCH_SLIDER_ROOT_LABELS_TEST =
  'DOM inspection — every Touch Slider root exposes aria-label';
export const TOUCH_SLIDER_INPUT_NAME_TEST =
  'Native range input exposes accessible name from aria-label';
export const TOUCH_SLIDER_COLOR_CONTRAST_TRACK_TEST =
  'axe color-contrast rule — progress track chrome ([data-progress-style])';
export const TOUCH_SLIDER_APPEARANCE_CONTRAST_IDS = [
  'touch-slider-appearance-auto',
  'touch-slider-appearance-neutral',
  'touch-slider-appearance-primary',
  'touch-slider-appearance-secondary',
  'touch-slider-appearance-sparkle',
  'touch-slider-appearance-negative',
  'touch-slider-appearance-positive',
  'touch-slider-appearance-warning',
  'touch-slider-appearance-informative',
  'touch-slider-appearance-brand-bg',
] as const;
export const TOUCH_SLIDER_SLOT_ARIA_HIDDEN_TEST =
  'Decorative slot wrappers are aria-hidden';
export const TOUCH_SLIDER_COLOR_CONTRAST_EACH_APPEARANCE_TEST =
  'axe color-contrast rule — each appearance row cell';
export const TOUCH_SLIDER_DEFAULT_RANGE_TEST =
  'Default slider exposes min, max, and aria-valuenow on native range input';
export const TOUCH_SLIDER_VERTICAL_ORIENTATION_TEST =
  'Vertical slider exposes aria-orientation on native range input';
export const TOUCH_SLIDER_KEYBOARD_ARROWS_TEST =
  'Keyboard arrows — default slider value change';
export const TOUCH_SLIDER_KEYBOARD_HOME_END_TEST =
  'Keyboard Home and End — default slider';
export const TOUCH_SLIDER_DISABLED_KEYBOARD_TEST =
  'Keyboard ArrowRight — disabled slider (value must not change)';
export const TOUCH_SLIDER_FIGMA_CELL_TEST =
'DOM inspection — Figma validation grid sample cell';
export const TOUCH_SLIDER_WCAG_PAGE_TEST = 'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const TOUCH_SLIDER_PAGE_LANG_TEST = 'page lang on <html>';
export const TOUCH_SLIDER_REFLOW_320_TEST =
  'Viewport 320px — horizontal overflow check per showcase band';
export const TOUCH_SLIDER_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const TOUCH_SLIDER_KEYBOARD_TAB_TEST = 'Tab reaches default slider with visible focus';
export const TOUCH_SLIDER_COLOR_CONTRAST_SHOWCASE_TEST =
  'axe color-contrast rule — showcase bands, zero serious/critical';
export const TOUCH_SLIDER_FIGMA_GRID_AXE_TEST =
  'axe WCAG 2.1 AA — Figma validation grid, zero serious/critical';

// —— Modal ——
export const MODAL_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'modal-figma-default', title: wcagBand('Default') },
  { id: 'modal-figma-size', title: wcagBand('Size (S · M · L · FullWidth)') },
  { id: 'modal-figma-header-start', title: wcagBand('Header start slot') },
  { id: 'modal-figma-header-align', title: wcagBand('Header align') },
  { id: 'modal-figma-no-header', title: wcagBand('No header') },
  { id: 'modal-figma-no-footer', title: wcagBand('No footer') },
  { id: 'modal-figma-description', title: wcagBand('Title and description visibility') },
  { id: 'modal-figma-dividers', title: wcagBand('Dividers (none · onScroll · always)') },
  { id: 'modal-figma-footer-orientation', title: wcagBand('Footer orientation') },
  { id: 'modal-figma-appearance', title: wcagBand('Appearance (colour roles)') },
  { id: 'modal-figma-scrollable', title: wcagBand('Scrollable body') },
  { id: 'modal-figma-dismissible', title: wcagBand('Dismissible backdrop') },
  { id: 'modal-figma-appearance-auto', title: wcagBand('Appearance auto') },
] as const;

export const MODAL_BUG_ID = 'BUG-MODAL-002' as const;
export const MODAL_FOOTER_CONTENT_BUG_ID = 'BUG-MODAL-003' as const;
export const MODAL_APPEARANCE_ATTR_BUG_ID = 'BUG-MODAL-004' as const;
export const MODAL_DISMISSIBLE_ESCAPE_BUG_ID = 'BUG-MODAL-006' as const;
export const MODAL_COLOR_CONTRAST_TEST = 'axe color-contrast rule — Modal story bands';
export const MODAL_COLOR_CONTRAST_APPEARANCE_EACH_TEST =
  'axe color-contrast rule — each appearance trigger row';
export const MODAL_LABEL_RULE_TEST = 'axe label rule — Modal story bands';
export const MODAL_ARIA_VALIDITY_TEST = 'ARIA validity rules — Modal story bands';
export const MODAL_OPEN_DIALOG_AXE_TEST =
  'WCAG 2.1 AA axe scan — open default dialog ([role="dialog"])';
export const MODAL_HEADER_CLOSE_LABEL_TEST =
  'Header close button exposes aria-label="Close" when dialog is open';
export const MODAL_ESCAPE_DISMISS_TEST = 'Keyboard Escape — closes open modal';
export const MODAL_FOCUS_TRAP_TEST = 'Focus trap — Tab keeps focus inside open dialog';
export const MODAL_REFLOW_320_TEST =
  'Reflow at 320px — story bands fit without horizontal scroll';
export const MODAL_FIGMA_WCAG_TEST = 'WCAG 2.1 AA axe scan — Figma validation grid';

// —— Pagination ——
export const PAGINATION_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'pagination-qa-default', title: wcagBand('Default') },
  { id: 'pagination-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'pagination-qa-attention', title: wcagBand('Attention (high · medium · low)') },
  { id: 'pagination-qa-first-last', title: wcagBand('firstPage · lastPage (showFirstLast)') },
  { id: 'pagination-qa-matrix', title: wcagBand('Design matrix (size × attention)') },
  { id: 'pagination-qa-code-only', title: wcagBand('Code-only props') },
  { id: 'pagination-qa-e2e', title: wcagBand('E2E — controlled, edges, ellipsis') },
  { id: 'pagination-qa-realtime', title: wcagBand('Real-time scenarios') },
  { id: 'pagination-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const PAGINATION_NAV_LANDMARK_TEST = 'Default nav has accessible landmark label';
export const PAGINATION_LIVE_REGION_TEST = 'Polite live region announces page changes';
export const PAGINATION_COLOR_CONTRAST_TEST = 'axe color-contrast rule — default pagination';
export const PAGINATION_BUTTON_NAME_TEST = 'axe button-name rule — Pagination story bands';
export const PAGINATION_ARIA_VALIDITY_TEST = 'ARIA validity rules — Pagination story bands';
export const PAGINATION_REFLOW_320_TEST =
  'Reflow at 320px — default pagination remains operable';

// —— Pagination Dots ——
export const PAGINATION_DOTS_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'pagination-dots-qa-default', title: wcagBand('Default') },
  { id: 'pagination-dots-qa-current-page', title: wcagBand('currentPage (activeIndex)') },
  { id: 'pagination-dots-qa-code-only', title: wcagBand('Code-only props') },
  { id: 'pagination-dots-qa-appearance-strip', title: wcagBand('Appearance strip') },
  { id: 'pagination-dots-qa-degenerate', title: wcagBand('Degenerate counts') },
  { id: 'pagination-dots-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const PAGINATION_DOTS_TABLIST_LABEL_TEST = 'Default tablist has accessible label';
export const PAGINATION_DOTS_SELECTED_TAB_TEST = 'Active dot exposes aria-selected="true"';
export const PAGINATION_DOTS_COLOR_CONTRAST_TEST = 'axe color-contrast rule — default wrapper';
export const PAGINATION_DOTS_BUTTON_NAME_TEST = 'axe button-name rule — PaginationDots story bands';
export const PAGINATION_DOTS_ARIA_VALIDITY_TEST = 'ARIA validity rules — PaginationDots story bands';
export const PAGINATION_DOTS_REFLOW_320_TEST =
  'Reflow at 320px — default dots remain operable';
export const PAGINATION_DOTS_FIGMA_GRID_AXE_TEST =
  'Figma validation grid — zero serious/critical';

// —— Radio ——
export const RADIO_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'radio-qa-default', title: wcagBand('Default') },
  { id: 'radio-qa-size', title: wcagBand('Size (S · M · L + aliases)') },
  { id: 'radio-qa-appearance', title: wcagBand('Appearance (colour roles)') },
  { id: 'radio-qa-accent', title: wcagBand('Accent (primary · secondary · sparkle)') },
  { id: 'radio-qa-selected', title: wcagBand('Selected (defaultValue / empty group)') },
  { id: 'radio-qa-readonly', title: wcagBand('readOnly') },
  { id: 'radio-qa-disabled', title: wcagBand('disabled') },
  { id: 'radio-qa-combos', title: wcagBand('Combination matrix') },
] as const;

export const RADIO_APPEARANCE_CONTRAST_TESTIDS = [
  'radio-appearance-auto-off',
  'radio-appearance-neutral-off',
  'radio-appearance-primary-off',
  'radio-appearance-secondary-off',
  'radio-appearance-sparkle-off',
  'radio-appearance-negative-off',
  'radio-appearance-positive-off',
  'radio-appearance-warning-off',
  'radio-appearance-informative-off',
  'radio-appearance-brand-bg-off',
] as const;

export const RADIO_WCAG_PAGE_TEST = 'WCAG 2.1 AA tag scan + JSON artefact + HTML report';
export const RADIO_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const RADIO_COLOR_CONTRAST_TEST = 'color-contrast rule — zero serious/critical';
export const RADIO_LABEL_RULE_TEST = 'label rule — zero serious/critical';
export const RADIO_ARIA_VALIDITY_TEST = 'ARIA validity rules — zero serious/critical';
export const RADIO_DEFAULT_NAME_TEST = 'Default first radio: role radio + accessible name';
export const RADIO_READONLY_ATTR_TEST = 'read-only group exposes aria-readonly on radios';
export const RADIO_REFLOW_320_TEST =
  'Reflow at 320px — showcase regions fit without horizontal overflow inside bands';

// —— Segmented Control (M3 segmented buttons a11y) ——
/** @see https://m3.material.io/components/segmented-buttons/accessibility */
export const SEGMENTED_CONTROL_WCAG_PAGE_TEST =
  'WCAG 2.1 AA tag scan + JSON artefact + HTML report';
export const SEGMENTED_CONTROL_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const SEGMENTED_CONTROL_ARIA_VALIDITY_TEST = 'ARIA validity rules — zero serious/critical';
export const SEGMENTED_CONTROL_BUTTON_NAME_TEST =
  'axe button-name rule — Test Scenarios bands, zero serious/critical';
export const SEGMENTED_CONTROL_LABEL_RULE_TEST = 'axe label rule — zero serious/critical';
export const SEGMENTED_CONTROL_REFLOW_320_TEST =
  'Reflow at 320px — story bands fit without horizontal scroll';
export const SEGMENTED_CONTROL_M3_GROUP_LABEL_TEST =
  'M3 — every segmented group exposes an accessible name (aria-label / aria-labelledby)';
export const SEGMENTED_CONTROL_M3_TOGGLE_SEMANTICS_TEST =
  'M3 — each segment is a button with aria-pressed true or false';
export const SEGMENTED_CONTROL_M3_SINGLE_SELECT_TEST =
  'M3 — single-select group has exactly one pressed segment';
export const SEGMENTED_CONTROL_M3_ICON_LABEL_TEST =
  'M3 — icon-only segments expose per-item accessible names';
export const SEGMENTED_CONTROL_M3_KEYBOARD_ACTIVATION_TEST =
  'M3 — Enter and Space activate the focused segment';
export const SEGMENTED_CONTROL_M3_ROVING_FOCUS_TEST =
  'M3 — arrow keys move focus between segments (roving focus)';
export const SEGMENTED_CONTROL_M3_DISABLED_SEGMENT_TEST =
  'M3 — disabled segment is inert and removed from tab order';
export const SEGMENTED_CONTROL_M3_FOCUS_VISIBLE_TEST =
  'M3 — keyboard focus shows a visible focus indicator on segments';

// —— RadioField ——
export const RADIO_FIELD_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'radio-field-qa-default', title: wcagBand('Default') },
  { id: 'radio-field-qa-label', title: wcagBand('Label') },
  { id: 'radio-field-qa-description', title: wcagBand('Description') },
  { id: 'radio-field-qa-required', title: wcagBand('Required') },
  { id: 'radio-field-qa-info-icon', title: wcagBand('Info icon') },
  { id: 'radio-field-qa-feedback', title: wcagBand('Feedback') },
  { id: 'radio-field-qa-dynamic-text', title: wcagBand('Dynamic text') },
  { id: 'radio-field-qa-description-feedback', title: wcagBand('Description + feedback') },
  { id: 'radio-field-qa-checked', title: wcagBand('Checked') },
  { id: 'radio-field-qa-disabled', title: wcagBand('Disabled') },
  { id: 'radio-field-qa-disabled-checked', title: wcagBand('Disabled checked') },
  { id: 'radio-field-qa-readonly', title: wcagBand('Read only') },
  { id: 'radio-field-qa-appearance', title: wcagBand('Appearance') },
  { id: 'radio-field-qa-accent', title: wcagBand('Accent (lone Radio)') },
  { id: 'radio-field-qa-size', title: wcagBand('Size') },
  { id: 'radio-field-qa-a11y', title: wcagBand('Accessibility') },
  { id: 'radio-field-qa-group-shell', title: wcagBand('Multi-option shell') },
] as const;

export const RADIO_FIELD_WCAG_PAGE_TEST =
  'WCAG 2.1 AA axe scan — zero serious/critical + HTML report';
export const RADIO_FIELD_SECTION508_TEST = 'Section 508 tag run — zero serious/critical';
export const RADIO_FIELD_LABEL_RULE_TEST = 'axe label rule — showcase bands, zero serious/critical';
export const RADIO_FIELD_ARIA_VALIDITY_TEST = 'ARIA validity rules — zero serious/critical';
export const RADIO_FIELD_NAME_RULES_TEST = 'axe name rules — showcase bands, zero serious/critical';
export const RADIO_FIELD_PAGE_LANG_TEST = 'page lang on <html>';
export const RADIO_FIELD_REFLOW_320_TEST =
  'Reflow at 320px — showcase bands fit without horizontal overflow';
export const RADIO_FIELD_RESIZE_200_TEST = '200% zoom — showcase fields remain visible';
export const RADIO_FIELD_KEYBOARD_TAB_TEST = 'Tab reaches a focusable control';
export const RADIO_FIELD_FOCUS_TRAP_TEST = 'no keyboard trap (Tab cycle advances)';
export const RADIO_FIELD_FOCUS_INDICATOR_TEST = 'focused element shows outline or box-shadow';
export const RADIO_FIELD_FOCUS_ORDER_TEST = 'focus order — Tab visits multiple distinct targets';
export const RADIO_FIELD_THEME_ENTER_TEST = 'Theme toggle activates with Enter when focused';
export const RADIO_FIELD_THEME_SPACE_TEST = 'Theme toggle activates with Space when focused';
export const RADIO_FIELD_DEFAULT_NAME_TEST = 'Default integrated radio accessible name';
export const RADIO_FIELD_REQUIRED_A11Y_TEST = 'Required field label visible for announcement';
export const RADIO_FIELD_KEYBOARD_TEST = 'Tab moves focus away from integrated radio';
export const RADIO_FIELD_READONLY_ATTR_TEST = 'read-only field exposes data-readonly on radio';
export const RADIO_FIELD_DISABLED_NOT_ENABLED_TEST = 'Disabled field radio is not enabled';

// —— Input Feedback ——
export const IFB_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'input-feedback-qa-default', title: wcagBand('Default') },
  { id: 'input-feedback-qa-all-props', title: wcagBand('All properties') },
  { id: 'input-feedback-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'input-feedback-qa-attention', title: wcagBand('Attention (low · medium · high)') },
  { id: 'input-feedback-qa-variant', title: wcagBand('Variant') },
  { id: 'input-feedback-qa-custom-icon', title: wcagBand('Custom icon') },
  { id: 'input-feedback-qa-matrix', title: wcagBand('Variant × attention matrix') },
  { id: 'input-feedback-qa-combos', title: wcagBand('Combination samples') },
  { id: 'input-feedback-qa-controls', title: wcagBand('Controls panel') },
] as const;

export const IFB_FIGMA_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'input-feedback-qa-figma-validation-matrix', title: wcagBand('Figma validation matrix') },
] as const;

export const IFB_FIGMA_WCAG_GRID_TEST = 'WCAG 2.1 AA axe scan — Figma validation matrix';
export const IFB_FIGMA_MATRIX_VISIBLE_TEST = 'Figma matrix — every type × size × attention cell is visible';

export const IFB_ARIA_VALIDITY_TEST = 'ARIA validity rules — zero serious/critical';
export const IFB_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const IFB_DEFAULT_ALERT_TEST = 'Default negative feedback uses role alert with message copy';
export const IFB_VARIANT_STATUS_TEST = (variant: string) =>
  `Variant ${variant} feedback uses role status`;
export const IFB_ICON_HIDDEN_TEST = 'Default feedback icon is aria-hidden';

// —— Input Field ——
export const IFF_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'input-field-qa-default', title: wcagBand('Default') },
  { id: 'input-field-qa-all-props', title: wcagBand('All properties') },
  { id: 'input-field-qa-size', title: wcagBand('Size (S · M · L)') },
  { id: 'input-field-qa-input-slots', title: wcagBand('Input slots') },
  { id: 'input-field-qa-input-chrome', title: wcagBand('Input chrome') },
  { id: 'input-field-qa-appearance', title: wcagBand('Input appearance') },
  { id: 'input-field-qa-input-types', title: wcagBand('Input types') },
  { id: 'input-field-qa-field-slots', title: wcagBand('Field slots') },
  { id: 'input-field-qa-isolates', title: wcagBand('Property isolates') },
  { id: 'input-field-qa-edge', title: wcagBand('Edge cases') },
  { id: 'input-field-qa-playground', title: wcagBand('Playground examples') },
  { id: 'input-field-qa-pairwise', title: wcagBand('Pairwise (7 × 2×2)') },
  { id: 'input-field-qa-a11y', title: wcagBand('Accessibility') },
  { id: 'input-field-qa-controls', title: wcagBand('Controls panel') },
] as const;

export const IFF_ARIA_VALIDITY_TEST = 'ARIA validity rules — zero serious/critical (Input Field showcase)';
export const IFF_REFLOW_320_TEST = 'Reflow at 320px — story bands fit without horizontal scroll';
export const IFF_DEFAULT_LABEL_TEST = 'Default field label is associated with textbox';
export const IFF_REQUIRED_LABEL_TEST = 'Required field exposes required on input and visible label';
export const IFF_DISABLED_INPUT_TEST = 'Disabled field textbox is not editable';
export const IFF_EDGE_AXE_TEST =
  'Edge band — axe documents disabled dynamic-text contrast defect (tracked)';
export const IFF_FEEDBACK_ALERT_TEST = 'Error feedback row uses role alert';
export const IFF_INFO_ICON_LABEL_TEST = 'Info icon button has accessible name when label is set';
export const IFF_SLOT_ICON_HIDDEN_TEST = 'Start slot icon is aria-hidden decorative';
export const IFF_INVALID_ARIA_TEST = 'Invalid chrome mount exposes aria-invalid on the control';
export const IFF_PASSWORD_TYPE_TEST = 'Password type mount renders a visible control';

export const IFF_FIGMA_A11Y_BANDS: readonly QaBandLabel[] = [
  { id: 'input-field-qa-figma-validation-matrix', title: wcagBand('Figma validation matrix') },
] as const;

export const IFF_FIGMA_WCAG_GRID_TEST = 'WCAG 2.1 AA axe scan — Figma validation matrix';
export const IFF_FIGMA_MATRIX_VISIBLE_TEST =
  'Figma matrix — every size cell renders label, placeholder, and icons';
export const IFF_FIGMA_TAB_VISIBLE_TEST = 'InputField - Figma Validation tab is available';
