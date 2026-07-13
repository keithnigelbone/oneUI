import type { SpacingScale } from './spacingTypes'
import { DEFAULT_DIMENSION_SCALE } from './dimensions'

/** Default spacing scale — every dimension token is a spacing token. */
export const DEFAULT_SPACING_SCALE: SpacingScale = {
  tokens: [...DEFAULT_DIMENSION_SCALE.tokens],
}
