/**
 * Applies brand-level outline/filled preference for mixed icon sets.
 */

import type {
  IconSetId,
  IconVariantPreference,
  MaterialStylePreference,
  SemanticIconName,
} from '@oneui/shared';

export interface IconResolutionContext {
  iconSet: IconSetId;
  variant?: IconVariantPreference;
  materialStyle?: MaterialStylePreference;
}

function swapTiraSuffix(name: string, target: 'Outlined' | 'Filled'): string {
  if (name.endsWith('Outlined') || name.endsWith('Filled')) {
    return name.replace(/(Outlined|Filled)$/, target);
  }
  return `${name}${target}`;
}

/**
 * Resolve a mapped icon name using brand variant preferences.
 */
export function resolveIconNameWithVariant(
  mappedName: string,
  semanticName: SemanticIconName | string,
  context: IconResolutionContext,
): string {
  const { iconSet, variant = 'outline' } = context;

  if (iconSet === 'tira') {
    const isExplicitFilled =
      semanticName.endsWith('Filled') || mappedName.endsWith('Filled');
    if (isExplicitFilled) {
      return swapTiraSuffix(mappedName, 'Filled');
    }
    return swapTiraSuffix(mappedName, variant === 'filled' ? 'Filled' : 'Outlined');
  }

  // Material fill axis is handled by the loader import path, not name swapping.
  return mappedName;
}

/**
 * Material Symbols module import path for the active style + fill preference.
 */
export function getMaterialSymbolsImportPath(
  materialStyle: MaterialStylePreference = 'outlined',
  variant: IconVariantPreference = 'outline',
): string {
  const style = materialStyle === 'sharp' ? 'sharp' : 'outlined';
  if (variant === 'filled') {
    return `@nine-thirty-five/material-symbols-react/${style}/filled`;
  }
  return `@nine-thirty-five/material-symbols-react/${style}`;
}
