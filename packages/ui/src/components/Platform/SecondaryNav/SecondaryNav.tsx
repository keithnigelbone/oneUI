/**
 * SecondaryNav.tsx
 *
 * Contextual/secondary navigation tabs
 * Appears below the main navigation to show subsections
 * Supports optional search filtering for long lists (e.g. components)
 * Supports collapsible groups with children that auto-expand when active
 */

'use client';

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import styles from './SecondaryNav.module.css';
import {
  SecondaryNavProps,
  SecondaryNavTab,
  useSecondaryNavState,
} from './SecondaryNav.shared';
import { Input } from '../../Input/Input';

// Memoized tab button to prevent unnecessary re-renders
const TabButton = memo(function TabButton({
  tab,
  isActive,
  onTabChange,
  indent,
}: {
  tab: SecondaryNavTab;
  isActive: boolean;
  onTabChange: (id: string) => void;
  indent?: boolean;
}) {
  const handleClick = useCallback(() => {
    onTabChange(tab.id);
  }, [tab.id, onTabChange]);

  return (
    <button
      className={styles.tab}
      data-active={isActive}
      data-indent={indent || undefined}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
    >
      <span className={styles.tabLabel}>{tab.label}</span>
      {tab.count !== undefined && (
        <span className={styles.count}>{tab.count}</span>
      )}
    </button>
  );
});

// Chevron icon for collapsible groups
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.chevron}
      data-expanded={expanded}
    >
      <polyline points="4 4.5 6 6.5 8 4.5" />
    </svg>
  );
}

// Collapsible group: a clickable parent tab with expandable children
const CollapsibleGroup = memo(function CollapsibleGroup({
  tab,
  activeTab,
  onTabChange,
}: {
  tab: SecondaryNavTab;
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  const children = tab.children ?? [];
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);

  // Auto-expand when this tab or any child is active
  const isChildActive = children.some((child) => activeTab === child.id);
  const isSelfActive = activeTab === tab.id;
  const isExpanded = (isSelfActive || isChildActive) && !manuallyCollapsed;

  // Reset manual collapse when navigating to a different section
  const isInGroup = isSelfActive || isChildActive;
  const prevInGroupRef = useRef(isInGroup);
  if (isInGroup && !prevInGroupRef.current) {
    // Just entered this group — clear manual collapse
    if (manuallyCollapsed) setManuallyCollapsed(false);
  }
  prevInGroupRef.current = isInGroup;

  const handleClick = useCallback(() => {
    if (isExpanded) {
      // Already expanded — toggle closed
      setManuallyCollapsed(true);
    } else if (manuallyCollapsed) {
      // Was manually collapsed — reopen
      setManuallyCollapsed(false);
    } else {
      // Navigate to the group's first page
      onTabChange(tab.id);
    }
  }, [tab.id, onTabChange, isExpanded, manuallyCollapsed]);

  return (
    <>
      <button
        className={styles.tab}
        data-active={isSelfActive && !isChildActive}
        onClick={handleClick}
        role="tab"
        aria-selected={isSelfActive}
        aria-expanded={isExpanded}
      >
        <span className={styles.tabLabel}>{tab.label}</span>
        <ChevronIcon expanded={isExpanded} />
      </button>
      {isExpanded && children.map((child) => (
        <TabButton
          key={child.id}
          tab={child}
          isActive={activeTab === child.id}
          onTabChange={onTabChange}
          indent
        />
      ))}
    </>
  );
});

export const SecondaryNav = memo(function SecondaryNav({
  tabs,
  activeTab,
  onTabChange,
  searchable = false,
  searchPlaceholder = 'Search',
}: SecondaryNavProps) {
  const { ariaProps } = useSecondaryNavState();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const filteredTabs = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return tabs;
    const q = searchQuery.toLowerCase().trim();
    return tabs.filter(
      (tab) =>
        tab.divider ||
        tab.collapsible ||
        tab.label.toLowerCase().includes(q) ||
        tab.id.toLowerCase().includes(q)
    );
  }, [tabs, searchQuery, searchable]);

  return (
    <nav className={styles.nav} {...ariaProps}>
      {searchable && (
        <div className={styles.searchContainer}>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
          />
        </div>
      )}
      {filteredTabs.map((tab) => {
        if (tab.divider) {
          return (
            <div key={tab.id} className={styles.divider} role="separator">
              <span className={styles.dividerLabel}>{tab.label}</span>
            </div>
          );
        }
        if (tab.collapsible && tab.children) {
          return (
            <CollapsibleGroup
              key={tab.id}
              tab={tab}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          );
        }
        return (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onTabChange={onTabChange}
          />
        );
      })}
      {searchable && searchQuery && filteredTabs.length === 0 && (
        <span className={styles.noResults}>No components found</span>
      )}
    </nav>
  );
});

export * from './SecondaryNav.shared';
