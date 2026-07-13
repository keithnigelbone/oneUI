/**
 * ApplyChangesBar.shared.ts
 * Shared types for apply changes action bar
 */

export interface ApplyChangesBarProps {
  isDirty: boolean;
  isApplying?: boolean;
  onApply: () => void;
  onReset: () => void;
  applyLabel?: string;
  resetLabel?: string;
}
