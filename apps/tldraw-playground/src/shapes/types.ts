// Module augmentation: registers our custom container shape types with tldraw's
// schema so TLShape includes them. Leaf components are now real @oneui/ui
// components rendered by the generated `oneui-*` shape utils (see
// manifest/oneuiManifest.tsx), which use loose props and need no augmentation.

import type { ComponentDef } from '@/lib/componentDef'
import type { CardShape } from './CardShape'
import type { ComponentInstanceShape } from './ComponentInstanceShape'
import type { FormContainerShape } from './FormContainerShape'
import type { ListContainerShape } from './ListContainerShape'
import type { PageFrameShape } from './PageFrameShape'
import type { SlotShape } from './SlotShape'
import type { StackShape } from './StackShape'

declare module '@tldraw/tlschema' {
  interface TLGlobalRecordPropsMap {
    componentDef: ComponentDef
  }
  interface TLGlobalShapePropsMap {
    'ui-card': CardShape['props']
    'ui-component-instance': ComponentInstanceShape['props']
    'ui-form': FormContainerShape['props']
    'ui-list': ListContainerShape['props']
    'ui-page': PageFrameShape['props']
    'ui-slot': SlotShape['props']
    'ui-stack': StackShape['props']
  }
}

export {}
