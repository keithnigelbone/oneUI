/**
 * JDS Jio-icons loader for native apps.
 *
 * The Jio icon set on native is shipped as a regular npm package
 * (`@jds/core-icons--react-native`) whose default + named exports are
 * all React-Native SVG components, e.g. `IcAdd`, `IcCare`, `IcChevronDown`.
 * This helper plugs that module into `@oneui/ui-native/icons` so
 * `<Icon name="add" />` resolves through the same pipeline as the web
 * `<Icon name="…" />` resolver.
 *
 * `@oneui/ui-native` deliberately does NOT take a hard dependency on
 * `@jds/core-icons--react-native` — consuming apps may vendor a tarball
 * (sample app), install a published version, or alias the import. The
 * caller passes the imported module in:
 *
 *   import * as JdsIcons from '@jds/core-icons--react-native';
 *   import { initJdsJioIcons } from '@oneui/ui-native/icons';
 *
 *   initJdsJioIcons(JdsIcons);
 *
 * Safe to call multiple times — only the first call registers the loader
 * and catalog.
 */

import type { IconComponent } from '@oneui/shared';
import {
  setJioIconLoader,
  setJioIconCatalog,
  getJioIconLoader,
} from '@oneui/shared';

/**
 * Shape of the imported JDS RN package — a record of named glyph
 * components keyed by their catalog id (`IcAdd`, `IcFavorite`, …).
 */
export type JdsCoreIconsModule = Record<string, unknown>;

/**
 * Web's full Jio catalog (1,622 glyphs in `apps/platform/src/Jio_Icons/icons`)
 * uses some names that differ from the JDS RN tarball (~100 glyphs). Where
 * the JDS RN package ships the same icon under a different id, we alias
 * here so the shared `SemanticMappings.jio` (`heart → IcCare`,
 * `delete → IcTrashClear`, …) keeps working on native too.
 *
 * This is intentionally small — only entries that have a 1:1 JDS RN
 * equivalent. Names without an RN equivalent (e.g. `mail → IcMail`) will
 * still resolve to `null`; callers should pass `icon={Component}` directly
 * for those, or fall back to a different semantic name.
 */
const JDS_RN_ALIASES: Record<string, string> = {
  IcCare: 'IcFavorite',
  IcTrashClear: 'IcTrash',
  IcCopyDocument: 'IcCopy',
  IcLocationPoint: 'IcLocation',
};

/**
 * Build a loader function compatible with `setJioIconLoader` from a JDS
 * module. The returned function looks up the requested asset id (e.g.
 * `IcAdd`) directly on the module's named exports, falling back to the
 * JDS RN alias table for the few names that differ between the full web
 * Jio catalog and the JDS RN tarball.
 */
export function createJdsJioIconLoader(
  jdsModule: JdsCoreIconsModule,
): (name: string) => Promise<IconComponent | null> {
  const map = jdsModule as Record<string, IconComponent | undefined>;
  return async (name: string) => {
    const direct = map[name];
    if (direct) return direct;
    const alias = JDS_RN_ALIASES[name];
    if (alias) return map[alias] ?? null;
    return null;
  };
}

/**
 * Build the catalog of available JDS asset ids — everything exported from
 * the module whose name starts with `Ic` (the JDS naming convention).
 */
export function buildJdsJioIconCatalog(jdsModule: JdsCoreIconsModule): string[] {
  return Object.keys(jdsModule).filter((key) => key.startsWith('Ic'));
}

let jdsInitialized = false;

/**
 * Returns true once `initJdsJioIcons` (or any other `setJioIconLoader`
 * caller) has registered a loader.
 */
export function isJdsJioIconsInitialized(): boolean {
  return jdsInitialized || getJioIconLoader() !== null;
}

/**
 * Register the JDS RN module as the Jio icon source.
 *
 * - Wires `setJioIconLoader` so `<Icon name="…" />` resolves via the
 *   semantic mapping `SemanticMappings.jio.<name>` → catalog id (e.g.
 *   `IcAdd`) → component lookup on the JDS module.
 * - Wires `setJioIconCatalog` with all `Ic*` named exports for any
 *   browsers / pickers that need the full list.
 *
 * Idempotent — only the first call performs the registration.
 */
export function initJdsJioIcons(jdsModule: JdsCoreIconsModule): void {
  if (jdsInitialized) return;

  setJioIconLoader(createJdsJioIconLoader(jdsModule));
  setJioIconCatalog(buildJdsJioIconCatalog(jdsModule));

  jdsInitialized = true;
}
