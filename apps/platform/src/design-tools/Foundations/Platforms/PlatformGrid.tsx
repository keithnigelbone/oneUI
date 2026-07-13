/**
 * PlatformList.tsx
 * Accordion-style list of platforms. Each row expands to show all settings
 * (DIN 1450 params, breakpoints, density) inline.
 *
 * Exported as `PlatformList` — replaces the old card grid approach.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  MoreHorizontal,
} from 'lucide-react';
import type { PlatformBreakpoint, PlatformCategory, PlatformDensityConfig, SemanticIconName } from '@oneui/shared';
import type { PlatformListProps } from './Platforms.shared';
import type { PlatformEntry } from '@oneui/shared';
import { Icon } from '@oneui/ui-internal/icons';
import { IconButton } from '@oneui/ui-internal/components/IconButton';
import { Badge } from '@oneui/ui-internal/components/Badge';
import { Menu } from '@oneui/ui-internal/components/Menu';
import { Tabs } from '@oneui/ui/components/Tabs';
import { PlatformDetailEditor } from './PlatformDetailEditor';
import { BreakpointEditor } from './BreakpointEditor';
import { DensityConfigTable } from './DensityConfigTable';
import styles from './PlatformGrid.module.css';

/**
 * Map platform IDs to semantic icon names. Resolved at render time through
 * the brand's selected icon set via `<Icon name="..." />`, so switching
 * between Jio / Lucide / Tabler / etc. in the brand settings updates these
 * icons automatically — no more hardcoded Lucide outlines next to Jio fills.
 */
const PLATFORM_ICON_NAMES: Record<string, SemanticIconName> = {
  web: 'globe',
  'mobile-native': 'smartphone',
  'tablet-native': 'tablet',
  'desktop-native': 'monitor',
  'tv-native': 'tv',
  outdoor: 'bus',
  print: 'printer',
  // Legacy IDs (pre-Print consolidation) — kept so legacy brand data still renders
  printA4: 'printer',
  printBusinessCard: 'printer',
};

function getPlatformIconName(id: string): SemanticIconName {
  return PLATFORM_ICON_NAMES[id] ?? 'layers';
}

/** Human-readable label for a platform category */
const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  'digital-responsive': 'Digital · Responsive',
  'digital-fixed': 'Digital · Fixed',
  print: 'Print',
  physical: 'Physical',
};

/** Stable display order for category section headers */
const CATEGORY_ORDER: PlatformCategory[] = [
  'digital-responsive',
  'digital-fixed',
  'print',
  'physical',
];

/**
 * Short badge label shown on the right side of every platform row.
 * Reports the platform's category type — "Responsive" / "Fixed" /
 * "Print" / "Physical" — in a single compact word so the badge
 * (combined with the breakpoint count) replaces both the old subtitle
 * text and the old per-row stats block.
 */
const CATEGORY_BADGE_LABELS: Record<PlatformCategory, string> = {
  'digital-responsive': 'Responsive',
  'digital-fixed': 'Fixed',
  print: 'Print',
  physical: 'Physical',
};

/** Infer category from a platform id when the stored config lacks the field */
function inferCategory(id: string): PlatformCategory {
  if (id === 'web') return 'digital-responsive';
  if (id === 'print' || id === 'printA4' || id === 'printBusinessCard') return 'print';
  if (id === 'outdoor') return 'physical';
  if (id.endsWith('-native')) return 'digital-fixed';
  return 'digital-responsive';
}

function getCategory(p: PlatformEntry): PlatformCategory {
  return p.category ?? inferCategory(p.id);
}

