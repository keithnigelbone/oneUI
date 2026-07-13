import type { StrokeTokenName, StrokeScale } from './strokeTypes'
import type { DimensionTokenName, DimensionScale, Density } from './dimensionTypes'
import { resolveDimension } from './dimensionLogic'

export function resolveStroke(
  token: StrokeTokenName,
  viewportWidth: number,
  dimensionScale: DimensionScale,
  strokeScale: StrokeScale,
  density: Density = 'default',
): number {
  const def = strokeScale.defs[token]
  if (def.kind === 'fixed') return def.px
  return resolveDimension(def.ref, viewportWidth, dimensionScale, density)
}

export interface ResolvedStroke {
  token: StrokeTokenName
  kind: 'fixed' | 'dimension'
  /** Dimension token name for `kind === 'dimension'`, otherwise null. */
  ref: DimensionTokenName | null
  px: number
}

export function resolveAllStrokes(
  viewportWidth: number,
  dimensionScale: DimensionScale,
  strokeScale: StrokeScale,
  density: Density = 'default',
): ResolvedStroke[] {
  return strokeScale.tokens.map(token => {
    const def = strokeScale.defs[token]
    if (def.kind === 'fixed') {
      return { token, kind: 'fixed', ref: null, px: def.px }
    }
    return {
      token,
      kind: 'dimension',
      ref: def.ref,
      px: resolveDimension(def.ref, viewportWidth, dimensionScale, density),
    }
  })
}
