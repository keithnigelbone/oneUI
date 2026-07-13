import './types' // augments tldraw's TLShape with our custom container types
import { CardShapeUtil } from './CardShape'
import { ComponentInstanceShapeUtil } from './ComponentInstanceShape'
import { FormContainerShapeUtil } from './FormContainerShape'
import { ListContainerShapeUtil } from './ListContainerShape'
import { PageFrameShapeUtil } from './PageFrameShape'
import { SlotShapeUtil } from './SlotShape'
import { StackShapeUtil } from './StackShape'
import { oneUiShapeUtils } from '@/manifest/oneuiManifest'

export const customShapeUtils = [
  // Real One UI component shape utils (oneui-*) — the leaf primitives.
  ...oneUiShapeUtils,
  // Layout-frame containers (nesting + auto-layout) that One UI leaves compose into.
  PageFrameShapeUtil,
  StackShapeUtil,
  FormContainerShapeUtil,
  ListContainerShapeUtil,
  CardShapeUtil,
  SlotShapeUtil,
  ComponentInstanceShapeUtil,
]

export type { CardShape } from './CardShape'
export type { PageFrameShape } from './PageFrameShape'
export type { StackShape } from './StackShape'
