/**
 * PlatformSyncIndicator.tsx
 * Sync status and controls for typography/spacing foundations
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { PlatformSyncIndicatorProps } from './Platforms.shared';
import styles from './PlatformSyncIndicator.module.css';

export function PlatformSyncIndicator({
  syncTypography,
  syncSpacing,
  onToggleSyncTypography,
  onToggleSyncSpacing,
  onSyncNow,
  isSyncing,
  disabled,
}: PlatformSyncIndicatorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.syncRow}>
        <div className={styles.syncLabel}>
          <span className={styles.syncTitle}>Typography Sync</span>
          <span className={styles.syncDescription}>
            Push DIN 1450 params (viewing distance, PPI, pixel density) to typography foundation
          </span>
        </div>
        <input
          type="checkbox"
          checked={syncTypography}
          onChange={(e) => onToggleSyncTypography(e.target.checked)}
          disabled={disabled}
          aria-label="Enable typography sync"
        />
      </div>

      <div className={styles.syncRow}>
        <div className={styles.syncLabel}>
          <span className={styles.syncTitle}>Spacing Sync</span>
          <span className={styles.syncDescription}>
            Push viewport range and density to spacing foundation
          </span>
        </div>
        <input
          type="checkbox"
          checked={syncSpacing}
          onChange={(e) => onToggleSyncSpacing(e.target.checked)}
          disabled={disabled}
          aria-label="Enable spacing sync"
        />
      </div>

      <button
        className={`${styles.syncButton} ${isSyncing ? styles.syncButtonSyncing : ''}`}
        onClick={onSyncNow}
        disabled={disabled || isSyncing}
        type="button"
      >
        <RefreshCw size={14} />
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
