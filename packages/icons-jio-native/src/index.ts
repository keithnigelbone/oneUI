/**
 * @oneui/icons-jio-native
 *
 * Full Jio icon set (1,622 icons) for React Native via react-native-svg.
 *
 * Run `pnpm run generate` once to populate `src/generated/` from the web
 * icon sources in `apps/platform/src/Jio_Icons/icons/`.
 *
 * Usage:
 *   import '@oneui/icons-jio-native';          // auto-registers on import
 *   import { IcAdd } from '@oneui/icons-jio-native';  // individual components
 *
 * The package auto-registers its icon loader and catalog on import,
 * so `<Icon name="add" />` resolves to the Jio icon set with no extra
 * setup required. This mirrors the web `@oneui/icons-jio` pattern.
 */

export * from './generated';

import type { IconComponent } from '@oneui/shared';
import { setJioIconLoader, setJioIconCatalog } from '@oneui/shared';
import * as generatedIcons from './generated';

const iconMap = generatedIcons as Record<string, IconComponent>;
const catalog = Object.keys(iconMap).filter((k) => k.startsWith('Ic'));

let registered = false;

export function initJioNativeIcons(): void {
  if (registered) return;
  setJioIconLoader(async (name: string) => iconMap[name] ?? null);
  setJioIconCatalog(catalog);
  registered = true;
}

// Side-effect auto-registration on import (mirrors @oneui/icons-jio)
initJioNativeIcons();

// JDS bridge — use initJdsJioIcons() if you have @jds/core-icons--react-native
export {
  initJdsJioIcons,
  createJdsJioIconLoader,
  buildJdsJioIconCatalog,
  isJdsJioIconsInitialized,
  type JdsCoreIconsModule,
} from './jdsLoader';

// release-pipeline test marker — safe to revert
