# External Sample App → QA Playground Migration Report

**Date:** 2026-05-29  
**Source of truth:** `/Users/prathip.kattekola/Documents/PrathipSample` (`prathip-sample`, branch `PK_ExternalSampleApp`)  
**Target:** `apps/qa-playground` in OneUiStudio monorepo

---

## Executive summary

QA Playground now embeds the **External Sample App** consumer surfaces (Home, Plans, Devices, Support, Account, Notifications, Rewards, Accessibility, Coverage, Showcase) with matching route paths and navigation hierarchy. The monorepo QA catalog moved from `/` to `/qa`, and component detail pages from `/c/:slug` to `/qa/c/:slug` (with `/c/:slug` kept for Playwright backward compatibility).

The sample app uses a **`@/debug/oneui` adapter** that wraps `@oneui/ui` components with the same `ComponentInspector` QA overlay pattern as the external repo.

---

## Route mapping (External Sample App → QA Playground)

| External path | QA Playground path | Status |
|---------------|-------------------|--------|
| `/` | `/` | ✅ `HomePage` |
| `/plans` | `/plans` | ✅ |
| `/devices` | `/devices` | ✅ |
| `/support` | `/support` | ✅ |
| `/account` | `/account` | ✅ |
| `/notifications` | `/notifications` | ✅ |
| `/rewards` | `/rewards` | ✅ |
| `/accessibility` | `/accessibility` | ✅ |
| `/coverage` | `/coverage` | ✅ Library coverage table |
| `/showcase` | `/showcase` | ✅ Component gallery |
| `/qa` | `/qa` | ✅ Monorepo `CatalogPage` (enhanced vs external) |
| `/qa/c/:slug` | `/qa/c/:slug` | ✅ Monorepo `ComponentDetailPage` |
| `/qa/coverage` | `/qa/coverage` | ⚠️ Temporary: reuses library `ComponentCoveragePage` |
| `/c/:slug` | `/c/:slug` | ✅ Alias for Playwright manifests |
| `/demo/jio` | → redirect `/` | ✅ Legacy monorepo demo removed |
| `/qa/dashboard` | `/qa/dashboard` | ✅ Notion bug dashboard (monorepo-only) |
| `/tools/performance` | `/tools/performance` | ✅ Perf harness (monorepo-only) |

---

## Files added

### `src/sample-app/` (54 files — ported from PrathipSample)

| Area | Files |
|------|-------|
| **Pages** | `HomePage`, `PlansPage`, `DevicesPage`, `SupportPage`, `AccountPage`, `NotificationsPage`, `RewardsPage`, `AccessibilityPage`, `ComponentCoveragePage`, `ComponentShowcasePage` (+ CSS modules) |
| **Layout / shell** | `layouts/SiteLayout`, `components/SiteHeader`, `SiteFooter`, `MobileTabBar`, `PageHeading`, `ThemeSettings`, `ThemeToggle`, `AdaptiveTooltip`, `showcase/ShowcaseSection` |
| **Features** | `features/recharge/RechargeModal` |
| **Data / state** | `services/catalog`, `services/types`, `store/appStore` (Zustand) |
| **Routing** | `routes/paths`, `routes/AppRoutes` |
| **A11y** | `accessibility/SkipLink`, `LiveRegion`, `announcer`, `useRouteFocus` |
| **Utils** | `utils/format`, `utils/resolveTheme`, `hooks/useBrandTheme`, `hooks/useBrandThemeOnDocument` |
| **QA hooks** | `testids/index.ts` (centralized `data-testid` constants) |
| **Styles** | `styles/oneui-layout.css`, component CSS modules |
| **Coverage** | `coverage/types.ts` (JSON data copied via page import) |

### `src/debug/` (ported + adapted)

