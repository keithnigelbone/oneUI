/**
 * DIN1450Calculator.tsx
 * Compact platform-based base font size calculator using DIN 1450 formula
 * with editable preset values and custom presets support
 */

'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { PLATFORM_PRESETS, calculateBaseSize } from '@oneui/shared';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';
import styles from './Typography.module.css';
import type { DIN1450CalculatorProps, Platform } from './Typography.shared';

// Pixel density options for Select component
const PIXEL_DENSITY_OPTIONS: SelectOption<number>[] = [
  { value: 1, label: '@1x' },
  { value: 2, label: '@2x' },
  { value: 3, label: '@3x' },
];

// All presets in a flat list for the compact selector
const ALL_PRESETS = [
  { key: 'mobile', category: 'digital' },
  { key: 'tablet', category: 'digital' },
  { key: 'desktop', category: 'digital' },
  { key: 'tv', category: 'digital' },
  { key: 'printA4', category: 'print' },
  { key: 'printBusinessCard', category: 'print' },
  { key: 'outdoor', category: 'print' },
] as const;

// Custom preset interface
interface CustomPreset {
  id: string;
  name: string;
  viewingDistance: number;
  ppi: number;
  pixelDensity: number;
}

export const DIN1450Calculator: React.FC<DIN1450CalculatorProps> = ({
  platform,
  initialParams,
  onChange,
}) => {
  // Get initial values from saved params or preset
  const presetValues = PLATFORM_PRESETS[platform] || PLATFORM_PRESETS.desktop;
  const initialViewingDistance = initialParams?.viewingDistance ?? presetValues.viewingDistance;
  const initialPpi = initialParams?.ppi ?? presetValues.ppi;
  const initialPixelDensity = initialParams?.pixelDensity ?? presetValues.pixelDensity;

  // Editable values state
  const [viewingDistance, setViewingDistance] = useState(initialViewingDistance);
  const [ppi, setPpi] = useState(initialPpi);
  const [pixelDensity, setPixelDensity] = useState(initialPixelDensity);
  const [isModified, setIsModified] = useState(!!initialParams);

  // Custom presets state
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPreset, setNewPreset] = useState<Omit<CustomPreset, 'id'>>({
    name: '',
    viewingDistance: 60,
    ppi: 96,
    pixelDensity: 1,
  });

  // Update values when platform changes (only if no initial params and not modified)
  useEffect(() => {
    // Skip if we have initial params on first load
    if (initialParams) return;

    const preset = PLATFORM_PRESETS[platform];
    if (preset && !isModified) {
      setViewingDistance(preset.viewingDistance);
      setPpi(preset.ppi);
      setPixelDensity(preset.pixelDensity);
    }
  }, [platform, isModified, initialParams]);

  // Calculate base size
  const baseSize = useMemo(() => {
    return calculateBaseSize(viewingDistance, ppi, pixelDensity);
  }, [viewingDistance, ppi, pixelDensity]);

  // Handle preset selection
  const handlePresetSelect = (presetKey: string) => {
    const preset = PLATFORM_PRESETS[presetKey];
    if (preset) {
      setViewingDistance(preset.viewingDistance);
      setPpi(preset.ppi);
      setPixelDensity(preset.pixelDensity);
      setIsModified(false);
      const newBaseSize = calculateBaseSize(preset.viewingDistance, preset.ppi, preset.pixelDensity);
      onChange(presetKey as Platform, newBaseSize, {
        viewingDistance: preset.viewingDistance,
        ppi: preset.ppi,
        pixelDensity: preset.pixelDensity,
      });
    }
  };

  // Handle value changes
  const handleValueChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number
  ) => {
    setter(value);
    setIsModified(true);
  };

  // Update parent when values change
  const handleApplyChanges = () => {
    const newBaseSize = calculateBaseSize(viewingDistance, ppi, pixelDensity);
    onChange(platform, newBaseSize, {
      viewingDistance,
      ppi,
      pixelDensity,
    });
  };

  // Get current preset info for display
  const currentPreset = PLATFORM_PRESETS[platform];
  const presetName = isModified ? `${currentPreset?.name || 'Custom'} (Modified)` : currentPreset?.name || 'Custom';

  // Handle custom preset selection
  const handleCustomPresetSelect = useCallback((preset: CustomPreset) => {
    setViewingDistance(preset.viewingDistance);
    setPpi(preset.ppi);
    setPixelDensity(preset.pixelDensity);
    setSelectedCustomId(preset.id);
    setIsModified(false);
    const newBaseSize = calculateBaseSize(preset.viewingDistance, preset.ppi, preset.pixelDensity);
    onChange(platform, newBaseSize, {
      viewingDistance: preset.viewingDistance,
      ppi: preset.ppi,
      pixelDensity: preset.pixelDensity,
    });
  }, [onChange, platform]);

  // Handle add custom preset
  const handleAddCustomPreset = useCallback(() => {
    if (!newPreset.name.trim()) return;

    const preset: CustomPreset = {
      ...newPreset,
      id: `custom-${Date.now()}`,
    };

    setCustomPresets(prev => [...prev, preset]);
    handleCustomPresetSelect(preset);
    setShowAddDialog(false);
    setNewPreset({
      name: '',
      viewingDistance: 60,
      ppi: 96,
      pixelDensity: 1,
    });
  }, [newPreset, handleCustomPresetSelect]);

  // Handle remove custom preset
  const handleRemoveCustomPreset = useCallback((id: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
    if (selectedCustomId === id) {
      setSelectedCustomId(null);
      handlePresetSelect('desktop');
    }
  }, [selectedCustomId]);

  return (
    <div className={styles.din1450Compact}>
      {/* Compact preset selector row */}
      <div className={styles.presetRow}>
        <div className={styles.presetChips}>
          {ALL_PRESETS.map(({ key }) => {
            const preset = PLATFORM_PRESETS[key];
            const isSelected = platform === key && !isModified && !selectedCustomId;
            return (
              <button
                key={key}
                type="button"
                className={styles.presetChip}
                data-selected={isSelected}
                onClick={() => {
                  setSelectedCustomId(null);
                  handlePresetSelect(key);
                }}
              >
                {preset.name}
              </button>
            );
          })}

          {/* Custom presets */}
          {customPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.presetChip}
              data-selected={selectedCustomId === preset.id && !isModified}
              data-custom="true"
              onClick={() => handleCustomPresetSelect(preset)}
            >
              {preset.name}
              <span
                className={styles.presetChipRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCustomPreset(preset.id);
                }}
              >
                ×
              </span>
            </button>
          ))}

          {/* Add custom preset button */}
          <button
            type="button"
            className={styles.presetChipAdd}
            onClick={() => setShowAddDialog(true)}
          >
            +
          </button>
        </div>
      </div>

      {/* Add custom preset dialog */}
      {showAddDialog && (
        <div className={styles.addPresetDialog}>
          <div className={styles.addPresetHeader}>
            <span className={styles.addPresetTitle}>Add Custom Device</span>
            <button
              type="button"
              className={styles.addPresetClose}
              onClick={() => setShowAddDialog(false)}
            >
              ×
            </button>
          </div>
          <div className={styles.addPresetFields}>
            <div className={styles.addPresetField}>
              <label>Name</label>
              <input
                type="text"
                value={newPreset.name}
                placeholder="e.g., Conference Display"
                onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className={styles.addPresetField}>
              <label>Viewing Distance (cm)</label>
              <input
                type="number"
                value={newPreset.viewingDistance}
                min={10}
                max={2000}
                onChange={(e) => setNewPreset(prev => ({ ...prev, viewingDistance: Number(e.target.value) || 60 }))}
              />
            </div>
            <div className={styles.addPresetField}>
              <label>PPI</label>
              <input
                type="number"
                value={newPreset.ppi}
                min={50}
                max={600}
                onChange={(e) => setNewPreset(prev => ({ ...prev, ppi: Number(e.target.value) || 96 }))}
              />
            </div>
            <div className={styles.addPresetField}>
              <label>Pixel Density</label>
              <Select
                value={newPreset.pixelDensity}
                onChange={(value) => setNewPreset(prev => ({ ...prev, pixelDensity: value }))}
                options={PIXEL_DENSITY_OPTIONS}
                size="sm"
                aria-label="Pixel density"
              />
            </div>
          </div>
          <div className={styles.addPresetPreview}>
            Calculated Base Size: <strong>{calculateBaseSize(newPreset.viewingDistance, newPreset.ppi, newPreset.pixelDensity)}px</strong>
          </div>
          <div className={styles.addPresetActions}>
            <button
              type="button"
              className={styles.addPresetCancel}
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.addPresetSubmit}
              onClick={handleAddCustomPreset}
              disabled={!newPreset.name.trim()}
            >
              Add Device
            </button>
          </div>
        </div>
      )}

      {/* Compact inline controls and result */}
      <div className={styles.calculatorInline}>
        {/* Editable parameters */}
        <div className={styles.parameterGroup}>
          <div className={styles.parameter}>
            <label className={styles.parameterLabel}>Distance</label>
            <div className={styles.parameterInput}>
              <input
                type="number"
                value={viewingDistance}
                min={10}
                max={1000}
                onChange={(e) => handleValueChange(setViewingDistance, Number(e.target.value) || 60)}
                onBlur={handleApplyChanges}
              />
              <span className={styles.parameterUnit}>cm</span>
            </div>
          </div>

          <div className={styles.parameter}>
            <label className={styles.parameterLabel}>PPI</label>
            <div className={styles.parameterInput}>
              <input
                type="number"
                value={ppi}
                min={50}
                max={600}
                onChange={(e) => handleValueChange(setPpi, Number(e.target.value) || 96)}
                onBlur={handleApplyChanges}
              />
            </div>
          </div>

          <div className={styles.parameter}>
            <label className={styles.parameterLabel}>Density</label>
            <Select
              value={pixelDensity}
              onChange={(value) => {
                handleValueChange(setPixelDensity, value);
                setTimeout(handleApplyChanges, 0);
              }}
              options={PIXEL_DENSITY_OPTIONS}
              size="sm"
              aria-label="Pixel density"
            />
          </div>
        </div>

        {/* Arrow */}
        <div className={styles.calculatorArrow}>→</div>

        {/* Result */}
        <div className={styles.compactResult}>
          <span className={styles.compactResultValue}>{baseSize}</span>
          <span className={styles.compactResultUnit}>px</span>
          {isModified && <span className={styles.modifiedBadge}>Modified</span>}
        </div>
      </div>

      {/* Formula reference (collapsed) */}
      <div className={styles.formulaNote}>
        DIN 1450: h = d × tan(0.3°) → base = (h × ppi) / density / 0.53
      </div>
    </div>
  );
};
