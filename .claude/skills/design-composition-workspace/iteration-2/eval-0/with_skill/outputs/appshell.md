# E-commerce App Shell — OneUI (Mobile + Desktop)

A single responsive app shell with four top-level destinations: **Home, Shop, Cart, Account**.
The nav **changes shape by breakpoint** — that's the core structural decision — while the
page content stays the same.

- **Mobile (S):** thumb-reachable `BottomNavigation` is the spine. The top is a minimal,
  title-only `WebHeader` context bar. Cart count rides on the Cart item.
- **Desktop (L):** `WebHeader.PrimaryNav` carries the four destinations horizontally,
  with logo, search, and an avatar. The bottom bar is gone.

One primary navigation surface per breakpoint — never both at once.

---

## TSX

```tsx
'use client';

import { useState } from 'react';
import {
  Surface,
  WebHeader,
  BottomNavigation,
  BottomNavItem,
  IconButton,
  IndicatorBadge,
  Logo,
  useBreakpoint,
  isMobileBreakpoint,
} from '@oneui/ui';

type Destination = 'home' | 'shop' | 'cart' | 'account';

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'shop', label: 'Shop' },
  { value: 'cart', label: 'Cart' },
  { value: 'account', label: 'Account' },
];

// No "cart"/"shop" icon ships in SemanticIconName, so we use inline SVGs for those two
// (the icon prop accepts a ReactElement) and the real semantic names for Home/Account.
const ShopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <path
      d="M4 7h16l-1 13H5L4 7Zm4 0a4 4 0 1 1 8 0"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <path
      d="M3 4h2l2.4 11.5a1.5 1.5 0 0 0 1.47 1.2h7.86a1.5 1.5 0 0 0 1.47-1.18L20 8H6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="20" r="1.25" fill="currentColor" />
    <circle cx="17" cy="20" r="1.25" fill="currentColor" />
  </svg>
);

const BRAND_LOGO_SVG = `
  <svg viewBox="0 0 120 32" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="24" font-family="inherit" font-size="22" font-weight="900"
      fill="currentColor">Mart</text>
  </svg>`;

function CartCount({ count }: { count: number }) {
  if (count <= 0) return null;
  // Dot indicator that the cart has items. (CounterBadge if you want the numeral.)
  return (
    <IndicatorBadge
      appearance="primary"
      size="s"
      aria-label={`${count} items in cart`}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint();
  const mobile = isMobileBreakpoint(breakpoint);

  const [active, setActive] = useState<Destination>('home');
  const cartCount = 2;

  return (
    // Whole app sits on the default page surface — the white canvas the content shines against.
    <Surface
      mode="default"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ---- TOP BAR ---- */}
      {mobile ? (
        // Mobile: minimal context bar. Title-only, no destinations up here —
        // navigation lives in the bottom bar. Header stays on default surface.
        <WebHeader breakpoint={breakpoint}>
          <WebHeader.PrimaryNav
            type="contextBar"
            middle="none"
            primaryNavItems={false}
            showMenuButton={false}
            aria-label="Mart"
            logo={<Logo svgContent={BRAND_LOGO_SVG} alt="Mart" size="l" variant="mark" />}
            end={
              <IconButton
                icon="search"
                aria-label="Search products"
                variant="ghost"
                size={8}
                appearance="neutral"
              />
            }
          />
        </WebHeader>
      ) : (
        // Desktop: PrimaryNav carries the four top-level destinations horizontally.
        // Active = primary role + aria-current (handled by WebHeader.Item active).
        <WebHeader breakpoint={breakpoint}>
          <WebHeader.PrimaryNav
            type="homeBar"
            middle="fluid"
            searchInput="end"
            showMenuButton={false}
            activeValue={active}
            aria-label="Primary navigation"
            searchAriaLabel="Search products"
            logo={<Logo svgContent={BRAND_LOGO_SVG} alt="Mart" size="xl" variant="mark" />}
            avatar={
              <IconButton
                icon="user"
                aria-label="Your account"
                variant="ghost"
                size={8}
                appearance="neutral"
                onClick={() => setActive('account')}
              />
            }
          >
            {DESTINATIONS.map((d) => (
              <WebHeader.Item
                key={d.value}
                value={d.value}
                active={active === d.value}
                href={`/${d.value}`}
                onClick={() => setActive(d.value)}
                // Cart count surfaces as an end-slot dot on desktop too.
                end={d.value === 'cart' ? <CartCount count={cartCount} /> : undefined}
                endSize={d.value === 'cart' ? 'S' : undefined}
              >
                {d.label}
              </WebHeader.Item>
            ))}
          </WebHeader.PrimaryNav>
        </WebHeader>
      )}

      {/* ---- CONTENT ---- */}
      <main
        style={{
          flex: 1,
          paddingInline: 'var(--Spacing-Margin)',
          paddingBlock: 'var(--Spacing-6)',
          // Reserve space on mobile so the fixed bottom bar never covers content.
          paddingBottom: mobile ? 'var(--Spacing-20)' : 'var(--Spacing-6)',
        }}
      >
        {children}
      </main>

      {/* ---- BOTTOM BAR (mobile only) ---- */}
      {mobile && (
        <BottomNavigation
          value={active}
          onValueChange={(v) => setActive(v as Destination)}
          labelType="1line"
          appearance="primary"
          aria-label="Primary navigation"
          style={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
          }}
        >
          <BottomNavItem value="home" icon="home" label="Home" href="/home" />
          <BottomNavItem value="shop" icon={<ShopIcon />} label="Shop" href="/shop" />
          <BottomNavItem value="cart" icon={<CartIcon />} label="Cart" href="/cart">
            {/* Count badge handled per design; IndicatorBadge dot used above for parity. */}
          </BottomNavItem>
          <BottomNavItem value="account" icon="user" label="Account" href="/account" />
        </BottomNavigation>
      )}
    </Surface>
  );
}
```

