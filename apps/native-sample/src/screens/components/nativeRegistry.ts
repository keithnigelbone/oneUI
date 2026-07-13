/**
 * nativeRegistry.ts
 *
 * Slug list mirroring `apps/v4-sample/src/pages/components/registry/`. Each
 * row carries `hasNativeImpl: true | false` so the components-list screen
 * can mark which components have a real `*.native.tsx` shipped via
 * `@oneui/ui-native` and which are still web-only.
 *
 * Today only `button` is implemented natively. As more native components
 * land, flip the flag here and add a real preview branch in
 * `ComponentDetailScreen.tsx`.
 */

export type NativeComponentCategory =
  | 'Inputs'
  | 'Data Display'
  | 'Navigation'
  | 'Feedback'
  | 'Layout';

export interface NativeComponentEntry {
  id: string;
  name: string;
  category: NativeComponentCategory;
  hasNativeImpl: boolean;
}

export const NATIVE_REGISTRY: readonly NativeComponentEntry[] = [
  // ── Inputs ────────────────────────────────────────────────────────────
  { id: 'button',         name: 'Button',         category: 'Inputs', hasNativeImpl: true },
  { id: 'iconbutton',     name: 'IconButton',     category: 'Inputs', hasNativeImpl: false },
  { id: 'linkbutton',     name: 'LinkButton',     category: 'Inputs', hasNativeImpl: false },
  { id: 'buttoncopy',     name: 'ButtonCopy',     category: 'Inputs', hasNativeImpl: false },
  { id: 'input',          name: 'Input',          category: 'Inputs', hasNativeImpl: false },
  { id: 'textarea',       name: 'TextArea',       category: 'Inputs', hasNativeImpl: false },
  { id: 'select',         name: 'Select',         category: 'Inputs', hasNativeImpl: false },
  { id: 'combobox',       name: 'Combobox',       category: 'Inputs', hasNativeImpl: false },
  { id: 'checkbox',       name: 'Checkbox',       category: 'Inputs', hasNativeImpl: false },
  { id: 'checkboxgroup',  name: 'CheckboxGroup',  category: 'Inputs', hasNativeImpl: false },
  { id: 'radiogroup',     name: 'RadioGroup',     category: 'Inputs', hasNativeImpl: false },
  { id: 'switch',         name: 'Switch',         category: 'Inputs', hasNativeImpl: false },
  { id: 'slider',         name: 'Slider',         category: 'Inputs', hasNativeImpl: false },
  { id: 'numberfield',    name: 'NumberField',    category: 'Inputs', hasNativeImpl: false },
  { id: 'pinfield',       name: 'PinField',       category: 'Inputs', hasNativeImpl: false },
  { id: 'searchfield',    name: 'SearchField',    category: 'Inputs', hasNativeImpl: false },
  { id: 'fileupload',     name: 'FileUpload',     category: 'Inputs', hasNativeImpl: false },
  { id: 'datepicker',     name: 'DatePicker',     category: 'Inputs', hasNativeImpl: false },
  { id: 'fieldgroup',     name: 'FieldGroup',     category: 'Inputs', hasNativeImpl: false },

  // ── Data Display ─────────────────────────────────────────────────────
  { id: 'avatar',         name: 'Avatar',         category: 'Data Display', hasNativeImpl: true },
  { id: 'badge',          name: 'Badge',          category: 'Data Display', hasNativeImpl: true },
  { id: 'counterbadge',   name: 'CounterBadge',   category: 'Data Display', hasNativeImpl: true },
  { id: 'indicatorbadge', name: 'IndicatorBadge', category: 'Data Display', hasNativeImpl: true },
  { id: 'image',          name: 'Image',          category: 'Data Display', hasNativeImpl: true },
  { id: 'logo',           name: 'Logo',           category: 'Data Display', hasNativeImpl: true },
  { id: 'chip',           name: 'Chip',           category: 'Data Display', hasNativeImpl: false },
  { id: 'chipgroup',      name: 'ChipGroup',      category: 'Data Display', hasNativeImpl: false },
  { id: 'tag',            name: 'Tag',            category: 'Data Display', hasNativeImpl: false },
  { id: 'card',           name: 'Card',           category: 'Data Display', hasNativeImpl: false },
  { id: 'list',           name: 'List',           category: 'Data Display', hasNativeImpl: false },
  { id: 'table',          name: 'Table',          category: 'Data Display', hasNativeImpl: false },
  { id: 'datagrid',       name: 'DataGrid',       category: 'Data Display', hasNativeImpl: false },
  { id: 'tooltip',        name: 'Tooltip',        category: 'Data Display', hasNativeImpl: false },
  { id: 'kbd',            name: 'Kbd',            category: 'Data Display', hasNativeImpl: false },
  { id: 'separator',      name: 'Separator',      category: 'Data Display', hasNativeImpl: true },
  { id: 'divider',        name: 'Divider',        category: 'Data Display', hasNativeImpl: true },

  // ── Navigation ───────────────────────────────────────────────────────
  { id: 'tabs',           name: 'Tabs',           category: 'Navigation', hasNativeImpl: false },
  { id: 'breadcrumbs',    name: 'Breadcrumbs',    category: 'Navigation', hasNativeImpl: false },
  { id: 'pagination',     name: 'Pagination',     category: 'Navigation', hasNativeImpl: false },
  { id: 'paginationdots', name: 'PaginationDots', category: 'Navigation', hasNativeImpl: true },
  { id: 'menu',           name: 'Menu',           category: 'Navigation', hasNativeImpl: false },
  { id: 'navbar',         name: 'NavBar',         category: 'Navigation', hasNativeImpl: false },
  { id: 'sidebar',        name: 'Sidebar',        category: 'Navigation', hasNativeImpl: false },
  { id: 'bottomnavigation', name: 'BottomNavigation', category: 'Navigation', hasNativeImpl: false },
  { id: 'stepper',        name: 'Stepper',        category: 'Navigation', hasNativeImpl: false },

  // ── Feedback ─────────────────────────────────────────────────────────
  { id: 'alert',          name: 'Alert',          category: 'Feedback', hasNativeImpl: false },
  { id: 'banner',         name: 'Banner',         category: 'Feedback', hasNativeImpl: false },
  { id: 'toast',          name: 'Toast',          category: 'Feedback', hasNativeImpl: false },
  { id: 'dialog',         name: 'Dialog',         category: 'Feedback', hasNativeImpl: false },
  { id: 'modal',          name: 'Modal',          category: 'Feedback', hasNativeImpl: false },
  { id: 'popover',        name: 'Popover',        category: 'Feedback', hasNativeImpl: false },
  { id: 'sheet',          name: 'Sheet',          category: 'Feedback', hasNativeImpl: false },
  { id: 'progressbar',    name: 'ProgressBar',    category: 'Feedback', hasNativeImpl: false },
  { id: 'circularprogressindicator', name: 'CircularProgressIndicator', category: 'Feedback', hasNativeImpl: false },
  { id: 'skeleton',       name: 'Skeleton',       category: 'Feedback', hasNativeImpl: false },
  { id: 'spinner',        name: 'Spinner',        category: 'Feedback', hasNativeImpl: true },
  { id: 'progress',       name: 'Progress',       category: 'Feedback', hasNativeImpl: true },
  { id: 'emptystate',     name: 'EmptyState',     category: 'Feedback', hasNativeImpl: false },

  // ── Layout ───────────────────────────────────────────────────────────
  { id: 'container',      name: 'Container',      category: 'Layout', hasNativeImpl: true },
  { id: 'grid',           name: 'Grid',           category: 'Layout', hasNativeImpl: false },
  { id: 'stack',          name: 'Stack',          category: 'Layout', hasNativeImpl: false },
  { id: 'flex',           name: 'Flex',           category: 'Layout', hasNativeImpl: false },
  { id: 'spacer',         name: 'Spacer',         category: 'Layout', hasNativeImpl: false },
  { id: 'aspectratio',    name: 'AspectRatio',    category: 'Layout', hasNativeImpl: false },
  { id: 'accordion',      name: 'Accordion',      category: 'Layout', hasNativeImpl: false },
  { id: 'collapsible',    name: 'Collapsible',    category: 'Layout', hasNativeImpl: false },
  { id: 'carousel',       name: 'Carousel',       category: 'Layout', hasNativeImpl: false },
  { id: 'scrollarea',     name: 'ScrollArea',     category: 'Layout', hasNativeImpl: false },
  { id: 'splitview',      name: 'SplitView',      category: 'Layout', hasNativeImpl: false },
  { id: 'chatcomposer',   name: 'ChatComposer',   category: 'Layout', hasNativeImpl: false },
  { id: 'chatsurface',    name: 'ChatSurface',    category: 'Layout', hasNativeImpl: false },
];

export const CATEGORY_ORDER: readonly NativeComponentCategory[] = [
  'Inputs',
  'Data Display',
  'Navigation',
  'Feedback',
  'Layout',
];

export function getEntry(id: string): NativeComponentEntry | undefined {
  return NATIVE_REGISTRY.find((entry) => entry.id === id);
}
