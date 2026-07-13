# FOUC Prevention — Zero-Flash Brand Switching

> Flash of Unstyled Content (FOUC) occurs when a browser paints a component before the correct CSS tokens are available. This document describes the full 6-layer system that eliminates it on both initial page load and live brand switches.

## Problem Space

One UI Studio has three distinct FOUC scenarios:

| Scenario | Cause | Symptom |
|----------|-------|---------|
| **Initial load** | Brand CSS not in DOM before first paint | Page flickers from base tokens → brand tokens |
| **Brand switch** | CSS transition gap while Convex loads new data | Animated fade between brand colors |
| **Font flash** | `display=swap` reflows text when web font downloads | Text renders in system font, then jumps to brand font |

---

## Architecture: 6-Layer Defence

```
Layer 1  Blocking script (layout.tsx <head>)
  ↓
Layer 2  CSS Bridge — previousCSSRef in providers
  ↓
Layer 3  useInsertionEffect — CSS injected before DOM paint
  ↓
Layer 4  Transition suppression — data-brand-switching
  ↓
Layer 5  Preloader gate — waits for foundationData before dismiss
  ↓
Layer 6  Font display=optional — no font reflow on cached loads
```

---

## Layer 1: Blocking Script (Initial Load)

**File**: `apps/platform/src/app/layout.tsx`

A synchronous `<script>` in `<head>` runs before any CSS or React hydration:

```js
(function() {
  // 1. Restore theme attribute so CSS resolves correctly from first paint
  var t = localStorage.getItem('oneui-studio:theme');
  document.documentElement.setAttribute('data-mode', t === 'dark' ? 'dark' : 'light');

  // 2. Restore density attribute
  var d = localStorage.getItem('oneui-studio:density');
  document.documentElement.setAttribute('data-density',
    (d === 'compact' || d === 'open') ? d : 'default');

  // 3. Restore cached brand CSS (only for global/scoped scope)
  var scope = localStorage.getItem('oneui-studio:theme-scope');
  var bc = localStorage.getItem('oneui-studio:brand-css');
  if (bc && (scope === 'global' || scope === 'scoped')) {
    var s = document.createElement('style');
    s.id = 'oneui-foundation-tokens';  // Same ID used by React — found and updated in-place
    s.textContent = bc;
    document.head.appendChild(s);
  }
})();
```

**Critical detail**: The style element uses id `oneui-foundation-tokens`. When React mounts, `useStyleInjection` finds this element by ID and updates it in-place — there is no removal/re-insertion gap.

---

## Layer 2: CSS Bridge (Brand Switch)

**Files**: `FoundationStyleProvider.tsx`, `BrandStyleDecorator.tsx`, `ComponentOverrideInjector` (in `BrandStyleDecorator.tsx`)

`useBrandCSS` returns `null` while Convex loads new data (not `''`). Callers use a `previousCSSRef` bridge:

```ts
// null  = still loading  → keep previous CSS (no blank frame)
// ''    = intentionally empty (mode=none) → clear the style tag
// string = new CSS → inject immediately
const { cssContent } = useBrandCSS({ foundationData, theme, injectionMode });

const previousCSSRef = useRef<string>(
  // Initialize from DOM so blocking-script CSS is preserved on mount
  document.getElementById(STYLE_ELEMENT_ID)?.textContent ?? ''
);
const effectiveCSS = cssContent ?? previousCSSRef.current;
useEffect(() => {
  if (cssContent !== null) previousCSSRef.current = cssContent;
}, [cssContent]);
```

The distinction between `null` (loading) and `''` (intentional empty) is why `??` is used instead of `||`.

---

## Layer 3: useInsertionEffect

**File**: `packages/ui/src/hooks/useStyleInjection.ts`

```ts
export function useStyleInjection(styleId: string, css: string): void {
  useInsertionEffect(() => {
    // Runs synchronously before React mutates the DOM —
    // CSS is ready before any component reads var(--Token-Name)
    elRef.current.textContent = next;
    // ... transition blocking + brand-ready signal
  }, [styleId, css]);
}
```

Both foundation CSS (`FoundationStyleProvider` / `BrandStyleInjector`) and component override CSS (`ComponentOverrideInjector`) use this hook. They inject in the **same `useInsertionEffect` phase**, so there is no inter-frame lag between them.

> **Why not `useEffect`?** `useEffect` runs after paint. `useInsertionEffect` runs synchronously before React touches the DOM, guaranteeing CSS is applied before component layout is calculated.

---

## Layer 4: Transition Suppression

**Files**: `apps/platform/src/app/layout.tsx` (inline `<style>`), `apps/storybook/.storybook/preview.css`

While `useStyleInjection` swaps CSS content, it sets `data-brand-switching` on `<html>` for one frame:

```ts
document.documentElement.setAttribute('data-brand-switching', 'true');
elRef.current.textContent = next;
requestAnimationFrame(() =>
  document.documentElement.removeAttribute('data-brand-switching')
);
```

CSS rule suppresses all transitions during that frame:

```css
[data-brand-switching],
[data-brand-switching] * {
  transition: none !important;
}
```

This rule exists in **both** the platform (inlined in `<head>` before any stylesheet) and Storybook (`preview.css`). Without it in Storybook, brand switches animated instead of snapping.

---

## Layer 5: Preloader Gate

