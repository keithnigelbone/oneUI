/**
 * TextTokenEditor.tsx
 * Editor for mapping color scale steps to text tokens with WCAG contrast validation
 */

'use client';

import { useCallback, useMemo } from 'react';
import {
  generateColorScaleFromParams,
  type ColorScaleStep,
  checkContrast,
  formatContrastRatio,
  getWCAGBadge,
} from '@oneui/shared';
import styles from './TextTokenEditor.module.css';
import {
  TextTokenEditorProps,
  TextTokenMapping,
  ThemeMode,
  TEXT_TOKEN_DESCRIPTIONS,
  AvailableScaleWithColors,
} from './TextTokenEditor.shared';
import { parseStepReference } from './SurfaceTokenEditor.shared';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';

interface ContrastInfo {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  color: 'success' | 'warning' | 'error';
}

interface StepSelectorWithContrastProps {
  value: string;
  scales: AvailableScaleWithColors[];
  onChange: (value: string) => void;
  disabled?: boolean;
  backgroundValue?: string;
}

/**
 * Get hex color from scale by step reference (e.g., "Primary-1300")
 * Uses actual colors from the scale if available, falls back to generating
 */
function getHexFromScales(
  stepRef: string,
  scales: AvailableScaleWithColors[]
): string | null {
  const parsed = parseStepReference(stepRef);
  if (!parsed) return null;

  // Find the matching scale
  const scale = scales.find(
    (s) => s.name.toLowerCase() === parsed.scale.toLowerCase()
  );
  if (!scale) return null;

  // Try to get actual hex color from the scale
  if (scale.colors) {
    const colorEntry = scale.colors.find((c) => c.step === parsed.step);
    if (colorEntry) {
      return colorEntry.hex;
    }
  }

  // Fallback: generate color if no actual color data
  const baseStep = scale.baseStep ?? 1300;
  const isNeutral = parsed.scale.toLowerCase() === 'neutral';
  const generatedScale = generateColorScaleFromParams({
    hue: isNeutral ? 0 : 340, // Default hue for non-neutral
    chroma: isNeutral ? 0.02 : 0.18,
    baseStep: baseStep as ColorScaleStep,
  });
  const step = generatedScale.steps.find((s) => s.step === parsed.step);
  return step?.hex ?? null;
}

const StepSelectorWithContrast: React.FC<StepSelectorWithContrastProps> = ({
  value,
  scales,
  onChange,
  disabled,
  backgroundValue,
}) => {
  // Get preview colors and contrast using actual scale colors
  const { textColor, bgColor, contrast } = useMemo(() => {
    const textHex = getHexFromScales(value, scales);
    if (!textHex) {
      return { textColor: null, bgColor: null, contrast: null };
    }

    // Get background color
    let bgHex: string | null = null;
    if (backgroundValue && backgroundValue !== 'transparent') {
      bgHex = getHexFromScales(backgroundValue, scales);
    }

    // Calculate contrast if we have both colors
    let contrastInfo: ContrastInfo | null = null;
    if (textHex && bgHex) {
      // checkContrast expects oklch strings, but we have hex
      // Convert hex to a format the function can use, or calculate contrast directly
      const result = checkContrast(textHex, bgHex);
      const badge = getWCAGBadge(result);
      contrastInfo = {
        ratio: result.ratio,
        level: badge.level,
        color: badge.color,
      };
    }

    return { textColor: textHex, bgColor: bgHex, contrast: contrastInfo };
  }, [value, scales, backgroundValue]);

  // Build Select options with color swatches
  const selectOptions = useMemo<SelectOption<string>[]>(() => {
    const opts: SelectOption<string>[] = [];
    for (const scale of scales) {
      if (!scale.colors) {
        for (const step of scale.steps) {
          opts.push({
            value: `${scale.name}-${step}`,
            label: `${scale.name}-${step}`,
          });
        }
        continue;
      }
      for (const step of scale.steps) {
        const colorEntry = scale.colors.find(c => c.step === step);
        opts.push({
          value: `${scale.name}-${step}`,
          label: `${scale.name}-${step}`,
          color: colorEntry?.hex,
        });
      }
    }
    return opts;
  }, [scales]);

  return (
    <div className={styles.stepSelectorWrapper}>
      <Select
        value={value}
        onChange={onChange}
        options={selectOptions}
        disabled={disabled}
        searchable
        size="sm"
      />
      {contrast && (
        <div className={styles.contrastIndicator}>
          <span className={styles.contrastRatio}>
            {formatContrastRatio(contrast.ratio)}
          </span>
          <span
            className={`${styles.contrastBadge} ${
              contrast.color === 'success'
                ? styles.contrastPass
                : contrast.color === 'warning'
                  ? styles.contrastWarning
                  : styles.contrastFail
            }`}
          >
            {contrast.level}
          </span>
        </div>
      )}
    </div>
  );
};

export const TextTokenEditor: React.FC<TextTokenEditorProps> = ({
  mappings,
  availableScales,
  surfaceMappings = [],
  onChange,
  disabled = false,
}) => {
  // Get background step for a given token and mode
  const getBackgroundStep = useCallback(
    (targetBg: string | undefined, mode: ThemeMode): string | undefined => {
      if (!targetBg) return undefined;
      const surface = surfaceMappings.find((s) => s.tokenName === targetBg);
      if (!surface) return undefined;

      switch (mode) {
        case 'light':
          return surface.lightModeStep;
        case 'dark':
          return surface.darkModeStep;
        default:
          return undefined;
      }
    },
    [surfaceMappings]
  );

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
                  {TEXT_TOKEN_DESCRIPTIONS[mapping.tokenName] && (
                    <span className={styles.tokenDescription}>
                      {TEXT_TOKEN_DESCRIPTIONS[mapping.tokenName]}
                    </span>
                  )}
                  {mapping.targetBackground && (
                    <span className={styles.targetBg}>
                      on {mapping.targetBackground}
                    </span>
                  )}
                </div>
              </td>
              <td
                className={`${styles.cell} ${styles.modeCell}`}
                data-label="Light Mode"
              >
                <StepSelectorWithContrast
                  value={mapping.lightModeStep}
                  scales={availableScales}
                  onChange={(value) =>
                    handleMappingChange(mapping.tokenName, 'light', value)
                  }
                  disabled={disabled}
                  backgroundValue={getBackgroundStep(
                    mapping.targetBackground,
                    'light'
                  )}
                />
              </td>
              <td
                className={`${styles.cell} ${styles.modeCell}`}
                data-label="Dark Mode"
              >
                <StepSelectorWithContrast
                  value={mapping.darkModeStep}
                  scales={availableScales}
                  onChange={(value) =>
                    handleMappingChange(mapping.tokenName, 'dark', value)
                  }
                  disabled={disabled}
                  backgroundValue={getBackgroundStep(
                    mapping.targetBackground,
                    'dark'
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
