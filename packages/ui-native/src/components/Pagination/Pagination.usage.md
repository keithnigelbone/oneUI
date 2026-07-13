# Pagination

## Overview

The `Pagination` component renders a numbered page navigator with sibling/boundary-driven ellipsis collapsing, plus optional previous/next and first/last navigation buttons. It supports controlled (`page`) and uncontrolled (`defaultPage`) usage.

Native implementation: `Pagination.native.tsx` · item: `PaginationItem.native.tsx` · contract: `interface.ts` · showcase: `Pagination.showcase.native.tsx`

## Import

```typescript
import { Pagination } from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so pagination colour tokens resolve correctly.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `totalPages` | `number` | — | **Required** — total number of pages |
| `page` | `number` | — | Controlled current page (1-indexed) |
| `defaultPage` | `number` | `1` | Uncontrolled initial page |
| `onPageChange` | `(page: number) => void` | — | Fires with the next page number |
| `siblingCount` | `number` | `1` | Pages shown on each side of the current page before collapsing |
| `boundaryCount` | `number` | `1` | Pages always shown at the start/end |
| `showPrevNext` | `boolean` | `true` | Show previous/next controls |
| `showFirstLast` | `boolean` | `false` | Show first/last controls |
| `disabled` | `boolean` | `false` | Disables the entire control |
| `attention` | `'high' \| 'medium' \| 'low'` | `'medium'` | Selected-chip prominence: high → bold, medium → subtle, low → outlined ghost |
| `size` | `PaginationSize` | — | Row size, drives chip and nav icon-button sizing |
| `appearance` | `'auto' \| 'primary' \| 'secondary' \| 'neutral' \| 'sparkle' \| 'brand-bg' \| 'positive' \| 'negative' \| 'warning' \| 'informative'` | — | Multi-accent role for selected chip and nav buttons |
| `aria-label` | `string` | `'Pagination'` | Accessible name |
| `accessibilityHint` | `string` | — | Additional a11y hint |
| `style` | `ViewStyle` | — | Root layout style |
| `testID` | `string` | — | Test identifier |

## Usage Examples

### Basic pagination

```tsx
import React, { useState } from 'react';
import { Pagination } from '@oneui/ui-native';

function BasicPagination() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      totalPages={10}
      page={page}
      onPageChange={setPage}
    />
  );
}
```

### First/last controls with wider siblings

```tsx
import React, { useState } from 'react';
import { Pagination } from '@oneui/ui-native';

function LongListPagination() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      totalPages={50}
      page={page}
      onPageChange={setPage}
      showFirstLast
      siblingCount={2}
    />
  );
}
```

### Low-attention outlined chips

```tsx
import React, { useState } from 'react';
import { Pagination } from '@oneui/ui-native';

function OutlinedPagination() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      totalPages={6}
      page={page}
      onPageChange={setPage}
      attention="low"
    />
  );
}
```

### Disabled

```tsx
import React from 'react';
import { Pagination } from '@oneui/ui-native';

function DisabledPagination() {
  return <Pagination totalPages={5} page={1} disabled />;
}
```

## Additional Notes

- Placement inside `<Surface mode="...">` re-steps the selected chip and nav-button colours automatically — never set a background on a raw `View`.
- Ellipsis slots render a disabled `IconButton` with `icon="moreHorizontal"` — they are not tappable.
- `attention="high"` uses `role.surfaces.bold` for the selected chip; `medium` uses `role.surfaces.subtle`; `low` draws a hairline `role.surfaces.bold` border with transparent fill.
- **Sample app** — open **Pagination** in `native-components-sample` to browse showcase suites.
