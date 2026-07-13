/**
 * One UI component manifest adapter.
 *
 * Reads the monorepo's existing COMPONENT_REGISTRY (@oneui/ui) + ComponentMeta
 * (@oneui/shared) and, for an allowlisted set of components, generates:
 *   - one tldraw BaseBoxShapeUtil subclass per component (distinct type
 *     `oneui-<slug>`), whose body renders the REAL @oneui/ui component, and
 *   - a ComponentRegistration (label/category/icon/schema/defaults) fed into the
 *     existing registry so LibraryPanel + Inspector work unchanged.
 *
 * This is the bridge that turns canvas shapes into real One UI components.
 */
import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  resizeBox,
  useEditor,
  type RecordProps,
  type TLBaseShape,
  type TLResizeInfo,
  type TLShapeUtilConstructor,
} from 'tldraw'
import { useLayoutEffect, useRef, type ComponentType } from 'react'
import { useValue } from '@tldraw/state-react'
import type {
  ComponentCategory,
  ComponentMeta,
  PropDescriptor,
} from '@oneui/shared'
import { COMPONENT_REGISTRY } from '@oneui/ui/registry/componentRegistry'
import { clearRegistry, registerComponent } from '@/lib/registry'
import { getPreviewState } from '@/lib/previewState'
import {
  computeEffectiveSurface,
  computeSurfaceStep,
  computeEffectiveAppearance,
} from '@/lib/surface'
import type { PropDef, PropSchema } from '@/lib/propSchema'

export const ONEUI_PREFIX = 'oneui-'

/** Legacy layout-frame containers kept in the Library (and re-themed to One UI
 *  tokens in Phase 4) — they provide nesting + auto-layout that the leaf
 *  components compose into. */
const LEGACY_CONTAINERS = new Set(['ui-page', 'ui-stack', 'ui-form', 'ui-list', 'ui-card', 'ui-slot'])

/** Leaf components that render cleanly standalone (text/children or simple
 *  defaults). Keyed by COMPONENT_REGISTRY PascalCase name. Components needing
 *  icons, options, or structural children (IconButton, Select, Tabs, FAB, …)
 *  are added with slot support in a later pass. Containers are registered
 *  separately (see oneuiContainers). */
const ALLOWLIST = new Set([
  // actions
  'Button',
  'SingleTextButton',
  'SelectableButton',
  // inputs
  'Checkbox',
  'Switch',
  'InputField',
  'Slider',
  // display
  'Text',
  'Avatar',
  'Chip',
  'Badge',
  'CounterBadge',
  'IndicatorBadge',
  'Divider',
  'ListItem',
  // feedback
  'Spinner',
])

/** ReactNode props that carry TEXT (surfaced as string editors), vs component
 *  slots (start/end/icon — hidden for now). */
const TEXT_SLOT_NAMES = new Set([
  'children',
  'title',
  'label',
  'supportText',
  'text',
  'description',
  'heading',
  'subtitle',
  'placeholder',
])
/** Priority order for picking a component's PRIMARY text prop (gets a default). */
const PRIMARY_TEXT_ORDER = ['children', 'title', 'label', 'text', 'heading']

/** Components that are inherently full-width (CSS width:100%): they must fill
 *  their box, not auto-hug to max-content (which collapses them — e.g. Slider
 *  shows only its thumb). Treated like fullWidth=true. */
const FILL_WIDTH_SLUGS = new Set(['slider', 'touch-slider', 'input-field', 'list-item', 'divider', 'progress'])

/** Props we never surface (handlers, refs, escape hatches, a11y plumbing). */
const SKIP_PROPS = new Set([
  'aria-label',
  'aria-labelledby',
  'data-testid',
  'className',
  'style',
  'id',
  'key',
  'ref',
  'decoration',
  'type', // HTML type attr — noise in the inspector
])

interface ManagedProp {
  name: string
  def: PropDef
  isChildren: boolean
  /** For enums: map the editor's string value back to its original typed value. */
  enumMap?: Record<string, string | number | boolean>
}

export interface OneUiManifestEntry {
  /** tldraw shape type, e.g. `oneui-button` */
  type: string
  /** ComponentMeta slug, e.g. `button` */
  slug: string
  /** PascalCase name for JSX emit + import, e.g. `Button` */
  componentName: string
  /** Library display label */
  label: string
  category: 'layout' | 'primitive' | 'form' | 'display'
  icon: string
  initialSize: { w: number; h: number }
  defaults: Record<string, unknown>
  component: ComponentType<any>
  managed: ManagedProp[]
  hasStates: boolean
}

