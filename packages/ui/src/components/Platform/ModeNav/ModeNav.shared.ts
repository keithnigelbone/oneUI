/**
 * ModeNav.shared.ts
 *
 * Top-center mode tab strip ("Home | Build | System | Agents") — the
 * Claude-desktop-style high-level switcher that swaps the platform into
 * a different working context. The active mode is derived from the
 * current pathname by the consuming layout, so ModeNav itself is a pure
 * controlled segmented control.
 */

import type { ReactNode } from 'react';

/**
 * Canonical mode slugs. The union is closed so TypeScript can enforce
 * that every mode has a matching navigation config + landing route.
 * Adding a new mode is a deliberate change across three places:
 * this union, the navigation config, and the ModeNav items list.
 */
export type PlatformModeId = 'home' | 'build' | 'system' | 'agents';

export interface ModeNavItem {
  id: PlatformModeId;
  label: string;
  /** Optional icon rendered left of the label. */
  icon?: ReactNode;
}

export interface ModeNavProps {
  /** Items to render, in order. */
  items: ModeNavItem[];
  /** The currently active mode id. */
  activeMode: PlatformModeId;
  /** Fired when the user clicks a different tab. */
  onModeChange: (mode: PlatformModeId) => void;
  /** Optional className for the outer wrapper. */
  className?: string;
}
