import type { IconComponent } from './types/icons';

/**
 * Icon registry backed by globalThis so state is shared across bundled copies.
 *
 * Both @oneui/ui-native and @oneui/icons-jio-native bundle @oneui/shared into
 * their own CJS output. Without globalThis backing, setJioIconLoader() in the
 * icons bundle would write to a different module-scope variable than the one
 * getJioIconLoader() reads in the ui-native bundle — icons would silently fail
 * to resolve even after initJdsJioIcons() is called.
 */

type Loader = (name: string) => Promise<IconComponent | null>;

interface OneUIIconRegistry {
  loader: Loader | null;
  catalog: string[] | null;
  listeners: Set<() => void>;
}

const G = globalThis as unknown as { __oneui_icon_registry?: OneUIIconRegistry };

function registry(): OneUIIconRegistry {
  if (!G.__oneui_icon_registry) {
    G.__oneui_icon_registry = { loader: null, catalog: null, listeners: new Set() };
  }
  return G.__oneui_icon_registry;
}

export function setJioIconLoader(loader: Loader): void {
  registry().loader = loader;
}

export function setJioIconCatalog(catalog: string[]): void {
  const r = registry();
  r.catalog = catalog;
  for (const listener of r.listeners) {
    listener();
  }
}

export function getJioIconLoader(): Loader | null {
  return registry().loader;
}

export function getJioIconCatalog(): string[] | null {
  return registry().catalog;
}

export function onJioIconCatalogReady(listener: () => void): () => void {
  const listeners = registry().listeners;
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
