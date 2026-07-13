/**
 * SelectStartSlots.tsx — Figma `start` enum → Input / Button slot nodes.
 */

import React from 'react';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { Image } from '../Image/Image';
import { resolveSelectSize } from './Select.shared';
import type { SelectInputStart, SelectSize } from './Select.shared';
import type { SelectProps } from './Select';

const AVATAR_SIZE_MAP: Record<SelectSize, 'xs' | 's' | 'm'> = {
  s: 'xs',
  m: 's',
  l: 'm',
};

/** Resolve Figma `start` preset to a ReactNode for InputField / Button `start` slot. */
export function resolveSelectStartSlot(
  inputStart: SelectInputStart | undefined,
  size: SelectSize = 'm',
): React.ReactNode {
  if (!inputStart || inputStart === 'none') return undefined;
  if (inputStart === 'icon') {
    // Figma icon "size 4" — Spacing-4 (16px), on the DS Icon numeric scale.
    return <Icon icon="heart" size="4" appearance="primary" emphasis="high" aria-hidden />;
  }
  if (inputStart === 'avatar') {
    return (
      <Avatar
        content="text"
        alt="AB"
        size={AVATAR_SIZE_MAP[size]}
        attention="high"
        appearance="primary"
        aria-hidden
      />
    );
  }
  if (inputStart === 'image') {
    return (
      <Image
        src="https://example.com/photo.jpg"
        alt=""
        aspectRatio="1:1"
        aria-hidden
      />
    );
  }
  if (inputStart === 'text') {
    return <span>Prefix</span>;
  }
  return undefined;
}

/** Custom `start` node wins over `inputStart` preset. */
export function resolveSelectTriggerStart<T extends string | number>(
  props: Pick<SelectProps<T>, 'start' | 'inputStart' | 'size'>,
): React.ReactNode {
  if (props.start != null) return props.start;
  return resolveSelectStartSlot(props.inputStart, resolveSelectSize(props.size));
}
