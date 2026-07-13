import type { DimensionTokenName, DimensionScale } from './dimensionTypes'

const TOKENS: DimensionTokenName[] = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5',
  '5', '5.5', '6', '7', '8', '9', '10', '12', '14', '16',
  '18', '20', '24', '28', '32', '40',
]

const MULTIPLIERS: Record<DimensionTokenName, number> = {
  '0':    0,
  '0.5':  0.125,
  '1':    0.25,
  '1.5':  0.375,
  '2':    0.5,
  '2.5':  0.625,
  '3':    0.75,
  '3.5':  0.875,
  '4':    1,
  '4.5':  1.125,
  '5':    1.25,
  '5.5':  1.375,
  '6':    1.5,
  '7':    1.75,
  '8':    2,
  '9':    2.25,
  '10':   2.5,
  '12':   3,
  '14':   3.5,
  '16':   4,
  '18':   4.5,
  '20':   5,
  '24':   6,
  '28':   7,
  '32':   8,
  '40':   10,
}

export const DEFAULT_DIMENSION_SCALE: DimensionScale = {
  tokens: TOKENS,
  multipliers: MULTIPLIERS,
  baseAt: {
    default: {
      min: { viewport: 360,  base: 16 },
      max: { viewport: 1920, base: 20 },
    },
    compact: {
      min: { viewport: 360,  base: 14 },
      max: { viewport: 1920, base: 18 },
    },
    open: {
      min: { viewport: 360,  base: 18 },
      max: { viewport: 1920, base: 22 },
    },
  },
  breakpoints: [360, 768, 1024, 1440, 1920],
}
