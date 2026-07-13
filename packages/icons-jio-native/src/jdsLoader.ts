/**
 * JDS Jio-icons loader for native apps.
 *
 * Moved from `packages/ui-native/src/components/Icon/jdsLoader.ts`.
 * Imports registry functions from `@oneui/shared` so this package has no
 * dependency on `@oneui/ui-native`.
 *
 * The Jio icon set on native is shipped as a regular npm package
 * (`@jds/core-icons--react-native`) whose default + named exports are
 * all React-Native SVG components, e.g. `IcAdd`, `IcCare`, `IcChevronDown`.
 * This helper plugs that module into the OneUI icon registry so
 * `<Icon name="add" />` resolves through the same pipeline as the web
 * `<Icon name="…" />` resolver.
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
 */
const JDS_RN_ALIASES: Record<string, string> = {
  IcCare: 'IcFavorite',
  IcTrashClear: 'IcTrash',
  IcCopyDocument: 'IcCopy',
  IcLocationPoint: 'IcLocation',
};

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

export function buildJdsJioIconCatalog(jdsModule: JdsCoreIconsModule): string[] {
  return Object.keys(jdsModule).filter((key) => key.startsWith('Ic'));
}

let jdsInitialized = false;

export function isJdsJioIconsInitialized(): boolean {
  return jdsInitialized || getJioIconLoader() !== null;
}

export function initJdsJioIcons(jdsModule: JdsCoreIconsModule): void {
  if (jdsInitialized) return;

  setJioIconLoader(createJdsJioIconLoader(jdsModule));
  setJioIconCatalog(buildJdsJioIconCatalog(jdsModule));

  jdsInitialized = true;
}
