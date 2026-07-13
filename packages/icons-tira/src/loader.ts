/**
 * Tira icon loader registration — shared by register.ts and index.ts.
 */

import type { IconComponent } from './iconProps';
import catalog from './catalog.json';
import { categoryFor } from './categoryIndex';
import { categoryLoaders } from './categoryLoaders';

const componentCache: Record<string, IconComponent> = {};

let registered = false;

async function loadTiraIcon(name: string): Promise<IconComponent | null> {
  if (componentCache[name]) return componentCache[name];

  const cat = categoryFor(name);
  if (!cat) {
    if (name.endsWith('Filled')) {
      return loadTiraIcon(name.replace(/Filled$/, 'Outlined'));
    }
    return null;
  }

  const loadCategory = categoryLoaders[cat];
  if (!loadCategory) return null;

  try {
    const mod = await loadCategory();
    const component = mod[name];
    if (component) {
      componentCache[name] = component;
      return component;
    }
  } catch {
    // Module missing or failed to load — treat as unknown icon.
  }

  return null;
}

/** Register the Tira icon loader with OneUI. Idempotent. */
export function initTiraIcons(): void {
  if (registered) return;

  const G = globalThis as typeof globalThis & {
    __oneui_tira_icon_registry?: {
      loader: (name: string) => Promise<IconComponent | null>;
      catalog: string[];
      listeners: Set<() => void>;
    };
  };

  if (!G.__oneui_tira_icon_registry) {
    G.__oneui_tira_icon_registry = { loader: loadTiraIcon, catalog, listeners: new Set() };
  } else {
    G.__oneui_tira_icon_registry.loader = loadTiraIcon;
    G.__oneui_tira_icon_registry.catalog = catalog;
  }

  for (const listener of G.__oneui_tira_icon_registry.listeners) {
    listener();
  }

  registered = true;
}

export { loadTiraIcon, catalog as tiraIconCatalog };