// ─── helpers ────────────────────────────────────────────────────────────────

function title(s: string): string {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function mapCategory(c: ComponentCategory): OneUiManifestEntry['category'] {
  switch (c) {
    case 'layout':
      return 'layout'
    case 'inputs':
      return 'form'
    case 'actions':
      return 'primitive'
    default:
      return 'display' // display | feedback | navigation | overlays
  }
}

const ICON_BY_SLUG: Record<string, string> = {
  button: 'MousePointerClick',
  'single-text-button': 'Type',
  'selectable-button': 'SquareCheck',
  text: 'Type',
  checkbox: 'CheckSquare',
  switch: 'ToggleLeft',
  'input-field': 'TextCursorInput',
  slider: 'SlidersHorizontal',
  avatar: 'CircleUser',
  chip: 'Tag',
  badge: 'Badge',
  'counter-badge': 'Hash',
  'indicator-badge': 'Dot',
  divider: 'Minus',
  'list-item': 'List',
  spinner: 'Loader',
}
const ICON_BY_CATEGORY: Record<OneUiManifestEntry['category'], string> = {
  layout: 'LayoutGrid',
  primitive: 'Square',
  form: 'TextCursorInput',
  display: 'Shapes',
}

const SIZE_BY_SLUG: Record<string, { w: number; h: number }> = {
  button: { w: 120, h: 40 },
  'single-text-button': { w: 120, h: 40 },
  'selectable-button': { w: 120, h: 40 },
  text: { w: 220, h: 28 },
  checkbox: { w: 180, h: 24 },
  switch: { w: 64, h: 28 },
  'input-field': { w: 240, h: 72 },
  slider: { w: 220, h: 32 },
  avatar: { w: 40, h: 40 },
  chip: { w: 96, h: 32 },
  badge: { w: 64, h: 24 },
  'counter-badge': { w: 40, h: 24 },
  'indicator-badge': { w: 16, h: 16 },
  divider: { w: 220, h: 2 },
  'list-item': { w: 280, h: 56 },
  spinner: { w: 32, h: 32 },
}
const SIZE_BY_CATEGORY: Record<OneUiManifestEntry['category'], { w: number; h: number }> = {
  layout: { w: 320, h: 200 },
  primitive: { w: 120, h: 40 },
  form: { w: 200, h: 40 },
  display: { w: 160, h: 40 },
}

/** Allowed enum values for the editor — handles size-by-variant (Text). */
function enumOptionsFor(p: PropDescriptor): (string | number | boolean)[] {
  if (p.options && p.options.length) return [...p.options]
  if (p.optionsByDiscriminator) {
    const all = new Set<string | number | boolean>()
    for (const arr of Object.values(p.optionsByDiscriminator.options)) {
      for (const v of arr) all.add(v)
    }
    return [...all]
  }
  return []
}

function buildManaged(p: PropDescriptor): { managed: ManagedProp; def: unknown } | null {
  if (p.deprecated) return null
  if (SKIP_PROPS.has(p.name)) return null
  if (p.type === 'function' || p.type === 'object') return null

  const isTextSlot = TEXT_SLOT_NAMES.has(p.name)
  // Component slots (start/end/icon ReactNode) are hidden for now; text-bearing
  // ReactNode props (title/label/supportText/…) are surfaced as text editors.
  if (p.type === 'ReactNode' && !isTextSlot) return null

  if (isTextSlot) {
    const textLabel = p.name === 'children' ? 'Text' : title(p.name)
    return {
      managed: { name: p.name, def: { kind: 'string', label: textLabel }, isChildren: p.name === 'children' },
      def: p.defaultValue != null ? String(p.defaultValue) : '',
    }
  }

  const label = title(p.name)
  switch (p.type) {
    case 'string':
      return {
        managed: { name: p.name, def: { kind: 'string', label }, isChildren: false },
        def: p.defaultValue != null ? String(p.defaultValue) : '',
      }
    case 'number':
      return {
        managed: { name: p.name, def: { kind: 'number', label }, isChildren: false },
        def: typeof p.defaultValue === 'number' ? p.defaultValue : 0,
      }
    case 'boolean':
      return {
        managed: { name: p.name, def: { kind: 'boolean', label }, isChildren: false },
        def: typeof p.defaultValue === 'boolean' ? p.defaultValue : false,
      }
    case 'enum': {
      const raw = enumOptionsFor(p)
      if (!raw.length) return null
      // Prefer t-shirt/string options; drop numeric duplicates (e.g. size
      // xs/s/m/l vs 6/8/10/12) — the design system only surfaces t-shirt sizes.
      const strings = raw.filter((v) => typeof v === 'string')
      const numbers = raw.filter((v) => typeof v === 'number')
      const useStringsOnly = strings.length > 0 && numbers.length > 0
      const opts = useStringsOnly ? strings : raw
      const enumMap: Record<string, string | number | boolean> = {}
      const options = opts.map((v) => {
        enumMap[String(v)] = v
        return { value: String(v), label: title(String(v)) }
      })
      const def: PropDef = { kind: 'enum', label, options }
      // Map a numeric default to its parallel t-shirt value by position
      // (xs↔6, s↔8, m↔10, l↔12) when the numeric options were dropped.
      let dv: string | number | boolean | null | undefined = p.defaultValue
      if (useStringsOnly && typeof dv === 'number') {
        const idx = numbers.indexOf(dv)
        dv = idx >= 0 && idx < strings.length ? strings[idx] : strings[Math.min(2, strings.length - 1)]
      }
      const dflt =
        dv != null && enumMap[String(dv)] !== undefined ? String(dv) : String(opts[0])
      return { managed: { name: p.name, def, isChildren: false, enumMap }, def: dflt }
    }
    default:
      return null
  }
}

function buildEntry(componentName: string, meta: ComponentMeta, component: ComponentType<any>): OneUiManifestEntry {
  const managed: ManagedProp[] = []
  const defaults: Record<string, unknown> = {}
  let hasStates = false

  // When a component exposes both `variant` and an `attention` alias of it
  // (e.g. Button: attention high/medium/low → variant bold/subtle/ghost), the
  // design system surfaces `attention`, not the internal `variant`. Hide variant.
  const hideVariant = meta.props.some(
    (p) => p.name === 'attention' && /maps to variant/i.test(p.description ?? ''),
  )

  for (const p of meta.props) {
    if (p.name === 'disabled' || p.name === 'loading' || p.name === 'checked') hasStates = true
    if (hideVariant && p.name === 'variant') continue
    const built = buildManaged(p)
    if (!built) continue
    managed.push(built.managed)
    defaults[built.managed.name] = built.def
  }

  // Default `appearance` to 'auto' so a component INHERITS the role of the surface
  // behind it (One UI's context-aware default — a CTA on a primary card becomes
  // primary). A concrete role can still be pinned per shape. OneUiShapeBody
  // resolves 'auto' to the effective surface role at render (see computeEffectiveAppearance).
  const appearanceManaged = managed.find((m) => m.name === 'appearance')
  if (
    appearanceManaged?.def.kind === 'enum' &&
    appearanceManaged.def.options.some((o) => o.value === 'auto')
  ) {
    defaults.appearance = 'auto'
  }

  // Avatar: the meta default is `content: 'image'`, but the playground has no
  // image URLs, so it renders an empty/person-icon circle. Default to text
  // initials (derived from `alt`) so it works out of the box; `alt` becomes the
  // primary editable text (a name → initials), and image/icon stay selectable
  // via `content` + `src`.
  if (meta.slug === 'avatar') {
    if ('content' in defaults) defaults.content = 'text'
    if (!defaults.alt) defaults.alt = meta.displayName
  }

  // Ensure a text prop exists. Many One UI components render text children that
  // meta.props doesn't enumerate (Text, Chip, …) → synthesize `children` (also
  // keeps the strict shape-props validator from rejecting a stored value).
  // Components with their own text slot (ListItem.title, …) use that instead.
  const textProps = managed.filter((m) => TEXT_SLOT_NAMES.has(m.name))
  if (textProps.length === 0) {
    const childrenProp: ManagedProp = { name: 'children', def: { kind: 'string', label: 'Text' }, isChildren: true }
    managed.unshift(childrenProp)
    textProps.push(childrenProp)
  }
  // Give the primary text prop a sensible default (the component's name).
  const primary =
    PRIMARY_TEXT_ORDER.map((n) => textProps.find((m) => m.name === n)).find(Boolean) ?? textProps[0]
  if (primary && (defaults[primary.name] == null || defaults[primary.name] === '')) {
    defaults[primary.name] = meta.displayName
  }

  const category = mapCategory(meta.category)
  return {
    type: ONEUI_PREFIX + meta.slug,
    slug: meta.slug,
    componentName,
    label: meta.displayName,
    category,
    icon: ICON_BY_SLUG[meta.slug] ?? ICON_BY_CATEGORY[category],
    initialSize: SIZE_BY_SLUG[meta.slug] ?? SIZE_BY_CATEGORY[category],
    defaults,
    component,
    managed,
    hasStates,
  }
}

// ─── build the manifest once ─────────────────────────────────────────────────

const MANIFEST: OneUiManifestEntry[] = (() => {
  const out: OneUiManifestEntry[] = []
  for (const [name, entry] of Object.entries(COMPONENT_REGISTRY)) {
    if (!ALLOWLIST.has(name)) continue
    if (!entry.meta || !entry.component) continue
    out.push(buildEntry(name, entry.meta, entry.component))
  }
  return out
})()

const BY_TYPE = new Map(MANIFEST.map((e) => [e.type, e]))

export function getOneUiEntry(type: string): OneUiManifestEntry | undefined {
  return BY_TYPE.get(type)
}

/** Convert stored (string-ish) props back into real One UI component props. */
function coerceProps(entry: OneUiManifestEntry, stored: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const m of entry.managed) {
    let v = stored[m.name]
    if (m.isChildren) {
      out.children = v == null ? '' : String(v)
      continue
    }
    if (v === undefined || v === null) continue
    if (m.def.kind === 'boolean') {
      out[m.name] = Boolean(v)
      continue
    }
    if (m.enumMap) {
      v = m.enumMap[String(v)] ?? v
    }
    if (v === '') continue // empty optional → let the component default
    out[m.name] = v
  }
  return out
}