| File | Purpose |
|------|---------|
| `oneui.ts` | Monorepo adapter: `@oneui/ui` + `withComponentInfo` wrappers |
| `withComponentInfo.tsx` | QA hover/long-press inspector HOC |
| `ComponentInspector.tsx` | Dev overlay (component name / props) |
| `QaInspectorLayer.tsx` | Global inspector toggle layer |
| `componentInfo.ts`, `inspectorRegistry.ts`, `qaConfig.ts`, `index.ts` | Inspector support |

---

## Files modified

| File | Change |
|------|--------|
| `src/App.tsx` | Routes via `AppRoutes`; `BrandProvider` + `QaInspectorLayer`; sample-app theme hooks |
| `src/pages/CatalogPage.tsx` | Sample App Demo → `/`; card links → `/qa/c/:slug` |
| `src/pages/ComponentDetailPage.tsx` | Back link → `/qa` |
| `package.json` | Added `zustand` dependency |

---

## Files to remove (obsolete)

| File | Reason |
|------|--------|
| `src/pages/JioDemoPage.tsx` | Replaced by full External Sample App at `/` |
| `src/styles/jioDemo.module.css` | Only used by removed `JioDemoPage` |

**Note:** `JioDemoPage` is no longer routed; safe to delete in a follow-up cleanup PR.

---

## Pages / components migrated

### Consumer app (exact port)

- Home — hero, search, quick actions, popular plans, theme settings
- Plans — catalog, filter/sort, compare (≤3), recharge modal
- Devices — shop, search/filter, pagination, cart, wishlist, detail modal
- Support — FAQ tabs, search, contact modal
- Account — profile, settings, saved plans, language, notification prefs
- Notifications — list, mark read
- Rewards — points, redeem, copy coupon codes
- Accessibility — a11y feature documentation
- Coverage — library vs sample static analysis table
- Showcase — manual all-in-one component gallery

### Shared workflows preserved

- Recharge flow (`RechargeModal` + `isValidMobile` validation)
- Device shopping (cart counter, wishlist, stepper qty)
- Plan compare (up to 3)
- Support contact form (subject + message required)
- Account profile edit (trim + async save + announcer)
- Theme preference (light/dark/auto → `localStorage`)

### QA capabilities preserved (monorepo)

- Playwright e2e (`e2e/*`, 38 per-component configs) — `/c/:slug` alias retained
- Axe accessibility suites + ingest pipeline
- `public/qa-reports/` dashboards + run-from-UI API
- Notion bug explorer (`/qa/dashboard`)
- Figma validation tabs on `ComponentDetailPage`
- Convex brand toolbar (`QaPlaygroundBrandShell`) — wraps entire app including sample surfaces
- Native Vitest + Maestro sub-app (`native/`)

---

## Remaining gaps

| Gap | Severity | Notes |
|-----|----------|-------|
| **`/qa/coverage` page** | Medium | External app has `buildPlaygroundCoverageReport` comparing library + playground + sample usage. Monorepo temporarily shows library `ComponentCoveragePage` at both `/coverage` and `/qa/coverage`. |
| **Folder structure** | Low | External app uses `src/qa-playground/` for QA showcases; monorepo keeps `src/components/` + `src/pages/`. Functionally equivalent; not a 1:1 directory mirror. |
| **Dual theme systems** | Low | Sample app `appStore.themePreference` + `ThemeSettings` coexist with `QaPlaygroundToolbar` theme. May desync `data-theme` — verify when testing dark mode. |
| **Dual brand injection** | Medium | `BrandProvider brand="jio"` (sample app) inside `QaPlaygroundBrandShell` (Convex/fixture). External app uses CDN `@jds4/oneui-init` only. Toolbar brand switch may not propagate to all sample pages identically. |
| **Coverage JSON source** | Medium | `componentCoverageData.json` is from external `analyze-component-coverage.mjs` against published package. Monorepo should run adapted script against `packages/ui` workspace. |
| **PrathipSample `src/qa-playground/`** | Low | External QA playground pages (`QaPlaygroundCatalogPage`, simplified detail tabs) not ported — monorepo versions are richer (stability badges, report tabs, Figma validation). |
| **Playwright sample-app tests** | Medium | External repo has `tests/specs/home.spec.ts`, `plans.spec.ts`, etc. Not yet copied to `apps/qa-playground`. |
| **Visual regression** | Medium | External `tests/visual/` snapshots not ported. |
| **Component API deltas** | Low | Monorepo `@oneui/ui` may differ slightly from `@jds4/oneui-react@0.1.0-alpha.6`. Runtime testing required on all 10 pages. |

