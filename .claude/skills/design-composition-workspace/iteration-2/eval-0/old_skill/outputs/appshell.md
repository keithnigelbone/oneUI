# E-commerce App Shell — Responsive Navigation (OneUI)

Top-level destinations: **Home · Shop · Cart · Account**.

The OneUI design system already ships real navigation primitives, so this app shell composes them rather than hand-rolling nav. The key responsive decision is to use **two different real components for the two form factors**, driven by one source of truth (the active destination + the breakpoint):

- **Desktop** → `WebHeader` + `PrimaryNav` + `HeaderItem` (a top bar with inline nav items, search, and avatar).
- **Mobile** → `BottomNavigation` + `BottomNavItem` (a thumb-reachable bottom tab bar) plus a slim top `WebHeader` (`contextBar`) for the logo + cart action.

Both read from the same `active` state and the same `DESTINATIONS` array, so there is exactly one navigation model and zero drift between platforms.

---

## TSX

```tsx
'use client';

import { useState } from 'react';
import {
  WebHeader,
  PrimaryNav,
  HeaderItem,
  BottomNavigation,
  BottomNavItem,
  IconButton,
  CounterBadge,
  Avatar,
  Logo,
  useBreakpoint,
  isDesktopBreakpoint,
} from '@oneui/ui';

// ── Single source of truth for navigation ────────────────────────────────
type DestinationKey = 'home' | 'shop' | 'cart' | 'account';

const DESTINATIONS: Array<{
  key: DestinationKey;
  label: string;
  href: string;
  icon: string;       // SemanticIconName
  activeIcon: string; // filled variant for the active tab
}> = [
  { key: 'home',    label: 'Home',    href: '/',        icon: 'home',    activeIcon: 'home-filled' },
  { key: 'shop',    label: 'Shop',    href: '/shop',    icon: 'grid',    activeIcon: 'grid-filled' },
  { key: 'cart',    label: 'Cart',    href: '/cart',    icon: 'cart',    activeIcon: 'cart-filled' },
  { key: 'account', label: 'Account', href: '/account', icon: 'user',    activeIcon: 'user-filled' },
];

export interface AppShellProps {
  children: React.ReactNode;
  cartCount?: number;
}

export function AppShell({ children, cartCount = 0 }: AppShellProps) {
  const [active, setActive] = useState<DestinationKey>('home');
  const breakpoint = useBreakpoint();
  const isDesktop = isDesktopBreakpoint(breakpoint);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // Page surface = default. Header/nav are navigation chrome (None attention),
        // never brand-colored. Content is the hero.
        backgroundColor: 'var(--Surface-Main)',
      }}
    >
      {/* ── TOP HEADER ─────────────────────────────────────────────────
          Desktop: full homeBar with inline nav items + search + avatar.
          Mobile:  slim contextBar — just logo + cart action; primary nav
                   moves to the bottom bar. */}
      <WebHeader variant="default" aria-label="Main site header">
        <PrimaryNav
          type={isDesktop ? 'homeBar' : 'contextBar'}
          middle={isDesktop ? 'fluid' : 'none'}
          searchInput={isDesktop ? 'end' : 'none'}
          searchPlaceholder="Search products"
          primaryNavItems={isDesktop}
          showAvatar={isDesktop}
          logo={<Logo size="s" aria-label="Shop home" />}
          activeValue={active}
          avatar={isDesktop ? <Avatar content="icon" icon="user" size="s" aria-label="Account" /> : undefined}
          end={
            // Cart action lives in the header end-slot on every breakpoint so
            // it's always one tap away. CounterBadge surfaces item count.
            <IconButton
              appearance="neutral"
              variant="low"
              aria-label={`Cart, ${cartCount} items`}
              onClick={() => setActive('cart')}
              start={
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {/* icon-only IconButton; badge overlays */}
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
                      <CounterBadge appearance="primary" size="s">{cartCount}</CounterBadge>
                    </span>
                  )}
                </span>
              }
            />
          }
        >
          {/* Inline destinations — only rendered on desktop (homeBar) */}
          {isDesktop &&
            DESTINATIONS.map((d) => (
              <HeaderItem
                key={d.key}
                value={d.key}
                href={d.href}
                active={active === d.key}
                attention={active === d.key ? 'high' : 'low'}
                onClick={() => setActive(d.key)}
                {...(d.key === 'cart' && cartCount > 0
                  ? { end: <CounterBadge appearance="primary" size="s">{cartCount}</CounterBadge>, endSize: 'S' }
                  : {})}
              >
                {d.label}
              </HeaderItem>
            ))}
        </PrimaryNav>
      </WebHeader>

      {/* ── PAGE CONTENT ───────────────────────────────────────────────
          Default surface throughout — the white canvas. Bottom padding on
          mobile reserves room for the fixed bottom nav. */}
      <main
        style={{
          flex: 1,
          paddingInline: 'var(--Spacing-Margin)',
          paddingBlockStart: 'var(--Spacing-2XL)',
          paddingBlockEnd: isDesktop ? 'var(--Spacing-7XL)' : 'var(--Spacing-9XL)',
        }}
      >
        {children}
      </main>

      {/* ── BOTTOM NAVIGATION (mobile only) ────────────────────────────
          Thumb-reachable tab bar. Same active state + same DESTINATIONS
          array as the desktop header → one navigation model, two surfaces.
          BottomNavigation owns its own surface; do NOT wrap in a colored div. */}
      {!isDesktop && (
        <BottomNavigation
          aria-label="Primary"
          labelType="1line"
          value={active}
          onValueChange={(v) => setActive(v as DestinationKey)}
          appearance="primary"
          showDivider
          style={{
            position: 'sticky',
            bottom: 0,
            // Bottom nav reads the page surface; primary appearance drives the
            // active-tab indicator color.
            backgroundColor: 'var(--Surface-Main)',
          }}
        >
          {DESTINATIONS.map((d) => (
            <BottomNavItem
              key={d.key}
              value={d.key}
              href={d.href}
              icon={d.icon}
              activeIcon={d.activeIcon}
              label={d.label}
              aria-label={d.label}
            />
          ))}
        </BottomNavigation>
      )}
    </div>
  );
}
```