// ─── shape body ──────────────────────────────────────────────────────────────

// Preview state → One UI's forced-state attribute (CSS targets an ancestor
// `[data-force-state='hover'|'pressed']`). Focus has no force-state hook.
const FORCE_STATE: Record<string, string | undefined> = {
  hover: 'hover',
  active: 'pressed',
  focus: 'focus',
  default: undefined,
}

function OneUiShapeBody({ entry, shape }: { entry: OneUiManifestEntry; shape: TLBaseShape<string, any> }) {
  const editor = useEditor()
  const Comp = entry.component
  const props = coerceProps(entry, shape.props)
  const ref = useRef<HTMLDivElement>(null)
  const userSized = Boolean((shape.meta as { userSized?: boolean })?.userSized)
  // fullWidth components — and components that are inherently width:100% (Slider,
  // InputField, ListItem, Divider) — must fill their box; auto-hugging width to
  // max-content would collapse them (e.g. Slider → just its thumb). Only hug
  // height in that case.
  const fillWidth = props.fullWidth === true || FILL_WIDTH_SLUGS.has(entry.slug)
  const hugW = !userSized && !fillWidth
  const hugH = !userSized
  const preview = useValue('preview-state', () => getPreviewState(shape.id), [shape.id])
  const forceState = FORCE_STATE[preview]

  // Surface context awareness: a leaf shape isn't DOM-nested in its container,
  // so it can't inherit the container's [data-surface] via the CSS cascade.
  // Compute the surface it visually sits on (walk the parent chain) and stamp it
  // on this shape's own root — the DS's global [data-surface] rules then remap
  // its text/icons/strokes for legible contrast (e.g. white text on a bold card).
  const surfaceContext = useValue(
    'surface-context',
    () => computeEffectiveSurface(editor, shape.id),
    [editor, shape.id],
  )
  // The numeric step drives the DS role/content token remap (--Neutral-High,
  // --Text-High, …); the mode drives component-specific rules (input borders).
  const surfaceStep = useValue(
    'surface-step',
    () => computeSurfaceStep(editor, shape.id),
    [editor, shape.id],
  )
  const surfaceAppearance = useValue(
    'surface-appearance',
    () => computeEffectiveAppearance(editor, shape.id),
    [editor, shape.id],
  )

  // Auto-hug: shrink the shape's geometry to the component's REAL rendered size
  // so the tldraw selection box matches the component exactly (no phantom
  // spacing). One UI components render at their own intrinsic size, not the box.
  useLayoutEffect(() => {
    if (!hugW && !hugH && !fillWidth) return
    const el = ref.current
    if (!el) return
    const sync = () => {
      const cur = editor.getShape(shape.id)
      if (!cur || (cur.meta as { userSized?: boolean })?.userSized) return
      const zoom = editor.getZoomLevel() || 1
      const rect = el.getBoundingClientRect()
      const mh = rect.height / zoom
      if (mh < 1) return
      const cw = (cur.props as { w: number }).w
      const ch = (cur.props as { h: number }).h
      let nextW = cw
      const nextH = hugH ? mh : ch
      if (fillWidth) {
        // fullWidth → stretch to the parent container's inner content width.
        const parent = editor.getShape((cur as { parentId: string }).parentId as never)
        const pp = parent?.props as { w?: number; padding?: number } | undefined
        if (pp && typeof pp.w === 'number') {
          const pad = typeof pp.padding === 'number' ? pp.padding : 0
          nextW = Math.max(1, pp.w - 2 * pad)
        }
      } else if (hugW) {
        const mw = rect.width / zoom
        if (mw < 1) return
        nextW = mw
      }
      if (Math.abs(cw - nextW) > 1 || Math.abs(ch - nextH) > 1) {
        // history: 'ignore' — auto-sizing is derived layout, not a user edit, so
        // it must not create undo steps or churn the persisted snapshot.
        editor.run(
          () => editor.updateShape({ id: shape.id, type: shape.type, props: { w: nextW, h: nextH } }),
          { history: 'ignore' },
        )
      }
    }
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
    return () => ro.disconnect()
  }, [editor, shape.id, shape.type, hugW, hugH, fillWidth])

  // Resolve a component's `auto` appearance to the role of the surface behind it.
  // One UI normally inherits this via the <Surface> React context, which isn't
  // present in tldraw — so we substitute the computed effective role explicitly
  // (e.g. a CTA button with appearance 'auto' on a primary card renders primary).
  const compProps =
    (props as { appearance?: unknown }).appearance === 'auto'
      ? { ...props, appearance: surfaceAppearance }
      : props

  return (
    <HTMLContainer style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'none', overflow: 'visible' }}>
      <div
        ref={ref}
        className="oneui-shape-root"
        data-force-state={forceState}
        data-surface={surfaceContext}
        data-surface-step={surfaceStep}
        data-appearance={surfaceAppearance}
        style={{
          width: hugW ? 'max-content' : '100%',
          height: hugH ? 'max-content' : '100%',
          userSelect: 'none',
        }}
      >
        <Comp {...compProps} />
      </div>
    </HTMLContainer>
  )
}

