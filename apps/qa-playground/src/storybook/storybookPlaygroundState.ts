import type { ComponentMeta, PropDescriptor } from '@oneui/shared';
import { getCatalogThumbnailPreviewProps } from '@/lib/qa/catalog';
import { getCatalogThumbDefaults } from '@/lib/qa/catalogThumbDefaults';
import { applyMetaDefaultProps } from '@/lib/qa/scenarioProps';

/** Curated reset defaults for the storybook playground — sensible mid-size, default emphasis. */
const STORYBOOK_RESET_DEFAULTS: Partial<Record<string, Record<string, unknown>>> = {
  button: {
    children: 'Button',
    attention: 'high',
    size: 10,
    appearance: 'auto',
  },
  'icon-button': {
    icon: 'heart',
    attention: 'high',
    size: 10,
    appearance: 'primary',
    'aria-label': 'Icon button',
  },
  checkbox: {
    label: 'Label',
    checked: false,
    size: 'm',
    appearance: 'primary',
  },
  switch: {
    children: 'Label',
    checked: false,
    size: 'm',
    appearance: 'primary',
  },
  radio: {
    label: 'Label',
    value: 'preview-option',
    checked: true,
    size: 'm',
    appearance: 'primary',
  },
  chip: {
    children: 'Chip',
    attention: 'medium',
    size: 'm',
    appearance: 'secondary',
    'aria-label': 'Chip',
  },
};

const SKIP_PLAYGROUND_PROPS = new Set([
  'value',
  'defaultValue',
  'onValueChange',
  'onChange',
  'onCheckedChange',
  'onSelectedChange',
  'children',
  'name',
  'id',
  'className',
  'style',
  'ref',
  'asChild',
  'slot',
  'slots',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'testId',
  'data-testid',
]);

const PROP_ORDER = [
  'size',
  'attention',
  'appearance',
  'shape',
  'type',
  'variant',
  'trackEmphasis',
  'equalWidth',
  'orientation',
  'labelType',
  'knobStyle',
  'progressStyle',
  'showTooltip',
  'contained',
  'selected',
  'checked',
  'disabled',
  'readOnly',
  'loading',
  'error',
  'success',
  'fullWidth',
];

export function isStorybookPlaygroundProp(prop: PropDescriptor): boolean {
  if (SKIP_PLAYGROUND_PROPS.has(prop.name)) return false;
  if (prop.type === 'function' || prop.type === 'ReactNode' || prop.type === 'object') {
    return false;
  }
  return true;
}

export function sortStorybookProps(props: PropDescriptor[]): PropDescriptor[] {
  return [...props].sort((a, b) => {
    const ai = PROP_ORDER.indexOf(a.name);
    const bi = PROP_ORDER.indexOf(b.name);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    return a.name.localeCompare(b.name);
  });
}

export function getStorybookPlaygroundProps(meta: ComponentMeta): PropDescriptor[] {
  return sortStorybookProps(meta.props.filter(isStorybookPlaygroundProp));
}

const metaPropNames = (meta: ComponentMeta) => new Set(meta.props.map((p) => p.name));

/** Drop props from other components (e.g. after sidebar navigation without remount). */
export function sanitizeStorybookPlaygroundProps(
  meta: ComponentMeta,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = metaPropNames(meta);
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (allowed.has(key) && value !== undefined) {
      next[key] = value;
    }
  }
  return next;
}

function ensureStorybookRenderableProps(
  meta: ComponentMeta,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...props };
  const childrenProp = meta.props.find((p) => p.name === 'children');
  if (childrenProp && (next.children === undefined || next.children === null)) {
    const resetChild = STORYBOOK_RESET_DEFAULTS[meta.slug]?.children;
    if (resetChild != null) {
      next.children = resetChild;
    } else if (childrenProp.required) {
      next.children = meta.displayName;
    }
  }
  return applyMetaDefaultProps(meta, next);
}

export function getStorybookResetProps(meta: ComponentMeta): Record<string, unknown> {
  const catalogThumb = getCatalogThumbDefaults(meta);
  const slugDefaults = STORYBOOK_RESET_DEFAULTS[meta.slug];
  const base = slugDefaults
    ? { ...slugDefaults }
    : catalogThumb
      ? { ...catalogThumb }
      : { ...getCatalogThumbnailPreviewProps(meta) };

  const playground = getStorybookPlaygroundProps(meta);
  for (const prop of playground) {
    if (base[prop.name] === undefined && prop.defaultValue !== undefined) {
      base[prop.name] = prop.defaultValue;
    }
  }

  return ensureStorybookRenderableProps(meta, sanitizeStorybookPlaygroundProps(meta, base));
}

export function buildInitialStorybookProps(meta: ComponentMeta): Record<string, unknown> {
  return getStorybookResetProps(meta);
}

export function resetStorybookProps(meta: ComponentMeta): Record<string, unknown> {
  return getStorybookResetProps(meta);
}

export function propControlHint(prop: PropDescriptor): string {
  if (prop.description?.trim()) return prop.description.trim();
  return `Specify the ${prop.name} of the component.`;
}

/** Short copy for API table — matches Figma reference tone. */
export function propTableDescription(prop: PropDescriptor): string {
  const shortHints: Record<string, string> = {
    size: 'Specify the size of the component.',
    attention: 'Specify the prominence of the component.',
    appearance: 'Specify the colour usage of the component.',
    shape: 'Specify the shape of the component.',
    type: 'Specify the type of the component.',
    equalWidth: 'Distribute equal width to all segments regardless of content length.',
    trackEmphasis: 'Specify the prominence of the component background.',
    variant: 'Specify the visual variant of the component.',
    disabled: 'Disable the entire control.',
    orientation: 'Specify the orientation of the component.',
  };

  if (shortHints[prop.name]) return shortHints[prop.name];

  const hint = propControlHint(prop);
  const first = hint.split(/(?<=[.!?])\s+/)[0] ?? hint;
  return first.length > 96 ? `${first.slice(0, 93)}…` : first;
}

export function formatApiValue(value: unknown): string {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.length > 48 ? `${value.slice(0, 45)}…` : value;
  return JSON.stringify(value);
}

export function mergeStorybookPreviewProps(
  meta: ComponentMeta,
  playgroundProps: Record<string, unknown>,
): Record<string, unknown> {
  return ensureStorybookRenderableProps(
    meta,
    sanitizeStorybookPlaygroundProps(meta, playgroundProps),
  );
}
