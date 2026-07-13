/**
 * Foundation type definitions
 * Shared types for foundation configuration
 */

export type FoundationType =
  | 'color'
  | 'surfaces'
  | 'materials'
  | 'typography'
  | 'spacing'
  | 'shape'
  | 'elevation'
  | 'motion'
  | 'icons';

export interface FoundationDraftState<T> {
  /** Current draft state */
  draft: T | null;
  /** Has unsaved changes */
  isDirty: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Applying changes state */
  isApplying: boolean;
  /** Error message if any */
  error: string | null;
}

export interface FoundationDraftActions<T> {
  /** Update draft with partial changes */
  updateDraft: (updates: Partial<T>) => void;
  /** Set entire draft */
  setDraft: (config: T) => void;
  /** Apply changes to database */
  applyChanges: () => Promise<void>;
  /** Reset to saved state */
  resetChanges: () => void;
}
