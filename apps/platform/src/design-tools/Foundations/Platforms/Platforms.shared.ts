/**
 * Platforms.shared.ts
 * Shared types, defaults, and prop interfaces for the Platforms foundation.
 */

import type {
  PlatformBreakpoint,
  PlatformCategory,
  PlatformDensityConfig,
  PlatformEntry,
  PlatformsFoundationConfig,
} from '@oneui/shared';

// Re-export shared types for convenience
export type {
  PlatformBreakpoint,
  PlatformCategory,
  PlatformDensityConfig,
  PlatformEntry,
  PlatformsFoundationConfig,
};

export interface PlatformListProps {
  platforms: PlatformEntry[];
  defaultPlatformId?: string;
  onUpdatePlatform: (updated: PlatformEntry) => void;
  onTogglePlatform: (id: string, enabled: boolean) => void;
  onRenamePlatform: (id: string, newLabel: string) => void;
  onDeletePlatform: (id: string) => void;
  onAddPlatform: () => void;
  disabled?: boolean;
}

export interface PlatformDetailEditorProps {
  platform: PlatformEntry;
  onChange: (updated: PlatformEntry) => void;
  disabled?: boolean;
}

export interface BreakpointEditorProps {
  breakpoints: PlatformBreakpoint[];
  onChange: (breakpoints: PlatformBreakpoint[]) => void;
  disabled?: boolean;
  /**
   * Parent platform category — drives which editor affordances are shown.
   *
   * - `digital-responsive` (default): only the width field + viewport ruler.
   * - `digital-fixed` / `print` / `physical`: adds height + units fields so
   *   fixed-canvas variants (A4, Business Card, Billboard) can be edited
   *   with their native dimensions. Width/height units are stored as 'px'
   *   or 'mm' directly in the breakpoint record.
   */
  category?: PlatformCategory;
}

export interface DensityConfigTableProps {
  densityConfigs: PlatformDensityConfig[];
  breakpoints: PlatformBreakpoint[];
  onChange: (configs: PlatformDensityConfig[]) => void;
  disabled?: boolean;
}

export interface PlatformSyncIndicatorProps {
  syncTypography: boolean;
  syncSpacing: boolean;
  onToggleSyncTypography: (enabled: boolean) => void;
  onToggleSyncSpacing: (enabled: boolean) => void;
  onSyncNow: () => void;
  isSyncing?: boolean;
  disabled?: boolean;
}
