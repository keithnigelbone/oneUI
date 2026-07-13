/**
 * AccessibilityBadge.tsx
 * WCAG compliance indicator badge
 */

import styles from './AccessibilityBadge.module.css';
import {
  AccessibilityBadgeProps,
  calculateBadgeState,
  formatContrastRatio,
} from './AccessibilityBadge.shared';

// Simple SVG icons
const CheckIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 4.5L6.5 11.5L3 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 5.5V8.5M8 11H8.01M7.13 2.5L1.53 12C1.39 12.24 1.32 12.52 1.32 12.8C1.32 13.08 1.4 13.36 1.54 13.6C1.68 13.84 1.88 14.04 2.12 14.18C2.36 14.32 2.64 14.4 2.92 14.4H13.08C13.36 14.4 13.64 14.32 13.88 14.18C14.12 14.04 14.32 13.84 14.46 13.6C14.6 13.36 14.68 13.08 14.68 12.8C14.68 12.52 14.61 12.24 14.47 12L8.87 2.5C8.73 2.26 8.53 2.07 8.29 1.93C8.05 1.79 7.78 1.72 7.5 1.72C7.22 1.72 6.95 1.79 6.71 1.93C6.47 2.07 6.27 2.26 6.13 2.5L7.13 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AccessibilityBadge: React.FC<AccessibilityBadgeProps> = ({
  contrastRatio,
  size = 'medium',
  showRatio = false,
}) => {
  const { level, variant } = calculateBadgeState(contrastRatio);

  const Icon = variant === 'success' ? CheckIcon : variant === 'warning' ? WarningIcon : XIcon;

  const badgeClassName = [styles.badge, styles[size], styles[variant]]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClassName} role="status" aria-label={`WCAG ${level}`}>
      <Icon />
      <span>{level}</span>
      {showRatio && (
        <span className={styles.ratio}>
          ({formatContrastRatio(contrastRatio)})
        </span>
      )}
    </span>
  );
};
