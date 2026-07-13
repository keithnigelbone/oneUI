/**
 * Shared types for PresetColorScaleSelector component
 */

/**
 * Preset scale data
 */
export interface PresetScale {
  _id: string;
  collectionId: string;
  name: string;
  baseStep: string;
  steps: Array<{
    step: string;
    oklch: string;
  }>;
}

/**
 * Preset collection data
 */
export interface PresetCollection {
  _id: string;
  name: string;
  description?: string;
  version: string;
  isDefault: boolean;
  scales?: PresetScale[];
}

/**
 * Brand's current selection
 */
export interface BrandSelection {
  collection: PresetCollection;
  selectedScaleNames: string[];
}

/**
 * Props for PresetColorScaleSelector component
 */
export interface PresetColorScaleSelectorProps {
  /** Available collections (provided by consumer) */
  collections: PresetCollection[];
  /** Currently selected collection ID */
  selectedCollectionId?: string;
  /** Currently selected scale names */
  selectedScales?: string[];
  /** Scales for the selected collection */
  selectedCollectionScales?: PresetScale[];
  /** Loading state */
  isLoading?: boolean;
  /** Called when selection changes */
  onSelectionChange?: (collectionId: string, selectedScales: string[]) => void;
  /** Called to save selection */
  onSaveSelection?: (collectionId: string, selectedScales: string[]) => Promise<void>;
  /** Called when user wants to use custom scales instead */
  onSwitchToCustom?: () => void;
  /** Whether selection is disabled */
  disabled?: boolean;
  /** Whether to show the collection selector */
  showCollectionSelector?: boolean;
}

/**
 * Get hex color from oklch string (simplified)
 * For accurate conversion, use the shared colorScale utilities
 */
export function getHexFromOklch(oklch: string): string {
  // Extract L value for a rough brightness estimate
  const match = oklch.match(/oklch\((\d+(?:\.\d+)?)[%\s]/);
  if (!match) return '#808080';

  const lightness = parseFloat(match[1]);
  // Simple grayscale approximation
  const gray = Math.round((lightness / 100) * 255);
  const hex = gray.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

/**
 * Get contrasting text color for a background
 */
export function getContrastText(lightness: number): string {
  return lightness > 50 ? '#000000' : '#FFFFFF';
}
