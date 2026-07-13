/**
 * types.ts
 *
 * Type definitions for ComponentTokenEditor components
 */

import type {
  ComponentTokenManifest,
  TokenCategory,
  TokenDefinition,
  TokenOverrideValue,
  TokenState,
} from '@oneui/shared';
import type { ReactNode } from 'react';

/**
 * Props for PropertyPanel component
 */
export interface PropertyPanelProps {
  /** The component name being edited */
  componentName: string;
  /** Token manifest for the component */
  manifest: ComponentTokenManifest;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Optional className for custom styling */
  className?: string;
  /** Optional render function for custom preview */
  renderPreview?: (tokens: Record<string, string>) => ReactNode;
}

/**
 * Props for TokenEditorList component
 */
export interface TokenEditorListProps {
  /** Token manifest to display */
  manifest: ComponentTokenManifest;
  /** Category filter ('all' shows all categories) */
  selectedCategory: TokenCategory | 'all';
  /** Current theme mode */
  mode: 'light' | 'dark';
  /** Current draft overrides */
  draftOverrides: Map<string, TokenOverrideValue>;
  /** Callback when a token value is changed */
  onTokenChange: (tokenName: string, selectedToken: string) => void;
  /** Callback when a token is reset to default */
  onTokenReset: (tokenName: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * Props for TokenEditorRow component
 */
export interface TokenEditorRowProps {
  /** Token property name (e.g., 'backgroundColor') */
  tokenName: string;
  /** Token definition from manifest */
  definition: TokenDefinition;
  /** Current value (either override or default) */
  currentValue: string;
  /** Source of current value */
  source: 'override' | 'base' | 'default';
  /** Whether this token is currently overridden */
  isOverridden: boolean;
  /** Callback when value is changed */
  onChange: (selectedToken: string) => void;
  /** Callback to reset to default */
  onReset: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Props for TokenSelector dropdown
 */
export interface TokenSelectorProps {
  /** Currently selected token */
  value: string;
  /** Available token options */
  options: Array<{ token: string; label: string }>;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Callback when selection changes */
  onChange: (token: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * Props for LivePreview component
 */
export interface LivePreviewProps {
  /** Component to render in preview */
  children: ReactNode;
  /** Current theme mode for preview */
  mode: 'light' | 'dark';
  /** Current preview state */
  previewState: TokenState;
  /** Draft token overrides to apply */
  tokenOverrides: Record<string, string>;
  /** Callback when mode changes */
  onModeChange: (mode: 'light' | 'dark') => void;
  /** Callback when preview state changes */
  onStateChange: (state: TokenState) => void;
  /** Optional className */
  className?: string;
}

/**
 * Props for ContextSwitcher component
 */
export interface ContextSwitcherProps {
  /** Current theme mode */
  mode: 'light' | 'dark';
  /** Current preview state */
  previewState: TokenState;
  /** Callback when mode changes */
  onModeChange: (mode: 'light' | 'dark') => void;
  /** Callback when state changes */
  onStateChange: (state: TokenState) => void;
  /** Optional className */
  className?: string;
}

/**
 * Brand option for selector
 */
export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  primaryHue?: number;
}

/**
 * Props for BrandSelector component
 */
export interface BrandSelectorProps {
  /** Available brands */
  brands: BrandOption[];
  /** Currently selected brand ID */
  selectedBrandId: string | null;
  /** Callback when brand selection changes */
  onChange: (brandId: string) => void;
  /** Whether the selector is loading */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Category tab item
 */
export interface CategoryTab {
  id: TokenCategory | 'all';
  label: string;
  count: number;
}

/**
 * Props for CategoryTabs component
 */
export interface CategoryTabsProps {
  /** Available categories with counts */
  categories: CategoryTab[];
  /** Currently selected category */
  selectedCategory: TokenCategory | 'all';
  /** Callback when category changes */
  onChange: (category: TokenCategory | 'all') => void;
  /** Optional className */
  className?: string;
}
