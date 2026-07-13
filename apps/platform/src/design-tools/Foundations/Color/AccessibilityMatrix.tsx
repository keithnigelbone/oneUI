/**
 * AccessibilityMatrix.tsx
 * WCAG contrast validation matrix for text/surface token combinations
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  generateColorScaleFromParams,
  type ColorScaleStep,
  checkContrast,
  formatContrastRatio,
  getWCAGBadge,
} from '@oneui/shared';
import styles from './AccessibilityMatrix.module.css';
import {
  AccessibilityMatrixProps,
  ThemeMode,
  ContrastCell,
  MODE_LABELS,
} from './AccessibilityMatrix.shared';
import { parseStepReference } from './SurfaceTokenEditor.shared';

export const AccessibilityMatrix: React.FC<AccessibilityMatrixProps> = ({
  textMappings,
  surfaceMappings,
  primaryHue = 340,
  primaryChroma = 0.18,
  activeMode: controlledMode,
  onModeChange,
}) => {
  // Internal state for mode if not controlled
  const [internalMode, setInternalMode] = useState<ThemeMode>('light');
  const activeMode = controlledMode ?? internalMode;

  const handleModeChange = useCallback(
    (mode: ThemeMode) => {
      if (onModeChange) {
        onModeChange(mode);
      } else {
        setInternalMode(mode);
      }
    },
    [onModeChange]
  );

  // Generate color from step reference
  const getColor = useCallback(
    (stepRef: string): string | null => {
      if (stepRef === 'transparent') return null;
      const parsed = parseStepReference(stepRef);
      if (!parsed) return null;

      const scale = generateColorScaleFromParams({
        hue: primaryHue,
        chroma: parsed.scale === 'Neutral' ? 0.02 : primaryChroma,
        baseStep: 500 as ColorScaleStep,
      });
      const step = scale.steps.find((s) => s.step === parsed.step);
      return step?.oklch ?? null;
    },
    [primaryHue, primaryChroma]
  );

  // Get step for current mode
  const getStepForMode = useCallback(
    (
      mapping: { lightModeStep: string; darkModeStep: string; dimModeStep: string },
      mode: ThemeMode
    ): string => {
      switch (mode) {
        case 'light':
          return mapping.lightModeStep;
        case 'dark':
          return mapping.darkModeStep;
        default:
          return mapping.lightModeStep;
      }
    },
    []
  );

  // Calculate contrast matrix
  const contrastMatrix = useMemo((): ContrastCell[][] => {
    return textMappings.map((textMapping) => {
      const textStep = getStepForMode(textMapping, activeMode);
      const textColor = getColor(textStep);

      return surfaceMappings.map((surfaceMapping) => {
        const surfaceStep = getStepForMode(surfaceMapping, activeMode);
        const surfaceColor = getColor(surfaceStep);

        // Calculate contrast if both colors are valid
        let ratio: number | null = null;
        let passesAA = false;
        let passesAALarge = false;
        let passesAAA = false;

        if (textColor && surfaceColor) {
          const result = checkContrast(textColor, surfaceColor);
          ratio = result.ratio;
          passesAA = result.passesAA;
          passesAALarge = result.passesAALarge;
          passesAAA = result.passesAAA;
        }

        return {
          textToken: textMapping.tokenName,
          surfaceToken: surfaceMapping.tokenName,
          textStep,
          surfaceStep,
          textColor,
          surfaceColor,
          ratio,
          passesAA,
          passesAALarge,
          passesAAA,
        };
      });
    });
  }, [textMappings, surfaceMappings, activeMode, getStepForMode, getColor]);

  // Calculate summary stats
  const stats = useMemo(() => {
    let total = 0;
    let passAAA = 0;
    let passAA = 0;
    let passAALarge = 0;
    let fail = 0;

    contrastMatrix.forEach((row) => {
      row.forEach((cell) => {
        if (cell.ratio !== null) {
          total++;
          if (cell.passesAAA) passAAA++;
          else if (cell.passesAA) passAA++;
          else if (cell.passesAALarge) passAALarge++;
          else fail++;
        }
      });
    });

    return { total, passAAA, passAA, passAALarge, fail };
  }, [contrastMatrix]);

  // Get badge class for a cell
  const getBadgeClass = (cell: ContrastCell): string => {
    if (cell.passesAAA) return styles.badgeAAA;
    if (cell.passesAA) return styles.badgeAA;
    if (cell.passesAALarge) return styles.badgeAALarge;
    return styles.badgeFail;
  };

  // Get badge text for a cell
  const getBadgeText = (cell: ContrastCell): string => {
    if (cell.passesAAA) return 'AAA';
    if (cell.passesAA) return 'AA';
    if (cell.passesAALarge) return 'AA Large';
    return 'Fail';
  };

  return (
    <div className={styles.container}>
      {/* Mode selector */}
      <div className={styles.modeSelector}>
        {(['light', 'dark', 'dim'] as ThemeMode[]).map((mode) => (
          <button
            key={mode}
            className={styles.modeTab}
            data-active={activeMode === mode}
            onClick={() => handleModeChange(mode)}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendBadge} ${styles.badgeAAA}`}>AAA</span>
          <span className={styles.legendLabel}>7:1+ Enhanced contrast</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendBadge} ${styles.badgeAA}`}>AA</span>
          <span className={styles.legendLabel}>4.5:1+ Standard contrast</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendBadge} ${styles.badgeAALarge}`}>AA Large</span>
          <span className={styles.legendLabel}>3:1+ Large text only</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendBadge} ${styles.badgeFail}`}>Fail</span>
          <span className={styles.legendLabel}>&lt;3:1 Insufficient</span>
        </div>
      </div>

      {/* Matrix table */}
      <div className={styles.matrixWrapper}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th className={styles.headerCell}></th>
              {surfaceMappings.map((surface) => (
                <th key={surface.tokenName} className={styles.headerCell}>
                  {surface.tokenName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contrastMatrix.map((row, rowIndex) => (
              <tr key={textMappings[rowIndex].tokenName}>
                <td className={styles.rowHeader}>
                  {textMappings[rowIndex].tokenName}
                </td>
                {row.map((cell) => (
                  <td
                    key={`${cell.textToken}-${cell.surfaceToken}`}
                    className={`${styles.cell} ${
                      cell.ratio === null ? styles.cellNA : ''
                    }`}
                  >
                    {cell.ratio !== null && cell.textColor && cell.surfaceColor ? (
                      <div className={styles.contrastCell}>
                        <div
                          className={styles.colorPreview}
                          style={{ backgroundColor: cell.surfaceColor }}
                        >
                          <span style={{ color: cell.textColor }}>Aa</span>
                        </div>
                        <div className={styles.contrastInfo}>
                          <span className={styles.ratioText}>
                            {formatContrastRatio(cell.ratio)}
                          </span>
                          <span className={`${styles.badge} ${getBadgeClass(cell)}`}>
                            {getBadgeText(cell)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className={styles.naText}>N/A</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Combinations</span>
          <span className={styles.summaryValue}>{stats.total}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>AAA Compliant</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>
            {stats.passAAA}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>AA Compliant</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>
            {stats.passAA}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>AA Large Only</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueWarning}`}>
            {stats.passAALarge}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Failing</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueError}`}>
            {stats.fail}
          </span>
        </div>
      </div>
    </div>
  );
};
