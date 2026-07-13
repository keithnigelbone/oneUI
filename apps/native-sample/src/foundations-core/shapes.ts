import type { ShapeTokenName, ShapeScale } from './shapeTypes'

const SHAPE_TOKENS: ShapeTokenName[] = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5',
  '5', '5.5', '6', '7', '8', '9', '10', 'pill',
]

export const DEFAULT_SHAPE_SCALE: ShapeScale = {
  tokens: SHAPE_TOKENS,
}
