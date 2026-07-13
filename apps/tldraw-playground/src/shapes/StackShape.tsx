import {
  BaseFrameLikeShapeUtil,
  Group2d,
  HTMLContainer,
  RecordProps,
  Rectangle2d,
  T,
  TLBaseShape,
  TLResizeInfo,
  resizeBox,
} from 'tldraw'
import type { AlignItems, JustifyContent, StackDirection } from '@/lib/layout'
import { registerComponent } from '@/lib/registry'
import {
  surfaceValidator,
  appearanceValidator,
  surfaceMigrations,
  surfacePaintStyle,
  useShapeSurfaceStep,
  useShapeSurfaceAppearance,
  SURFACE_SCHEMA_OPTIONS,
  APPEARANCE_SCHEMA_OPTIONS,
  type SurfaceLevel,
  type SurfaceAppearance,
} from '@/lib/surface'
import { ContainerChrome } from './ContainerChrome'

export type StackShape = TLBaseShape<
  'ui-stack',
  {
    w: number
    h: number
    direction: StackDirection
    gap: number
    padding: number
    alignItems: AlignItems
    justifyContent: JustifyContent
    background: SurfaceLevel
    appearance: SurfaceAppearance
    borderRadius: number
    border: boolean
  }
>

export const stackShapeProps: RecordProps<StackShape> = {
  w: T.number,
  h: T.number,
  direction: T.literalEnum('horizontal', 'vertical'),
  gap: T.number,
  padding: T.number,
  alignItems: T.literalEnum('start', 'center', 'end', 'stretch'),
  justifyContent: T.literalEnum('start', 'center', 'end', 'space-between', 'space-around'),
  background: surfaceValidator,
  appearance: appearanceValidator,
  borderRadius: T.number,
  border: T.boolean,
}

const STACK_DEFAULTS: StackShape['props'] = {
  w: 320,
  h: 200,
  direction: 'vertical',
  gap: 12,
  padding: 16,
  // 'start' (not 'stretch') so children keep their real intrinsic size and the
  // One UI auto-hug (manifest/oneuiManifest) isn't fought by stretch-to-fill.
  alignItems: 'start',
  justifyContent: 'start',
  background: 'default',
  appearance: 'auto',
  borderRadius: 8,
  // Default off — the ContainerChrome's dashed outline already makes Stack
  // bounds visible in edit mode, so a hard border here would just bleed
  // into the rendered output as an unwanted box. Users who genuinely want
  // a visible border flip this in the inspector.
  border: false,
}

export class StackShapeUtil extends BaseFrameLikeShapeUtil<StackShape> {
  static override type = 'ui-stack' as const
  static override props = stackShapeProps
  static override migrations = surfaceMigrations('ui-stack')

  override canEdit = () => false
  override hideRotateHandle = () => true
  override isAspectRatioLocked = () => false

  // Auto-hug means children always fit; clipping is redundant and only hurts
  // visual feedback during transient layout states.
  override getClipPath() {
    return undefined
  }

  override getDefaultProps(): StackShape['props'] {
    return { ...STACK_DEFAULTS }
  }

  override getGeometry(shape: StackShape) {
    // Frame-like shapes must return a Group2d — tldraw's hit-test iterates
    // geometry.children when `isShapeFrameLike(shape)` is true.
    return new Group2d({
      children: [
        new Rectangle2d({
          width: shape.props.w,
          height: shape.props.h,
          isFilled: true,
        }),
      ],
    })
  }

  override onResize(shape: StackShape, info: TLResizeInfo<StackShape>) {
    const next = resizeBox(shape, info)
    // Mark as user-sized so layoutSync stops auto-shrinking it.
    return { ...next, meta: { ...(shape.meta ?? {}), userSized: true } }
  }

  override component(shape: StackShape) {
    const { background, borderRadius, border } = shape.props
    // Resolved step + role (resolving `auto` to the surface behind) drive the
    // role fill (--{Role}-Self-Color) and the token remap for content on it.
    const step = useShapeSurfaceStep(shape.id)
    const appearance = useShapeSurfaceAppearance(shape.id)
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
        }}
      >
        <div
          className="group"
          // data-surface(+step+appearance) make this a context-aware surface:
          // the fill is the role's colour at this step; descendants adapt. (see
          // lib/surface.ts). 'ghost' → transparent.
          data-surface={background}
          data-surface-step={step}
          data-appearance={appearance}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius,
            border: border ? '1px solid var(--Border-Default, var(--Color-Neutral-300))' : undefined,
            transition: 'background-color 120ms',
            ...surfacePaintStyle(background, appearance),
          }}
        >
          <ContainerChrome shapeId={shape.id} label="Stack" color="zinc" />
        </div>
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: StackShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}

registerComponent({
  type: 'ui-stack',
  label: 'Stack',
  category: 'layout',
  icon: 'LayoutPanelLeft',
  initialSize: { w: 320, h: 200 },
  defaults: { ...STACK_DEFAULTS },
  schema: {
    layout: {
      group: 'Layout',
      props: {
        direction: {
          kind: 'enum',
          label: 'Direction',
          options: [
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
          ],
        },
        gap: { kind: 'number', label: 'Gap', min: 0, max: 64, step: 1, unit: 'px' },
        padding: { kind: 'number', label: 'Padding', min: 0, max: 64, step: 1, unit: 'px' },
        alignItems: {
          kind: 'enum',
          label: 'Align items',
          options: [
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' },
            { value: 'stretch', label: 'Stretch' },
          ],
        },
        justifyContent: {
          kind: 'enum',
          label: 'Justify',
          options: [
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' },
            { value: 'space-between', label: 'Between' },
            { value: 'space-around', label: 'Around' },
          ],
        },
      },
    },
    style: {
      group: 'Style',
      props: {
        background: {
          kind: 'enum',
          label: 'Surface',
          options: [...SURFACE_SCHEMA_OPTIONS],
        },
        appearance: {
          kind: 'enum',
          label: 'Appearance',
          options: [...APPEARANCE_SCHEMA_OPTIONS],
        },
        borderRadius: { kind: 'number', label: 'Radius', min: 0, max: 32, step: 1, unit: 'px' },
        border: { kind: 'boolean', label: 'Border' },
      },
    },
  },
})
