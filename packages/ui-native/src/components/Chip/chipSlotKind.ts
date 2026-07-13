/**
 * Classify Chip start/end slot children for padding (affordance vs badge).
 * Compares `node.type` to component references — no displayName required.
 */

import { isValidElement, type ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.native';
import { CounterBadge } from '../CounterBadge/CounterBadge.native';
import { Icon } from '../Icon/Icon.native';
import { IndicatorBadge } from '../IndicatorBadge/IndicatorBadge.native';
import type { ChipSlotKind } from './chipLayoutMatrix';

const BADGE_SLOT_TYPES: ReadonlySet<unknown> = new Set([CounterBadge, IndicatorBadge]);
const AFFORDANCE_SLOT_TYPES: ReadonlySet<unknown> = new Set([Icon, Avatar]);

function unwrapComponentType(type: unknown): unknown {
  if (typeof type !== 'object' || type === null) return type;
  const inner = (type as { type?: unknown }).type;
  return inner ?? type;
}

export function classifyChipSlot(node: ReactNode): ChipSlotKind | null {
  if (!isValidElement(node)) return null;
  const type = unwrapComponentType(node.type);
  if (BADGE_SLOT_TYPES.has(type)) return 'badge';
  if (AFFORDANCE_SLOT_TYPES.has(type)) return 'affordance';
  return 'affordance';
}

