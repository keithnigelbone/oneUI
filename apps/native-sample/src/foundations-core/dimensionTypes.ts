export type DimensionTokenName =
  | '0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' | '4.5'
  | '5' | '5.5' | '6' | '7' | '8' | '9' | '10' | '12' | '14' | '16'
  | '18' | '20' | '24' | '28' | '32' | '40'

export type Density = 'default' | 'compact' | 'open'

export interface DensityBaseAt {
  min: { viewport: number; base: number }
  max: { viewport: number; base: number }
}

export interface DimensionScale {
  tokens: DimensionTokenName[]
  multipliers: Record<DimensionTokenName, number>
  /** Base value endpoints per density. min.viewport and max.viewport must match across densities. */
  baseAt: Record<Density, DensityBaseAt>
  breakpoints: number[]
}
