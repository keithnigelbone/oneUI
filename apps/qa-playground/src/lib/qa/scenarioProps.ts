import type { ComponentMeta } from '@oneui/shared';

function metaHasProp(meta: ComponentMeta, name: string): boolean {
  return meta.props.some((p) => p.name === name);
}

function metaProp(meta: ComponentMeta, name: string) {
  return meta.props.find((p) => p.name === name);
}

/** Fill missing props from `ComponentMeta.props[].defaultValue` so registry previews render. */
export function applyMetaDefaultProps(
  meta: ComponentMeta,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...props };
  for (const prop of meta.props) {
    if (next[prop.name] === undefined && prop.defaultValue !== undefined) {
      next[prop.name] = prop.defaultValue;
    }
  }
  return next;
}

export function mapMatrixToProps(
  meta: ComponentMeta,
  variant: string,
  size: string | number | undefined
): Record<string, unknown> {
  switch (meta.slug) {
    case 'badge':
      return {
        children: 'Badge',
        variant: variant as 'bold' | 'subtle' | 'ghost',
        ...(size !== undefined ? { size } : {}),
      };
    case 'button':
      return {
        children: 'Button',
        attention: variant,
        ...(size !== undefined ? { size } : {}),
      };
    case 'checkbox':
      return {
        label: 'Label',
        checked: variant === 'selected',
        ...(size !== undefined ? { size } : {}),
      };
    case 'switch':
      return {
        children: 'Label',
        checked: variant === 'selected',
        ...(size !== undefined ? { size } : {}),
      };
    case 'radio':
      return {
        label: 'Label',
        value: 'preview-option',
        checked: variant === 'selected',
        ...(size !== undefined ? { size } : {}),
      };
    case 'radio-field':
      return {
        name: 'qa-preview-radio-field',
        label: 'Default Radio',
        appearance: 'primary',
        size: (size ?? 'm') as 's' | 'm' | 'l',
      };
    case 'icon':
      return {
        icon: 'heart',
        emphasis: variant,
        appearance: 'primary',
        ...(size !== undefined ? { size } : {}),
      };
    case 'icon-contained':
      return {
        icon: 'home',
        attention: variant,
        ...(size !== undefined ? { size } : {}),
      };
    case 'pagination':
      return {
        totalPages: 10,
        defaultPage: 1,
        siblingCount: 1,
        boundaryCount: 1,
        attention: variant as 'high' | 'medium' | 'low',
        ...(size !== undefined ? { size } : {}),
      };
    case 'input-dynamic-text': {
      const rowSize = size === 8 ? 's' : size === 12 ? 'l' : 'm';
      return {
        size: rowSize,
        content: '0 / 280 characters',
        end: 'Helper Button',
      };
    }
    case 'input-feedback': {
      const rowSize = size === 8 ? 's' : size === 12 ? 'l' : 'm';
      return {
        variant: 'negative' as const,
        attention: 'low' as const,
        size: rowSize,
        feedback_message: 'Password must be at least 8 characters.',
      };
    }
    case 'input':
      return {
        placeholder: 'Placeholder',
        size: size === 8 ? 's' : size === 12 ? 'l' : 'm',
        attention: 'medium',
      };
    case 'tooltip':
      // Tooltip requires both `children` (trigger element) and `content` (bubble text).
      // Neither is a simple scalar that the generic path can infer, so we provide
      // concrete defaults here.  `children` is injected as a native <button> by
      // ScenarioPreview.ensureTooltipChildren so this object stays serialisable.
      return {
        content: 'Tooltip',
        defaultOpen: true,
        trigger: 'manual' as const,
        ...(size !== undefined ? { size } : {}),
      };
    case 'counter-badge':
      return {
        value: 5,
        attention: variant as 'high' | 'medium' | 'low',
        appearance: 'auto',
        'aria-label': '5 notifications',
        ...(size === 8 ? { size: 's' as const } : size === 12 ? { size: 'l' as const } : { size: 'm' as const }),
      };
    case 'indicator-badge':
      return {
        'aria-label': 'Status',
        appearance: 'negative',
        ...(size === 8 ? { size: 's' as const } : size === 12 ? { size: 'l' as const } : { size: 'm' as const }),
      };
    case 'chip': {
      const variantMap: Record<string, 'bold' | 'subtle' | 'ghost'> = {
        bold: 'bold',
        subtle: 'subtle',
        ghost: 'ghost',
        high: 'bold',
        medium: 'subtle',
        low: 'ghost',
      };
      const resolved = variantMap[variant] ?? 'subtle';
      return {
        children: 'Chip',
        variant: resolved,
        attention: resolved === 'bold' ? 'high' : resolved === 'ghost' ? 'low' : 'medium',
        size: (size ?? 'm') as 's' | 'm' | 'l',
        appearance: 'secondary',
        defaultSelected: variant === 'bold' || variant === 'high',
        'aria-label': 'Chip',
      };
    }
    case 'selectable-button':
    case 'selectable-single-text-button': {
      const attention =
        variant === 'high' || variant === 'medium' || variant === 'low'
          ? variant
          : 'high';
      return {
        children: meta.slug === 'selectable-single-text-button' ? 'Ag' : 'Button',
        attention,
        size: (size ?? 'm') as string,
        appearance: 'primary',
        contained: meta.slug === 'selectable-button',
        selected: true,
        'aria-label': meta.displayName,
      };
    }
    case 'divider': {
      const attention =
        variant === 'high' || variant === 'medium' || variant === 'low'
          ? variant
          : 'medium';
      return {
        orientation: 'horizontal',
        size: (size ?? 'm') as 's' | 'm' | 'l',
        attention,
        appearance: 'neutral',
      };
    }
    case 'slider':
      return {
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        showTooltip: 'false',
        appearance: 'primary',
        knobStyle: 'outside',
        orientation: 'horizontal',
      };
    case 'touch-slider':
      return {
        defaultValue: 40,
        min: 0,
        max: 100,
        step: 1,
        progressStyle:
          variant === 'sharp' || variant === 'rounded'
            ? variant
            : 'rounded',
        appearance: 'primary',
        orientation: 'horizontal',
      };
    case 'select':
      return {
        trigger: variant as 'selectableInput' | 'selectableButton' | 'selectableIconButton',
        menu: 'singleSelect',
        size: (size ?? 'm') as 's' | 'm' | 'l',
        appearance: 'primary',
        label: 'Label',
        placeholder: 'Select',
        defaultValue: 'opt-1',
        options: [
          { value: 'opt-1', label: 'Option 1' },
          { value: 'opt-2', label: 'Option 2' },
        ],
        'aria-label': 'Select',
      };
    default: {
      const out: Record<string, unknown> = {};
      if (size !== undefined && metaHasProp(meta, 'size')) {
        out.size = size;
      }
      const enumProp = meta.props.find(
        (p) =>
          p.type === 'enum' &&
          p.options &&
          (p.options as readonly unknown[]).includes(variant as never)
      );
      if (enumProp) {
        out[enumProp.name] = variant;
      }
      if (Object.keys(out).length === 0) {
        out._qaVariant = variant;
      }
      return out;
    }
  }
}

