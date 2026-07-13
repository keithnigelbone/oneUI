export { Chip } from './Chip';
export { useChipState } from './Chip.shared';
export type {
  ChipProps,
  ChipAppearance,
  ChipVariant,
  ChipSize,
  ChipAttention,
} from './Chip.shared';

// Shared preview component (single source of truth for chip rendering)
export { ChipPreview } from './ChipPreview';
export type { ChipPreviewProps } from './ChipPreview';

// Token manifest for Component Token Editor
export {
  CHIP_TOKEN_MANIFEST,
  CHIP_TOKENS,
  getChipTokensByCategory,
  getChipTokenDefault,
} from './Chip.tokens';

// Recipe definition for Component Recipe System
export { CHIP_RECIPE_DEFINITION } from './Chip.recipe';

// Unified component metadata
export { CHIP_META } from './Chip.meta';

// Showcase components — shared between Storybook stories and platform documentation
export {
  ChipAttentionLevels,
  ChipSizes,
  ChipStates,
  ChipWithSlots,
  ChipAppearances,
  ChipSurfaceContext,
} from './Chip.showcase';