**File**: `apps/platform/src/app/(platform)/layout.tsx`

The app preloader does not dismiss until `foundationData` is available — ensuring brand CSS is injected before users see any UI:

```ts
useEffect(() => {
  if (brands === undefined) return;
  if (!currentBrand) return;
  if (foundationData === undefined) return;   // ← gates on brand CSS
  window.dispatchEvent(new CustomEvent('oneui:app-ready'));
}, [brands, currentBrand, foundationData]);
```

A secondary optimisation caches `last-brand-id` in localStorage so `FoundationStyleProvider` can start its Convex query immediately on next load — before the brand list resolves:

```ts
// PlatformContext.tsx — persists brand ID on every brand change
localStorage.setItem('oneui-studio:last-brand-id', brand.id);

// FoundationStyleProvider.tsx — uses cached ID as fallback
const cachedBrandId = useRef<string | undefined>(
  localStorage.getItem('oneui-studio:last-brand-id') ?? undefined
);
const brandId = (currentBrand?.id ?? cachedBrandId.current) as Id<'brands'> | undefined;
```

---

## Layer 6: Font Display

**Files**: `packages/ui/src/components/Foundations/Typography/fonts.ts`, `apps/platform/src/app/layout.tsx`

```
display=optional   ← used
display=swap       ← NOT used
```

`display=optional` gives the browser ~100ms to use a cached font. On repeat visits (brand already loaded), the brand font appears instantly with zero reflow. On cold first load, the browser uses the system fallback — no text jumps.

`display=swap` was removed because it guarantees a reflow: text renders in fallback, downloads finish, then text re-renders in the brand font. That is a font flash by design.

---

## Storybook vs. Platform Differences

| Feature | Platform | Storybook |
|---------|----------|-----------|
| Blocking script | `<script>` in `<head>` (Next.js layout) | Not applicable |
| Preloader gate | `AppPreloader` + `oneui:app-ready` event | Not applicable |
| Brand CSS injection | `FoundationStyleProvider` → `useStyleInjection` | `BrandStyleInjector` → `useStyleInjection` |
| Component CSS injection | Platform editor injects via `useStyleInjection` | `ComponentOverrideInjector` → `useStyleInjection` |
| Transition suppression | Inlined `<style>` in `<head>` | `preview.css` rule |
| Loading guard | `AppPreloader` hides content | `.story-wrapper-loading` + `[data-brand-ready]` |

---

## Data Flow on Brand Switch

```
User selects new brand
  → PlatformContext.setCurrentBrand()
  → foundationData briefly = undefined (Convex loading)
      ↓
  useBrandCSS returns null
      ↓
  effectiveCSS = previousCSSRef.current  (bridge holds old CSS)
      ↓
  useStyleInjection: no change (same CSS, no write)
      ↓
  Convex resolves new foundationData
      ↓
  useBrandCSS returns new CSS string
      ↓
  effectiveCSS = new CSS
      ↓
  useStyleInjection:
    1. data-brand-switching = true       (suppress transitions)
    2. style.textContent = new CSS       (atomic swap in useInsertionEffect)
    3. data-brand-ready = true           (signal story wrapper to show)
    4. rAF: remove data-brand-switching  (re-enable transitions next frame)
```

---

## Regression Tests

All invariants are verified by `packages/ui/src/engine/__tests__/fouc-prevention.test.ts`.

| Test | What It Verifies |
|------|-----------------|
| Test 2 | Blocking script checks `theme-scope` before restoring cache; uses `oneui-foundation-tokens` ID |
| Test 3 | `useBrandCSS` returns `null` for loading, `''` for `mode=none` |
| Test 4 | `useBrandCSS` calls `wrapCSSForInjection` |
| Test 5 | Both providers use `??` bridge (not `\|\|`) |
| Test 6 | Storybook: no `key={brandId}` remount on `BrandStyleInjector` |
| Test 6b | `FoundationStyleProvider` uses `useStyleInjection`, no `dangerouslySetInnerHTML` |
| Test 6c | HMR ping errors are suppressed |
| Test 7 | Preloader gates on `foundationData` |
| Test 10 | `preview.css` contains `[data-brand-switching]` transition suppression |
| Test 11 | `ComponentOverrideInjector` uses `useStyleInjection`, no `dangerouslySetInnerHTML` |
| Test 12 | `display=optional` in both `fonts.ts` and `layout.tsx` |

Run with:
```bash
pnpm --filter @oneui/ui test -- --run src/engine/__tests__/fouc-prevention.test.ts
```

---

## What NOT to Do

| Anti-pattern | Why |
|--------------|-----|
| Reset `data-brand-ready` during switches | The bridge keeps old CSS visible — hiding content during the 200–500ms Convex query is worse UX |
| Brand-switch loading overlay | Transition blocking + bridge is sufficient; an overlay adds latency |
| Gate content on font readiness | `display=optional` handles this without blocking render |
| Use `useEffect` for CSS injection | Runs after paint — use `useInsertionEffect` |
| Use `\|\|` instead of `??` for bridge | `\|\|` treats `''` (intentional empty) as falsy — use `??` |
| `dangerouslySetInnerHTML` for style tags | React controls removal/insertion timing — use `useStyleInjection` |
| Different style element IDs between script and React | Creates a DOM gap on hydration — both must use `oneui-foundation-tokens` |
