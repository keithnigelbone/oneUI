/**
 * Container.meta.ts
 *
 * **ComponentMeta** — serializable descriptor for registry, editor previews, code
 * export hints, and **AI / agent context** (`generateAIContext`, component registry).
 * It documents **props** and **slots**; it does not replace TypeScript types.
 *
 * **Relationship to `Container.recipe.ts`:** Meta lists the full public API.
 * Recipes only cover decisions that compile to **token overrides**; layout props
 * (flex, grid, spacing keys) stay in meta only. See `Container.recipe.ts` header.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CONTAINER_TOKEN_MANIFEST } from './Container.tokens';
import { CONTAINER_RECIPE_DEFINITION } from './Container.recipe';

const SURFACE_MODES = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;

const APPEARANCE_OPTIONS = [
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
] as const;

const LAYOUT_OPTIONS = ['flex', 'grid'] as const;

const FLEX_DIRECTION = ['row', 'column'] as const;

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

const SPACING_KEY_HINT =
  '`ContainerSpaceKey`: `0`, `0-5`, `1` … `40`, `margin`, `gutter` — resolves to `var(--Spacing-*)` on web.';

const SIZE_PRESET_HINT =
  '`ContainerSizePreset`: `auto`, `full`, `fit`, `min`, `max`, or any spacing key — see `Container.shared.ts`.';

export const CONTAINER_META: ComponentMeta = {
  name: 'Container',
  slug: 'container',
  displayName: 'Container',
  description:
    'Page-width shell (`fluid` / `fixed` / `full-bleed`) and declarative layout root. On web the node is always `<Surface>` (default `surface="ghost"`) so children get `[data-surface]` token context without an opaque page fill. Omit `layout` for normal block flow; set `layout` to `flex` or `grid` for token-backed flex/grid. Spacing props use spacing scale keys, not raw px.',
  category: 'layout',
  tags: [
    'container',
    'layout',
    'wrapper',
    'page-width',
    'flex',
    'grid',
    'spacing',
    'surface',
    'a2ui',
  ],

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      group: 'content',
      description: 'Main content (default slot).',
    },
    {
      name: 'variant',
      type: 'enum',
      group: 'layout',
      description:
        '`fluid`: viewport width + `--Grid-Margin`. `fixed`: centered cap at `--Grid-MaxWidth` (or `maxWidth`). `full-bleed`: edge-to-edge.',
      defaultValue: 'fluid',
      options: ['fluid', 'fixed', 'full-bleed'],
    },
    {
      name: 'maxWidth',
      type: 'string',
      group: 'layout',
      description:
        'With `variant="fixed"`: number or string sets `--_container-max-width`; otherwise token size preset or CSS length on the element. See `resolveContainerMaxWidth`.',
    },
    {
      name: 'as',
      type: 'string',
      group: 'layout',
      description: 'Polymorphic root element forwarded to `<Surface as>` (default `div`).',
      defaultValue: 'div',
    },
    {
      name: 'surface',
      type: 'enum',
      group: 'appearance',
      description: 'Root `<Surface mode>` — drives `[data-surface]` remapping for descendants.',
      defaultValue: 'ghost',
      options: [...SURFACE_MODES],
    },
    {
      name: 'appearance',
      type: 'enum',
      group: 'appearance',
      description: 'Multi-accent role on the root `<Surface>`.',
      defaultValue: 'auto',
      options: [...APPEARANCE_OPTIONS],
    },
    {
      name: 'layout',
      type: 'enum',
      group: 'layout',
      description:
        'Omit for **block flow** (no `display` flex/grid). `flex` or `grid` sets display and layout props on the root.',
      options: [...LAYOUT_OPTIONS],
    },
    {
      name: 'direction',
      type: 'enum',
      group: 'layout',
      description: '`flex-direction` when `layout="flex"` (ignored for grid).',
      defaultValue: 'row',
      options: [...FLEX_DIRECTION],
    },
    {
      name: 'wrap',
      type: 'boolean',
      group: 'layout',
      description: '`flex-wrap: wrap` when true; `nowrap` when false (flex only).',
    },
    {
      name: 'justify',
      type: 'enum',
      group: 'layout',
      description: '`justify-content` when `layout` is `flex` or `grid`.',
      options: [...JUSTIFY_OPTIONS],
    },
    {
      name: 'align',
      type: 'enum',
      group: 'layout',
      description: '`align-items` when `layout` is `flex` or `grid`.',
      options: [...ALIGN_OPTIONS],
    },
    {
      name: 'alignSelf',
      type: 'enum',
      group: 'layout',
      description: '`align-self` when this `Container` is a flex/grid child (e.g. center one column).',
      options: [...ALIGN_OPTIONS],
    },
    {
      name: 'columns',
      type: 'number',
      group: 'layout',
      description: '`grid-template-columns: repeat(n, minmax(0, 1fr))` when `layout="grid"` and n > 0.',
    },
    {
      name: 'rows',
      type: 'number',
      group: 'layout',
      description: '`grid-template-rows: repeat(n, minmax(0, 1fr))` when `layout="grid"` and n > 0.',
    },
    {
      name: 'padding',
      type: 'string',
      group: 'layout',
      description: `Uniform padding (${SPACING_KEY_HINT})`,
    },
    {
      name: 'paddingX',
      type: 'string',
      group: 'layout',
      description: `Horizontal padding (${SPACING_KEY_HINT}) Used when \`padding\` is unset.`,
    },
    {
      name: 'paddingY',
      type: 'string',
      group: 'layout',
      description: `Vertical padding (${SPACING_KEY_HINT}) Used when \`padding\` is unset.`,
    },
    {
      name: 'paddingTop',
      type: 'string',
      group: 'layout',
      description: `Per-side padding (${SPACING_KEY_HINT}) Overrides that edge after \`padding\` / axis props.`,
    },
    {
      name: 'paddingRight',
      type: 'string',
      group: 'layout',
      description: `Per-side padding (${SPACING_KEY_HINT})`,
    },
    {
      name: 'paddingBottom',
      type: 'string',
      group: 'layout',
      description: `Per-side padding (${SPACING_KEY_HINT})`,
    },
    {
      name: 'paddingLeft',
      type: 'string',
      group: 'layout',
      description: `Per-side padding (${SPACING_KEY_HINT})`,
    },
    {
      name: 'gap',
      type: 'string',
      group: 'layout',
      description: `Flex/grid gap (${SPACING_KEY_HINT})`,
    },
    {
      name: 'rowGap',
      type: 'string',
      group: 'layout',
      description: `Row gap (${SPACING_KEY_HINT})`,
    },
    {
      name: 'columnGap',
      type: 'string',
      group: 'layout',
      description: `Column gap (${SPACING_KEY_HINT})`,
    },
    {
      name: 'width',
      type: 'string',
      group: 'layout',
      description: `Width (${SIZE_PRESET_HINT})`,
    },
    {
      name: 'height',
      type: 'string',
      group: 'layout',
      description: `Height (${SIZE_PRESET_HINT})`,
    },
    {
      name: 'minWidth',
      type: 'string',
      group: 'layout',
      description: `Min width (${SIZE_PRESET_HINT})`,
    },
    {
      name: 'minHeight',
      type: 'string',
      group: 'layout',
      description: `Min height (${SIZE_PRESET_HINT})`,
    },
    {
      name: 'maxHeight',
      type: 'string',
      group: 'layout',
      description: `Max height (${SIZE_PRESET_HINT})`,
    },
    {
      name: 'flex',
      type: 'string',
      group: 'layout',
      description:
        'CSS `flex` shorthand on the root (number or string). Prefer this **or** `grow` / `shrink` / `basis`, not both.',
    },
    {
      name: 'grow',
      type: 'number',
      group: 'layout',
      description: '`flex-grow` when `flex` is omitted.',
    },
    {
      name: 'shrink',
      type: 'number',
      group: 'layout',
      description: '`flex-shrink` when `flex` is omitted.',
    },
    {
      name: 'basis',
      type: 'string',
      group: 'layout',
      description: '`flex-basis` when `flex` is omitted.',
    },
    {
      name: 'position',
      type: 'enum',
      group: 'layout',
      description: 'CSS `position`.',
      options: [...POSITION_OPTIONS],
    },
    {
      name: 'top',
      type: 'string',
      group: 'layout',
      description: 'Offset (token-backed length or valid CSS length string).',
    },
    {
      name: 'right',
      type: 'string',
      group: 'layout',
      description: 'Offset (token-backed length or valid CSS length string).',
    },
    {
      name: 'bottom',
      type: 'string',
      group: 'layout',
      description: 'Offset (token-backed length or valid CSS length string).',
    },
    {
      name: 'left',
      type: 'string',
      group: 'layout',
      description: 'Offset (token-backed length or valid CSS length string).',
    },
    {
      name: 'zIndex',
      type: 'number',
      group: 'layout',
      description: 'Stacking order.',
    },
    {
      name: 'overflow',
      type: 'enum',
      group: 'layout',
      description: 'CSS `overflow`.',
      options: [...OVERFLOW_OPTIONS],
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      group: 'layout',
      deprecated: true,
      description: 'Deprecated; consumed so it is not forwarded to the DOM.',
    },
    {
      name: 'className',
      type: 'string',
      group: 'layout',
      description: 'Additional class names on the root.',
    },
    {
      name: 'style',
      type: 'object',
      group: 'layout',
      description: 'Inline styles merged after generated layout styles.',
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'Main content; in flex/grid layouts becomes direct flex/grid items unless wrapped.',
      cardinality: 'multiple',
    },
  ],

  previewMatrix: {
    variants: ['fluid', 'fixed', 'full-bleed'],
    variantLabels: {
      fluid: 'Fluid',
      fixed: 'Fixed',
      'full-bleed': 'Full bleed',
    },
  },

  surfaceAware: true,
  /** Root supports `appearance`, but preview matrix stays variant-only (fluid / fixed / full-bleed). */
  multiAccent: false,

  tokenManifest: CONTAINER_TOKEN_MANIFEST,
  recipeDefinition: CONTAINER_RECIPE_DEFINITION,
};
