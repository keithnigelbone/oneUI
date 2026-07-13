import type { DimensionTokenName } from './dimensionTypes'

/** T-shirt sized stroke tokens. `none`–`2XL` are fixed; `3XL`–`9XL` reference the dimension scale. */
export type StrokeTokenName =
  | 'none' | 'S' | 'M' | 'L' | 'XL' | '2XL'
  | '3XL' | '4XL' | '5XL' | '6XL' | '7XL' | '8XL' | '9XL'

export type StrokeDef =
  | { kind: 'fixed'; px: number }
  | { kind: 'dimension'; ref: DimensionTokenName }

export interface StrokeScale {
  tokens: StrokeTokenName[]
  defs: Record<StrokeTokenName, StrokeDef>
}
