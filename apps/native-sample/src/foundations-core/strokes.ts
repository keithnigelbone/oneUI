import type { StrokeTokenName, StrokeScale } from './strokeTypes'

const TOKENS: StrokeTokenName[] = [
  'none', 'S', 'M', 'L', 'XL', '2XL',
  '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL',
]

export const DEFAULT_STROKE_SCALE: StrokeScale = {
  tokens: TOKENS,
  defs: {
    none:  { kind: 'fixed', px: 0 },
    S:     { kind: 'fixed', px: 0.5 },
    M:     { kind: 'fixed', px: 1 },
    L:     { kind: 'fixed', px: 1.5 },
    XL:    { kind: 'fixed', px: 2 },
    '2XL': { kind: 'fixed', px: 3 },
    '3XL': { kind: 'dimension', ref: '1' },
    '4XL': { kind: 'dimension', ref: '1.5' },
    '5XL': { kind: 'dimension', ref: '2' },
    '6XL': { kind: 'dimension', ref: '2.5' },
    '7XL': { kind: 'dimension', ref: '3' },
    '8XL': { kind: 'dimension', ref: '3.5' },
    '9XL': { kind: 'dimension', ref: '4' },
  },
}
