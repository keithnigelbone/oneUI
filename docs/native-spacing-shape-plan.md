# Native Spacing + Shape Token Plan

> ✅ **Implemented 2026-05-02** in commits `18bdafd3..5c0ac8c7` (now on `main` via merge `aca55843`). `buildNativeDimensions.ts` + `theme.spacing.*` + `theme.shape.*` shipped. Section 7 (motion + elevation builders) remains the open follow-up — pick up when a `packages/ui-native/src` component first uses a motion or elevation literal.

## 1. Context and Motivation

Phase 4½ of the surface migration demonstrated the limit: `BrandPickerHeader.tsx` could migrate color and typography to token-backed values, but `padding`, `gap`, `borderRadius`, and `marginBottom` stayed as literals because `OneUINativeTheme` carries no spacing or shape data. This is the last remaining category of CLAUDE.md's "Zero Tolerance: No literals" violation on the native side. Closing it also enables `pnpm check:literals` to enforce the same standard on `packages/ui-native/src` as it does on `packages/ui/src`.

## 2. Current State

### File Inventory

**Engine (source of truth)**

| File | Role |
|------|------|
| `packages/shared/src/data/dimension-scales.ts` | `getDimensionValue(platform, density, fStep)` — the O(1) resolver for all f-step values. Already used by `buildNativeTypography`. |
| `packages/shared/src/engine/buildNativeTypography.ts` | Canonical pattern: pure function, takes `{config, platform, density}`, returns a typed JS object of resolved numeric values. |
| `packages/shared/src/engine/buildNativeTheme.ts` | Calls `buildNativeTypography`, stores result at `theme.typography`. The integration point for new builders. |
| `packages/tokens/src/css/primitives.css` (lines 14–102) | Web source of truth for spacing (`--Spacing-*`) and shape (`--Shape-*`) token names and their f-step aliases. |
| `packages/tokens/src/index.ts` | Existing static `tokens.spacing` and `tokens.shape` objects — **pre-V2, non-density-aware, mismatched f-step values**. `Button.native.tsx` currently imports from here. |

**Native theme**

| File | Role |
|------|------|
| `packages/ui-native/src/theme/index.ts` | Barrel — exports `useOneUITheme`, `useSurfaceTokens`, `useTypographyTokens`, and all engine types. |
| `packages/ui-native/src/theme/SurfaceContext.tsx` | `ThemeContext` provides `OneUINativeTheme`; `useOneUITheme()` is the consumer API. |
| `packages/ui-native/src/theme/useTypographyTokens.ts` | Hook pattern to follow — reads `theme.typography[role].sizes[size]`. |

