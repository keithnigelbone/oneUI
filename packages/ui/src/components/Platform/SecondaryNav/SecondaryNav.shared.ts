/**
 * SecondaryNav.shared.ts
 *
 * Shared types for secondary/contextual navigation (tabs)
 */

import React from 'react';

export interface SecondaryNavTab {
  id: string;
  label: string;
  count?: number;
  /** When true, renders as a visual divider/section header instead of a clickable tab */
  divider?: boolean;
  /** When true, this tab has collapsible children that expand when active */
  collapsible?: boolean;
  /** Child tabs shown when this collapsible group is expanded */
  children?: SecondaryNavTab[];
}

export interface SecondaryNavProps {
  tabs: SecondaryNavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** When true, renders a search input at the top to filter tabs */
  searchable?: boolean;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
}

export function useSecondaryNavState() {
  return {
    ariaProps: {
      role: 'tablist',
    },
  };
}
