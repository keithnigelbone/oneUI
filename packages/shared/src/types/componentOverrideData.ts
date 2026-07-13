/**
 * Convex component token editor payload — shared by web CSS builders and native token maps.
 */

export interface ComponentTokenOverride {
  componentName?: string;
  tokenName: string;
  value: string;
  scope?: 'variant' | 'variant-state' | string;
  target?: {
    variant?: string;
    state?: string;
  };
  channel?: string;
  valueKind?: string;
}

export interface ComponentOverrideData {
  componentThemeSelections?: Array<{ familyId: string; selections: Record<string, string> }>;
  recipeSelections: Array<{ componentName: string; selections: Record<string, string> }>;
  tokenOverrides: ComponentTokenOverride[];
}
