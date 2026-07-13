/**
 * Accessibility contracts — one interface per platform binder. JDS owns the
 * type definitions in kb-core (decision #5); per-component values live in
 * each @jds/kb-<sdk> package.
 *
 * Authors pick the right A11y* interface based on the SDK their kb-<sdk> targets.
 */

// ---------------------------------------------------------------------------
// Web / DOM
// ---------------------------------------------------------------------------

export type AriaRole =
  | 'button' | 'link' | 'img' | 'heading' | 'switch' | 'checkbox'
  | 'radio' | 'tab' | 'tabpanel' | 'tablist' | 'dialog' | 'menu'
  | 'menuitem' | 'listbox' | 'option' | 'navigation' | 'region'
  | 'banner' | 'main' | 'contentinfo' | 'complementary' | 'form'
  | 'group' | 'list' | 'listitem' | 'none' | 'presentation';

export interface A11yWeb {
  readonly role: AriaRole;
  readonly accessibleNameSource: 'children' | 'aria-label' | 'aria-labelledby' | 'alt' | 'icon';
  readonly states?: readonly ('aria-disabled' | 'aria-selected' | 'aria-checked' | 'aria-busy' | 'aria-expanded' | 'aria-pressed')[];
  readonly keyboardActivation: readonly ('Enter' | 'Space' | 'Arrow' | 'Escape' | 'Tab')[];
  readonly contrastRequirement: 'AA' | 'AAA' | 'graphical-AA';
}

// ---------------------------------------------------------------------------
// React Native
// ---------------------------------------------------------------------------

export type AccessibilityRoleRN =
  | 'button' | 'link' | 'image' | 'text' | 'header' | 'switch'
  | 'checkbox' | 'radio' | 'tab' | 'tablist' | 'progressbar' | 'spinbutton'
  | 'adjustable' | 'imagebutton' | 'menu' | 'menuitem' | 'none';

export interface A11yRN {
  readonly accessibilityRole: AccessibilityRoleRN;
  readonly accessibilityState?: readonly ('disabled' | 'selected' | 'checked' | 'busy' | 'expanded')[];
  readonly accessibleNameSource: 'children' | 'aria-label' | 'icon';
  /** iOS HIG / Material Design minimum tap target — 44 on phone, 48 dp on Android. */
  readonly minTouchTarget: 44 | 48;
  readonly honorsBoldText: boolean;
  readonly honorsScreenReader: boolean;
}

// ---------------------------------------------------------------------------
// iOS SwiftUI / UIKit
// ---------------------------------------------------------------------------

export interface A11yIos {
  readonly accessibilityTraits: readonly (
    | 'button' | 'link' | 'image' | 'header' | 'selected' | 'staticText'
    | 'searchField' | 'updatesFrequently' | 'allowsDirectInteraction'
  )[];
  readonly accessibleNameSource: 'label' | 'value' | 'children';
  readonly supportsDynamicType: boolean;
  readonly supportsVoiceOver: boolean;
}

// ---------------------------------------------------------------------------
// Android Compose
// ---------------------------------------------------------------------------

export interface A11yAndroid {
  readonly contentDescription: 'children' | 'explicit' | 'none';
  readonly role: 'Button' | 'Checkbox' | 'Switch' | 'RadioButton' | 'Tab' | 'Image' | 'DropdownList' | 'Custom';
  readonly stateDescription?: 'enabled' | 'busy' | 'on' | 'off';
  /** Material Design minimum touch target. */
  readonly minTouchTarget: 48;
}

// ---------------------------------------------------------------------------
// Flutter
// ---------------------------------------------------------------------------

export interface A11yFlutter {
  readonly semanticsLabel: 'child' | 'explicit' | 'inherited';
  readonly button: boolean;
  readonly enabled: boolean;
  readonly liveRegion?: boolean;
}
