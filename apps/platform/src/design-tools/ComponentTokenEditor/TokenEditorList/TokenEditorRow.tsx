/**
 * TokenEditorRow.tsx
 *
 * Single token row with name, value selector, and reset button.
 */

'use client';

import React from 'react';
import { Lock, RotateCcw } from 'lucide-react';
import { TokenSelector } from './TokenSelector';
import { getAvailableTokensForDefinition } from '@oneui/shared';
import type { TokenEditorRowProps } from '../types';
import styles from '../PropertyPanel/PropertyPanel.module.css';

/**
 * TokenEditorRow Component
 *
 * Renders a single token editor row with controls.
 */
export function TokenEditorRow({
  tokenName,
  definition,
  currentValue,
  source,
  isOverridden,
  onChange,
  onReset,
  className,
}: TokenEditorRowProps) {
  const isLocked = definition.locked === true;
  const availableTokens = getAvailableTokensForDefinition(definition);

  return (
    <div
      className={`${styles.tokenRow} ${className || ''}`}
      data-locked={isLocked}
      data-overridden={isOverridden}
    >
      <div className={styles.tokenHeader}>
        <span className={styles.tokenName}>
          {isLocked && <Lock size={12} className={styles.lockIcon} />}
          {tokenName}
        </span>
        <span className={styles.sourceBadge} data-source={source}>
          {source}
        </span>
      </div>

      {definition.description && (
        <p className={styles.tokenDescription}>{definition.description}</p>
      )}

      <div className={styles.tokenControls}>
        <TokenSelector
          value={currentValue}
          options={availableTokens}
          disabled={isLocked}
          onChange={onChange}
        />
        <button
          className={styles.resetButton}
          onClick={onReset}
          disabled={!isOverridden}
          aria-label={`Reset ${tokenName} to default`}
          title={isLocked ? definition.lockReason : 'Reset to default'}
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