---

## Validation checklist

| Check | Status |
|-------|--------|
| Every external screen route exists | ✅ |
| Navigation paths match `paths.ts` | ✅ |
| Header + mobile bottom nav | ✅ |
| Form validations (mobile, contact, profile) | ✅ Ported — needs manual QA |
| QA test IDs on sample pages | ✅ `src/sample-app/testids/` |
| Component inspector overlay | ✅ `@/debug/oneui` |
| Playwright `/c/:slug` routes | ✅ Backward compatible |
| Accessibility skip link + live region | ✅ |
| `pnpm dev` serves `/`, `/qa`, `/plans` | ✅ HTTP 200 smoke test |

---

## Recommendations — keeping apps synchronized

### 1. Single source for sample app pages

Treat `PrathipSample/src/pages/` and `src/sample-app/` as a **shared package** or git submodule:

```
packages/sample-app-screens/   # pages, layouts, services, store
```

Both `prathip-sample` and `@oneui/qa-playground` import from it; only `debug/oneui` import path differs per consumer.

### 2. Automated sync script

Add `scripts/sync-external-sample-app.mts`:

1. `rsync` from `PrathipSample/src/{pages,layouts,components,services,store,...}`
2. Transform imports (`../debug/oneui` → `@/debug/oneui`, etc.)
3. Run `pnpm typecheck` + sample-app Playwright smoke

Run in CI weekly or on `PK_ExternalSampleApp` branch updates.

### 3. Shared Playwright suite

Port `PrathipSample/tests/specs/*.spec.ts` to `apps/qa-playground/e2e/sample-app/` using `src/sample-app/testids` — validates consumer flows in both release (npm) and workspace (monorepo) contexts.

### 4. Coverage analysis parity

Port `scripts/analyze-component-coverage.mjs` to scan:

- `packages/ui/src/components/**`
- `apps/qa-playground/src/sample-app/**`
- `apps/qa-playground/src/components/**QaShowcase*`

Emit `src/sample-app/coverage/componentCoverageData.json` on `pnpm build`.

### 5. Release gate

Before `@jds4/oneui-react` alpha publish:

1. Run external sample app tests
2. Run `pnpm sync:sample-app && pnpm typecheck` in monorepo
3. Run QA Playwright `--all` on `/qa` routes
4. Compare `/coverage` reports (library prop matrix)

### 6. Route contract test

Add a Vitest/Playwright test that asserts `ROUTES` in `sample-app/routes/paths.ts` matches PrathipSample `paths.ts` (diff in CI).

---

## How to run

```bash
cd apps/qa-playground
pnpm dev
```

| URL | What |
|-----|------|
| http://localhost:5180/ | External Sample App — Home |
| http://localhost:5180/plans | Plans + recharge |
| http://localhost:5180/qa | QA component catalog |
| http://localhost:5180/qa/c/button | Button QA detail |
| http://localhost:5180/qa/dashboard | Notion bug tracker |

Toggle **QA Component Inspector** via app store / inspector layer (same as external app).

---

## Next steps (priority order)

1. Delete `JioDemoPage.tsx` + `jioDemo.module.css`
2. Port `buildPlaygroundCoverageReport` for `/qa/coverage`
3. Port external Playwright smoke tests for sample pages
4. Resolve dual brand/theme injection (toolbar vs `appStore`)
5. Add `pnpm sync:sample-app` script to `package.json`
6. Manual QA pass on all 10 consumer pages in light + dark mode
