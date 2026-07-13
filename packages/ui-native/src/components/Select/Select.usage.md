# Select

## Overview

The `Select` component is a dropdown picker for single-select, multi-select (with checkboxes), and action-menu use cases. It supports three trigger surfaces (`input`, `button`, `iconButton`), the full multi-accent appearance set, grouped options, search/filter, and all OneUI surface contexts.

Native implementation: `Select.native.tsx` · contract: `interface.ts` · showcase: `Select.showcase.native.tsx`

## Import

```typescript
import { Select } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` (or `OneUINativeThemeProvider`) so spacing, typography, and surface tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` | `SelectOption[]` | — | Selectable options (required) |
| `sections` | `SelectSection[]` | — | Optional section groups; options are grouped by `option.group` |
| `value` | `string \| number` | — | Controlled single-select value |
| `onChange` | `(value) => void` | — | Single-select change handler |
| `values` | `(string \| number)[]` | — | Controlled multi-select values (`menu="multi"`) |
| `onValuesChange` | `(values) => void` | — | Multi-select change handler |
| `onAction` | `(value) => void` | — | Action handler for `menu="actions"` rows |
| `menu` | `'single' \| 'multi' \| 'actions'` | `'single'` | Menu behaviour |
| `trigger` | `'input' \| 'button' \| 'iconButton'` | `'input'` | Trigger surface |
| `menuDirection` | `'below' \| 'above' \| 'alignWithTrigger'` | `'below'` | Menu open direction |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | `'auto'` | Multi-accent colour role (`'auto'` resolves to `'primary'`) |
| `attention` | `'high' \| 'medium' \| 'low'` | `'medium'` | Attention for `button` / `iconButton` triggers |
| `size` | `'s' \| 'm' \| 'l'` | `'m'` | Trigger and row size |
| `searchable` | `boolean` | `false` | Shows a search/filter input in the menu header |
| `placeholder` | `string` | `'Select…'` | Trigger text when nothing is selected |
| `disabled` | `boolean` | `false` | Disables the control |
| `label` | `string` | — | Field label above the `input` trigger |
| `description` | `string` | — | Description under the label |
| `required` | `boolean` | `false` | Marks the field required (renders `*`) |
| `helperText` | `string` | — | Helper text below the `input` trigger |
| `feedback` | `string` | — | Feedback / error message below the `input` trigger |
| `errorHighlight` | `boolean` | `false` | Error chrome on the `input` trigger |
| `start` | `ReactNode` | — | Leading node inside the trigger |
| `triggerIcon` | `ReactNode` | — | Icon for the `iconButton` trigger |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the menu opens or closes |
| `style` | `ViewStyle` | — | Inline style on the root |
| `aria-label` | `string` | — | Accessible name |
| `accessibilityHint` | `string` | — | Describes the result of activating the control |
| `testID` | `string` | — | React Native test identifier |

### `SelectOption` shape

| Field | Type | Description |
| ----- | ---- | ----------- |
| `value` | `string \| number` | Option value (required) |
| `label` | `string` | Display text (required) |
| `secondaryText` | `string` | Secondary row text |
| `disabled` | `boolean` | Disables this option |
| `icon` | `ReactNode` | Leading icon in the row |
| `color` | `string` | Colour swatch token |
| `swatch` | `string` | Swatch preview |
| `badge` | `string` | Badge label |
| `group` | `string` | Group ID (matches `SelectSection.id`) |

## Usage Examples

### Basic single-select (controlled)

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

function BasicSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Select
      options={OPTIONS}
      value={value}
      onChange={setValue}
      label="Fruit"
      placeholder="Choose a fruit"
      aria-label="Fruit selector"
    />
  );
}
```

### With helper text and error state

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

function ValidatedSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);
  const hasError = !value;

  return (
    <Select
      options={[
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'ta', label: 'Tamil' },
      ]}
      value={value}
      onChange={setValue}
      label="Language"
      required
      helperText="Select your preferred language"
      feedback={hasError ? 'Language is required' : undefined}
      errorHighlight={hasError}
      aria-label="Language selector"
    />
  );
}
```

### Multi-select

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

function MultiSelect() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <Select
      options={[
        { value: 'news', label: 'News' },
        { value: 'sports', label: 'Sports' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'tech', label: 'Technology' },
      ]}
      menu="multi"
      values={values}
      onValuesChange={setValues}
      label="Topics"
      placeholder="Select topics"
      aria-label="Topic multi-select"
    />
  );
}
```

