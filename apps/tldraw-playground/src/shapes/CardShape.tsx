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

export type CardShape = TLBaseShape<
  'ui-card',
  {
    w: number
    h: number
    background: SurfaceLevel
    appearance: SurfaceAppearance
    shadow: 'none' | 'sm' | 'md' | 'lg'
    borderRadius: number
    border: boolean
    padding: number
  }
>

export const cardShapeProps: RecordProps<CardShape> = {
  w: T.number,
  h: T.number,
  background: surfaceValidator,
  appearance: appearanceValidator,
  shadow: T.literalEnum('none', 'sm', 'md', 'lg'),
  borderRadius: T.number,
  border: T.boolean,
  padding: T.number,
}

const DEFAULTS: CardShape['props'] = {
  w: 360,
  h: 240,
  background: 'default',
  appearance: 'auto',
  shadow: 'md',
  borderRadius: 12,
  border: true,
  padding: 24,
}

// One UI elevation tokens — no Tailwind.
const SHADOW: Record<CardShape['props']['shadow'], string> = {
  none: 'none',
  sm: 'var(--Elevation-1, 0 1px 3px rgba(0,0,0,0.12))',
  md: 'var(--Elevation-2, 0 2px 6px rgba(0,0,0,0.15))',
  lg: 'var(--Elevation-3, 0 8px 24px rgba(0,0,0,0.18))',
}

export class CardShapeUtil extends BaseFrameLikeShapeUtil<CardShape> {
  static override type = 'ui-card' as const
  static override props = cardShapeProps
  static override migrations = surfaceMigrations('ui-card')

  override hideRotateHandle = () => true

  override getClipPath() {
    return undefined
  }

  override getDefaultProps(): CardShape['props'] {
    return { ...DEFAULTS }
  }

  override getGeometry(shape: CardShape) {
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

  override onResize(shape: CardShape, info: TLResizeInfo<CardShape>) {
    const next = resizeBox(shape, info)
    return { ...next, meta: { ...(shape.meta ?? {}), userSized: true } }
  }

  override component(shape: CardShape) {
    const { background, shadow, borderRadius, border, w, h } = shape.props
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
            boxShadow: SHADOW[shadow],
            border: border ? '1px solid var(--Border-Default, var(--Color-Neutral-300))' : undefined,
            borderRadius,
            ...surfacePaintStyle(background, appearance),
          }}
        >
          <ContainerChrome shapeId={shape.id} label="Card" color="violet" />
        </div>
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: CardShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}

registerComponent({
  type: 'ui-card',
  label: 'Card',
  category: 'layout',
  icon: 'Square',
  initialSize: { w: 360, h: 240 },
  defaults: { ...DEFAULTS },
  schema: {
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
        shadow: {
          kind: 'enum',
          label: 'Shadow',
          options: [
            { value: 'none', label: 'None' },
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ],
        },
        borderRadius: { kind: 'number', label: 'Radius', min: 0, max: 32, step: 1, unit: 'px' },
        border: { kind: 'boolean', label: 'Border' },
        padding: { kind: 'number', label: 'Padding', min: 0, max: 64, step: 1, unit: 'px' },
      },
    },
  },
})
