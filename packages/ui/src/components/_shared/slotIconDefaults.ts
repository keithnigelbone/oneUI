/**
 * Default Icon emphasis when label-host components auto-render string slot icons.
 *
 * Figma slot wrappers use IconTinted / IconTintedA11y — not the Icon primitive's
 * default `high`. Host CSS (`--Icon-color: currentColor` on Button/Badge/LinkButton)
 * owns colour; emphasis stays aligned with Figma for hosts that use token remaps.
 */
import React, { isValidElement, type ReactElement, type ReactNode } from 'react';
import type { ComponentIconInput, SemanticIconName } from '@oneui/shared';
import { Icon } from '../Icon/Icon';
import type { IconEmphasis } from '../Icon/Icon.shared';
import type { ButtonAttention } from '../Button/Button.shared';

export type LabelHostAttention = ButtonAttention;

/** Figma-aligned default emphasis for Button / LinkButton string slot icons. */
export const SLOT_ICON_EMPHASIS_BY_ATTENTION: Record<LabelHostAttention, IconEmphasis> = {
  high: 'tintedA11y',
  medium: 'tintedA11y',
  low: 'tintedA11y',
};

export function slotIconEmphasisForAttention(
  attention: LabelHostAttention | undefined,
): IconEmphasis {
  return SLOT_ICON_EMPHASIS_BY_ATTENTION[attention ?? 'high'];
}

/**
 * Render a slot value that may be a semantic icon name or pre-built React element.
 * String names become <Icon> with host-default emphasis (appearance from SlotParent).
 */
export function renderHostSlotIcon(
  slot: ComponentIconInput | ReactElement | undefined,
  attention: LabelHostAttention | undefined,
): ReactNode {
  if (slot == null) return undefined;
  if (isValidElement(slot)) return slot;
  return React.createElement(Icon, {
    icon: slot as SemanticIconName,
    emphasis: slotIconEmphasisForAttention(attention),
    'aria-hidden': true,
  });
}
