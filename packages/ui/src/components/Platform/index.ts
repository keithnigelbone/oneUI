/**
 * Platform components — path-based import entry point.
 *
 * Usage:
 *   import { Shell, TopBar, LeftNav, ... } from '@oneui/ui/components/Platform';
 */

export { Shell, type ShellProps } from './Shell/Shell';
export {
  TopBar,
  PlatformSelector,
  type TopBarProps,
  type PlatformConfig,
} from './TopBar/TopBar';
export type {
  PlatformOption,
  PlatformSelectorProps,
} from './TopBar/PlatformSelector';
export {
  LeftNav,
  type LeftNavProps,
  type NavigationItem,
  type UserInfo,
} from './LeftNav/LeftNav';
export {
  ModeNav,
  type ModeNavProps,
  type ModeNavItem,
  type PlatformModeId,
} from './ModeNav';
export { SecondaryNav, type SecondaryNavProps } from './SecondaryNav/SecondaryNav';
export {
  SettingsModal,
  type SettingsModalProps,
  type ThemeScope,
  type SubThemeConfig,
  type SubThemeOption,
  type DensityMode,
  type DensityOption,
} from './SettingsModal';
export { DensitySelector, type DensitySelectorProps } from './TopBar/DensitySelector';
export {
  ComponentPlatformSelector,
  type ComponentPlatformSelectorProps,
} from './TopBar/ComponentPlatformSelector';
export { ScopedPlatform, type ScopedPlatformProps } from './ScopedPlatform';
export {
  BrandPicker,
  BrandPickerGroup,
  BrandPickerItem,
  BrandPickerVariant,
  groupBrands,
  type BrandPickerProps,
  type BrandPickerSelection,
  type BrandPickerSubBrandConfig,
  type BrandFamily,
  type BrandGroups,
} from './BrandPicker';