export function PlatformList({
  platforms,
  defaultPlatformId,
  onUpdatePlatform,
  onTogglePlatform,
  onRenamePlatform,
  onDeletePlatform,
  onAddPlatform,
  disabled,
}: PlatformListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PlatformCategory | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggle = useCallback(
    (e: React.MouseEvent, id: string, currentEnabled: boolean) => {
      e.stopPropagation();
      onTogglePlatform(id, !currentEnabled);
    },
    [onTogglePlatform]
  );

  const handleBreakpointChange = useCallback(
    (platform: PlatformEntry, breakpoints: PlatformBreakpoint[]) => {
      const active = breakpoints.filter((bp) => bp.isActive);
      const viewportMin = active.length > 0
        ? Math.min(...active.map((bp) => bp.viewportWidth))
        : 360;
      const viewportMax = active.length > 0
        ? Math.max(...active.map((bp) => bp.viewportWidth))
        : 1920;
      // Fluid scaling is automatic: 2+ active breakpoints = fluid
      const fluidScaling = active.length >= 2;
      onUpdatePlatform({ ...platform, breakpoints, viewportMin, viewportMax, fluidScaling });
    },
    [onUpdatePlatform]
  );

  const handleDensityChange = useCallback(
    (platform: PlatformEntry, densityConfigs: PlatformDensityConfig[]) => {
      onUpdatePlatform({ ...platform, densityConfigs });
    },
    [onUpdatePlatform]
  );

  const handleStartRename = useCallback(
    (e: React.MouseEvent, platform: PlatformEntry) => {
      e.stopPropagation();
      setRenamingId(platform.id);
      setRenameValue(platform.label);
      // Focus input on next tick after render
      requestAnimationFrame(() => renameInputRef.current?.select());
    },
    []
  );

  const handleConfirmRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      onRenamePlatform(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  }, [renamingId, renameValue, onRenamePlatform]);

  const handleCancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue('');
  }, []);

  const handleRequestDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setConfirmDeleteId(id);
    },
    []
  );

  const handleConfirmDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirmDeleteId) {
        onDeletePlatform(confirmDeleteId);
        if (expandedId === confirmDeleteId) setExpandedId(null);
      }
      setConfirmDeleteId(null);
    },
    [confirmDeleteId, onDeletePlatform, expandedId]
  );

  const handleCancelDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmDeleteId(null);
    },
    []
  );

  // Group platforms by category (Digital Responsive / Digital Fixed / Print /
  // Physical) so the editor shows clear section headers and matches the
  // designer's mental model instead of a flat mixed list.
  const groupedPlatforms = useMemo<Array<[PlatformCategory, PlatformEntry[]]>>(() => {
    const groups = new Map<PlatformCategory, PlatformEntry[]>();
    for (const platform of platforms) {
      const category = getCategory(platform);
      const existing = groups.get(category);
      if (existing) {
        existing.push(platform);
      } else {
        groups.set(category, [platform]);
      }
    }
    // Preserve CATEGORY_ORDER, dropping empty groups.
    return CATEGORY_ORDER
      .map((cat): [PlatformCategory, PlatformEntry[]] => [cat, groups.get(cat) ?? []])
      .filter(([, items]) => items.length > 0);
  }, [platforms]);

  useEffect(() => {
    if (groupedPlatforms.length === 0) {
      setActiveCategory(null);
      return;
    }
    if (!activeCategory || !groupedPlatforms.some(([category]) => category === activeCategory)) {
      setActiveCategory(groupedPlatforms[0][0]);
    }
  }, [activeCategory, groupedPlatforms]);

  const visibleCategory = activeCategory ?? groupedPlatforms[0]?.[0] ?? null;
  const visibleItems = groupedPlatforms.find(([category]) => category === visibleCategory)?.[1] ?? [];

  const renderPlatformRow = (platform: PlatformEntry) => {
    const isExpanded = expandedId === platform.id;
    const activeBreakpoints = platform.breakpoints.filter((bp) => bp.isActive);
    return (
      <div
        key={platform.id}
        className={[
          styles.row,
          !platform.isEnabled && styles.rowDisabled,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Clickable header */}
        <div
          className={styles.rowHeader}
          onClick={() => handleToggleExpand(platform.id)}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleExpand(platform.id);
            }
          }}
        >
          <div className={styles.rowIcon}>
            <Icon name={getPlatformIconName(platform.id)} size={20} />
          </div>
          <div className={styles.rowInfo}>
            {renamingId === platform.id ? (
              <div
                className={styles.renameRow}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={renameInputRef}
                  className={styles.renameInput}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename();
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  aria-label="Rename platform"
                />
                <button
                  className={styles.renameAction}
                  onClick={handleConfirmRename}
                  type="button"
                  aria-label="Confirm rename"
                >
                  <Check size={14} />
                </button>
                <button
                  className={styles.renameAction}
                  onClick={handleCancelRename}
                  type="button"
                  aria-label="Cancel rename"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <h3 className={styles.rowLabel}>{platform.label}</h3>
            )}
          </div>
          {/*
           * Single category Badge on the right replaces both the
           * old subtitle text and the old per-row stats. Shows the
           * type (Responsive / Fixed / Print / Physical) plus the
           * breakpoint count so the row still communicates its shape
           * at a glance, without any free-floating text.
           */}
          <div className={styles.rowMeta}>
            <Badge attention="medium" appearance="neutral" size="s">
              {CATEGORY_BADGE_LABELS[getCategory(platform)]} · {activeBreakpoints.length}
            </Badge>
          </div>

          {/*
           * Row actions collapse into a three-dot overflow Menu so the row
           * header stays clean. Delete is disabled (and the confirmation
           * flow triggered inline) when the platform is either the default
           * or the last remaining entry — matches the previous guard-rails.
           */}
          <div
            className={styles.rowActions}
            onClick={(e) => e.stopPropagation()}
          >
            {confirmDeleteId === platform.id ? (
              <div className={styles.deleteConfirm}>
                <span className={styles.deleteConfirmText}>Delete?</span>
                <button
                  className={styles.deleteConfirmYes}
                  onClick={handleConfirmDelete}
                  type="button"
                  aria-label="Confirm delete"
                >
                  Yes
                </button>
                <button
                  className={styles.deleteConfirmNo}
                  onClick={handleCancelDelete}
                  type="button"
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            ) : (
              <Menu>
                <Menu.Trigger
                  render={
                    <IconButton
                      attention="low"
                      appearance="neutral"
                      size="s"
                      disabled={disabled}
                      icon={<MoreHorizontal size={14} />}
                      aria-label={`${platform.label} actions`}
                    />
                  }
                />
                <Menu.Portal side="bottom" align="end">
                  <Menu.Item
                    onClick={() => onTogglePlatform(platform.id, !platform.isEnabled)}
                  >
                    {platform.isEnabled ? <X size={14} /> : <Check size={14} />}
                    <span>{platform.isEnabled ? 'Disable' : 'Enable'}</span>
                  </Menu.Item>
                  <Menu.Item onClick={() => handleStartRename({ stopPropagation: () => {} } as React.MouseEvent, platform)}>
                    <Pencil size={14} />
                    <span>Rename</span>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => setConfirmDeleteId(platform.id)}
                    disabled={platform.id === defaultPlatformId || platforms.length <= 1}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </Menu.Item>
                </Menu.Portal>
              </Menu>
            )}
          </div>
          <ChevronRight
            size={16}
            className={[styles.chevron, isExpanded && styles.chevronExpanded]
              .filter(Boolean)
              .join(' ')}
          />
        </div>

        {/* Expanded body with all settings */}
        {isExpanded && (
          <div className={styles.rowBody}>
            {/* DIN 1450 Parameters — section heading shows the computed
                base size inline on the right so the result is visible
                without dedicating a separate block to it. */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>DIN 1450 parameters</h4>
                <span className={styles.sectionResult}>
                  <span className={styles.sectionResultLabel}>Base size</span>
                  <span className={styles.sectionResultValue}>
                    {platform.calculatedBaseSize} px
                  </span>
                </span>
              </div>
              <PlatformDetailEditor
                platform={platform}
                onChange={onUpdatePlatform}
                disabled={disabled || !platform.isEnabled}
              />
            </div>

            {/* Breakpoints */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Breakpoints</h4>
              </div>
              <BreakpointEditor
                breakpoints={platform.breakpoints}
                category={getCategory(platform)}
                onChange={(bps) => handleBreakpointChange(platform, bps)}
                disabled={disabled || !platform.isEnabled}
              />
            </div>

            {/* Density */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Density</h4>
              </div>
              <DensityConfigTable
                densityConfigs={platform.densityConfigs}
                breakpoints={platform.breakpoints}
                onChange={(configs) => handleDensityChange(platform, configs)}
                disabled={disabled || !platform.isEnabled}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.list}>
      {groupedPlatforms.length > 1 && visibleCategory && (
        <div className={styles.categoryTabsRow}>
          <Tabs.Root
            value={visibleCategory}
            onValueChange={(value) => setActiveCategory((value as PlatformCategory) ?? groupedPlatforms[0]?.[0] ?? null)}
          >
            <Tabs.List className={styles.categoryTabsList}>
              {groupedPlatforms.map(([category, items]) => (
                <Tabs.Item key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                  <span className={styles.categoryTabCount}>{items.length}</span>
                </Tabs.Item>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>
      )}

      {visibleCategory && (
        <div className={styles.categoryGroup}>
          <div className={styles.categoryHeader}>
            <span>{CATEGORY_LABELS[visibleCategory]}</span>
            <span className={styles.categoryHeaderCount}>
              · {visibleItems.length} {visibleItems.length === 1 ? 'platform' : 'platforms'}
            </span>
          </div>
          {visibleItems.map(renderPlatformRow)}
        </div>
      )}

      {/* Add Platform button */}
      <button
        className={styles.addPlatformButton}
        onClick={onAddPlatform}
        disabled={disabled}
        type="button"
      >
        <Plus size={16} />
        Add Platform
      </button>
    </div>
  );
}
