import { isValidElement, type ReactElement, type ReactNode } from 'react'

const SKIP_KEYS = new Set([
  'children',
  'className',
  'style',
  'ref',
  'key',
  'data-testid',
  'testID',
  'as',
  'id',
  'name',
  'value',
  'defaultValue',
  'footerEnd',
  'footerStart',
])

const SLOT_KEYS = ['start', 'end', 'start2', 'end2', 'labelSlot', 'feedback', 'dynamicTextSlot', 'infoIconSlot', 'leftIcon', 'rightIcon'] as const

const PRIORITY_KEYS = [
  'variant',
  'appearance',
  'size',
  'attention',
  'shape',
  'mode',
  'surface',
  'layout',
  'orientation',
  'contained',
  'dismissible',
  'fullWidth',
  'icon',
  'label',
  'placeholder',
  'type',
  'position',
  'side',
  'align',
  'trigger',
  'content',
  'description',
  'feedback',
  'required',
  'selected',
  'checked',
  'disabled',
  'readOnly',
  'loading',
  'error',
  'invalid',
  'open',
] as const

function isReactNode(value: unknown): value is ReactNode {
  return isValidElement(value) || (Array.isArray(value) && value.some(isValidElement))
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return JSON.stringify(value)
}

function describeElement(el: ReactElement): string {
  const type = el.type
  const typeName =
    typeof type === 'string'
      ? type
      : typeof type === 'function'
        ? (type as { displayName?: string; name?: string }).displayName || type.name || 'Element'
        : 'Element'

  const p = el.props as Record<string, unknown>
  if (typeName === 'Icon' && typeof p.icon === 'string') return `Icon(${p.icon})`
  if (typeName === 'IconContained' && typeof p.icon === 'string') return `IconContained(${p.icon})`
  if (typeName === 'IconButton' && typeof p.icon === 'string') return `IconButton(${p.icon})`
  if (typeName === 'Avatar') return 'Avatar'
  if (typeName === 'Badge' || typeName === 'CounterBadge') return typeName
  if (typeof p.icon === 'string') return `${typeName}(${p.icon})`
  if (typeof p.label === 'string') return `${typeName}(${p.label})`
  return typeName
}

/** Resolve slot prop to a readable label e.g. start → SearchIcon */
export function describeSlot(value: unknown): string | undefined {
  if (value == null || value === false) return undefined
  if (typeof value === 'string') return value
  if (isValidElement(value)) return describeElement(value)
  if (Array.isArray(value)) {
    const parts = value.filter(isValidElement).map(describeElement)
    return parts.length ? parts.join(', ') : 'Slot'
  }
  return 'Slot'
}

function slotKeyLabel(key: string): string {
  if (key === 'start') return 'startSlot'
  if (key === 'end') return 'endSlot'
  if (key === 'start2') return 'start2Slot'
  if (key === 'end2') return 'end2Slot'
  return key
}

/** Pick props suitable for QA inspector (no handlers, enriched slots/state). */
export function pickDisplayProps(
  props: Record<string, unknown>,
  componentName: string,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(props)) {
    if (SKIP_KEYS.has(key)) continue
    if (key.startsWith('on') && typeof value === 'function') continue
    if (value === undefined) continue

    if (SLOT_KEYS.includes(key as (typeof SLOT_KEYS)[number])) {
      const slotLabel = describeSlot(value)
      if (slotLabel) out[slotKeyLabel(key)] = slotLabel
      continue
    }

    if (isReactNode(value)) continue

    out[key] = value
  }

  if (componentName === 'InputField') {
    out.size = out.size ?? 'M'
    out.appearance = out.appearance ?? props.attention ?? 'medium'
    out.description = Boolean(props.description)
    out.feedback = Boolean(props.error || props.feedback || props.invalid)
    out.error = Boolean(props.invalid || props.error)
    out.required = Boolean(props.required)
    out.disabled = Boolean(props.disabled)
    out.readOnly = Boolean(props.readOnly)
  }

  if (componentName === 'CheckboxField' || componentName === 'RadioField') {
    out.size = out.size ?? 'M'
    out.checked = props.checked ?? props.defaultChecked
    out.description = Boolean(props.description)
    out.required = Boolean(props.required)
    out.disabled = Boolean(props.disabled)
    out.readOnly = Boolean(props.readOnly)
  }

  if (componentName === 'Radio' || componentName === 'RadioGroup') {
    out.size = out.size ?? 'M'
    out.description = Boolean(props.description)
    out.required = Boolean(props.required)
    out.disabled = Boolean(props.disabled)
  }

  if (componentName === 'Button') {
    out.variant = props.appearance ?? props.variant ?? 'auto'
    out.size = out.size ?? 'M'
    out.appearance = props.attention ?? out.appearance
    out.disabled = Boolean(props.disabled)
    out.loading = Boolean(props.loading)
    out.contained = props.contained ?? true
  }

  if (componentName === 'Chip' || componentName === 'ChipGroup') {
    out.selected = props.selected ?? props.defaultSelected ?? false
    out.disabled = Boolean(props.disabled)
  }

  if (componentName === 'Switch') {
    out.checked = props.checked ?? props.defaultChecked ?? false
    out.disabled = Boolean(props.disabled)
    out.readOnly = Boolean(props.readOnly)
  }

  if (
    componentName === 'SelectableButton' ||
    componentName === 'SelectableIconButton' ||
    componentName === 'SelectableSingleTextButton'
  ) {
    out.selected = props.selected ?? props.defaultSelected ?? false
    out.disabled = Boolean(props.disabled)
  }

  if (componentName === 'Surface') {
    out.variant = props.mode ?? props.variant
    out.appearance = props.appearance ?? 'primary'
  }

  if (componentName === 'Container') {
    out.surface = props.surface
    out.layout = props.layout
  }

  if (componentName === 'Text') {
    out.variant = props.variant
    out.size = props.size ?? 'M'
    out.attention = props.attention
    out.weight = props.weight
  }

  if (componentName === 'Icon' || componentName === 'IconButton' || componentName === 'IconContained') {
    out.icon = props.icon
    out.size = props.size
    out.attention = props.attention
    out.disabled = Boolean(props.disabled)
  }

  if (componentName === 'Tooltip') {
    out.side = props.side ?? props.position
    out.trigger = props.trigger ?? 'hover'
  }

  return orderInspectorProps(out)
}

function orderInspectorProps(props: Record<string, unknown>): Record<string, unknown> {
  const ordered: Record<string, unknown> = {}
  const seen = new Set<string>()

  for (const key of PRIORITY_KEYS) {
    if (key in props) {
      ordered[key] = props[key]
      seen.add(key)
    }
  }

  for (const [key, value] of Object.entries(props)) {
    if (!seen.has(key)) ordered[key] = value
  }

  return ordered
}

export function formatInspectorRows(props: Record<string, unknown>): Array<{ key: string; value: string }> {
  return Object.entries(props).map(([key, value]) => ({
    key,
    value: formatValue(value),
  }))
}

/** @deprecated Pipe-separated single line — use formatInspectorRows instead */
export function formatComponentInfoLine(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(' | ')
}

/** Block-level components that should fill available width in the inspector wrapper. */
export function isBlockComponent(name: string, props: Record<string, unknown>): boolean {
  if (props.fullWidth === true) return true
  return [
    'Container',
    'Surface',
    'InputField',
    'Modal',
    'TabGroup',
    'TabPanel',
    'RadioGroup',
    'ChipGroup',
    'BottomNavigation',
    'Pagination',
    'Slider',
    'CheckboxField',
  ].includes(name)
}
