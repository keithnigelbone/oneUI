# Product Listing Page (OneUI)

A responsive product grid with image, title, and price, preceded by a row of toggleable filter chips. Built per OneUI composition rules: **content is hero**, so the entire page stays on the `default` surface — no card fills, no competing backgrounds. The products' imagery, names, and prices are the focal point; filter chips provide quiet interaction.

## TSX

```tsx
import { Chip } from '@oneui/ui';

const FILTERS = ['All', 'Groceries', 'Fruits', 'Vegetables', 'Dairy', 'Bakery'];

const PRODUCTS = [
  { id: '1', name: 'Organic Bananas',     price: '₹49',  img: '/img/bananas.jpg' },
  { id: '2', name: 'Farm Fresh Eggs',     price: '₹89',  img: '/img/eggs.jpg' },
  { id: '3', name: 'Whole Wheat Bread',   price: '₹45',  img: '/img/bread.jpg' },
  { id: '4', name: 'Almond Milk 1L',      price: '₹199', img: '/img/almond-milk.jpg' },
  { id: '5', name: 'Cherry Tomatoes',     price: '₹79',  img: '/img/tomatoes.jpg' },
  { id: '6', name: 'Greek Yogurt',        price: '₹129', img: '/img/yogurt.jpg' },
  { id: '7', name: 'Baby Spinach',        price: '₹59',  img: '/img/spinach.jpg' },
  { id: '8', name: 'Dark Chocolate 70%',  price: '₹249', img: '/img/chocolate.jpg' },
];

export function ProductListingPage() {
  const [active, setActive] = React.useState('All');

  return (
    <main
      style={{
        padding: 'var(--Spacing-Margin)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-3XL)',
        fontFamily: 'var(--Typography-Font-Primary)',
      }}
    >
      {/* Page header — default background, navigation/identity only */}
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
          Daily Essentials
        </h1>
      </header>

      {/* Filter chips — horizontal scroll on mobile, secondary accent role */}
      <nav
        aria-label="Filter products"
        style={{
          display: 'flex',
          gap: 'var(--Spacing-3XS)',
          overflowX: 'auto',
          paddingBottom: 'var(--Spacing-5XS)',
        }}
      >
        {FILTERS.map((label) => (
          <Chip
            key={label}
            appearance="secondary"
            variant={active === label ? 'bold' : 'ghost'}
            onClick={() => setActive(label)}
            style={{ flex: '0 0 auto' }}
          >
            {label}
          </Chip>
        ))}
      </nav>

      {/* Product grid — default surface, no card fills (content is hero) */}
      <section
        aria-label="Products"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--Spacing-2XL)',
        }}
      >
        {PRODUCTS.map((p) => (
          <article
            key={p.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-3XS)',
            }}
          >
            <img
              src={p.img}
              alt={p.name}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: 'var(--Shape-M)',
                display: 'block',
              }}
            />

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
              {p.name}
            </h3>

            <p
              style={{
                margin: 0,
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Body-S-FontSize)',
                lineHeight: 'var(--Body-S-LineHeight)',
                fontWeight: 'var(--Body-FontWeight-Medium)',
                color: 'var(--Text-Medium)',
              }}
            >
              {p.price}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

## Composition decisions

**Surface — `default` everywhere.** Following the White Canvas Rule: the entire page stays on the page surface. Product imagery is the hero, so cards get **no fills and no strokes** — a tinted/bordered card would compete with the photography. No `<Surface>` wrapper is needed because nothing sits on a non-default background.

**Filter chips — `secondary` appearance.** Chips use the secondary (accent) role, not the primary action color — they're a selection affordance, not the page's main CTA. The active chip is `variant="bold"`; inactive chips are `variant="ghost"` (transparent fill, readable tinted text). Pill shape and chip padding come from the `Chip` component's own tokens. Mobile gets horizontal scroll via `overflow-x: auto` with `flex: 0 0 auto` chips.

**Typography — role-explicit tokens, each size paired with its line-height and `font-family: var(--Typography-Font-Primary)`:**
- Page title → `Headline-L` (FontSize / LineHeight / FontWeight)
- Product name → `Title-S` (compact card title)
- Price → `Body-S` with `--Body-FontWeight-Medium`, set in `--Text-Medium` so it reads as supporting metadata under the name

**Color — context-aware tokens only.** `--Text-High` for names/title, `--Text-Medium` for prices. No hard-coded hex.

**Spacing — adaptive grid + f-step gaps:**
- `--Spacing-Margin` for the page margin (auto-adapts per platform breakpoint)
- `--Spacing-3XL` between the header, filter row, and grid (section rhythm)
- `--Spacing-2XL` grid gutter between product cards
- `--Spacing-3XS` between chips, and between each card's image/name/price

**Shape — `--Shape-M` (16px)** on product images for moderate, friendly rounding consistent with small-card guidance. Chips inherit `--Shape-Pill` from the component.

**Attention pyramid.** No `bold` surface and no primary CTA on the page — a listing page is a *None/Low* attention screen by design. Emphasis is reserved for the product imagery and the single active filter chip, keeping the grid calm and scannable.

### Notes
- `Chip` is imported from `@oneui/ui`; swap `img` for the project's `Image` component if you want managed loading/aspect handling — the token styling stays identical.
- Adding per-card "Add to Cart" actions? Use one `<Button variant="bold" appearance="primary" size="s">` per card (one CTA per card) — that's the only place a bold/primary element belongs on this screen.
- Zero literals except the layout primitives the system permits (`0`, `100%`, `auto-fill`/`minmax` track sizing, and the `aspect-ratio` ratio). All color, type, spacing, and shape values resolve through design tokens.
```
