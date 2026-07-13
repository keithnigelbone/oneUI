/**
 * Shared Pressable accessibility mapping for Button / IconButton / LinkButton.
 */

export type AriaHaspopupValue = boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';

export interface ButtonFamilyA11yInput {
  isDisabled: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: AriaHaspopupValue;
  'aria-describedby'?: string;
  'aria-controls'?: string;
  'aria-hidden'?: boolean;
}

export interface ButtonFamilyPressableA11y {
  accessible: true;
  focusable: true;
  accessibilityRole: 'button' | 'link';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: {
    disabled: boolean;
    busy: boolean;
    expanded?: boolean;
  };
  accessibilityLabelledBy?: string;
  accessibilityControls?: string;
  accessibilityElementsHidden?: boolean;
  'aria-haspopup'?: AriaHaspopupValue;
}

export function buildButtonFamilyPressableAccessibility(
  input: ButtonFamilyA11yInput,
  options?: { role?: 'button' | 'link' },
): ButtonFamilyPressableA11y {
  const ariaExpanded = input['aria-expanded'];
  const ariaHaspopup = input['aria-haspopup'];
  return {
    accessible: true,
    focusable: true,
    accessibilityRole: options?.role ?? 'button',
    accessibilityLabel: input.accessibilityLabel,
    accessibilityHint: input.accessibilityHint,
    accessibilityState: {
      disabled: input.isDisabled,
      busy: Boolean(input.loading),
      ...(typeof ariaExpanded === 'boolean' ? { expanded: ariaExpanded } : {}),
    },
    ...(input['aria-describedby']
      ? { accessibilityLabelledBy: input['aria-describedby'] }
      : {}),
    ...(input['aria-controls'] ? { accessibilityControls: input['aria-controls'] } : {}),
    ...(input['aria-hidden'] === true ? { accessibilityElementsHidden: true } : {}),
    ...(ariaHaspopup != null ? { 'aria-haspopup': ariaHaspopup } : {}),
  };
}

/** Inline loading indicator inside button-family components. */
export function getButtonFamilyLoadingSpinnerAccessibility(): {
  accessible: true;
  accessibilityLabel: 'Loading';
  accessibilityRole: 'progressbar';
} {
  return {
    accessible: true,
    accessibilityLabel: 'Loading',
    accessibilityRole: 'progressbar',
  };
}
