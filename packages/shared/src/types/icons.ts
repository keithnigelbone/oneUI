/**
 * Icon System Types
 *
 * Defines types for the multi-brand icon set selection system.
 * Each brand can select from 6 icon libraries, with semantic mappings
 * that allow components to reference icons by function rather than name.
 */

import type { ComponentType, SVGProps } from 'react';

/**
 * Available icon set identifiers
 */
export type IconSetId =
  | 'jio'
  | 'tira'
  | 'material'
  | 'lucide'
  | 'tabler'
  | 'hugeicons'
  | 'phosphor'
  | 'remix';

/**
 * Preferred glyph weight for mixed sets that ship both outline and filled
 * variants (Tira, Material Symbols fill axis).
 */
export type IconVariantPreference = 'outline' | 'filled';

/**
 * Material Symbols style family — matches Google's Outlined vs Sharp families.
 */
export type MaterialStylePreference = 'outlined' | 'sharp';

/**
 * Icon size presets following the spacing token pattern
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon size values in pixels
 */
export const IconSizeValues: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Icon style type - whether icons use fill or stroke
 */
export type IconStyle = 'filled' | 'stroke' | 'mixed';

/**
 * Metadata for an icon set library
 */
export interface IconSetMetadata {
  id: IconSetId;
  name: string;
  description: string;
  totalIcons: number;
  style: IconStyle;
  website: string;
  license: string;
  packageName: string;
  /** Whether this icon set supports stroke width customization */
  supportsStrokeWidth: boolean;
  /** Default stroke width for stroke-based sets */
  defaultStrokeWidth?: number;
  /** Sample icons to preview (icon names from the set) */
  previewIcons: string[];
}

/**
 * Icon component props type
 */
export type IconComponentProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

/**
 * Icon component type that all icon libraries must conform to
 */
export type IconComponent = ComponentType<IconComponentProps>;

/**
 * Semantic icon names used throughout the component library
 * These abstract names map to specific icons in each icon set
 */
export type SemanticIconName =
  // Actions
  | 'add'
  | 'remove'
  | 'close'
  | 'edit'
  | 'delete'
  | 'copy'
  | 'save'
  | 'refresh'
  | 'download'
  | 'upload'
  | 'share'
  | 'link'
  | 'unlink'
  // Navigation
  | 'menu'
  | 'search'
  | 'home'
  | 'settings'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowUp'
  | 'arrowDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'chevronDown'
  | 'externalLink'
  | 'firstPage'
  | 'lastPage'
  /** Single-step back / forward (Jio: `IcBack` / `IcNext` — distinct from chevrons). */
  | 'back'
  | 'next'
  // Status
  | 'check'
  | 'checkCircle'
  | 'warning'
  | 'error'
  | 'info'
  | 'help'
  | 'loading'
  // Media
  | 'play'
  | 'pause'
  | 'stop'
  | 'volumeOn'
  | 'volumeOff'
  | 'microphone'
  | 'image'
  | 'video'
  // User
  | 'user'
  | 'users'
  | 'userAdd'
  | 'userRemove'
  | 'logout'
  // UI
  | 'eye'
  | 'eyeOff'
  | 'lock'
  | 'unlock'
  | 'star'
  | 'starFilled'
  | 'heart'
  | 'heartFilled'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'filter'
  | 'sort'
  | 'grid'
  | 'list'
  | 'moreHorizontal'
  // Communication
  | 'mail'
  | 'phone'
  | 'chat'
  | 'notification'
  // Files
  | 'file'
  | 'folder'
  | 'document'
  // Misc
  | 'calendar'
  | 'clock'
  | 'location'
  | 'sun'
  | 'moon'
  | 'palette'
  // Design System navigation
  | 'layers'
  | 'components'
  | 'canvas'
  | 'create'
  | 'sparkles'
  // Platforms / device surfaces (used by Density & Platforms editor, platform pickers)
  | 'globe'        // Web
  | 'smartphone'   // Mobile Native
  | 'tablet'       // Tablet Native
  | 'monitor'      // Desktop Native
  | 'tv'           // TV Native
  | 'printer'      // Print
  | 'billboard'    // Outdoor signage (billboards)
  | 'bus';         // Bus / transit signage — used as the Outdoor platform icon

/**
 * Mapping from semantic icon names to actual icon names in a specific icon set
 */
export type SemanticIconMapping = Record<SemanticIconName, string>;

/**
 * Icon configuration stored per brand
 */
export interface IconConfig {
  brandId: string;
  selectedSet: IconSetId;
  defaultSize: IconSize;
  strokeWidth?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Icon foundation configuration shape (stored in foundations table)
 */
export interface IconFoundationConfig {
  selectedSet: IconSetId;
  defaultSize: IconSize;
  strokeWidth?: number;
  /** Outline vs filled default for mixed sets (Tira, Material fill axis). */
  variant?: IconVariantPreference;
  /** Material Symbols style family when `selectedSet` is `material`. */
  materialStyle?: MaterialStylePreference;
}

/**
 * Icon category for browsing icons
 */
export interface IconCategory {
  id: string;
  name: string;
  count: number;
}

/**
 * Icon entry for displaying in the icon browser
 */
export interface IconEntry {
  name: string;
  category?: string;
  tags?: string[];
}

/**
 * String icon reference: semantic alias (`"add"`), Jio pack id (`"IcCarSide"`),
 * or another set's export name (`"Plus"` when `iconSet="lucide"`).
 */
export type IconNameInput = SemanticIconName | (string & {});

/**
 * Icon value for component slots and the universal resolver — string name or
 * icon component constructor. Web design-system shells also accept JSX elements.
 */
export type ComponentIconInput = IconNameInput | IconComponent;

/**
 * Props for the universal Icon component
 */
export interface IconProps {
  /**
   * @deprecated Use `icon` with the same string value.
   */
  name?: SemanticIconName;
  /**
   * Semantic name (`"close"`), Jio pack id (`"IcCarSide"`), OSS export name
   * (`"Plus"` when `iconSet="lucide"`), or an icon component.
   */
  icon?: ComponentIconInput;
  /** Icon size preset or pixel value */
  size?: IconSize | number;
  /** Icon color (defaults to currentColor for token-based theming) */
  color?: string;
  /** Stroke width for stroke-based icons */
  strokeWidth?: number;
  /** Additional CSS class */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Whether icon is hidden from screen readers */
  'aria-hidden'?: boolean;
}

/**
 * Context value for the icon provider
 */
export interface IconContextValue {
  /** Currently selected icon set */
  iconSet: IconSetId;
  /** Default icon size */
  defaultSize: IconSize;
  /** Default stroke width for stroke-based icons */
  strokeWidth?: number;
  /** Outline vs filled preference for mixed sets */
  variant?: IconVariantPreference;
  /** Material Symbols style family */
  materialStyle?: MaterialStylePreference;
  /** Resolve a semantic icon name to its component */
  resolveIcon: (name: SemanticIconName) => IconComponent | null;
  /** Get an icon component by its actual name in the current set */
  getIconByName: (name: string) => Promise<IconComponent | null>;
  /** Get all icons for browsing */
  getAllIcons: () => Promise<IconEntry[]>;
  /** Get icon categories */
  getCategories: () => IconCategory[];
  /** Get icon set metadata */
  getMetadata: () => IconSetMetadata;
}
