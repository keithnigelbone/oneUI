/**
 * Idempotent icon-set registration for BrandProvider and host apps.
 *
 * - `jio` → dynamic import of `@oneui/icons-jio/register` (peer; lazy per-icon chunks).
 * - OSS sets → per-icon dynamic imports where the npm package supports it (Lucide, Tabler).
 *   Falls back to a one-time full-module import for other sets when the pack is installed.
 *
 * Safe to call from every BrandProvider mount — each set registers at most once.
 */

import type { IconComponent, IconSetId } from '@oneui/shared';
import { getJioIconLoader } from '@oneui/shared';
import { setIconSetLoader, getIconSetLoader, toKebabCase } from './iconLoaders';

const registeredSets = new Set<IconSetId>();
const warnedMissing = new Set<IconSetId>();

export function isIconSetRegistered(iconSet: IconSetId): boolean {
  return registeredSets.has(iconSet);
}

function warnMissingPack(iconSet: IconSetId, packageName: string): void {
  if (warnedMissing.has(iconSet)) return;
  warnedMissing.add(iconSet);
  // eslint-disable-next-line no-console
  console.warn(
    `[@jds4/oneui-react] iconSet="${iconSet}" requires \`${packageName}\` to be installed. `
    + `Icons in this BrandProvider subtree will not render until the package is added.`,
  );
}

type IconModule = Record<string, unknown> & { icons?: Record<string, unknown> };

function resolveExport(module: IconModule, iconName: string): IconComponent | null {
  const direct = module[iconName] ?? module.icons?.[iconName];
  if (typeof direct === 'function') return direct as IconComponent;
  if (direct && typeof direct === 'object' && '$$typeof' in direct) {
    return direct as IconComponent;
  }
  return null;
}

function createPerIconLoader(
  iconSet: IconSetId,
  packageName: string,
  resolvePath: (iconName: string) => string | null,
): (iconName: string) => Promise<IconComponent | null> {
  const cache: Record<string, IconComponent> = {};

  return async (iconName: string) => {
    if (cache[iconName]) return cache[iconName];
    const path = resolvePath(iconName);
    if (!path) return null;
    try {
      const mod = await import(/* @vite-ignore */ path) as { default?: IconComponent } & IconModule;
      const component = mod.default ?? resolveExport(mod, iconName);
      if (component) {
        cache[iconName] = component;
        return component;
      }
    } catch {
      warnMissingPack(iconSet, packageName);
    }
    return null;
  };
}

function registerLucideLoader(): void {
  if (getIconSetLoader('lucide')) return;
  // Per-icon paths target each pack's internal dist layout (e.g. lucide-react/dist/esm/icons/*.js).
  // These are opt-in non-Jio sets only; a pack version bump may require path updates here.
  setIconSetLoader(
    'lucide',
    createPerIconLoader('lucide', 'lucide-react', (iconName) => {
      const kebab = toKebabCase(iconName);
      return `lucide-react/dist/esm/icons/${kebab}.js`;
    }),
  );
}

function registerTablerLoader(): void {
  if (getIconSetLoader('tabler')) return;
  setIconSetLoader(
    'tabler',
    createPerIconLoader('tabler', '@tabler/icons-react', (iconName) => {
      const base = iconName.startsWith('Icon') ? iconName : `Icon${iconName}`;
      return `@tabler/icons-react/dist/esm/icons/${base}.mjs`;
    }),
  );
}

const moduleCache: Partial<Record<IconSetId, Promise<IconModule>>> = {};

function loadFullModule(
  iconSet: IconSetId,
  packageName: string,
  importer: () => Promise<IconModule>,
): Promise<IconModule> {
  moduleCache[iconSet] ??= importer().catch((err) => {
    delete moduleCache[iconSet];
    warnMissingPack(iconSet, packageName);
    throw err;
  });
  return moduleCache[iconSet]!;
}

function registerFullModuleLoader(
  iconSet: IconSetId,
  packageName: string,
  importer: () => Promise<IconModule>,
  fallbacks: (iconName: string) => readonly string[] = () => [],
): void {
  if (getIconSetLoader(iconSet)) return;
  setIconSetLoader(iconSet, async (iconName) => {
    try {
      const mod = await loadFullModule(iconSet, packageName, importer);
      return [iconName, ...fallbacks(iconName)]
        .map((name) => resolveExport(mod, name))
        .find(Boolean) ?? null;
    } catch {
      return null;
    }
  });
}

async function registerJio(): Promise<void> {
  if (getJioIconLoader()) {
    registeredSets.add('jio');
    return;
  }
  try {
    await import('@oneui/icons-jio/register');
    registeredSets.add('jio');
  } catch {
    warnMissingPack('jio', '@jds4/oneui-icons-jio');
  }
}

function registerOssSet(iconSet: IconSetId): void {
  switch (iconSet) {
    case 'lucide':
      registerLucideLoader();
      registeredSets.add('lucide');
      break;
    case 'tabler':
      registerTablerLoader();
      registeredSets.add('tabler');
      break;
    case 'hugeicons':
      registerFullModuleLoader(
        'hugeicons',
        'hugeicons-react',
        () => import('hugeicons-react') as Promise<IconModule>,
      );
      registeredSets.add('hugeicons');
      break;
    case 'phosphor':
      registerFullModuleLoader(
        'phosphor',
        '@phosphor-icons/react',
        () => import('@phosphor-icons/react') as Promise<IconModule>,
        (iconName) => [
          `${iconName}Icon`,
          iconName.replace(/Fill$/, ''),
          `${iconName.replace(/Fill$/, '')}Icon`,
        ],
      );
      registeredSets.add('phosphor');
      break;
    case 'remix':
      registerFullModuleLoader(
        'remix',
        '@remixicon/react',
        () => import('@remixicon/react') as Promise<IconModule>,
      );
      registeredSets.add('remix');
      break;
    case 'tira': {
      if (getIconSetLoader('tira')) {
        registeredSets.add('tira');
        break;
      }
      setIconSetLoader('tira', async (iconName) => {
        try {
          const { loadTiraIcon } = await import('@oneui/icons-tira');
          return loadTiraIcon(iconName);
        } catch {
          warnMissingPack('tira', '@oneui/icons-tira');
          return null;
        }
      });
      registeredSets.add('tira');
      break;
    }
    case 'material':
      registerFullModuleLoader(
        'material',
        '@nine-thirty-five/material-symbols-react',
        () => import('@nine-thirty-five/material-symbols-react/outlined') as Promise<IconModule>,
      );
      registeredSets.add('material');
      break;
    default:
      break;
  }
}

/**
 * Ensure the loader for `iconSet` is registered. Idempotent across nested BrandProviders.
 */
export async function ensureIconSetRegistered(iconSet: IconSetId): Promise<void> {
  if (registeredSets.has(iconSet)) return;

  if (iconSet === 'jio') {
    await registerJio();
    return;
  }

  registerOssSet(iconSet);
}
