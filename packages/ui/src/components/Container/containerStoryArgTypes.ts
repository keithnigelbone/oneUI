/**
 * Storybook `argTypes` for web `Container` — controls + docs table only.
 *
 * `columns` / `rows` stay on the TS API for grid layout but are hidden here so
 * autodocs matches the props authors care about day-to-day; grid demos set
 * them in story `render` / static `args` instead of exposing number spinners.
 *
 * Spacing props are typed as preset **string** keys (`ContainerSpaceKey`); use
 * `text` controls so values are edited as strings (e.g. `4`, `3-5`, `margin`).
 *
 * `blend` is omitted from `surface` controls — it exists on `SurfaceToken` for
 * engine / media paths but is not part of the seven canonical surface modes
 * we document for layout authors.
 */

import type { ArgTypes } from '@storybook/react-vite';

const JUSTIFY_OPTIONS = [
  'start',
  'center',
  'end',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
] as const;

const ALIGN_OPTIONS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;

const POSITION_OPTIONS = ['static', 'relative', 'absolute', 'fixed', 'sticky'] as const;

const OVERFLOW_OPTIONS = ['visible', 'hidden', 'clip', 'scroll', 'auto'] as const;

const hiddenGridCountProps = {
  control: false,
  table: { disable: true },
} as const;

export const containerStoryArgTypes = {
  variant: {
    control: 'inline-radio',
    options: ['fluid', 'fixed', 'full-bleed'],
    description:
      '`fluid`: viewport width + `--Grid-Margin`. `fixed`: centered cap at `--Grid-MaxWidth` (or `maxWidth`). `full-bleed`: edge-to-edge.',
  },
  surface: {
    control: 'select',
    options: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'],
    description:
      'Root `<Surface mode>` (defaults to `ghost` when omitted). Web only; native ignores `surface` / `appearance`.',
  },
  appearance: {
    control: 'select',
    options: [
      'auto',
      'primary',
      'secondary',
      'neutral',
      'sparkle',
      'brand-bg',
      'positive',
      'negative',
      'warning',
      'informative',
    ],
    description: 'Multi-accent role for the root `<Surface>` (`appearance` prop).',
  },
  maxWidth: {
    control: 'text',
    description:
      '`fixed`: numeric/string cap → `--_container-max-width`, or CSS `max-width`. Otherwise size preset / length on the element. See `resolveContainerMaxWidth` in `Container.shared.ts`.',
  },
  fullWidth: {
    control: 'boolean',
    description: 'Deprecated; consumed so it is not forwarded to the DOM.',
  },
  as: {
    control: 'select',
    options: ['div', 'section', 'main', 'article', 'header', 'footer', 'nav'],
    description: 'Polymorphic root element (forwarded to `<Surface as>` on web).',
  },
  className: { control: 'text' },
  style: { control: 'object' },
  children: {
    control: false,
    description: 'Story previews inject demo cells; pass your own tree in app code.',
  },
  layout: {
    control: 'inline-radio',
    options: ['flex', 'grid'],
    description:
      'Omit for normal block flow. `flex` / `grid` set `display` and layout props on the root (token-backed).',
  },
  direction: {
    control: 'inline-radio',
    options: ['row', 'column'],
    description: 'Flex main axis (`flex-direction`).',
  },
  wrap: {
    control: 'boolean',
    description: 'Flex wrap (`flex-wrap: wrap` when true).',
  },
  justify: {
    control: 'select',
    options: JUSTIFY_OPTIONS,
    description: 'Main-axis distribution (flex) / grid content alignment helper.',
  },
  align: {
    control: 'select',
    options: ALIGN_OPTIONS,
    description: 'Cross-axis alignment (`align-items`) when `layout` is `flex` or `grid`.',
  },
  alignSelf: {
    control: 'select',
    options: ALIGN_OPTIONS,
    description:
      '`align-self` when this `Container` is a flex/grid child (e.g. center one column in a row).',
  },
  flex: {
    control: 'text',
    description:
      'Flex shorthand on the root (`flex`). Prefer this **or** `grow`/`shrink`/`basis`, not both.',
  },
  grow: { control: 'number', description: '`flex-grow` when `flex` is omitted.' },
  shrink: { control: 'number', description: '`flex-shrink` when `flex` is omitted.' },
  basis: {
    control: 'text',
    description: '`flex-basis` preset (`ContainerSizePreset`) when `flex` is omitted.',
  },
  columns: {
    ...hiddenGridCountProps,
    description:
      'Optional grid column count (maps to `grid-template-columns`). Hidden from this table — set via code or story `args` when using `layout="grid"`.',
  },
  rows: {
    ...hiddenGridCountProps,
    description:
      'Optional grid row count. Hidden from this table — set via code or story `args` when using `layout="grid"`.',
  },
  padding: {
    control: 'text',
    description:
      'Uniform padding: `ContainerSpaceKey` string (`0` … `40`, `margin`, `gutter`) → `var(--Spacing-*)`.',
  },
  paddingX: {
    control: 'text',
    description: 'Horizontal padding key (when `padding` is unset).',
  },
  paddingY: {
    control: 'text',
    description: 'Vertical padding key (when `padding` is unset).',
  },
  paddingTop: {
    control: 'text',
    description: 'Per-side padding key; overrides `padding` / `paddingY` on that edge.',
  },
  paddingRight: {
    control: 'text',
    description: 'Per-side padding key; overrides `padding` / `paddingX` on that edge.',
  },
  paddingBottom: {
    control: 'text',
    description: 'Per-side padding key; overrides `padding` / `paddingY` on that edge.',
  },
  paddingLeft: {
    control: 'text',
    description: 'Per-side padding key; overrides `padding` / `paddingX` on that edge.',
  },
  gap: {
    control: 'text',
    description: 'Grid/flex gap spacing key.',
  },
  rowGap: {
    control: 'text',
    description: 'Grid/flex `row-gap` spacing key.',
  },
  columnGap: {
    control: 'text',
    description: 'Grid/flex `column-gap` spacing key.',
  },
  width: {
    control: 'text',
    description: '`ContainerSizePreset` string (`auto`, `full`, spacing key, …).',
  },
  height: {
    control: 'text',
    description: 'Height preset string.',
  },
  minWidth: {
    control: 'text',
    description: 'Minimum width preset string.',
  },
  minHeight: {
    control: 'text',
    description: 'Minimum height preset string.',
  },
  maxHeight: {
    control: 'text',
    description: 'Maximum height preset string.',
  },
  position: {
    control: 'select',
    options: POSITION_OPTIONS,
    description: 'CSS `position`.',
  },
  top: { control: 'text', description: 'Offset token or CSS length (`position` not static).' },
  right: { control: 'text', description: 'Ditto.' },
  bottom: { control: 'text', description: 'Ditto.' },
  left: { control: 'text', description: 'Ditto.' },
  zIndex: { control: 'number', description: 'Stacking order.' },
  overflow: {
    control: 'select',
    options: OVERFLOW_OPTIONS,
    description: 'CSS `overflow`.',
  },
} satisfies ArgTypes;
