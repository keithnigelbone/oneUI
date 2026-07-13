/**
 * CreateBrandDialog.shared.ts
 *
 * Shared types and hooks for CreateBrandDialog component
 */

export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  baseBrand?: string;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
}

export interface CreateBrandDialogProps {
  /** Available brands for inheritance selection */
  availableBrands?: Array<{ id: string; name: string; slug: string }>;
  /** Called when form is submitted */
  onSubmit?: (data: BrandFormData) => void;
  /** Called when dialog is cancelled */
  onCancel?: () => void;
  /** Whether the dialog is in loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Generate a URL-safe slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Hue presets with descriptive names
 */
export const HUE_PRESETS = [
  { name: 'Red', value: 25 },
  { name: 'Orange', value: 45 },
  { name: 'Yellow', value: 90 },
  { name: 'Green', value: 145 },
  { name: 'Teal', value: 180 },
  { name: 'Blue', value: 240 },
  { name: 'Purple', value: 280 },
  { name: 'Pink', value: 340 },
];

/**
 * Default form values
 */
export const DEFAULT_FORM_DATA: BrandFormData = {
  name: '',
  slug: '',
  description: '',
  baseBrand: undefined,
  primaryHue: 280,
  primaryChroma: 0.15,
  secondaryHue: 140,
  secondaryChroma: 0.12,
};

export function useCreateBrandDialogState() {
  return {
    ariaProps: {
      role: 'dialog',
      'aria-labelledby': 'create-brand-title',
      'aria-modal': true,
    },
  };
}
