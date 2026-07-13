/**
 * Icon Registry
 *
 * Central registry for all icon sets, providing metadata, semantic mappings,
 * and utilities for resolving icons across different icon libraries.
 */

import type {
  IconSetId,
  IconSetMetadata,
  SemanticIconName,
  IconCategory,
} from '@oneui/shared';
import { SemanticMappings } from './semanticMappings';

/**
 * Metadata for all available icon sets
 */
export const IconSetRegistry: Record<IconSetId, IconSetMetadata> = {
  jio: {
    id: 'jio',
    name: 'Jio Icons',
    description: 'Custom Jio design system icons with filled style',
    totalIcons: 1620,
    style: 'filled',
    website: 'https://jio.com',
    license: 'Proprietary',
    packageName: 'local',
    supportsStrokeWidth: false,
    previewIcons: ['IcHome', 'IcSearch', 'IcSettings', 'IcUser', 'IcAdd', 'IcClose'],
  },
  tira: {
    id: 'tira',
    name: 'Tira Icons',
    description: 'Tira retail icons with outline and filled variants',
    totalIcons: 194,
    style: 'mixed',
    website: 'https://tirabeauty.com',
    license: 'Proprietary',
    packageName: '@oneui/icons-tira',
    supportsStrokeWidth: false,
    previewIcons: [
      'HomeOutlined',
      'SearchOutlined',
      'SettingsOutlined',
      'UserOutlined',
      'AddOutlined',
      'CloseOutlined',
    ],
  },
  material: {
    id: 'material',
    name: 'Material Symbols',
    description: 'Google Material Symbols in Outlined or Sharp styles',
    totalIcons: 3892,
    style: 'mixed',
    website: 'https://fonts.google.com/icons',
    license: 'Apache 2.0',
    packageName: '@nine-thirty-five/material-symbols-react',
    supportsStrokeWidth: false,
    previewIcons: ['Home', 'Search', 'Settings', 'Person', 'Add', 'Close'],
  },
  lucide: {
    id: 'lucide',
    name: 'Lucide',
    description: 'Beautiful & consistent icon toolkit forked from Feather',
    totalIcons: 1400,
    style: 'stroke',
    website: 'https://lucide.dev',
    license: 'ISC',
    packageName: 'lucide-react',
    supportsStrokeWidth: true,
    defaultStrokeWidth: 2,
    previewIcons: ['Home', 'Search', 'Settings', 'User', 'Plus', 'X'],
  },
  tabler: {
    id: 'tabler',
    name: 'Tabler Icons',
    description: 'Over 5200 free MIT-licensed high-quality icons',
    totalIcons: 5200,
    style: 'stroke',
    website: 'https://tabler.io/icons',
    license: 'MIT',
    packageName: '@tabler/icons-react',
    supportsStrokeWidth: true,
    defaultStrokeWidth: 2,
    previewIcons: ['IconHome', 'IconSearch', 'IconSettings', 'IconUser', 'IconPlus', 'IconX'],
  },
  hugeicons: {
    id: 'hugeicons',
    name: 'Huge Icons',
    description: 'Beautiful 4000+ free icons for modern design',
    totalIcons: 4000,
    style: 'stroke',
    website: 'https://hugeicons.com',
    license: 'MIT',
    packageName: 'hugeicons-react',
    supportsStrokeWidth: true,
    defaultStrokeWidth: 1.5,
    previewIcons: ['Home01Icon', 'Search01Icon', 'Settings01Icon', 'UserIcon', 'Add01Icon', 'Cancel01Icon'],
  },
  phosphor: {
    id: 'phosphor',
    name: 'Phosphor Icons',
    description: 'Flexible icon family with 9000+ icons in 6 weights',
    totalIcons: 9000,
    style: 'mixed',
    website: 'https://phosphoricons.com',
    license: 'MIT',
    packageName: '@phosphor-icons/react',
    supportsStrokeWidth: true,
    defaultStrokeWidth: 1.5,
    previewIcons: ['House', 'MagnifyingGlass', 'Gear', 'User', 'Plus', 'X'],
  },
  remix: {
    id: 'remix',
    name: 'Remix Icons',
    description: 'Open source icon library with 2800+ icons',
    totalIcons: 2800,
    style: 'mixed',
    website: 'https://remixicon.com',
    license: 'Apache 2.0',
    packageName: '@remixicon/react',
    supportsStrokeWidth: false,
    previewIcons: ['RiHomeLine', 'RiSearchLine', 'RiSettings3Line', 'RiUserLine', 'RiAddLine', 'RiCloseLine'],
  },
};

/**
 * Semantic icon mappings for each icon set
 * Maps abstract icon names to actual icon component names
 */
/**
 * Semantic icon mappings — extracted to ./semanticMappings/index.ts
 * Re-exported here so existing callers keep working unchanged. New code
 * should import from '@oneui/ui/icons/semanticMappings' (or, post Phase 4,
 * from per-set chunks) to avoid pulling all mapping tables eagerly.
 */
export { SemanticMappings } from './semanticMappings';


/**
 * Default icon categories for browsing
 */
export const IconCategories: IconCategory[] = [
  { id: 'all', name: 'All', count: 0 },
  { id: 'actions', name: 'Actions', count: 0 },
  { id: 'navigation', name: 'Navigation', count: 0 },
  { id: 'status', name: 'Status', count: 0 },
  { id: 'media', name: 'Media', count: 0 },
  { id: 'user', name: 'User', count: 0 },
  { id: 'ui', name: 'UI', count: 0 },
  { id: 'communication', name: 'Communication', count: 0 },
  { id: 'files', name: 'Files', count: 0 },
];

/**
 * Get icon set metadata by ID
 */
export function getIconSetMetadata(setId: IconSetId): IconSetMetadata {
  return IconSetRegistry[setId];
}

/**
 * Get semantic icon name for a specific icon set
 */
export function getIconName(setId: IconSetId, semanticName: SemanticIconName): string {
  return SemanticMappings[setId][semanticName];
}

/**
 * Get all available icon set IDs
 */
export function getIconSetIds(): IconSetId[] {
  return Object.keys(IconSetRegistry) as IconSetId[];
}

/**
 * Get all semantic icon names
 */
export function getSemanticIconNames(): SemanticIconName[] {
  return Object.keys(SemanticMappings.lucide) as SemanticIconName[];
}

/**
 * Generate import snippet for an icon
 */
export function getImportSnippet(setId: IconSetId, iconName: string): string {
  const metadata = IconSetRegistry[setId];

  switch (setId) {
    case 'jio':
      return `import ${iconName} from '@jio/ds-react/components/Icon/icons/${iconName}';`;
    case 'tira':
      return `import { ${iconName} } from '@oneui/icons-tira';`;
    case 'material':
      return `import { ${iconName} } from '@nine-thirty-five/material-symbols-react/outlined';`;
    default:
      return `// ${metadata.name} is optional. Install ${metadata.packageName} and register "${iconName}" via setIconSetLoader("${setId}", loader).`;
  }
}
