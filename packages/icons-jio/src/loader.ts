/**
 * Jio icon loader registration — shared by register.ts and index.ts.
 */

import type { IconComponent } from './iconProps';
import catalog from './catalog.json';
import { categoryFor } from './categoryIndex';
import { categoryLoaders } from './categoryLoaders';

const componentCache: Record<string, IconComponent> = {};

let registered = false;

async function loadJioIcon(name: string): Promise<IconComponent | null> {
  if (componentCache[name]) return componentCache[name];

  const cat = categoryFor(name);
  if (!cat) return null;

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

/** Register the Jio icon loader with OneUI. Idempotent. */
export function initJioIcons(): void {
  if (registered) return;

  const G = globalThis as any;
  if (!G.__oneui_icon_registry) {
    G.__oneui_icon_registry = { loader: null, catalog: null, listeners: new Set() };
  }

  const r = G.__oneui_icon_registry;
  r.loader = loadJioIcon;
  r.catalog = catalog;
  for (const listener of r.listeners) {
    listener();
  }

  registered = true;
}