// ─── generated shape utils ───────────────────────────────────────────────────

// Permissive per-prop validator — props are free-form (manifest-driven) but
// must be JSON-serializable (they're persisted). geometry props stay numeric.
const anyVal: any = (T as any).any ?? (T as any).jsonValue ?? (T as any).unknown

function makeShapeUtil(entry: OneUiManifestEntry): TLShapeUtilConstructor<any> {
  const propsValidator: RecordProps<any> = { w: T.number, h: T.number }
  for (const m of entry.managed) propsValidator[m.name] = anyVal

  const defaultProps = { w: entry.initialSize.w, h: entry.initialSize.h, ...entry.defaults }

  class OneUiShapeUtil extends BaseBoxShapeUtil<TLBaseShape<string, any>> {
    static override type = entry.type
    static override props = propsValidator

    override canResize = () => true
    override hideRotateHandle = () => true

    override getDefaultProps() {
      return { ...defaultProps }
    }

    override getGeometry(shape: TLBaseShape<string, any>) {
      return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
    }

    override onResize(shape: TLBaseShape<string, any>, info: TLResizeInfo<any>) {
      const next = resizeBox(shape as any, info as any)
      return { ...next, meta: { ...(shape.meta ?? {}), userSized: true } }
    }

    override component(shape: TLBaseShape<string, any>) {
      return <OneUiShapeBody entry={entry} shape={shape} />
    }

    override getIndicatorPath(shape: TLBaseShape<string, any>) {
      const path = new Path2D()
      path.rect(0, 0, shape.props.w, shape.props.h)
      return path
    }
  }
  return OneUiShapeUtil as unknown as TLShapeUtilConstructor<any>
}

/** Generated shape utils — spread into the store's shapeUtils (see shapes/index.ts). */
export const oneUiShapeUtils: TLShapeUtilConstructor<any>[] = MANIFEST.map(makeShapeUtil)

/** Clear legacy `ui-*` library tiles and register the One UI manifest. Call once
 *  at app init, AFTER the legacy shape modules have self-registered. */
export function registerOneUiComponents() {
  // Drop legacy leaf tiles but keep the layout-frame containers.
  clearRegistry(LEGACY_CONTAINERS)
  for (const entry of MANIFEST) {
    const schema: PropSchema = {}
    for (const m of entry.managed) schema[m.name] = m.def
    registerComponent({
      type: entry.type,
      label: entry.label,
      category: entry.category,
      icon: entry.icon,
      initialSize: entry.initialSize,
      hasStates: entry.hasStates,
      defaults: entry.defaults,
      schema,
    })
  }
}
