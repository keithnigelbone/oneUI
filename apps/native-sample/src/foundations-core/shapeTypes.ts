import type { DimensionTokenName } from './dimensionTypes'

/** Shape (corner radius) tokens — subset of dimension tokens capped at 10, plus a fixed-value 'pill' token. */
export type ShapeTokenName =
  | Extract<
      DimensionTokenName,
      '0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '4.5'
      | '5' | '5.5' | '6' | '7' | '8' | '9' | '10'
    >
  | 'pill'

/** Fixed radius (in px) for the 'pill' token — large enough to fully round any realistic element. */
export const PILL_RADIUS_PX = 9999

export interface ShapeScale {
  tokens: ShapeTokenName[]
}
