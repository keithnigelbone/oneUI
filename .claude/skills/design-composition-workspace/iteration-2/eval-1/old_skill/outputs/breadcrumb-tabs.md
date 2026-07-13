# Product Detail Page — Breadcrumb + Section Tabs (OneUI TSX)

```tsx
import { useState } from 'react';
import { Link } from '@oneui/ui';
import { Text } from '@oneui/ui';
import { Icon } from '@oneui/ui';
import { TabGroup, TabItem, TabPanel } from '@oneui/ui';

/**
 * Product detail page header region:
 *  - Breadcrumb trail (Home / Shop / Running shoes)
 *  - Section tab navigation (Description / Reviews / Specs)
 *
 * OneUI has no dedicated Breadcrumb component, so the trail is composed from
 * Link (navigable ancestors) + a low-attention Text separator + a current-page
 * Text node. This keeps it inside the token system and surface-aware cascade.
 */
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
      {/* Breadcrumb — navigation chrome, attention = None */}
      <nav aria-label="Breadcrumb">
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--Spacing-2)',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <Link href="/" size="small">
              Home
            </Link>
          </li>

          <li aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-right" size="small" />
          </li>

          <li>
            <Link href="/shop" size="small">
              Shop
            </Link>
          </li>

          <li aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-right" size="small" />
          </li>

          {/* Current page — not a link, de-emphasised, marked current */}
          <li>
            <Text
              as="span"
              variant="label"
              size="S"
              weight="medium"
              attention="medium"
              aria-current="page"
            >
              Running shoes
            </Text>
          </li>
        </ol>
      </nav>

      {/* Section navigation — primary role, controlled */}
      <TabGroup
        value={section}
        onValueChange={(v) => setSection(String(v))}
        appearance="primary"
        size="m"
      >
        <TabItem value="description">Description</TabItem>
        <TabItem value="reviews">Reviews</TabItem>
        <TabItem value="specs">Specs</TabItem>
      </TabGroup>

      <TabPanel value="description">
        <Text variant="body" size="M" weight="low">
          Engineered for everyday miles — breathable knit upper, responsive foam
          midsole, and a durable rubber outsole.
        </Text>
      </TabPanel>

      <TabPanel value="reviews">
        <Text variant="body" size="M" weight="low">
          Customer reviews go here.
        </Text>
      </TabPanel>

      <TabPanel value="specs">
        <Text variant="body" size="M" weight="low">
          Weight, drop, materials, and sizing details go here.
        </Text>
      </TabPanel>
    </div>
  );
}
```

## Notes

- **No native Breadcrumb component.** OneUI ships `Link`, `Text`, `Icon`, and `TabGroup`/`TabItem`/`TabPanel` — not a `Breadcrumb`. The trail is composed: `Link` for the navigable ancestors (`Home`, `Shop`), a `chevron-right` `Icon` separator marked `aria-hidden`, and a non-link `Text` with `aria-current="page"` for the current item (`Running shoes`). Wrapped in `<nav aria-label="Breadcrumb">` + an ordered list for semantics.

- **Attention budget.** Both regions are navigation chrome, so they live at the bottom of the attention pyramid (None/Low). The breadcrumb uses `size="small"` links and a `medium`-attention current label; the current page is intentionally quieter than the links, since it isn't actionable. No bold colour anywhere — brand emphasis is reserved for the product CTA below this region.

- **Default surface only.** This is header/navigation content, so it sits on the page `default` surface. No `<Surface>` wrapper is needed (and per the rules, headers stay on default — brand colour does not belong on navigation chrome).

- **Tabs are controlled + accessible.** `TabGroup` manages selection via `value` / `onValueChange`; each `TabPanel` is matched to its `TabItem` by the shared `value`. The compound API wires the `tab`↔`tabpanel` ARIA relationship and the surface-aware focus halo automatically. `appearance="primary"` makes the active-tab indicator use the brand action colour — the correct role for a navigation indicator.

- **Tokens, not literals.** All spacing comes from `--Spacing-*` tokens; the inline flex `style` blocks are layout-only (display/gap/list-reset), with no hard-coded colours, font sizes, or radii. Typography flows through `Text` variants/sizes (which alias the f-step typography tokens) rather than raw CSS.

- **Swap the placeholder panels** for your real Description / Reviews / Specs content. If a panel needs a grouped/tinted container (e.g. a specs table block), wrap that content in `<Surface mode="subtle">` rather than setting a background on a `div`.