### Action menu trigger

```tsx
import React from 'react';
import { Select } from '@oneui/ui-native';

function ActionMenu() {
  return (
    <Select
      options={[
        { value: 'edit', label: 'Edit' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'delete', label: 'Delete' },
      ]}
      menu="actions"
      trigger="button"
      attention="medium"
      onAction={(value) => console.log('Action:', value)}
      aria-label="Item actions"
    />
  );
}
```

### Button and iconButton triggers

```tsx
import React, { useState } from 'react';
import { Select, Icon } from '@oneui/ui-native';
import { IcFilter } from '@oneui/icons-native';

function TriggerVariants() {
  const [sort, setSort] = useState<string>('recent');

  return (
    <>
      {/* Button trigger */}
      <Select
        options={[
          { value: 'recent', label: 'Most Recent' },
          { value: 'popular', label: 'Most Popular' },
        ]}
        trigger="button"
        value={sort}
        onChange={setSort}
        attention="high"
        aria-label="Sort order"
      />

      {/* Icon button trigger */}
      <Select
        options={[
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ]}
        trigger="iconButton"
        triggerIcon={<Icon icon={IcFilter} />}
        value={sort}
        onChange={setSort}
        aria-label="Sort direction"
      />
    </>
  );
}
```

### Grouped options with sections

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

const SECTIONS = [
  { id: 'fruit', label: 'Fruit' },
  { id: 'veg', label: 'Vegetables' },
];

const OPTIONS = [
  { value: 'apple', label: 'Apple', group: 'fruit' },
  { value: 'mango', label: 'Mango', group: 'fruit' },
  { value: 'carrot', label: 'Carrot', group: 'veg' },
  { value: 'spinach', label: 'Spinach', group: 'veg' },
];

function GroupedSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Select
      options={OPTIONS}
      sections={SECTIONS}
      value={value}
      onChange={setValue}
      label="Food"
      aria-label="Food selector"
    />
  );
}
```

### Searchable select

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

function SearchableSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Select
      options={[
        { value: 'in', label: 'India' },
        { value: 'us', label: 'United States' },
        { value: 'gb', label: 'United Kingdom' },
        { value: 'de', label: 'Germany' },
        { value: 'jp', label: 'Japan' },
      ]}
      searchable
      value={value}
      onChange={setValue}
      label="Country"
      placeholder="Search country"
      aria-label="Country selector"
    />
  );
}
```

### Appearance roles

```tsx
import React, { useState } from 'react';
import { Select } from '@oneui/ui-native';

function AppearanceSelect() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Select
      options={[
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ]}
      trigger="button"
      appearance="negative"
      attention="high"
      value={value}
      onChange={setValue}
      aria-label="Risk level"
    />
  );
}
```

### Surface context

Place `Select` inside `<Surface>` so on-colour tokens remap on tinted backgrounds.

```tsx
import React, { useState } from 'react';
import { Select, Surface } from '@oneui/ui-native';

function SelectOnSurface() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Surface mode="bold">
      <Select
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        value={value}
        onChange={setValue}
        label="Selection"
        aria-label="Selection on surface"
      />
    </Surface>
  );
}
```

### Disabled state

```tsx
import React from 'react';
import { Select } from '@oneui/ui-native';

function DisabledSelect() {
  return (
    <Select
      options={[{ value: 'locked', label: 'Locked option' }]}
      value="locked"
      disabled
      label="Region"
      aria-label="Region (disabled)"
    />
  );
}
```

## Additional Notes

- **`trigger="input"`** renders a full-width labelled input field; `trigger="button"` and `trigger="iconButton"` are compact and suited for toolbars or action rows.
- **`menu="multi"`** requires `values` + `onValuesChange`; `menu="single"` uses `value` + `onChange`; `menu="actions"` uses `onAction`.
- **Controlled only** — the component does not manage internal selection state. Always provide `value`/`values` and a change handler.
- **`appearance="auto"`** resolves to `'primary'`; pass an explicit role for semantic tinting.
- **`searchable`** adds a filter input at the top of the menu that narrows visible options client-side.
- **`sections`** — options are assigned to sections via `option.group` matching `section.id`; ungrouped options appear at the end.
- **Sample app** — open **Select** in `native-components-sample` to browse the full showcase suite.
- **Web parity** — mirrors `packages/ui/src/components/Select/Select.tsx`.
