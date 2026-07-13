/**
 * SelectIcons.tsx — chevron + menu indicators for Select triggers.
 *
 * Figma node 3877:38142 — 24×24 chevron (`Spacing-6` / Icon size 6) in the end slot.
 * Decorative only — the combobox/button trigger owns interaction.
 */

import React from 'react';
import { Icon } from '../Icon/Icon';

export function SelectChevronIcon({ open }: { open?: boolean }) {
  return (
    <Icon
      icon={open ? 'chevronUp' : 'chevronDown'}
      size="6"
      emphasis="high"
      appearance="secondary"
      aria-hidden
    />
  );
}

/** Figma Slot/size6/IconTinted — ic_confirm in menu list item end slot. */
export function SelectCheckIcon() {
  return (
    <Icon icon="check" size="6" emphasis="high" appearance="primary" aria-hidden />
  );
}
