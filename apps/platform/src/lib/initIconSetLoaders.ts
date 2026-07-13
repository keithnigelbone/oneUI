/**
 * Registers optional icon-pack loaders for the platform host app.
 *
 * The UI package intentionally does not import third-party icon packs by
 * default. The platform app offers these sets in Foundations, so it must
 * register loaders for the same sets used by the global IconProvider.
 */

import { setIconSetLoader } from '@oneui/ui/icons/IconContext';
import { getIconRuntimePrefs } from '@oneui/ui/icons/iconLoaders';
import type { IconComponent, IconSetId, MaterialStylePreference, IconVariantPreference } from '@oneui/shared';

type IconModule = Record<string, unknown> & {
  icons?: Record<string, unknown>;
};

/** Static keys for Material module cache — dynamic import paths break Turbopack. */
type MaterialModuleKey = 'outlined' | 'outlined-filled' | 'sharp' | 'sharp-filled';

function materialModuleKey(
  materialStyle: MaterialStylePreference = 'outlined',
  variant: IconVariantPreference = 'outline',
): MaterialModuleKey {
  const style = materialStyle === 'sharp' ? 'sharp' : 'outlined';
  return variant === 'filled' ? `${style}-filled` : style;
}

async function loadMaterialModule(key: MaterialModuleKey): Promise<IconModule> {
  switch (key) {
    case 'outlined':
      return import('@nine-thirty-five/material-symbols-react/outlined') as Promise<IconModule>;
    case 'outlined-filled':
      return import('@nine-thirty-five/material-symbols-react/outlined/filled') as Promise<IconModule>;
    case 'sharp':
      return import('@nine-thirty-five/material-symbols-react/sharp') as Promise<IconModule>;
    case 'sharp-filled':
      return import('@nine-thirty-five/material-symbols-react/sharp/filled') as Promise<IconModule>;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

let initialized = false;

const moduleCache: Partial<Record<IconSetId, Promise<IconModule>>> = {};

function loadModule(iconSet: IconSetId, loader: () => Promise<IconModule>): Promise<IconModule> {
  moduleCache[iconSet] ??= loader();
  return moduleCache[iconSet]!;
}

function resolveExport(module: IconModule, iconName: string): IconComponent | null {
  const direct = module[iconName] ?? module.icons?.[iconName];
  if (typeof direct === 'function') return direct as IconComponent;
  if (direct && typeof direct === 'object' && '$$typeof' in direct) {
    return direct as IconComponent;
  }
  return null;
}

function resolveWithFallbacks(
  module: IconModule,
  iconName: string,
  fallbacks: readonly string[] = [],
): IconComponent | null {
  return [iconName, ...fallbacks]
    .map((name) => resolveExport(module, name))
    .find(Boolean) ?? null;
}

export function initIconSetLoaders(): void {
  if (initialized) return;
  initialized = true;

  setIconSetLoader('lucide', async (iconName) => {
    const module = await loadModule('lucide', () => import('lucide-react') as Promise<IconModule>);
    return resolveExport(module, iconName);
  });

  setIconSetLoader('tabler', async (iconName) => {
    const module = await loadModule(
      'tabler',
      () => import('@tabler/icons-react') as Promise<IconModule>,
    );
    return resolveExport(module, iconName);
  });

  setIconSetLoader('hugeicons', async (iconName) => {
    const module = await loadModule(
      'hugeicons',
      () => import('hugeicons-react') as Promise<IconModule>,
    );
    return resolveExport(module, iconName);
  });

  setIconSetLoader('phosphor', async (iconName) => {
    const module = await loadModule(
      'phosphor',
      () => import('@phosphor-icons/react') as Promise<IconModule>,
    );
    return resolveWithFallbacks(module, iconName, [
      `${iconName}Icon`,
      iconName.replace(/Fill$/, ''),
      `${iconName.replace(/Fill$/, '')}Icon`,
    ]);
  });

  setIconSetLoader('remix', async (iconName) => {
    const module = await loadModule('remix', () => import('@remixicon/react') as Promise<IconModule>);
    return resolveExport(module, iconName);
  });

  setIconSetLoader('tira', async (iconName) => {
    const { loadTiraIcon } = await import('@oneui/icons-tira');
    return (await loadTiraIcon(iconName)) as IconComponent | null;
  });

  const materialModuleCache: Partial<Record<MaterialModuleKey, Promise<IconModule>>> = {};

  setIconSetLoader('material', async (iconName) => {
    const { variant, materialStyle } = getIconRuntimePrefs();
    const key = materialModuleKey(materialStyle, variant);
    materialModuleCache[key] ??= loadMaterialModule(key);
    const module = await materialModuleCache[key]!;
    return resolveExport(module, iconName);
  });
}
