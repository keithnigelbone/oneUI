/**
 * ApplyChangesBar.tsx
 * Fixed action bar for apply/reset changes workflow
 */

import styles from './ApplyChangesBar.module.css';
import { ApplyChangesBarProps } from './ApplyChangesBar.shared';

export const ApplyChangesBar: React.FC<ApplyChangesBarProps> = ({
  isDirty,
  isApplying = false,
  onApply,
  onReset,
  applyLabel = 'Apply Changes',
  resetLabel = 'Reset',
}) => {
  const barClassName = [styles.bar, isDirty && styles.barVisible]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container} aria-live="polite">
      <div className={barClassName} role="alert">
        <div className={styles.message}>
          <span className={styles.dot} />
          <span className={styles.text}>Unsaved changes</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.resetButton}
            onClick={onReset}
            disabled={isApplying}
          >
            {resetLabel}
          </button>
          <button
            className={styles.applyButton}
            onClick={onApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <span className={styles.spinner} />
            ) : (
              applyLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
