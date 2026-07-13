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
  useEditor,
  useValue,
} from 'tldraw'
import { registerComponent } from '@/lib/registry'

export type SlotShape = TLBaseShape<
  'ui-slot',
  {
    w: number
    h: number
    name: string
    accepts: 'any' | 'text' | 'button' | 'input'
  }
>

export const slotShapeProps: RecordProps<SlotShape> = {
  w: T.number,
  h: T.number,
  name: T.string,
  accepts: T.literalEnum('any', 'text', 'button', 'input'),
}

const DEFAULTS: SlotShape['props'] = {
  w: 240,
  h: 60,
  name: 'children',
  accepts: 'any',
}

export class SlotShapeUtil extends BaseFrameLikeShapeUtil<SlotShape> {
  static override type = 'ui-slot' as const
  static override props = slotShapeProps

  override hideRotateHandle = () => true
  override canEdit = () => false

  override getDefaultProps(): SlotShape['props'] {
    return { ...DEFAULTS }
  }

  override getGeometry(shape: SlotShape) {
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

  override onResize(shape: SlotShape, info: TLResizeInfo<SlotShape>) {
    return resizeBox(shape, info)
  }

  override component(shape: SlotShape) {
    return <SlotShapeBody shape={shape} />
  }

  override getIndicatorPath(shape: SlotShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}

function SlotShapeBody({ shape }: { shape: SlotShape }) {
  const editor = useEditor()
  const hasChildren = useValue(
    'slot has children',
    () => editor.getSortedChildIdsForParent(shape.id).length > 0,
    [editor, shape.id],
  )

  return (
    <HTMLContainer style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'all' }}>
      {hasChildren ? (
        // When filled, the slot is invisible — children render normally
        <div className="w-full h-full" />
      ) : (
        <div
          className="flex items-center justify-center pointer-events-none select-none"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--Shape-2, 8px)',
            border: '2px dashed color-mix(in srgb, var(--Primary-Bold) 40%, transparent)',
            background: 'color-mix(in srgb, var(--Primary-Bold) 4%, transparent)',
          }}
        >
          <div className="text-center" style={{ color: 'var(--Primary-Bold)' }}>
            <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ opacity: 0.7 }}>
              Slot
            </div>
            <div className="text-sm font-medium" style={{ opacity: 0.85 }}>
              {shape.props.name}
            </div>
            {shape.props.accepts !== 'any' && (
              <div className="text-[10px] mt-0.5" style={{ opacity: 0.6 }}>
                accepts: {shape.props.accepts}
              </div>
            )}
          </div>
        </div>
      )}
    </HTMLContainer>
  )
}

registerComponent({
  type: 'ui-slot',
  label: 'Slot',
  category: 'layout',
  icon: 'SquareDashed',
  initialSize: { w: 240, h: 60 },
  defaults: { ...DEFAULTS },
  schema: {
    name: { kind: 'string', label: 'Name', placeholder: 'e.g. children, header' },
    accepts: {
      kind: 'enum',
      label: 'Accepts',
      options: [
        { value: 'any', label: 'Any' },
        { value: 'text', label: 'Text' },
        { value: 'button', label: 'Button' },
        { value: 'input', label: 'Input' },
      ],
    },
  },
})
