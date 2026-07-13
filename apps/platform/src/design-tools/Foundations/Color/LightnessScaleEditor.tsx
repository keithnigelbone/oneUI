/**
 * LightnessScaleEditor.tsx
 *
 * Global lightness scale configuration editor.
 * Uses OneUI design system components throughout.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  COLOR_SCALE_STEPS,
  LIGHTNESS_SCALE_PRESETS,
  createDefaultLightnessScale,
  createLightnessScaleFromPreset,
  createManualLightnessScale,
  validateLightnessScale,
  type ColorScaleStep,
} from '@oneui/shared';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Badge } from '@oneui/ui/components/Badge';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Input } from '@oneui/ui/components/Input';
import { Icon } from '@oneui/ui/icons/Icon';
import { SliderControl } from '../shared/SliderControl';
import styles from './LightnessScaleEditor.module.css';
import type { LightnessScaleEditorProps, SavedLightnessScale, LightnessValues } from './LightnessScaleEditor.shared';

function lightnessToGray(lightness: number): string {
  const value = Math.round((lightness / 100) * 255);
  // INTENTIONAL-LITERAL: programmatic grayscale swatch color for lightness preview — not CSS styling
  return `rgb(${value}, ${value}, ${value})`;
}

function getContrastText(lightness: number): string {
  // INTENTIONAL-LITERAL: WCAG reference black/white for contrast-based text color selection
  return lightness > 50 ? '#000000' : '#ffffff';
}

export const LightnessScaleEditor: React.FC<LightnessScaleEditorProps> = ({
  config,
  onChange,
  disabled = false,
  savedScales = [],
  onSaveScale,
  onDeleteSavedScale,
  lightnessOffsets = { dark: 0, light: 0 },
}) => {
  const [selectedStep, setSelectedStep] = useState<ColorScaleStep | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveScale = useCallback(async () => {
    if (!onSaveScale || !saveName.trim()) return;
    setIsSaving(true);
    try {
      await onSaveScale(saveName.trim(), saveDescription.trim() || undefined);
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
    } finally {
      setIsSaving(false);
    }
  }, [onSaveScale, saveName, saveDescription]);

  const handleLoadSavedScale = useCallback((saved: SavedLightnessScale) => {
    onChange(createManualLightnessScale(saved.values as LightnessValues));
  }, [onChange]);

  const handleModeChange = useCallback(
    (mode: 'auto' | 'preset' | 'manual') => {
      if (mode === 'auto') {
        onChange(createDefaultLightnessScale());
      } else if (mode === 'preset') {
        onChange(createLightnessScaleFromPreset('perceptual'));
      } else {
        onChange(createManualLightnessScale(config.values));
      }
      setSelectedStep(null);
    },
    [config.values, onChange]
  );

  const handlePresetSelect = useCallback(
    (presetName: string) => onChange(createLightnessScaleFromPreset(presetName)),
    [onChange]
  );

  const handleStepValueChange = useCallback(
    (step: ColorScaleStep, value: number) => {
      const clampedValue = Math.max(0, Math.min(100, value));
      onChange({ mode: 'manual', values: { ...config.values, [step]: clampedValue } });
    },
    [config.values, onChange]
  );

  const handleReset = useCallback(() => {
    onChange(createDefaultLightnessScale());
    setSelectedStep(null);
  }, [onChange]);

  const validation = useMemo(() => validateLightnessScale(config.values), [config.values]);

  const labelSteps = [100, 500, 900, 1300, 1700, 2100, 2500];
  const midStep = 1300;

  const applyOffsets = useCallback((baseLightness: number, step: ColorScaleStep): number => {
    if (step === 100 || step === 2500) return baseLightness;
    let offset = 0;
    if (step < midStep) {
      const blendFactor = Math.min(1, (midStep - step) / (midStep - 100));
      offset = lightnessOffsets.dark * blendFactor;
    } else if (step > midStep) {
      const blendFactor = Math.min(1, (step - midStep) / (2500 - midStep));
      offset = lightnessOffsets.light * blendFactor;
    }
    return Math.max(0, Math.min(100, baseLightness + offset));
  }, [lightnessOffsets, midStep]);

  const hasAnyOffset = lightnessOffsets.dark !== 0 || lightnessOffsets.light !== 0;

  const renderScaleVisualizer = (isInteractive: boolean) => (
    <div className={styles.scaleVisualizer}>
      {/* Color strip */}
      <div className={styles.visualizerStrip} data-interactive={isInteractive}>
        {COLOR_SCALE_STEPS.map((step) => {
          const baseLightness = config.values[step];
          const displayLightness = applyOffsets(baseLightness, step);
          const stepHasOffset = hasAnyOffset && step !== 100 && step !== 2500 && step !== midStep;
          return (
            <div
              key={step}
              className={styles.visualizerStep}
              data-selected={isInteractive && selectedStep === step}
              data-interactive={isInteractive}
              style={{ backgroundColor: lightnessToGray(displayLightness) }}
              onClick={isInteractive ? () => setSelectedStep(step === selectedStep ? null : step) : undefined}
              title={`Step ${step}: ${displayLightness.toFixed(1)}%${stepHasOffset ? ` (base: ${baseLightness.toFixed(1)}%)` : ''}`}
            >
              <span
                className={styles.lightnessValue}
                style={{ color: getContrastText(displayLightness) }}
              >
                {Math.round(displayLightness)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ruler — below the strip, consistent with scale rows above */}
      <div className={styles.visualizerLabels}>
        {labelSteps.map((step) => (
          <span key={step} className={styles.visualizerLabel}>{step}</span>
        ))}
      </div>

      {/* Offset badges */}
      {hasAnyOffset && (
        <div className={styles.offsetIndicator}>
          {lightnessOffsets.dark !== 0 && (
            <Badge attention="medium" appearance="neutral" size="s">
              Dark {lightnessOffsets.dark > 0 ? '+' : ''}{lightnessOffsets.dark.toFixed(1)}
            </Badge>
          )}
          {lightnessOffsets.light !== 0 && (
            <Badge attention="medium" appearance="neutral" size="s">
              Light {lightnessOffsets.light > 0 ? '+' : ''}{lightnessOffsets.light.toFixed(1)}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header row: mode selector left, Save/Reset right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--Spacing-4)' }}>
        <ToggleGroup
          variant="subtool"
          size="small"
          value={config.mode}
          onValueChange={(val) => {
            if (val && val !== config.mode) handleModeChange(val as 'auto' | 'preset' | 'manual');
          }}
        >
          <ToggleGroup.Item value="auto" disabled={disabled}>Auto</ToggleGroup.Item>
          <ToggleGroup.Item value="preset" disabled={disabled}>Preset</ToggleGroup.Item>
          <ToggleGroup.Item value="manual" disabled={disabled}>Manual</ToggleGroup.Item>
        </ToggleGroup>

        {config.mode === 'manual' && (
          <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexShrink: 0 }}>
            {onSaveScale && (
              <Button attention="low" appearance="neutral" size="small" onPress={() => setShowSaveDialog(true)} disabled={disabled}>
                Save as preset
              </Button>
            )}
            <Button attention="low" appearance="neutral" size="small" onPress={handleReset} disabled={disabled}>
              Reset to defaults
            </Button>
          </div>
        )}
      </div>

      {/* Auto Mode Info */}
      {config.mode === 'auto' && (
        <div className={styles.infoText}>
          Auto mode uses the default perceptual lightness distribution, automatically interpolating
          values smoothly from black (0%) through your base color to white (100%).
        </div>
      )}

      {/* Preset Mode */}
      {config.mode === 'preset' && (
        <div className={styles.presetSection}>
          {savedScales.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Your Saved Scales</div>
              <div className={styles.presetGrid}>
                {savedScales.map((saved) => (
                  <div
                    key={saved._id}
                    className={styles.presetCard}
                    data-selected={false}
                    onClick={disabled ? undefined : () => handleLoadSavedScale(saved)}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        handleLoadSavedScale(saved);
                      }
                    }}
                  >
                    <div className={styles.presetName}>{saved.name}</div>
                    {saved.description && (
                      <div className={styles.presetDescription}>{saved.description}</div>
                    )}
                    <div className={styles.presetPreview}>
                      {COLOR_SCALE_STEPS.map((step) => (
                        <div
                          key={step}
                          className={styles.presetPreviewStep}
                          style={{ backgroundColor: lightnessToGray(saved.values[step] as number) }}
                        />
                      ))}
                    </div>
                    {onDeleteSavedScale && (
                      <span
                        className={styles.deleteButtonWrapper}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          attention="low"
                          appearance="negative"
                          size="small"
                          aria-label={`Delete ${saved.name}`}
                          onPress={() => onDeleteSavedScale(saved._id)}
                          icon={<Icon name="delete" size="sm" />}
                        />
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className={styles.sectionLabel}>Built-in Presets</div>
            </>
          )}
          <div className={styles.presetGrid}>
            {Object.entries(LIGHTNESS_SCALE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={styles.presetCard}
                data-selected={config.presetName === key}
                onClick={() => handlePresetSelect(key)}
                disabled={disabled}
              >
                <div className={styles.presetName}>{preset.name}</div>
                <div className={styles.presetDescription}>{preset.description}</div>
                <div className={styles.presetPreview}>
                  {COLOR_SCALE_STEPS.map((step) => (
                    <div
                      key={step}
                      className={styles.presetPreviewStep}
                      style={{ backgroundColor: lightnessToGray(preset.values[step]) }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Mode */}
      {config.mode === 'manual' && (
        <div className={styles.manualSection}>
          {/* Save Dialog */}
          {showSaveDialog && (
            <div className={styles.saveDialog}>
              <div className={styles.saveDialogTitle}>Save Lightness Scale</div>
              <div className={styles.saveDialogField}>
                <label className={styles.saveDialogLabel}>Name</label>
                <Input
                  value={saveName}
                  onChange={(v) => setSaveName(v)}
                  placeholder="e.g., High Contrast, Soft Fade"
                  autoFocus
                />
              </div>
              <div className={styles.saveDialogField}>
                <label className={styles.saveDialogLabel}>Description (optional)</label>
                <Input
                  value={saveDescription}
                  onChange={(v) => setSaveDescription(v)}
                  placeholder="Brief description"
                />
              </div>
              <div className={styles.saveDialogActions}>
                <Button
                  attention="low"
                  size="small"
                  onPress={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                    setSaveDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  attention="high"
                  size="small"
                  onPress={handleSaveScale}
                  disabled={!saveName.trim() || isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {/* Visual Scale Editor */}
          {renderScaleVisualizer(true)}

          {/* Selected Step Editor */}
          {selectedStep !== null && (
            <div className={styles.stepEditor}>
              <div className={styles.stepEditorHeader}>
                <span className={styles.stepEditorTitle}>
                  Step {selectedStep}
                  {(selectedStep === 100 || selectedStep === 2500) && (
                    <span className={styles.stepEditorHint}>
                      {' '}(typically {selectedStep === 100 ? '0%' : '100%'})
                    </span>
                  )}
                </span>
                <IconButton
                  attention="low"
                  size="small"
                  aria-label="Close step editor"
                  onPress={() => setSelectedStep(null)}
                  icon={<Icon name="close" size="sm" />}
                />
              </div>
              <div className={styles.stepEditorControls}>
                <div className={styles.stepSlider}>
                  <SliderControl
                    label="Lightness"
                    value={config.values[selectedStep]}
                    min={0}
                    max={100}
                    step={0.5}
                    unit="%"
                    onChange={(value) => handleStepValueChange(selectedStep, value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {!validation.valid && validation.warnings.length > 0 && (
            <div className={styles.warningsBox}>
              <span className={styles.warningsLabel}>Recommendations:</span>
              <span className={styles.warningsText}>
                {validation.warnings.slice(0, 3).join(' • ')}
                {validation.warnings.length > 3 && ` (+${validation.warnings.length - 3} more)`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Scale Preview (auto + preset modes) */}
      {config.mode !== 'manual' && renderScaleVisualizer(false)}
    </div>
  );
};

export * from './LightnessScaleEditor.shared';
