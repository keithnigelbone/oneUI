'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { Button, type ButtonSize } from '@oneui/ui/components/Button';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { LockToggle } from './LockToggle';
import {
  DEFAULT_ATTENTION_ROWS,
  cellKeyToString,
  inferSelectionScope,
  capitalize,
  type CellKey,
} from './buildAttentionMatrix';
import styles from './ButtonEditorCanvas.module.css';

export interface ButtonEditorCanvasProps {
  /** Configured appearance roles for this brand — one column per role. */
  appearances: ComponentAppearance[];
  /** Button size used for every cell in the matrix. */
  size?: ButtonSize;
  /** Notifies parent editor of the inferred variant scope so right-panel
   *  token rows resolve the correct variant bucket (otherwise every cell
   *  click would only update context-level granular state and the parent
   *  selectedVariant/selectedSize would drift out of sync). */
  onVariantChange?: (variant: string) => void;
  /** Notifies parent editor of the inferred size scope. */
  onSizeChange?: (size: string) => void;
}

export function ButtonEditorCanvas({ appearances, size = 10, onVariantChange, onSizeChange }: ButtonEditorCanvasProps) {
  const [locked, setLocked] = useState(true);
  const [selected, setSelected] = useState<ReadonlyArray<CellKey>>([]);
  const { setGranularTarget } = useComponentTokenEditor();

  const safeAppearances = useMemo<ComponentAppearance[]>(
    () => (appearances.length > 0 ? appearances : (['primary'] as ComponentAppearance[])),
    [appearances],
  );

  const selectedKeys = useMemo(() => new Set(selected.map(cellKeyToString)), [selected]);

  const applyScope = useCallback(
    (next: ReadonlyArray<CellKey>) => {
      const scope = inferSelectionScope(next);
      if (scope.scope === 'global') {
        setGranularTarget({});
        onVariantChange?.('all');
        onSizeChange?.('all');
        return;
      }
      const nextVariant = scope.variant;
      const nextSize = scope.size !== undefined ? String(scope.size) : undefined;
      setGranularTarget({ variant: nextVariant, size: nextSize });
      // Keep the editor's parent-level selectedVariant/selectedSize in sync so
      // TokenRow scope-lock detection matches the cell the user actually clicked.
      onVariantChange?.(nextVariant ?? 'all');
      onSizeChange?.(nextSize ?? 'all');
    },
    [setGranularTarget, onVariantChange, onSizeChange],
  );

  const handleCellClick = useCallback(
    (cell: CellKey, event: React.MouseEvent) => {
      if (locked) return;
      const multi = event.shiftKey || event.metaKey || event.ctrlKey;
      const key = cellKeyToString(cell);
      const wasSelected = selectedKeys.has(key);

      let next: CellKey[];
      if (multi) {
        next = wasSelected ? selected.filter((c) => cellKeyToString(c) !== key) : [...selected, cell];
      } else {
        next = wasSelected && selected.length === 1 ? [] : [cell];
      }
      setSelected(next);
      applyScope(next);
    },
    [locked, selectedKeys, selected, applyScope],
  );

  const scopeLabel = useMemo(() => {
    const scope = inferSelectionScope(selected);
    if (scope.scope === 'variant-size') return `${capitalize(scope.variant!)} · size ${scope.size}`;
    if (scope.scope === 'variant') return `${capitalize(scope.variant!)} (all sizes)`;
    if (scope.scope === 'size') return `Size ${scope.size} (all variants)`;
    return null;
  }, [selected]);

  return (
    <div className={styles.wrapper} data-draggable="false">
      <div className={styles.matrixScroll} data-draggable="false">
        <div
          className={styles.matrix}
          style={{
            gridTemplateColumns: `var(--Dimension-f9, 120px) repeat(${safeAppearances.length}, minmax(var(--Dimension-f10, 140px), 1fr))`,
          }}
          data-locked={locked}
        >
          {/* Top-left spacer */}
          <div aria-hidden />

          {/* Column headers — appearance roles */}
          {safeAppearances.map((role) => (
            <div key={`col-${role}`} className={styles.colHeader}>
              {capitalize(role)}
            </div>
          ))}

          {/* Rows: one per attention level */}
          {DEFAULT_ATTENTION_ROWS.map(({ variant, attention, label }) => (
            <React.Fragment key={`row-${variant}`}>
              <div className={styles.rowHeader}>
                <span className={styles.rowLabel}>{label}</span>
                <span className={styles.rowSub}>{capitalize(variant)}</span>
              </div>
              {safeAppearances.map((appearance) => {
                const cell: CellKey = { appearance, variant, size };
                const key = cellKeyToString(cell);
                const isSelected = selectedKeys.has(key);
                return (
                  <div
                    key={key}
                    className={styles.cell}
                    data-selected={isSelected || undefined}
                    data-locked={locked || undefined}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    onClick={(e) => handleCellClick(cell, e)}
                    onKeyDown={(e) => {
                      if (locked) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(cell, e as unknown as React.MouseEvent);
                      }
                    }}
                  >
                    <div className={styles.cellInner}>
                      <Button
                        attention={attention}
                        size={size}
                        appearance={appearance}
                        onPress={() => {}}
                      >
                        Button
                      </Button>
                    </div>
                    {isSelected && scopeLabel ? (
                      <span className={styles.selectionPill} aria-hidden>
                        {scopeLabel}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={styles.floatingLock} data-draggable="false">
        <LockToggle locked={locked} onToggle={setLocked} />
      </div>
    </div>
  );
}
