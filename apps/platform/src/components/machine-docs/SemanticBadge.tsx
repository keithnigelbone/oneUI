'use client';

import type { CSSProperties } from 'react';
import styles from './MachineDocs.module.css';

type SemanticBadgeIntent = 'info' | 'success' | 'warning' | 'critical' | 'experimental' | 'neutral';

interface SemanticBadgeProps {
  intent?: SemanticBadgeIntent;
  label: string;
}

function getIntentStyles(intent: SemanticBadgeIntent): CSSProperties {
  switch (intent) {
    case 'success':
      return {
        backgroundColor: 'var(--Positive-Subtle, oklch(0.93 0.04 155))',
        color: 'var(--Positive-Tinted, oklch(0.50 0.12 155))',
      };
    case 'warning':
    case 'experimental':
      return {
        backgroundColor: 'var(--Warning-Subtle, oklch(0.93 0.06 85))',
        color: 'var(--Warning-Tinted, oklch(0.55 0.12 85))',
      };
    case 'critical':
      return {
        backgroundColor: 'var(--Negative-Subtle, oklch(0.93 0.05 25))',
        color: 'var(--Negative-Tinted, oklch(0.55 0.15 25))',
      };
    case 'neutral':
      return {
        backgroundColor: 'var(--Neutral-Subtle, oklch(0.93 0 0))',
        color: 'var(--Neutral-Tinted, oklch(0.55 0 0))',
      };
    case 'info':
    default:
      return {
        backgroundColor: 'var(--Informative-Subtle, oklch(0.93 0.04 260))',
        color: 'var(--Informative-Tinted, oklch(0.55 0.12 260))',
      };
  }
}

export function SemanticBadge({ intent = 'info', label }: SemanticBadgeProps) {
  return (
    <span
      className={styles.inlineCode}
      style={{
        ...getIntentStyles(intent),
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--Spacing-1-5) var(--Spacing-2-5)',
        borderRadius: 'var(--Shape-2)',
        border: 'var(--Stroke-M) solid transparent',
        fontFamily: 'var(--Typography-Font-Code, monospace)',
      }}
    >
      {label}
    </span>
  );
}
