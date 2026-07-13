/**
 * SurfaceTokenEditor.tsx
 * Editor for mapping color scale steps to surface tokens
 *
 * Organized by Appearance:
 * - Background (single surface)
 * - Primary (Ghost, Subtle, Default, Bold)
 * - Secondary (Ghost, Subtle, Default, Bold)
 * - Sparkle (Ghost, Subtle, Default, Bold)
 */

'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import styles from './SurfaceTokenEditor.module.css';
import {
  SurfaceTokenEditorProps,
  SurfaceTokenMapping,
  ThemeMode,
  AvailableScale,
  SURFACE_TOKEN_DESCRIPTIONS,
  parseStepReference,
} from './SurfaceTokenEditor.shared';

interface StepSelectorProps {
  value: string;
  scales: AvailableScale[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const StepSelector: React.FC<StepSelectorProps> = ({
  value,
  scales,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Get preview color from the actual scale data
  const previewColor = useMemo(() => {
    if (value === 'transparent') return null;
    const parsed = parseStepReference(value);
    if (!parsed) return null;

    const scale = scales.find(
      (s) => s.name.toLowerCase() === parsed.scale.toLowerCase()
    );
    if (!scale?.colors) return null;

    const stepColor = scale.colors.find((c) => c.step === parsed.step);
    return stepColor?.hex ?? null;
  }, [value, scales]);

  // Check if the selected value is a base step
  const isBaseSelected = useMemo(() => {
    if (value === 'transparent') return false;
    const parsed = parseStepReference(value);
    if (!parsed) return false;

    const scale = scales.find(
      (s) => s.name.toLowerCase() === parsed.scale.toLowerCase()
    );
    // Compare as numbers to handle both string and number baseStep
    return scale?.baseStep !== undefined && Number(scale.baseStep) === Number(parsed.step);
  }, [value, scales]);

  // Get display label for selected value
  const displayLabel = useMemo(() => {
    if (value === 'transparent') return 'transparent';
    const parsed = parseStepReference(value);
    if (!parsed) return value;
    return `${parsed.scale}-${parsed.step}${isBaseSelected ? ' ★' : ''}`;
  }, [value, isBaseSelected]);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.stepSelector} ref={dropdownRef}>
      <button
        type="button"
        className={styles.selectorTrigger}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className={`${styles.colorPreview} ${
            !previewColor ? styles.transparentPreview : ''
          }`}
          style={previewColor ? { backgroundColor: previewColor } : undefined}
        />
        <span className={styles.selectorLabel}>
          {displayLabel}
        </span>
        <svg
          className={`${styles.selectorChevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.selectorDropdown} role="listbox">
          {/* Transparent option */}
          <button
            type="button"
            className={`${styles.selectorOption} ${value === 'transparent' ? styles.optionSelected : ''}`}
            onClick={() => handleSelect('transparent')}
            role="option"
            aria-selected={value === 'transparent'}
          >
            <div className={`${styles.colorPreview} ${styles.transparentPreview}`} />
            <span className={styles.optionLabel}>transparent</span>
          </button>

          {/* Scale groups */}
          {scales.map((scale, scaleIndex) => (
            <div key={`${scale.name}-${scaleIndex}`} className={styles.scaleGroup}>
              <div className={styles.scaleGroupHeader}>{scale.name}</div>
              <div className={styles.scaleSteps}>
                {scale.steps.map((step) => {
                  const optionValue = `${scale.name}-${step}`;
                  const stepColor = scale.colors?.find((c) => c.step === step)?.hex;
                  // Compare as numbers to handle both string and number baseStep
                  const isBase = scale.baseStep !== undefined && Number(scale.baseStep) === Number(step);
                  const isSelected = value === optionValue;

                  return (
                    <button
                      key={`${scaleIndex}-${step}`}
                      type="button"
                      className={`${styles.selectorOption} ${isSelected ? styles.optionSelected : ''} ${isBase ? styles.optionBase : ''}`}
                      onClick={() => handleSelect(optionValue)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div
                        className={styles.colorPreview}
                        style={stepColor ? { backgroundColor: stepColor } : undefined}
                      />
                      <span className={styles.optionLabel}>
                        {step}
                        {isBase && <span className={styles.baseIndicator}>★</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SurfaceTokenEditor: React.FC<SurfaceTokenEditorProps> = ({
  mappings,
  availableScales,
  onChange,
  disabled = false,
}) => {
  // Handle mapping change for a specific token and mode
  const handleMappingChange = useCallback(
    (tokenName: string, mode: ThemeMode, newValue: string) => {
      const updatedMappings = mappings.map((mapping) => {
        if (mapping.tokenName !== tokenName) return mapping;

        switch (mode) {
          case 'light':
            return { ...mapping, lightModeStep: newValue };
          case 'dark':
            return { ...mapping, darkModeStep: newValue };
          default:
            return mapping;
        }
      });

      onChange(updatedMappings);
    },
    [mappings, onChange]
  );

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.headerCell}>Token</th>
            <th className={styles.headerCell}>Light Mode</th>
            <th className={styles.headerCell}>Dark Mode</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping) => (
            <tr key={mapping.tokenName} className={styles.row}>
              <td className={styles.cell}>
                <div className={styles.tokenInfo}>
                  <span className={styles.tokenName}>{mapping.tokenName}</span>
                  {SURFACE_TOKEN_DESCRIPTIONS[mapping.tokenName] && (
                    <span className={styles.tokenDescription}>
                      {SURFACE_TOKEN_DESCRIPTIONS[mapping.tokenName]}
                    </span>
                  )}
                </div>
              </td>
              <td className={`${styles.cell} ${styles.modeCell}`} data-label="Light Mode">
                <StepSelector
                  value={mapping.lightModeStep}
                  scales={availableScales}
                  onChange={(value) =>
                    handleMappingChange(mapping.tokenName, 'light', value)
                  }
                  disabled={disabled}
                />
              </td>
              <td className={`${styles.cell} ${styles.modeCell}`} data-label="Dark Mode">
                <StepSelector
                  value={mapping.darkModeStep}
                  scales={availableScales}
                  onChange={(value) =>
                    handleMappingChange(mapping.tokenName, 'dark', value)
                  }
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
