# Navigation & App Structure — OneUI

How to structure navigation in OneUI apps: which real components exist, when to use each, how the app shell changes across breakpoints, and the conventions that keep navigation legible. Grounded in the components that actually ship in `packages/ui` — it does **not** invent components.

## The navigation components that exist

Use these. Do not reach for components OneUI doesn't have (see "What doesn't exist" below).

| Component | Role | Key props / shape | Active state |
|-----------|------|-------------------|--------------|
| **Tabs** | Switch between sibling views *within the same screen/context* | Compound: `Tabs.Root / List / Item / Panel / Indicator`. `orientation` horizontal\|vertical, `size` s/m/l, `appearance` (multi-accent) | Active item → role accent (`--{Role}-TintedA11y`) + sliding `Indicator` |
| **BottomNavigation** | Primary **mobile** app navigation between top-level destinations | Compound: `BottomNavigation` + `BottomNavItem`. `labelType` none\|1line\|2line, `value`, `showDivider`, `appearance`. **2–5 destinations** | Active item → content `high`; inactive → `low` |
| **WebHeader** | Top app bar + primary navigation on **larger screens** | `WebHeader.PrimaryNav / SecondaryNav / Item`. `variant` default\|transparent\|glass\|hidden\|stickyHidden. Responsive; collapses to a `MobileDrawer` (menu button) at small breakpoints | `WebHeader.Item active` → `aria-current="page"` + indicator |
| **NavigationMenu** | Dropdown / mega-menu navigation (grouped links under triggers) | Compound: `Item / Trigger / Content / Link / Viewport`. `orientation` horizontal\|vertical | Controlled `value` |
| **Menu** | Contextual / overflow action menu (not primary nav) | Compound: `Trigger / Item / Separator / Group`. `side`, `align` | — |
| **ToggleGroup** | Segmented control — switch a *view mode/filter*, not navigate pages | Compound: `ToggleGroup.Item`. `toggleMultiple`, `fullWidth`, neutral appearance | Selected item highlighted |
| **Pagination** | Move through pages of results | `totalPages`, `page`, `siblingCount`, `boundaryCount`, `showFirstLast/PrevNext`, `attention` high/med/low, `appearance` | Selected page → appearance accent + bold |
| **Link** / **LinkButton** | Inline or standalone text navigation | `Link` = semantic `<a>` (`external` adds icon); `LinkButton` = semantic `<button>` with variants/attention/appearance | — |

## What does NOT exist (don't hallucinate it)

- **Breadcrumb / Breadcrumbs** — no component. Build from `Link` + a separator (`/` or chevron icon), styled with neutral text tokens.
- **Sidebar / NavRail (desktop side nav)** — no component. Compose one from a vertical `Tabs` (`orientation="vertical"`) or a column of `NavigationMenu` / `Link` items inside your own layout container.
- **AppBar / TopBar** — use **WebHeader** instead.
- **Drawer (standalone)** — there's no general Drawer; WebHeader ships a `MobileDrawer` for its own collapsed nav. For other drawer needs, compose with a Dialog/Sheet + surface.
- **Stepper is a trap** — the `Stepper` component is a **numeric +/− input**, NOT a wizard/step indicator. For a multi-step flow indicator, compose it from `Tabs` (disabled non-current) or a custom row; do not use `Stepper`.

## The app-shell model by breakpoint

OneUI uses discrete breakpoints (`data-Breakpoint`: S / M / L). Navigation **changes shape** across them — this is the core structural rule:

| Breakpoint | Primary navigation | Pattern |
|-----------|--------------------|---------|
| **S** (mobile) | `BottomNavigation` (2–5 top-level destinations) + a minimal `WebHeader` (or just a title) that collapses extra nav into the `MobileDrawer` menu button | Thumb-reachable bottom bar is the spine; the top is light |
| **M** (tablet/landscape) | `WebHeader.PrimaryNav` becomes viable; bottom nav can give way to a header nav or a composed vertical nav | Transition zone — pick one primary nav, not both |
| **L** (desktop) | `WebHeader.PrimaryNav` (+ optional `SecondaryNav`), or a composed vertical side nav for app-dense products | Full horizontal nav; generous margins |

