/**
 * TokenEditorList.tsx
 *
 * List of editable tokens grouped by category.
 */

'use client';

import React, { useMemo } from 'react';
import { TokenEditorRow } from './TokenEditorRow';
import type { TokenEditorListProps } from '../types';
import styles from '../PropertyPanel/PropertyPanel.module.css';

/**
 * TokenEditorList Component
 *
 * Renders a list of token editors grouped by category.
 */
export function TokenEditorList({
  manifest,
  selectedCategory,
  mode,
  draftOverrides,
  onTokenChange,
  onTokenReset,
  className,
}: TokenEditorListProps) {
  // Filter tokens by selected category
  const filteredTokens = useMemo(() => {
    return Object.entries(manifest.tokens).filter(([, def]) => {
      if (selectedCategory === 'all') return true;
      return def.category === selectedCategory;
    });
  }, [manifest.tokens, selectedCategory]);

  // Group tokens by category for display
  const groupedTokens = useMemo(() => {
    const groups: Record<string, Array<[string, typeof manifest.tokens[string]]>> = {};

    for (const [name, def] of filteredTokens) {
      const category = def.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push([name, def]);
    }

    return groups;
  }, [filteredTokens]);

  // Get current value for a token
  const getCurrentValue = (tokenName: string): { value: string; isOverridden: boolean } => {
    const override = draftOverrides.get(tokenName);
    if (override) {
      return { value: override.selectedToken, isOverridden: true };
    }

    const definition = manifest.tokens[tokenName];
    return { value: definition?.defaultToken || '', isOverridden: false };
  };

  return (
    <div className={`${styles.content} ${className || ''}`}>
      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <div key={category} className={styles.tokenGroup}>
          {selectedCategory === 'all' && (
            <h3 className={styles.tokenGroupTitle}>{category}</h3>
          )}
          <div className={styles.tokenList}>
            {tokens.map(([tokenName, definition]) => {
              const { value, isOverridden } = getCurrentValue(tokenName);

              return (
                <TokenEditorRow
                  key={tokenName}
                  tokenName={tokenName}
                  definition={definition}
                  currentValue={value}
                  source={isOverridden ? 'override' : 'default'}
                  isOverridden={isOverridden}
                  onChange={(selectedToken) => onTokenChange(tokenName, selectedToken)}
                  onReset={() => onTokenReset(tokenName)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
