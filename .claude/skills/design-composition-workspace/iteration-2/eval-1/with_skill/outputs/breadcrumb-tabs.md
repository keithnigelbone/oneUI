# Product Detail — Breadcrumb + Section Tabs (OneUI)

Two distinct navigation jobs on one page, so two distinct OneUI patterns:

- **Breadcrumb** (Home / Shop / Running shoes) — OneUI has **no Breadcrumb component**. Per the navigation guide, you compose it from `Link` + neutral text separators inside a `<nav aria-label="Breadcrumb">` landmark. It's quiet wayfinding: low attention, neutral tokens, default surface.
- **Section switcher** (Description / Reviews / Specs) — these are sibling views *within the same screen*, which is exactly what **`Tabs`** is for (not `BottomNavigation`, which is top-level app destinations). Active tab uses the `primary` role accent + sliding `Indicator`; the component handles `aria-current`, focus and keyboard for you.

Both sit on the **default surface** — navigation chrome doesn't get brand color or bold surfaces. The product content is the hero; the nav stays out of the way.

## TSX

```tsx
'use client';

import { useState } from 'react';
import { Link, Tabs } from '@oneui/ui';

export function ProductDetailNav() {
  const [section, setSection] = useState('description');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-6)',
      }}
    >
      {/* Breadcrumb — composed from Link + separators (no Breadcrumb component exists).
          Quiet wayfinding: neutral text, default surface, Label role. */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--Spacing-2)',
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
        }}
      >
        <Link href="/">Home</Link>
        <span aria-hidden style={{ color: 'var(--Text-Low)' }}>
          /
        </span>
        <Link href="/shop">Shop</Link>
        <span aria-hidden style={{ color: 'var(--Text-Low)' }}>
          /
        </span>
        {/* Current page is not a link — just emphasized text + aria-current */}
        <span aria-current="page" style={{ color: 'var(--Text-Medium)' }}>
          Running shoes
        </span>
      </nav>

      {/* Section tabs — sibling views within this screen.
          Active state = primary role accent + sliding Indicator (handled by the component). */}
      <Tabs.Root value={section} onValueChange={setSection} appearance="primary">
        <Tabs.List>
          <Tabs.Item value="description">Description</Tabs.Item>
          <Tabs.Item value="reviews">Reviews</Tabs.Item>
          <Tabs.Item value="specs">Specs</Tabs.Item>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value="description">
          {/* Description content */}
        </Tabs.Panel>
        <Tabs.Panel value="reviews">
          {/* Reviews content */}
        </Tabs.Panel>
        <Tabs.Panel value="specs">
          {/* Specs content */}
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
```

## Why it's built this way

- **Real components only.** `Tabs` (compound: `Root / List / Item / Panel / Indicator`) and `Link` are actual OneUI exports. Breadcrumb is deliberately hand-composed because OneUI ships no Breadcrumb — the guide is explicit about not hallucinating one.
- **Right tool for scope.** Tabs = in-screen view switching. The Description/Reviews/Specs sections live on the same product page, so Tabs is correct (a `BottomNavigation` would wrongly imply top-level app destinations).
- **One clear "you are here."** Breadcrumb marks the current page with `aria-current="page"` + `--Text-Medium` (not a link); Tabs marks the active section with the `primary` accent + `Indicator`. Active never uses the `secondary` role.
- **Navigation = None/Low attention, default surface.** No bold surfaces, no brand wash on the chrome — neutral text tokens (`--Text-Low` separators, `--Text-Medium` current crumb). Attention budget is reserved for the product content below.
- **Tokens only.** Spacing (`--Spacing-2` / `--Spacing-6`), `Label`-role typography for the breadcrumb (`--Label-S-FontSize` / `--Label-S-LineHeight` / `--Label-FontWeight-Medium`), and `--Typography-Font-Primary` for brand-font portability. No literals. Tabs supplies its own `Label`-role typography internally.

> Note: the import path `@oneui/ui` and route hrefs (`/`, `/shop`) are placeholders — wire them to your app's router. The composition (which components, which roles, which tokens) is the load-bearing part.
