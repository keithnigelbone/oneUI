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

export type FormContainerShape = TLBaseShape<
  'ui-form',
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
    /** Form-specific: action URL + method get baked into the emitted <form>. */
    action: string
    method: 'GET' | 'POST'
  }
>

export const formContainerShapeProps: RecordProps<FormContainerShape> = {
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
  action: T.string,
  method: T.literalEnum('GET', 'POST'),
}

const DEFAULTS: FormContainerShape['props'] = {
  w: 320,
  h: 280,
  direction: 'vertical',
  gap: 12,
  padding: 20,
  alignItems: 'stretch',
  justifyContent: 'start',
  background: 'default',
  appearance: 'auto',
  borderRadius: 8,
  // Default off — ContainerChrome handles visibility in edit mode; a hard
  // border here would clutter the rendered <form>.
  border: false,
  action: '',
  method: 'POST',
}

export class FormContainerShapeUtil extends BaseFrameLikeShapeUtil<FormContainerShape> {
  static override type = 'ui-form' as const
  static override props = formContainerShapeProps
  static override migrations = surfaceMigrations('ui-form')

  override canEdit = () => false
  override hideRotateHandle = () => true

  override getClipPath() {
    return undefined
  }

  override getDefaultProps(): FormContainerShape['props'] {
    return { ...DEFAULTS }
  }

  override getGeometry(shape: FormContainerShape) {
    return new Group2d({
      children: [
        new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true }),
      ],
    })
  }

  override onResize(shape: FormContainerShape, info: TLResizeInfo<FormContainerShape>) {
    const next = resizeBox(shape, info)
    return { ...next, meta: { ...(shape.meta ?? {}), userSized: true } }
  }

  override component(shape: FormContainerShape) {
    const { background, borderRadius, w, h } = shape.props
    const step = useShapeSurfaceStep(shape.id)
    const appearance = useShapeSurfaceAppearance(shape.id)
    return (
      <HTMLContainer style={{ width: w, height: h, pointerEvents: 'all' }}>
        <div
          className="group"
          data-surface={background}
          data-surface-step={step}
          data-appearance={appearance}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius,
            transition: 'background-color 120ms',
            ...surfacePaintStyle(background, appearance),
          }}
        >
          <ContainerChrome shapeId={shape.id} label="Form" color="blue" />
        </div>
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: FormContainerShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}

registerComponent({
  type: 'ui-form',
  label: 'Form',
  category: 'layout',
  icon: 'FormInput',
  initialSize: { w: 320, h: 280 },
  defaults: { ...DEFAULTS },
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
      },
    },
    form: {
      group: 'Form',
      props: {
        action: { kind: 'string', label: 'Action URL', placeholder: '/api/submit' },
        method: {
          kind: 'enum',
          label: 'Method',
          options: [
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
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