export type InteractionStateKey =
  | 'default'
  | 'disabled'
  | 'loading'
  | 'readonly'
  | 'error'
  | 'success';

const STATE_ORDER: InteractionStateKey[] = [
  'default',
  'disabled',
  'loading',
  'readonly',
  'error',
  'success',
];

export function applicableInteractionStates(meta: ComponentMeta): InteractionStateKey[] {
  return STATE_ORDER.filter((key) => {
    if (key === 'default') return true;
    if (key === 'disabled' && metaHasProp(meta, 'disabled')) return true;
    if (key === 'loading' && metaHasProp(meta, 'loading')) return true;
    if (key === 'readonly' && metaHasProp(meta, 'readOnly')) return true;
    if (key === 'error' && metaHasProp(meta, 'error')) return true;
    if (key === 'success' && metaHasProp(meta, 'success')) return true;
    return false;
  });
}

export function applyInteractionState(
  meta: ComponentMeta,
  base: Record<string, unknown>,
  state: InteractionStateKey
): Record<string, unknown> {
  const next = { ...base };
  if (state === 'default') return next;

  if (state === 'disabled' && metaHasProp(meta, 'disabled')) {
    next.disabled = true;
  }
  if (state === 'loading' && metaHasProp(meta, 'loading')) {
    next.loading = true;
  }
  if (state === 'readonly' && metaHasProp(meta, 'readOnly')) {
    next.readOnly = true;
  }
  if (state === 'error' && metaHasProp(meta, 'error')) {
    const errorDef = metaProp(meta, 'error');
    next.error = errorDef?.type === 'string' ? 'Error message' : true;
  }
  if (state === 'success' && metaHasProp(meta, 'success')) {
    next.success = true;
  }
  return next;
}

export function buttonSlotScenarios(): Array<{
  id: string;
  name: string;
  group: string;
  props: Record<string, unknown>;
}> {
  return [
    {
      id: 'slots-start-icon',
      name: 'Start icon',
      group: 'Slots & icons',
      props: {
        children: 'Button',
        attention: 'medium',
        size: 10,
        start: 'heart',
      },
    },
    {
      id: 'slots-end-icon',
      name: 'End icon',
      group: 'Slots & icons',
      props: {
        children: 'Button',
        attention: 'medium',
        size: 10,
        end: 'heart',
      },
    },
    {
      id: 'slots-both-icons',
      name: 'Start + end icons',
      group: 'Slots & icons',
      props: {
        children: 'Button',
        attention: 'high',
        size: 10,
        start: 'heart',
        end: 'heart',
      },
    },
    {
      id: 'slots-loading-label',
      name: 'Loading + label',
      group: 'Slots & icons',
      props: {
        children: 'Processing',
        attention: 'high',
        size: 10,
        loading: true,
      },
    },
  ];
}

export function appearanceSampleProps(meta: ComponentMeta): Array<{
  id: string;
  name: string;
  appearance: string;
}> {
  if (!meta.multiAccent) return [];
  const appearances =
    meta.props.find((p) => p.name === 'appearance' && p.type === 'enum')?.options ?? [];
  const pick = ['primary', 'secondary', 'neutral', 'positive'].filter((a) =>
    (appearances as string[]).includes(a)
  );
  return pick.map((appearance) => ({
    id: `appearance-${appearance}`,
    name: `Appearance: ${appearance}`,
    appearance,
  }));
}
