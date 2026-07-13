import type { DimensionTokenName, DimensionScale, Density } from './dimensionTypes'

export function resolveBase(
  viewportWidth: number,
  scale: DimensionScale,
  density: Density = 'default',
): number {
  const { min, max } = scale.baseAt[density]
  if (viewportWidth <= min.viewport) return min.base
  if (viewportWidth >= max.viewport) return max.base
  const t = (viewportWidth - min.viewport) / (max.viewport - min.viewport)
  return min.base + t * (max.base - min.base)
}

export function resolveDimension(
  token: DimensionTokenName,
  viewportWidth: number,
  scale: DimensionScale,
  density: Density = 'default',
): number {
  const base = resolveBase(viewportWidth, scale, density)
  return base * scale.multipliers[token]
}

export interface ResolvedDimension {
  token: DimensionTokenName
  multiplier: number
  px: number
}

export function resolveAllDimensions(
  viewportWidth: number,
  scale: DimensionScale,
  density: Density = 'default',
): ResolvedDimension[] {
  const base = resolveBase(viewportWidth, scale, density)
  return scale.tokens.map(token => ({
    token,
    multiplier: scale.multipliers[token],
    px: base * scale.multipliers[token],
  }))
}
