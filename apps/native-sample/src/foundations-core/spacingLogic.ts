import type { SpacingTokenName, SpacingScale } from './spacingTypes'
import type { DimensionScale, Density } from './dimensionTypes'
import { resolveDimension } from './dimensionLogic'

export function resolveSpacing(
  token: SpacingTokenName,
  viewportWidth: number,
  dimensionScale: DimensionScale,
  density: Density = 'default',
): number {
  return resolveDimension(token, viewportWidth, dimensionScale, density)
}

export interface ResolvedSpacing {
  token: SpacingTokenName
  multiplier: number
  px: number
}

export function resolveAllSpacings(
  viewportWidth: number,
  dimensionScale: DimensionScale,
  spacingScale: SpacingScale,
  density: Density = 'default',
): ResolvedSpacing[] {
  return spacingScale.tokens.map(token => ({
    token,
    multiplier: dimensionScale.multipliers[token],
    px: resolveDimension(token, viewportWidth, dimensionScale, density),
  }))
}
