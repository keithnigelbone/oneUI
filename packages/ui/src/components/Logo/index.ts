export { Logo } from './Logo';
export { useLogoState } from './Logo.shared';
export type {
  LogoProps,
  LogoSize,
  LogoVariant,
  LogoContentMode,
} from './Logo.shared';

// Shared preview component (single source of truth for logo rendering)
export { LogoPreview } from './LogoPreview';
export type { LogoPreviewProps } from './LogoPreview';

// Token manifest for Component Token Editor
export {
  LOGO_TOKEN_MANIFEST,
  LOGO_TOKENS,
} from './Logo.tokens';

// Recipe definition for Component Recipe System
export { LOGO_RECIPE_DEFINITION } from './Logo.recipe';

// Unified component metadata
export { LOGO_META } from './Logo.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  LogoSizes,
  LogoVariants,
  LogoContentSources,
  LogoImageFallback,
} from './Logo.showcase';
