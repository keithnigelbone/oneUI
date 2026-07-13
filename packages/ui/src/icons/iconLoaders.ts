import type { IconComponent, IconSetId, IconVariantPreference, MaterialStylePreference } from '@oneui/shared';

/** A function that asynchronously resolves a single icon component by name. */
export type IconLoader = (iconName: string) => Promise<IconComponent | null>;

/**
 * Convert PascalCase icon name to kebab-case for libraries that key their
 * per-icon files by kebab name (lucide, hugeicons after suffixing).
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Optional icon loaders explicitly registered by the host app or a companion
 * package. The core UI package intentionally ships no default third-party
 * dynamic imports, so installing @jds4/oneui-react never requires external
 * icon packs unless a consumer opts into one and registers it.
 */
export const ICON_LOADERS: Partial<Record<IconSetId, IconLoader>> = {};

export interface IconRuntimePrefs {
  variant?: IconVariantPreference;
  materialStyle?: MaterialStylePreference;
}

const G = globalThis as typeof globalThis & { __oneui_icon_prefs?: IconRuntimePrefs };

export function setIconRuntimePrefs(prefs: IconRuntimePrefs): void {
  G.__oneui_icon_prefs = { ...G.__oneui_icon_prefs, ...prefs };
}

export function getIconRuntimePrefs(): IconRuntimePrefs {
  return G.__oneui_icon_prefs ?? { variant: 'outline', materialStyle: 'outlined' };
}

export function setIconSetLoader(iconSet: IconSetId, loader: IconLoader): void {
  ICON_LOADERS[iconSet] = loader;
}

export function getIconSetLoader(iconSet: IconSetId): IconLoader | null {
  return ICON_LOADERS[iconSet] ?? null;
}

export function clearIconSetLoader(iconSet: IconSetId): void {
  delete ICON_LOADERS[iconSet];
}

/**
 * Resolve a single icon by set + name using the per-library loader table.
 * Returns `null` if the set has no registered loader (e.g. `'jio'`, which is
 * routed through the host-app-supplied loader in `IconContext.tsx`) or if the
 * underlying import resolves to nothing.
 */
export async function loadSingleIcon(
  iconSet: string,
  iconName: string,
): Promise<IconComponent | null> {
  const loader = ICON_LOADERS[iconSet as IconSetId];
  if (!loader) return null;
  try {
    return await loader(iconName);
  } catch {
    return null;
  }
}
