# Native design system payload (schema v2)

`nativeTheme:getNativeThemeSnapshot` returns engine output from `buildNativeTheme` **plus** a `designSystem` object for non-web clients (Flutter, Kotlin, Swift) that cannot consume injected CSS.

## Shape

| Field | Source (TypeScript) | Purpose |
|-------|---------------------|---------|
| `designSystem.componentCustomProperties` | `buildAllComponentCustomPropertiesFlat` (`@oneui/ui`) | Flat map of CSS custom property names (e.g. `--Button-borderRadius`) to values (may include `var(--…)`). Same merge order as web `buildAllComponentCSS`. |
| `designSystem.dimensionContexts` | `buildStructuredDimensionContexts` (`@oneui/shared`) | All computed `[data-Breakpoint][data-6-Density]` slices. Each `dimensions` map includes `--Dimension-f*`, **`--Spacing-*`** (copied from the matching f-step), the **`--Shape-Pill` / `--Shape-0`** literals, and the numeric shape scale **`--Shape-{0-5…10}`** (same f-step mapping as web `primitives.css`), plus grid tokens. The deprecated t-shirt aliases (`--Shape-None`, `--Shape-{6XS…6XL}`) are still emitted at identical values for clients mid-migration; they disappear when `pnpm check:shape-tokens` reports an empty allowlist. |
| `designSystem.activeDimensionContext` | `pickStructuredDimensionContext` | The slice for the requested `platform` (`mobile`→`S`, etc.) + `density`. |
| `designSystem.activeDimensionKey` | `${v2Platform}:${density}` | Stable lookup key for caches. |

`schemaVersion` is `2` when `designSystem` is present. Older fields (`themeConfig`, `rootRoles`, `typography`, …) are unchanged.

## Clients

- **Flutter**: `NativeThemeSnapshot.tryParse` → `NativeDesignSystemPayload` on `OneUiScope.designSystem`; `NativeTypographySnapshot.tryParse(snap.typography)` on `OneUiScope.nativeTypography`; use `resolveCSSValue`, `parsePx`, `componentLengthPx`, `resolveComponentLengthPxCascade`. **`OneUiButton`** (`primary` appearance) is the first strict contained component; **`OneUiButton(contained:false)` → `OneUiLinkButton`** (mirror web `LinkButton`). Unresolved Convex keys render a gap card instead of Material fallbacks. See [`docs/flutter-native-parity-and-button-pipeline.md`](flutter-native-parity-and-button-pipeline.md). **Flutter Storybook “No brand”** injects manifest-only `--Button-*` plus `--LinkButton-*` defaults (same TS merge as Convex with empty overrides) plus baseline label typography so buttons and uncontained rows render like web Storybook without `BrandStyleInjector`. **`resolveCSSValue`** unwraps typography chains (`var(--Label-M-FontSize)`, …) when `nativeTypography` is passed. When Convex/dimension contexts omit global tokens, static fallbacks approximate hairline **`--Stroke-{static}`** widths and **`--Touch-Target-Min`** (`44px`) so small maps (e.g. Storybook **No brand**) still resolve `LinkButton-underlineThickness` and tap targets — prefer full **Platforms** foundations on real brands for exact parity.
- **Android / iOS**: Deserialize the same JSON; resolve `var(--Token)` against `activeDimensionContext.dimensions` then `componentCustomProperties`.

## Convex

Implementation: `packages/convex/convex/nativeTheme.ts` imports the React-free token builder via a **relative path** (`../../ui/src/utils/componentTokenMapCore`) so Convex’s esbuild step can bundle it (workspace package subpaths like `@oneui/ui/utils/...` are not resolved for queries).

## Maintenance

When adding a component to `COMPONENT_REGISTRY`, update **`componentDesignRegistry.ts`** (recipe + manifest only) so Convex and `buildAllComponentCustomPropertiesFlat` stay aligned.

---

## Ensuring `getNativeThemeSnapshot` returns a full v2 payload (e.g. brand Jio)

The handler is `packages/convex/convex/nativeTheme.ts`. Flutter Storybook passes the result into `OneUiScope.designSystem` (`apps/storybook_flutter/lib/main.dart`) — no extra wiring is required in Flutter once Convex returns the data.

### 1. Preconditions on the brand (Convex data)

| Symptom | Cause in handler | What to fix |
|--------|------------------|-------------|
| **`value` is `null`** (query returns nothing usable) | **`fd.color?.config` is missing** | Create/configure the **Color** foundation for the brand so `loadBrandOverviewPayload` exposes `color.config` (same data the web colour pipeline needs). |
| **`value` is `null`** | **`buildNativeTheme(...)` returns `null`** | Incomplete or invalid colour / appearance inputs for the engine — align with what works in the platform Brand Theme editor for that brand. |
| **`schemaVersion` is `2` but `designSystem.dimensionContexts` is `[]`** | **`platforms.config` is missing or invalid** | Add/configure the **Platforms** foundation (dimensions) so `fd.platforms.config` parses as `PlatformsFoundationConfig`. Without it, `buildStructuredDimensionContexts` is never run and Flutter falls back to static f-step tables for sizing (component `var(--Dimension-*)` resolution is weaker). |
| **`componentCustomProperties` is sparse** | Normal if the brand has few **component theme / recipe / token override** rows | The flat map still includes **recipe defaults** from the registry merge; optional Convex **Button decorations** add ornament vars. |

`designSystem` is always attached **after** `buildNativeTheme` succeeds — it includes `componentCustomProperties` (object, possibly large), `dimensionContexts` (array, **empty** if no platforms config), `activeDimensionContext`, and `activeDimensionKey`.

### 2. Verify in Convex (after deploy)

1. Open the Convex dashboard → **Functions** → run **`nativeTheme:getNativeThemeSnapshot`** with:
   - `brandId`: your Jio document id (`brands` table `_id`)
   - `theme`: `light` or `dark`
   - Optional: `density`, `platform` (defaults: `default`, `mobile`)

2. Confirm the JSON:
   - **`value` is not `null`**
   - **`schemaVersion` === `2`**
   - **`designSystem.componentCustomProperties`** is an object with keys like `--Button-*` (and often `--Shape-*`, `--Spacing-*` references inside values)
   - **`designSystem.dimensionContexts`** is a **non-empty** array if you want full `var(--Dimension-*)` / spacing parity on device — if it is empty, fix the **Platforms** foundation.

### 3. Verify over HTTP (same as Flutter Storybook)

Post to `{CONVEX_URL}/api/query` with body:

```json
{
  "path": "nativeTheme:getNativeThemeSnapshot",
  "args": {
    "brandId": "<brands _id>",
    "theme": "light",
    "density": "default",
    "platform": "mobile"
  },
  "format": "json"
}
```

Expect `"status":"success"` and `"value"` containing `designSystem`. If `"value":null`, fix **colour foundation** (or engine inputs) first — Flutter cannot invent this without a TS/CSS runtime on the client.

### 4. Flutter side (sanity)

With a good payload, `fetchNativeThemeSnapshot` in `apps/storybook_flutter/lib/convex_brands.dart` should parse `NativeThemeSnapshot`; `OneUiScope` receives `designSystem: snap?.designSystem`. **`OneUiButton`** then resolves `--Button-*` from that map; if anything is still missing, you see the **gap card** listing specific unresolved tokens — fix **component registry / brand overrides** in Convex, not Flutter layout.

