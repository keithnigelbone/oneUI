/**
 * ColorScalePreview.tsx
 * Visual preview of generated color scale
 */

'use client';

import { useMemo } from 'react';
import { generateColorScaleFromParams, ColorStepValue, type ColorScaleStep } from '@oneui/shared';
import styles from './ColorScalePreview.module.css';
import { ColorScalePreviewProps } from './ColorScaleGenerator.shared';

interface StepItemProps {
  step: ColorStepValue;
  isBase: boolean;
  showValues: boolean;
  compact: boolean;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  isBase,
  showValues,
  compact,
}) => {
  const itemClassName = [
    styles.step,
    isBase && styles.stepHighlight,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClassName}>
      <div
        className={styles.swatch}
        style={{ backgroundColor: step.oklch }}
      />
      <span className={styles.stepLabel}>{step.step}</span>
      {showValues && <span className={styles.value}>{step.oklch}</span>}
      {isBase && !compact && <span className={styles.badge}>Base</span>}
    </div>
  );
};

export const ColorScalePreview: React.FC<ColorScalePreviewProps> = ({
  hue,
  chroma,
  baseStep,
  showValues = true,
  compact = false,
}) => {
  const scale = useMemo(
    () => generateColorScaleFromParams({ hue, chroma, baseStep: baseStep as ColorScaleStep }),
    [hue, chroma, baseStep]
  );

  const containerClassName = [
    styles.container,
    compact && styles.compact,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      {scale.steps.map((step) => (
        <StepItem
          key={step.step}
          step={step}
          isBase={step.step === baseStep}
          showValues={showValues}
          compact={compact}
        />
      ))}
    </div>
  );
};

// Strip variant for horizontal display
export const ColorScaleStrip: React.FC<
  ColorScalePreviewProps & {
    onStepClick?: (step: number) => void;
  }
> = ({ hue, chroma, baseStep, onStepClick }) => {
  const scale = useMemo(
    () => generateColorScaleFromParams({ hue, chroma, baseStep: baseStep as ColorScaleStep }),
    [hue, chroma, baseStep]
  );

  return (
    <div className={styles.strip}>
      {scale.steps.map((step) => {
        // Use dark text for light steps (lightness > 60)
        const useDarkText = step.lightness > 60;

        return (
          <div
            key={step.step}
            className={styles.stripItem}
            style={{ backgroundColor: step.oklch }}
            onClick={() => onStepClick?.(step.step)}
            role={onStepClick ? 'button' : undefined}
            tabIndex={onStepClick ? 0 : undefined}
            title={step.oklch}
          >
            <span
              className={`${styles.stripLabel} ${
                useDarkText ? styles.stripLabelDark : ''
              }`}
            >
              {step.step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
