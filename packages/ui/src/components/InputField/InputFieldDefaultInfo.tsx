/**
 * Default info control for InputField — IconButton + Tooltip.
 * Override with `infoIconSlot` on InputField when you need custom wiring.
 */

'use client';

import React from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { useSurfaceAppearance } from '../Surface/Surface';
import type { InputLabelSize } from '../Input/Input.shared';
import styles from './InputFieldDefaultInfo.module.css';

const ICON_BUTTON_SIZE: Record<InputLabelSize, 8 | 10 | 12> = {
  s: 8,
  m: 10,
  l: 12,
};

/** Match IconButton container to `--_ib-icon-size` so the tooltip anchor matches the painted glyph. */
const INFO_TRIGGER_LAYOUT_STYLE = {
  '--_ib-size': 'var(--_ib-icon-size)',
} as React.CSSProperties;

export interface InputFieldDefaultInfoProps {
  disabled?: boolean;
  /** Accessible name for the trigger (WCAG 4.1.2). */
  ariaLabel: string;
  /** Tooltip surface copy (string or rich node). */
  tooltipContent: React.ReactNode;
  /** Matches Input label tier for hit target / icon scale. */
  labelSize: InputLabelSize;
}

export function InputFieldDefaultInfo({
  disabled,
  ariaLabel,
  tooltipContent,
  labelSize,
}: InputFieldDefaultInfoProps) {
  const parentAppearance = useSurfaceAppearance();

  return (
    <Tooltip content={tooltipContent} trigger="hover">
      <IconButton
        className={styles.infoTrigger}
        style={INFO_TRIGGER_LAYOUT_STYLE}
        icon="info"
        aria-label={ariaLabel}
        disabled={disabled}
        size={ICON_BUTTON_SIZE[labelSize]}
        appearance={parentAppearance ?? 'neutral'}
        attention="low"
        condensed
      />
    </Tooltip>
  );
}