**Rule:** one primary navigation surface per breakpoint. Don't show a bottom nav *and* a full header nav simultaneously — that's two competing maps. Let the layout swap them at the breakpoint.

## Conventions that keep navigation legible

These are the fundamentals — apply them every time:

1. **Active = `primary`, inactive = neutral.** The active destination/tab uses the primary role accent; inactive items use neutral content tokens (`Text-Medium`/`Low`). Never use the `secondary` role to signal active navigation — secondary is for non-interactive accents, and using it for active state reads as a different meaning.
2. **Navigation is None/Low attention infrastructure.** Users look *through* navigation to get somewhere, not *at* it. It sits at the bottom of the attention pyramid. Don't spend brand color or bold surfaces on the nav chrome itself — save the attention budget for content and the primary action.
3. **Headers stay on the default surface.** A header's job is wayfinding, not brand expression. Keep it `default` (or `transparent`/`glass` WebHeader variants over media). Putting a brand-colored surface on a header wastes attention and hurts scannability. (For *which* surface a header/nav region should use, the `surface` skill is the authority — but the default answer for nav chrome is `default`.)
4. **Label typography = `Label` role.** All nav item text (tabs, bottom nav, header items, segmented controls) uses the `Label` role at Medium weight (`--Label-M-FontSize` / `--Label-S-FontSize`, `--Label-FontWeight-Medium`), never Body or Display.
5. **Tabs vs BottomNav vs Header — pick by scope:**
   - **Tabs** = switching views *inside one screen/section* (e.g. "Overview / Activity / Settings" of a profile). Not for top-level app destinations.
   - **BottomNavigation** = top-level app destinations on mobile (2–5).
   - **WebHeader nav** = top-level destinations on larger screens.
   - **ToggleGroup** = a view-mode/filter switch (grid vs list), not navigation.
   - **Menu / NavigationMenu** = overflow or grouped secondary links.
6. **2–5 top-level destinations.** If you need more than ~5, the information architecture is too flat — group destinations and use a drawer/overflow, don't cram the bottom nav.
7. **One clear "you are here."** Every navigation surface must make the current location obvious (active styling + `aria-current="page"`). Ambiguous active state is the most common nav failure.
8. **Accessibility is non-negotiable.** Nav landmarks (`<nav aria-label>`), `aria-current` on the active item, 44×44px touch targets on mobile, visible focus (the focus-halo pattern), and keyboard operability come from using the real components — another reason not to hand-roll nav from raw divs.

## Worked patterns

### Mobile app shell
```tsx
// Bottom nav is the spine; header is minimal. 3 top-level destinations.
<BottomNavigation value={active} onValueChange={setActive} labelType="1line">
  <BottomNavItem value="home"    icon={<HomeIcon />}    label="Home" />
  <BottomNavItem value="explore" icon={<ExploreIcon />} label="Explore" />
  <BottomNavItem value="account" icon={<AccountIcon />} label="Account" />
</BottomNavigation>
```

### In-screen view switching (NOT top-level nav)
```tsx
<Tabs.Root value={view} onValueChange={setView}>
  <Tabs.List>
    <Tabs.Item value="overview">Overview</Tabs.Item>
    <Tabs.Item value="activity">Activity</Tabs.Item>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="activity">…</Tabs.Panel>
</Tabs.Root>
```

### Breadcrumb (composed — no component exists)
```tsx
<nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 'var(--Spacing-2)', alignItems: 'center' }}>
  <Link href="/">Home</Link>
  <span aria-hidden style={{ color: 'var(--Text-Low)' }}>/</span>
  <Link href="/products">Products</Link>
  <span aria-hidden style={{ color: 'var(--Text-Low)' }}>/</span>
  <span style={{ color: 'var(--Text-Medium)' }} aria-current="page">Running shoes</span>
</nav>
```

## The one-line summary
Navigation is quiet wayfinding infrastructure: use the real components, swap the shell shape by breakpoint (bottom nav on mobile, WebHeader on desktop), mark active with the `primary` role + `aria-current`, keep the chrome on the default surface, and spend the attention budget on content — not the map.
