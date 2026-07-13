/**
 * ColorScaleGenerator.tsx
 * Interactive editor for generating OkLCH color scales
 */

'use client';

import { useMemo, useCallback } from 'react';
import { generateColorScaleFromParams, COLOR_SCALE_STEPS, type ColorScaleStep } from '@oneui/shared';
import { SliderControl } from '../shared';
import styles from './ColorScaleGenerator.module.css';
import {
  ColorScaleGeneratorProps,
  HUE_PRESETS,
  CHROMA_PRESETS,
} from './ColorScaleGenerator.shared';

export const ColorScaleGenerator: React.FC<ColorScaleGeneratorProps> = ({
  name,
  hue,
  chroma,
  baseStep,
  onChange,
  onNameChange,
  disabled = false,
}) => {
  // Generate color scale from current parameters
  const scale = useMemo(
    () => generateColorScaleFromParams({ hue, chroma, baseStep: baseStep as ColorScaleStep, name }),
    [hue, chroma, baseStep, name]
  );

  // Get base step color for preview
  const baseStepColor = useMemo(() => {
    const step = scale.steps.find((s) => s.step === baseStep);
    // INTENTIONAL-LITERAL: OkLCH color string constructed for palette computation — not CSS styling
  return step?.oklch ?? `oklch(50% ${chroma} ${hue})`;
  }, [scale, baseStep, chroma, hue]);

  // Handle hue preset click
  const handleHuePreset = useCallback(
    (presetHue: number) => {
      onChange({ hue: presetHue });
    },
    [onChange]
  );

  // Handle chroma preset click
  const handleChromaPreset = useCallback(
    (presetChroma: number) => {
      onChange({ chroma: presetChroma });
    },
    [onChange]
  );

  // Check if current value matches a preset
  const isActiveHuePreset = (presetHue: number) =>
    Math.abs(hue - presetHue) < 5;
  const isActiveChromaPreset = (presetChroma: number) =>
    Math.abs(chroma - presetChroma) < 0.01;

  return (
    <div className={styles.container}>
      {/* Scale name */}
      <div className={styles.header}>
        {onNameChange ? (
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={styles.nameInput}
            placeholder="Scale name"
            disabled={disabled}
          />
        ) : (
          <span className={styles.nameInput}>{name}</span>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          {/* Hue control */}
          <div className={styles.controlGroup}>
            <SliderControl
              label="Hue"
              value={hue}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={(value) => onChange({ hue: value })}
              disabled={disabled}
            />
            <div className={styles.presetRow}>
              {HUE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`${styles.presetButton} ${
                    isActiveHuePreset(preset.value)
                      ? styles.presetButtonActive
                      : ''
                  }`}
                  onClick={() => handleHuePreset(preset.value)}
                  disabled={disabled}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chroma control */}
          <div className={styles.controlGroup}>
            <SliderControl
              label="Chroma"
              value={chroma}
              min={0}
              max={0.4}
              step={0.01}
              onChange={(value) => onChange({ chroma: value })}
              disabled={disabled}
              formatValue={(v) => v.toFixed(2)}
            />
            <div className={styles.presetRow}>
              {CHROMA_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`${styles.presetButton} ${
                    isActiveChromaPreset(preset.value)
                      ? styles.presetButtonActive
                      : ''
                  }`}
                  onClick={() => handleChromaPreset(preset.value)}
                  disabled={disabled}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <p className={styles.infoText}>
              Base chroma lock: No step exceeds this value
            </p>
          </div>
        </div>

        {/* Base step control */}
        <SliderControl
          label="Base Step"
          value={baseStep}
          min={0}
          max={1200}
          step={50}
          description="The step with maximum chroma (typically the brand color)"
          onChange={(value) => onChange({ baseStep: value })}
          disabled={disabled}
        />
      </div>

      {/* Color strip preview */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewLabel}>Generated Scale</span>
          <span className={styles.previewValue}>{baseStepColor}</span>
        </div>
        <div className={styles.colorStrip}>
          {scale.steps.map((step) => (
            <div
              key={step.step}
              className={styles.colorStripSegment}
              style={{ backgroundColor: step.oklch }}
              title={`${step.step}: ${step.oklch}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
