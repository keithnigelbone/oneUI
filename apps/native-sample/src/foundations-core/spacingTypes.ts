import type { DimensionTokenName } from './dimensionTypes'

/** Spacing tokens are 1:1 aliases of dimension tokens — the name is the multiplier × 4. */
export type SpacingTokenName = DimensionTokenName

export interface SpacingScale {
  /** Ordered token list. A subset of DimensionTokenName is allowed so a family can omit tokens. */
  tokens: SpacingTokenName[]
}
