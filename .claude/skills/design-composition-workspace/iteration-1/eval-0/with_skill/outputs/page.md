# Product Listing Page — OneUI

A responsive product grid with filter chips, built to OneUI composition rules: **default (white) canvas throughout, content as hero, attention reserved for the one CTA per card.** Every spacing, shape, color, and type value is a design token — zero literals.

## Composition decisions

- **Surface: `default` everywhere.** Product imagery is the content hero, so no card fills, no tinted backgrounds. A raw white canvas lets the photos and prices breathe (the White Canvas Rule). No `<Surface>` wrapper is needed because nothing sits on a non-default background.
- **Filter chips → `secondary` appearance.** Chips are accent/selection moments, not the primary action color. The active chip uses `variant="bold"`, the rest `variant="ghost"` — one selected state, the rest quiet.
- **One CTA per card.** "Add" is the single `Button variant="bold" appearance="primary"` per card — the only High-attention element in each card. Everything else (title, price) is None/Low.
- **Typography roles:** `Headline-L` page title → `Title-S` product name → `Body-M` (high weight) price → `Body-S` (`--Text-Medium`) for the unit/meta line. Prices get emphasis weight because they're the decision-driving number.
- **Shape:** chips & buttons = `--Shape-Pill` (Jio identity); product image = `--Shape-4` (standard card rounding).
- **Spacing:** `--Spacing-Margin` for the page edge (auto-adapts per platform), `--Spacing-2` between chips, `--Spacing-4` grid gutter, `--Spacing-1`/`--Spacing-1-5` for the tight title→price stack.
- **Responsive grid:** `repeat(auto-fill, minmax(160px, 1fr))` reflows from 2-up on mobile to many columns on desktop without media queries. The horizontal-scrolling chip row handles narrow viewports.

## TSX

```tsx
import { Chip, Image, Button } from '@oneui/ui';

interface Product {
  id: string;
  name: string;
  unit: string;
  price: string;
  image: string;
}

interface ProductListingPageProps {
  title?: string;
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  products: Product[];
  onAddToCart: (id: string) => void;
}

export function ProductListingPage({
  title = 'Daily Essentials',
  filters,
  activeFilter,
  onFilterChange,
  products,
  onAddToCart,
}: ProductListingPageProps) {
  return (
    <main
      style={{
        padding: 'var(--Spacing-Margin)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-6)',
        // Default surface — white canvas. No background set: the page IS default.
      }}
    >
      {/* Page header — default background, navigation/title only, no brand color */}
      <header>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Headline-L-FontSize)',
            lineHeight: 'var(--Headline-L-LineHeight)',
            fontWeight: 'var(--Headline-L-FontWeight)',
            color: 'var(--Text-High)',
          }}
        >
          {title}
        </h1>
      </header>

      {/* Filter chips — horizontal scroll on mobile. Secondary role (accent, not primary CTA). */}
      <div
        role="group"
        aria-label="Filter products"
        style={{
          display: 'flex',
          gap: 'var(--Spacing-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--Spacing-1)',
        }}
      >
        {filters.map((filter) => {
          const selected = filter === activeFilter;
          return (
            <Chip
              key={filter}
              appearance="secondary"
              variant={selected ? 'bold' : 'ghost'}
              aria-pressed={selected}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Chip>
          );
        })}
      </div>

      {/* Product grid — responsive auto-fill, default background, no card fills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--Spacing-4)',
        }}
      >
        {products.map((product) => (
          <article
            key={product.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-2)',
            }}
          >
            {/* Image is the hero — moderate card rounding */}
            <Image
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: 'var(--Shape-4)',
              }}
            />

            {/* Title + price — tight stack, quiet typography */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-1)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--Typography-Font-Primary)',
                  fontSize: 'var(--Title-S-FontSize)',
                  lineHeight: 'var(--Title-S-LineHeight)',
                  fontWeight: 'var(--Title-S-FontWeight)',
                  color: 'var(--Text-High)',
                }}
              >
                {product.name}
              </h3>

              <span
                style={{
                  fontFamily: 'var(--Typography-Font-Primary)',
                  fontSize: 'var(--Body-S-FontSize)',
                  lineHeight: 'var(--Body-S-LineHeight)',
                  fontWeight: 'var(--Body-FontWeight-Low)',
                  color: 'var(--Text-Medium)',
                }}
              >
                {product.unit}
              </span>

              {/* Price — the decision-driving number, emphasis weight */}
              <span
                style={{
                  fontFamily: 'var(--Typography-Font-Primary)',
                  fontSize: 'var(--Body-M-FontSize)',
                  lineHeight: 'var(--Body-M-LineHeight)',
                  fontWeight: 'var(--Body-FontWeight-High)',
                  color: 'var(--Text-High)',
                }}
              >
                {product.price}
              </span>
            </div>

            {/* One CTA per card — the only High-attention element */}
            <Button
              variant="bold"
              appearance="primary"
              size="s"
              onClick={() => onAddToCart(product.id)}
              style={{ marginTop: 'var(--Spacing-1)' }}
            >
              Add
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
```

## Token recap

| Concern | Token(s) |
|---|---|
| Page margin / section gap | `--Spacing-Margin`, `--Spacing-6` |
| Chip gap / grid gutter | `--Spacing-2`, `--Spacing-4` |
| Title→price micro stack | `--Spacing-1` |
| Page title | `--Headline-L-FontSize` / `-LineHeight` / `-FontWeight` |
| Product name | `--Title-S-FontSize` / `-LineHeight` / `-FontWeight` |
| Price (emphasis) | `--Body-M-FontSize` + `--Body-FontWeight-High` |
| Unit/meta | `--Body-S-FontSize` + `--Body-FontWeight-Low` + `--Text-Medium` |
| Text color | `--Text-High`, `--Text-Medium` |
| Image rounding | `--Shape-4` |
| Font | `--Typography-Font-Primary` on every text element |

### Notes

- Chips and the Add button carry their own pill shape (`--Shape-Pill`) and color tokens internally via the OneUI components — no overrides needed.
- No `<Surface>` wrapper: the whole page is `default`, so children read root tokens directly. If a promotional/hero strip were added later, it would get a single `<Surface mode="bold">` — never a manual `background-color` on a div with interactive children.
- To pin a card to a non-primary role you'd add `appearance="secondary"` to its `Button`/`Chip`; the grid itself stays role-agnostic.