---

## How navigation changes between mobile and desktop

| Concern | Desktop (`L`) | Mobile (`S` / `M`) |
|---------|---------------------|-----------------------------|
| Primary destinations | Inline `HeaderItem`s in `PrimaryNav` (`type="homeBar"`) | `BottomNavItem`s in a fixed `BottomNavigation` |
| Top bar | Full `homeBar`: logo, nav, search, avatar | Slim `contextBar`: logo + cart only |
| Search | Inline in header end-slot (`searchInput="end"`) | Hidden in chrome; lives on the Shop page itself |
| Active state | `HeaderItem active` + sliding indicator (`activeValue`) | `BottomNavigation value` + filled `activeIcon` |
| Cart | Header end-slot `IconButton` + `CounterBadge` everywhere; also a bottom tab on mobile | Bottom tab + header icon |

### Why this structure

1. **One navigation model, two renderers.** A single `active` state and one `DESTINATIONS` array feed both the `WebHeader`/`PrimaryNav` and the `BottomNavigation`. `useBreakpoint()` + `isDesktopBreakpoint()` (the design system's own breakpoint hook) choose which one is visible. No duplicated nav logic, no drift.

2. **Bottom nav on mobile is the OneUI convention.** `BottomNavigation` (2–5 items — we have exactly 4) is the thumb-reachable pattern for top-level destinations on phones. Desktop has horizontal room, so destinations live inline in the header where a bottom bar would waste vertical space.

3. **Header is navigation chrome → None attention.** Per the attention pyramid, the header and nav bars stay on the `default` surface with neutral text — no brand color. Brand accent (`primary` appearance) appears only on the **active-tab indicator** (the one place that legitimately signals "you are here" / the action color). The active `HeaderItem` uses `attention="high"`; inactive items use `attention="low"`.

4. **Real components own their own surface.** `WebHeader` and `BottomNavigation` are surface-aware OneUI components — they are never wrapped in a raw `<div style={{ background }}>`. The page itself is `var(--Surface-Main)` (the white canvas, 80–90% of the screen), letting product content be the hero.

5. **Cart is always reachable.** The cart count surfaces via `CounterBadge` (numeric, `primary`) in the header end-slot on all breakpoints, and as a dedicated bottom tab on mobile — so it's always one tap/click away without competing for attention.

6. **Tokens only.** Spacing uses `--Spacing-Margin` / `--Spacing-2XL` / `--Spacing-7XL` / `--Spacing-9XL` (the f-step scale, which adapts per platform and density). No hardcoded colors, sizes, or fonts — typography and color come from the components' own token wiring.

### Notes / wiring
- Icon names (`home`, `grid`, `cart`, `user`, and `*-filled`) are `SemanticIconName`s — swap for the exact names registered in your icon set.
- For real routing, give each destination an `href` (already wired) and replace the local `useState` with your router's active-path detection (e.g. `usePathname()` → derive `active`), keeping the same single-source-of-truth shape.
- `WebHeader` auto-detects the breakpoint internally for its own layout; passing `type`/`searchInput`/`primaryNavItems` based on `isDesktop` gives you explicit control over the mobile-vs-desktop nav split shown here.
