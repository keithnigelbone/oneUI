import type { ShapeTokenName, ShapeScale } from './shapeTypes'
import { PILL_RADIUS_PX } from './shapeTypes'
import type { DimensionScale, Density } from './dimensionTypes'
import { resolveDimension } from './dimensionLogic'

export function resolveShape(
  token: ShapeTokenName,
  viewportWidth: number,
  dimensionScale: DimensionScale,
  density: Density = 'default',
): number {
  if (token === 'pill') return PILL_RADIUS_PX
  return resolveDimension(token, viewportWidth, dimensionScale, density)
}

export interface ResolvedShape {
  token: ShapeTokenName
  /** Null for 'pill' (fixed radius, not multiplier-based). */
  multiplier: number | null
  px: number
}

export function resolveAllShapes(
  viewportWidth: number,
  dimensionScale: DimensionScale,
  shapeScale: ShapeScale,
  density: Density = 'default',
): ResolvedShape[] {
  return shapeScale.tokens.map(token => {
    if (token === 'pill') {
      return { token, multiplier: null, px: PILL_RADIUS_PX }
    }
    return {
      token,
      multiplier: dimensionScale.multipliers[token],
      px: resolveDimension(token, viewportWidth, dimensionScale, density),
    }
  })
}