**Known literal consumers (scoped to `packages/ui-native/src/` only — the gate's scan root)**

| File | Literals present |
|------|-----------------|
| `packages/ui-native/src/components/Button/Button.native.tsx` | `minHeight: 44`, `minWidth: 44` (allowlisted touch targets), `borderRadius: tokens.shape.pill` (uses old `tokens.shape.pill = 999`, not `getDimensionValue`) |

The `apps/mobile` directory is explicitly excluded from `check:literals` via the `EXCLUDED_FILE_SUFFIXES` allowlist (`path: 'apps/mobile'`). Its components (`BrandPickerHeader.tsx`, `ActiveTokensPanel.tsx`) are playground fixtures, not gated. They still benefit from token migration as the recommended usage pattern, but they do not block the quality gate.

**Theme gap**

`OneUINativeTheme` today exposes: `meta`, `themeConfig`, `rootParentStep`, `darkMode`, `typography`, `rootRoles`. It has no `spacing` or `shape` fields. The existing `tokens.spacing` / `tokens.shape` in `@oneui/tokens` are static V1 tables with non-matching values and no density awareness — they are not the V2 system.

## 3. Proposed Design

### Where to emit: one combined builder

**`buildNativeDimensions.ts`** in `packages/shared/src/engine/`, not two separate files. Spacing and shape share the exact same resolution path — both are f-step aliases read from `getDimensionValue(platform, density, fStep)`. The f-step mapping for each token is a static table (identical to `primitives.css`). Splitting adds file overhead with no isolation benefit; the typography builder is separate because its inputs (typography config, font overrides) are brand-configurable. Spacing and shape have no brand-configurable f-step assignments — they are fixed by the dimension scale. One file, one export.

### Theme object shape

`OneUINativeTheme` gains two new top-level fields, using the exact web token names (PascalCase, matching `--Spacing-*` and `--Shape-*`):

```ts
spacing: {
  '0': 0,
  '0-5': number, // f-7
  '1': number,   // f-6
  '1-5': number, // f-5
  '2': number,   // f-4
  '2-5': number, // f-3
  '3': number,   // f-2
  '3-5': number, // f-1
  '4': number,   // f0  (base)
  '4-5': number, // f1
  '5': number,   // f2
  '5-5': number, // midpoint between f2 and f3
  '6': number,   // f3
  '7': number,   // f4
  '8': number,   // f5
  '9': number,   // f6
  '10': number,  // f7
  '12': number,  // f8
  '14': number,  // f9
  '16': number,  // f10
  '18': number,  // f11
  '20': number,  // f12
  '24': number,  // f13
  '28': number,  // f14
  '32': number,  // f15
  '40': number,  // f16
  Margin: number, // grid margin
  Gutter: number, // grid gutter
};

shape: {
  None: 0,
  Pill: 9999,      // standalone constant, not f-step derived
  '6XS': number,   // f-7
  '5XS': number,   // f-6
  '4XS': number,   // f-5
  '3XS': number,   // f-4
  '2XS': number,   // f-3
  XS: number,      // f-2
  S: number,       // f-1
  M: number,       // f0
  L: number,       // f1
  XL: number,      // f2
  '2XL': number,   // f3
  '3XL': number,   // f4
  '4XL': number,   // f5
  '5XL': number,   // f6
  '6XL': number,   // f7
};
```

Sit at `theme.spacing['4']`, `theme.shape.Pill`, etc. — not nested under `dimensions`. Nesting would break parallelism with `theme.typography` and add an indirection that hides what these fields are.

`Margin` and `Gutter` on `spacing` are read from `getGridValue(platform, density, 'margin' / 'gutter')` — already available in `dimension-scales.ts`.

### Density strategy: pre-resolve at theme-build time

`buildNativeTypography` already uses this pattern. It receives `platform` and `density` from `NativeThemeContext` and calls `getDimensionValue(platform, density, fStep)` for every size. Consumers read pre-resolved numbers; there is no f-step index escape hatch. Spacing and shape must follow the same pattern for consistency.

`NativeThemeContext.density` and `.platform` are already typed (`'compact' | 'default' | 'open'` and `'mobile' | 'tablet' | 'desktop'`). `buildNativeTheme` already maps `platform` to a dimension platform string for typography — the spacing/shape builder uses the same `dimensionPlatform` variable.

When density changes, the theme rebuilds. This is acceptable and already true for typography; `buildNativeTheme` is a pure function memoized by `brandHash`, and density is part of that hash.

### Hook ergonomics: no new hooks

**No `useSpacingTokens()` or `useShapeTokens()` hooks.** The typography hook exists because it adds non-trivial logic (emphasis weight override, size union narrowing). Spacing and shape are flat numeric lookups: `theme.spacing['4']`, `theme.shape.Pill`. Hooks for map lookups would be over-abstraction. Components read via `useOneUITheme()`:

```ts
const theme = useOneUITheme();
const styles = StyleSheet.create({
  pill: { paddingVertical: theme.spacing['3'], borderRadius: theme.shape.Pill },
});
```

### Backwards compat

`check:literals` scans `packages/ui-native/src` (line 133 of `scripts/check-literals.ts`). `apps/mobile` is excluded. Current violations in the scanned scope:

**`packages/ui-native/src/components/Button/Button.native.tsx`**
- `minHeight: 44` — allowlisted (`NATIVE_NUMERIC_ALLOWLIST` includes `'44'`)
- `minWidth: 44` — allowlisted
- `borderRadius: tokens.shape.pill` — uses `tokens.shape.pill = 999` (old static table). After migration: `theme.shape.Pill` from `useOneUITheme()`. **The one real violation.**

**`packages/ui-native/src/components/Materials/*.native.tsx`** — no spacing/shape style literals. They use `tokens.material.*` (opacity, blur intensity). Not affected.

Total files to modify for gate compliance: **1** (`Button.native.tsx`). Playground has 2 follow-on examples (`BrandPickerHeader.tsx`, `ActiveTokensPanel.tsx`) — non-gated.

### Tests

Mirror `buildNativeTypography.test.ts` at `packages/shared/src/engine/__tests__/buildNativeDimensions.test.ts`:

- Default config (platform=`S`, density=`default`): all 28 spacing keys are non-negative; `spacing['0']` is 0; `Pill` is 9999.
- Values match `getDimensionValue('S', 'default', fStep)` directly.
- Density shift: compact `spacing['4']` < default < open.
- Platform shift: tablet (M) matches S (same BASE_16 scale); desktop (L) `spacing['4'] === 18` (BASE_18).
- Grid: `Margin` and `Gutter` match `getGridValue` for the given combination.
- Shape: `Pill === 9999`, `None === 0`, all t-shirt tokens non-negative.
- Coverage target: ≥ 70% lines.

### Quality gate

`check:literals` already scans `packages/ui-native/src` and applies `NATIVE_STYLE_NUMBER_PATTERN` to `*.native.tsx`. Pattern covers `borderRadius`, `padding`, `gap`, `margin`. Once tokens exist and Button.native.tsx is updated, the gate catches future regressions automatically. No parallel native checker needed.

The `apps/mobile` exclusion is intentional — playground scratchpad. Removing it is out of scope.

## 4. File Changes

| File | Action | Description | Est. LOC |
|------|--------|-------------|---------|
| `packages/shared/src/engine/buildNativeDimensions.ts` | Create | Pure builder: spacing + shape tables → `NativeDimensions`. Calls `getDimensionValue` + `getGridValue`. Exports `buildNativeDimensions`, `NativeDimensions`, `NativeSpacing`, `NativeShape`. | ~120 |
| `packages/shared/src/engine/buildNativeTheme.ts` | Modify | Import `buildNativeDimensions`; add `spacing` and `shape` fields; call builder with `dimensionPlatform + density`; include in `brandHash` if not already covered. | ~25 |
| `packages/shared/src/engine/index.ts` | Modify | Re-export `buildNativeDimensions` + 3 new types. | ~8 |
| `packages/ui-native/src/theme/index.ts` | Modify | Re-export `NativeDimensions`, `NativeSpacing`, `NativeShape`. | ~5 |
| `packages/ui-native/src/index.ts` | Modify | Add three new type exports to package barrel. | ~5 |
| `packages/ui-native/src/components/Button/Button.native.tsx` | Modify | Replace `tokens.shape.pill` with `theme.shape.Pill` via `useOneUITheme()`. Remove `import { tokens }` if no other use remains. | ~8 |
| `packages/shared/src/engine/__tests__/buildNativeDimensions.test.ts` | Create | Vitest tests as above. | ~120 |

Total new/modified LOC: ~291.

## 5. Migration Sequence

**Phase 1 — Engine (no consumer impact)**

- [ ] Create `buildNativeDimensions.ts`.
- [ ] Write `buildNativeDimensions.test.ts`. `pnpm test --filter @oneui/shared` passes with ≥ 70% coverage.
- [ ] Modify `buildNativeTheme.ts`: add fields, call builder, extend `brandHash` (verify `computeInputHash` already covers `density`).
- [ ] Update `packages/shared/src/engine/index.ts`.
- [ ] `pnpm typecheck` clean.

**Phase 2 — Package exports**

- [ ] Update `packages/ui-native/src/theme/index.ts` and `packages/ui-native/src/index.ts`.
- [ ] `pnpm typecheck` clean.

**Phase 3 — Component migration (gate compliance)**

- [ ] `Button.native.tsx`: call `useOneUITheme()`, replace `tokens.shape.pill` with `theme.shape.Pill`. Remove `import { tokens }` if no longer used.
- [ ] `pnpm check:literals` zero violations.

**Phase 4 — Playground examples (non-gated, follow-on)**

- [ ] `apps/mobile/src/components/BrandPickerHeader.tsx`: replace remaining spacing/shape literals.
- [ ] `apps/mobile/src/components/ActiveTokensPanel.tsx`: same.

## 6. Verification

After each phase:

1. `pnpm typecheck` — zero errors
2. `pnpm test --filter @oneui/shared` — `buildNativeDimensions.test.ts` green, ≥ 70% coverage
3. `pnpm check:literals` — zero violations in `packages/ui-native/src`
4. Manual smoke: `pnpm dev:native`, confirm `theme.spacing['4']` is `16` for default/mobile, `14` for compact/mobile, `18` for open/mobile (matches `STATIC_DIMENSION_TABLES['S']`)
5. Fallow audit from root — no regressions in web packages

## 7. Out of Scope

**Motion tokens.** `OneUINativeTheme` has no `motion` field. `packages/tokens/src/index.ts` exposes `tokens.motion.duration.*` (static ms values). Same gap as spacing/shape but for motion. Approach would be identical (`buildNativeMotion.ts`). Deferred — no `packages/ui-native/src` component currently uses motion literals that fail the gate.

**Elevation tokens.** No native elevation builder exists. Web uses a two-shadow formula with level 0–5. RN shadows use `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation` (Android). Non-trivial mapping. No current `packages/ui-native/src` component uses elevation literals in the gated path. Deferred.

Both motion and elevation have the same structural gap and the same fix pattern: pure `buildNative*.ts` in `packages/shared/src/engine/`, new field on `OneUINativeTheme`, barrel re-exports.
