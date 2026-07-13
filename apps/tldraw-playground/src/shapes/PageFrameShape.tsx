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
import { useValue } from '@tldraw/state-react'
import { previewModeAtom } from '@/lib/previewMode'
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

export type PageFrameShape = TLBaseShape<
  'ui-page',
  {
    w: number
    h: number
    name: string
    breakpoint: 'mobile' | 'desktop'
    background: SurfaceLevel
    appearance: SurfaceAppearance
  }
>

export const pageFrameShapeProps: RecordProps<PageFrameShape> = {
  w: T.number,
  h: T.number,
  name: T.string,
  breakpoint: T.literalEnum('mobile', 'desktop'),
  background: surfaceValidator,
  appearance: appearanceValidator,
}

const PAGE_DEFAULTS: PageFrameShape['props'] = {
  w: 1024,
  h: 720,
  name: 'Untitled Page',
  breakpoint: 'desktop',
  background: 'default',
  appearance: 'auto',
}

export class PageFrameShapeUtil extends BaseFrameLikeShapeUtil<PageFrameShape> {
  static override type = 'ui-page' as const
  static override props = pageFrameShapeProps
  static override migrations = surfaceMigrations('ui-page')

  override hideRotateHandle = () => true

  // Don't clip children. If content overflows the page's bounds, the user
  // should see it (and fix the layout or resize the page) — not have it
  // mysteriously disappear at the edge.
  override getClipPath() {
    return undefined
  }

  override getDefaultProps(): PageFrameShape['props'] {
    return { ...PAGE_DEFAULTS }
  }

  override getGeometry(shape: PageFrameShape) {
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

  override onResize(shape: PageFrameShape, info: TLResizeInfo<PageFrameShape>) {
    return resizeBox(shape, info)
  }

  override component(shape: PageFrameShape) {
    const previewMode = useValue('preview-mode', () => previewModeAtom.get(), [])
    const step = useShapeSurfaceStep(shape.id)
    const appearance = useShapeSurfaceAppearance(shape.id)
    return (
      <HTMLContainer
        style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'all' }}
      >
        {/* Header strip — page name + breakpoint chip. Editor chrome only;
            hidden in preview mode so the canvas reads as the finished UI. */}
        {!previewMode && (
          <div
            className="absolute left-0 -top-7 flex items-center gap-2 text-xs font-medium pointer-events-none select-none"
            style={{ color: 'var(--Text-Medium, var(--Text-High))' }}
          >
            <span
              className="px-2 py-0.5 rounded"
              style={{
                background: 'var(--Surface-Default)',
                border: '1px solid var(--Border-Default, var(--Color-Neutral-300))',
              }}
            >
              {shape.props.name}
            </span>
            <span style={{ color: 'var(--Text-Low, var(--Text-Medium))' }}>
              {shape.props.breakpoint === 'mobile' ? '375px' : `${shape.props.w}px`}
            </span>
          </div>
        )}
        <div
          data-surface={shape.props.background}
          data-surface-step={step}
          data-appearance={appearance}
          style={{
            width: '100%',
            height: '100%',
            border: previewMode ? undefined : '1px solid var(--Border-Default, var(--Color-Neutral-300))',
            boxShadow: previewMode ? undefined : 'var(--Elevation-1, 0 1px 3px rgba(0,0,0,0.12))',
            ...surfacePaintStyle(shape.props.background, appearance),
          }}
        />
      </HTMLContainer>
    )
  }

  override getIndicatorPath(shape: PageFrameShape) {
    const path = new Path2D()
    path.rect(0, 0, shape.props.w, shape.props.h)
    return path
  }
}

registerComponent({
  type: 'ui-page',
  label: 'Page',
  category: 'layout',
  icon: 'AppWindow',
  initialSize: { w: 1024, h: 720 },
  defaults: { ...PAGE_DEFAULTS },
  schema: {
    info: {
      group: 'Page',
      props: {
        name: { kind: 'string', label: 'Name', placeholder: 'Page name' },
        breakpoint: {
          kind: 'enum',
          label: 'Breakpoint',
          options: [
            { value: 'desktop', label: 'Desktop' },
            { value: 'mobile', label: 'Mobile' },
          ],
        },
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
      },
    },
  },
})