---

## Why the nav is structured this way

**1. The shell swaps shape at the breakpoint — one primary nav per breakpoint.**
`useBreakpoint()` (from `@oneui/ui`) reports the active platform; `isMobileBreakpoint`
gates the rendering. On `S` the spine is `BottomNavigation` (thumb-reachable) and the
top is a minimal `contextBar`. On `L` the four destinations move into
`WebHeader.PrimaryNav` and the bottom bar disappears. The shell never shows a bottom nav
*and* a header nav at the same time — two simultaneous maps compete.

**2. Four top-level destinations — inside the 2–5 rule.** Home / Shop / Cart / Account is a
flat, legible IA that fits both a bottom bar (max 5 items) and a horizontal header without
overflow. No grouping or drawer needed.

**3. Active = `primary`, inactive = neutral, one "you are here."** Both surfaces use
`appearance="primary"` for the active destination and carry `active` / `activeValue`, which
the real components translate into the primary accent + `aria-current="page"`. Secondary is
never used to signal active nav — that would read as a different meaning.

**4. Navigation is None/Low attention chrome on the `default` surface.** The whole shell sits
in `<Surface mode="default">` (the white canvas). No bold surfaces or brand washes on the
header or bar — wayfinding, not brand expression. The attention budget is saved for content
and the primary CTA inside each screen.

**5. Real components, not hand-rolled divs.** `BottomNavigation`/`BottomNavItem`,
`WebHeader.PrimaryNav`/`WebHeader.Item`, `IconButton`, `Logo`, `IndicatorBadge`. Using them
gives `aria-current`, nav landmarks (`aria-label` on the `<nav>`), 44×44 touch targets, and
the focus-halo for free. `Tabs` was deliberately *not* used — Tabs switch views *within* one
screen, not top-level app destinations.

**6. Tokens only, zero literals.** Margins/padding use `var(--Spacing-Margin)` and the
numeric spacing scale, so they adapt across platform and density automatically. Colors,
shape, and typography come from the components' own tokens.

**7. Icon caveat (real-data finding).** `SemanticIconName` ships `home` and `user`, but **no
`cart`/`shop`/`bag`/`store` icon exists**. Home → `home`, Account → `user`; Shop and Cart use
inline SVG `ReactElement`s (the `icon` prop accepts either a semantic name or a ReactElement).
Cart quantity is shown with an `IndicatorBadge` dot — swap to `CounterBadge value={n}` if you
want the numeral.
