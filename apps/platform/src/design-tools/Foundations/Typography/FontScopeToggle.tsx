/**
 * FontScopeToggle.tsx
 * Toggle between single font and primary/secondary font modes
 */

import { memo } from 'react';
import type { FontScope } from './fonts';
import styles from './Typography.module.css';

export interface FontScopeToggleProps {
  /** Current scope mode */
  scope: FontScope;
  /** Scope change handler */
  onScopeChange: (scope: FontScope) => void;
  /** Whether toggle is disabled */
  disabled?: boolean;
}

/**
 * FontScopeToggle - Switch between single and dual font mode
 */
export const FontScopeToggle = memo(function FontScopeToggle({
  scope,
  onScopeChange,
  disabled = false,
}: FontScopeToggleProps) {
  return (
    <div className={styles.fontScopeToggle} role="radiogroup" aria-label="Font scope selection">
      <button
        type="button"
        role="radio"
        aria-checked={scope === 'single'}
        className={styles.fontScopeOption}
        data-selected={scope === 'single'}
        onClick={() => onScopeChange('single')}
        disabled={disabled}
      >
        <span className={styles.fontScopeRadio} data-checked={scope === 'single'} />
        <span className={styles.fontScopeLabel}>One font for all</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={scope === 'dual'}
        className={styles.fontScopeOption}
        data-selected={scope === 'dual'}
        onClick={() => onScopeChange('dual')}
        disabled={disabled}
      >
        <span className={styles.fontScopeRadio} data-checked={scope === 'dual'} />
        <span className={styles.fontScopeLabel}>Primary + Secondary</span>
      </button>
    </div>
  );
});
