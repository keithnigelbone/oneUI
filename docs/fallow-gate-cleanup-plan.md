# Fallow-Gate Cleanup Plan

> ✅ **Phases 1–4 + native-spacing-shape landed 2026-05-02** (commit `94f44375` on `main`). Phase 5 is deferred by design — pick up component splits when those files are next edited for product reasons. Doc retained for historical context and the Phase 5 reference list.

> Audit-driven refactor to bring the workspace back under the project's
> `fallow` pre-commit gate without `--no-verify` bypass. Five independent
> phases, each safe to run in a separate Claude/dev session.

**Created:** 2026-04-30
**Trigger:** `feat/surface-migration-settings-brandpicker` had to bypass the
fallow gate to land Expo 54 / React 19 / native multibrand pipeline because
the diff vs `main` exposed 30 complexity findings + 18 duplication groups
that pre-date that work.

---

## Context

`fallow-gate.sh` runs as a Claude Code `PreToolUse` hook (configured in
`.claude/settings.json`) and fails any Bash command if the workspace audit
reports any of:

- **Dead code** — unused exports / types / class members / files
- **Complexity** — any function with cyclomatic > 20, cognitive > 15, or
  CRAP score > 30 (CRAP = `CC² × (1 − cov/100)³ + CC` — penalises
  uncovered code)
- **Duplication** — clone groups of ≥ 8 lines / 50 tokens

The gate is healthy in principle and was added intentionally
(`cafaa1e9 chore(ci): add fallow pre-commit gate via Claude Code hooks`).
The current 48 findings concentrate in a small number of files; this plan
clears them in five focused phases.

---

## Current state (baseline)

Run `fallow audit` from the workspace root to refresh these numbers.

| Metric | Value |
|---|---|
| Files analysed | 1,250 |
| Dead files / exports | 0 / 0 ✅ |
| Avg cyclomatic | 2.7 ✅ |
| P90 cyclomatic | 6 ✅ |
| Maintainability avg | 91.9 ✅ |
| Complexity findings | **30** (6 critical · 8 high · 16 moderate) |
| Duplication clone groups | **18** |
| Files with clones | 31 / 1,250 (2.5%) |

### Complexity hotspots

| Tier | File | Findings | Worst function |
|---|---|---|---|
| 1 | `apps/platform/src/app/(platform)/layout.tsx` | **13** | `PlatformLayoutContent` — 808 lines, cyclomatic 53, CRAP 2862 |
| 2 | `packages/ui/src/components/Input/InputField.tsx` | 1 | `InputField` — 159 lines, cyclomatic 27 |
| 2 | `packages/ui/src/components/BottomNavigation/BottomNavItem.tsx` | 1 | `BottomNavItem` — 105 lines, cyclomatic 24 |
| 2 | `packages/ui/src/components/ListItem/ListItem.tsx` | 1 | `ListItem` — 136 lines, cyclomatic 22 |
| 2 | `packages/ui/src/components/Button/Button.tsx` | 2 | `Button` 19 cyclomatic + nested `renderOrnament` |
| 2 | `packages/ui/src/components/PaginationDots/PaginationDots.tsx` | 1 | `handleKeyDown` — cyclomatic 15 |
| 2 | `packages/ui/src/components/Tabs/Tabs.tsx` | 1 | `TabsItem` — cyclomatic 11 |
| 2 | `packages/ui/src/components/WebHeader/PrimaryNav.tsx` | 1 | `updateIndicator` — cyclomatic 12 |
| 3 | `apps/mobile/src/hooks/useBrandFonts.ts` | 1 | CRAP 56 (no coverage) |
| 3 | `apps/mobile/src/hooks/useActiveBrand.ts` | 1 | CRAP 56 (no coverage) |
| 3 | `packages/ui-native/src/components/Button/Button.native.tsx` | 1 | CRAP 30 (no coverage) |
| 3 | `apps/mobile/src/screens/PlaygroundScreen.tsx` | 1 | already suppressed |
| 3 | other | 6 | mostly `Button.shared.resolveSize`, `OneUIFrameShapeUtil.patchFrameBodyFill` |

### Duplication clone families (8 of 18 are big)

| Family | Files | Lines duplicated |
|---|---|---|
| `appearanceClassMap` literal | Badge, Button, Chip, CounterBadge, IconButton, IndicatorBadge, LinkButton, PaginationDots, SelectableButton, SelectableIconButton, SelectableSingleTextButton | **289 lines × 11 instances** |
| Form-control `APPEARANCE_CLASSES` + `ACCENT_CLASSES` | Checkbox, Radio, Stepper, Switch | 141 lines × 4 |
| Icon-button render content (loading spinner SVG + icon span) | IconButton, SelectableIconButton | 118 lines × 2 |
| Slot shielding (`shieldSlotChildren` displayName check) | Badge, Chip | 117 lines × 2 |
| `useButtonState` resolution (variant/attention/appearance/size) | Button.shared, IconButton.shared, LinkButton.shared | 11 lines × 3 |
| `tintSvgToCurrentColor` (white-rect strip + currentColor regex) | LogoPageContent, layout.tsx | 32 lines × 2 |
| `createBrand` form submission | OverviewContent, layout.tsx | 14 lines × 2 |
| Brand-switch + localStorage logo write (within layout.tsx) | layout.tsx (2 sites) | 9 lines × 2 |

---

## Phase 1 — Decompose `apps/platform/src/app/(platform)/layout.tsx`

**Owns ~40% of all complexity findings. Highest-impact phase.**

### Goal
Split the 808-line `PlatformLayoutContent` into a thin shell that mounts 3–4
focused sub-components, each owning a single concern.

### Scope
File: `apps/platform/src/app/(platform)/layout.tsx`

Concerns currently entangled in this file:

1. Brand-switching logic + localStorage logo cache write (duplicated within
   the file at lines ~518–526 and ~587–595)
2. Sidebar logo override colour (`sidebarLogoOverrideColor` arrow at line 209)
3. Secondary-nav tabs + active-tab resolution (`secondaryNavTabs` line 717,
   `activeSecondaryTab` line 747)
4. Brand-create dialog form submission (`handleCreateBrand` line 602 — also
   duplicated in `OverviewContent.tsx`)
5. SVG logo tint helper (`tintSvgToCurrentColor` line 68 — also duplicated in
   `LogoPageContent.tsx`)
6. Font-warm-up wait (`waitForActiveBrandFont` line 991, `getFirstFontFamily`
   line 1006)
7. App-ready preloader trigger (`appReadyTimer` block at line 344)

### Suggested split

```
apps/platform/src/app/(platform)/
├── layout.tsx                          # Thin shell — composes the below
├── _layout/
│   ├── BrandSwitching.tsx              # setBrandWithLogoCache + effects
│   ├── Sidebar.tsx                     # sidebar color logic + secondary tabs
│   ├── BrandCreateDialog.tsx           # handleCreateBrand + form (also imported by OverviewContent)
│   ├── AppReadyPreloader.tsx           # appReadyFired/Timer + font wait
│   └── lib/
│       ├── tintSvgToCurrentColor.ts    # shared with LogoPageContent
│       └── brandFontWait.ts            # waitForActiveBrandFont + getFirstFontFamily
```

### Definition of done

- `layout.tsx` shrinks to < 200 lines and only orchestrates
- `tintSvgToCurrentColor` deleted from `LogoPageContent.tsx` (imports the shared one)
- `OverviewContent.tsx` imports `BrandCreateDialog` (or its submit handler) from `_layout/`
- `pnpm typecheck` passes
- `fallow audit` shows the layout.tsx complexity findings drop from 13 → ≤ 1
- Smoke test: navigate the platform app, switch brands, create a brand, verify nothing regressed

### Estimated effort
1 day. The file has known-good behavior with 17 commits ahead of `origin/main`
already on `main` — no merging in flight, safe to refactor.

---

## Phase 2 — Shared `appearanceClassMap` factory

**Removes the largest clone family: 289 duplicated lines × 11 instances.**

### Goal
Replace the inline `Record<Exclude<XAppearance, 'auto'>, string | undefined>`
literal in 11 components with a single factory call.

### Scope

Affected files (all in `packages/ui/src/components/`):

```
Badge/Badge.tsx
Button/Button.tsx
Chip/Chip.tsx
CounterBadge/CounterBadge.tsx
IconButton/IconButton.tsx
IndicatorBadge/IndicatorBadge.tsx
LinkButton/LinkButton.tsx
PaginationDots/PaginationDots.tsx
SelectableButton/SelectableButton.tsx
SelectableIconButton/SelectableIconButton.tsx
SelectableSingleTextButton/SelectableSingleTextButton.tsx
Tabs/Tabs.tsx
```

Plus the form-control variant in:
```
Checkbox/Checkbox.tsx
Radio/Radio.tsx
Stepper/Stepper.tsx
Switch/Switch.tsx
```

### Suggested implementation

New file: `packages/ui/src/components/_shared/appearanceClasses.ts`

```ts
import type { ComponentAppearance } from '@oneui/shared';

/**
 * Build the standard 11-role appearance → CSS class map for a component
 * whose CSS module exposes `.appearanceNeutral`, `.appearanceSecondary`,
 * etc. `primary` returns `undefined` because it's the default and gets
 * no extra class.
 */
export function makeAppearanceClassMap(
  styles: Record<string, string>,
): Record<Exclude<ComponentAppearance, 'auto'>, string | undefined> {
  return {
    primary: undefined,
    neutral: styles.appearanceNeutral,
    secondary: styles.appearanceSecondary,
    sparkle: styles.appearanceSparkle,
    'brand-bg': styles.appearanceBrandBg,
    positive: styles.appearancePositive,
    negative: styles.appearanceNegative,
    warning: styles.appearanceWarning,
    informative: styles.appearanceInformative,
  };
}

/**
 * Form-control accent factory — only the 3 accent roles, used by
 * Checkbox / Radio / Stepper / Switch.
 */
export function makeAccentClassMap(
  styles: Record<string, string>,
): Record<'primary' | 'secondary' | 'sparkle', string> {
  return {
    primary: styles.accentPrimary,
    secondary: styles.accentSecondary,
    sparkle: styles.accentSparkle,
  };
}
```

Each component replaces:

```ts
const appearanceClassMap: Record<...> = {
  primary: undefined,
  neutral: styles.appearanceNeutral,
  // ... 10 more lines
};
```

with:

```ts
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
const appearanceClassMap = makeAppearanceClassMap(styles);
```

### Definition of done

- New `_shared/appearanceClasses.ts` exports both factories
- All 11 component files (12 with Tabs) use the factory
- All 4 form-control files use `makeAccentClassMap`
- `pnpm typecheck` passes
- `pnpm test` passes (no behavioral change expected)
- `fallow audit` clone-groups count drops by ≥ 7 (the entire clone family clears)

### Estimated effort
Half-day. Mechanical change — one `Edit` per file.

---

## Phase 3 — Extract `useButtonStateCommon`

**Removes the 3-instance clone in Button/IconButton/LinkButton `.shared.ts`.**

### Scope

```
packages/ui/src/components/Button/Button.shared.ts          (line 182–192)
packages/ui/src/components/IconButton/IconButton.shared.ts  (line 106–116)
packages/ui/src/components/LinkButton/LinkButton.shared.ts  (line 101–108)
```

Each contains the same `disabled / variant / appearance / numericSize`
resolution pattern with only the variant type and size resolver swapped.

### Suggested implementation

New file: `packages/ui/src/components/_shared/buttonStateBase.ts`

```ts
export function resolveButtonStateBase<V extends string>(
  props: {
    disabled?: boolean;
    loading?: boolean;
    variant?: V;
    attention?: 'high' | 'medium' | 'low';
    appearance?: string;
  },
  attentionToVariant: Record<'high' | 'medium' | 'low', V>,
  defaultVariant: V,
) {
  const isDisabled = props.disabled || props.loading;
  const resolvedVariant: V =
    props.variant ?? (props.attention ? attentionToVariant[props.attention] : defaultVariant);
  const resolvedAppearance =
    props.appearance === 'auto' || !props.appearance ? 'primary' : props.appearance;
  return { isDisabled, resolvedVariant, resolvedAppearance };
}
```

Each `useXState` calls `resolveButtonStateBase(...)`, then computes its
own `numericSize` via the role-specific resolver and returns the merged
result.

### Definition of done

- All 3 `*.shared.ts` files import from `_shared/buttonStateBase.ts`
- `pnpm typecheck` passes
- `pnpm test` passes (behaviour unchanged)
- `fallow audit` clone-groups count drops by 1

### Estimated effort
Half-day.

---

## Phase 4 — Test coverage on new mobile files

**Removes the 4 "no coverage" CRAP findings introduced by this branch.**

### Scope

```
apps/mobile/src/hooks/useActiveBrand.ts
apps/mobile/src/hooks/useBrandFonts.ts
apps/mobile/src/utils/foundationToNativeTheme.ts
apps/mobile/src/components/BrandPickerHeader.tsx
apps/mobile/src/components/ActiveTokensPanel.tsx
packages/ui-native/src/theme/useTypographyTokens.ts
packages/ui-native/src/components/Button/Button.native.tsx
packages/shared/src/engine/buildNativeTypography.ts
```

### Suggested test stubs

- `useActiveBrand` — initial null state → hydrated from AsyncStorage → falls back to first non-system brand
- `useBrandFonts` — empty descriptors → ready immediately; with descriptors → calls `Font.loadAsync`
- `foundationToNativeTheme` — passes the right config keys to `buildNativeTheme`; returns null when colorConfig missing
- `buildNativeTypography` — pure function, deterministic snapshot test against the default Jio config
- `useTypographyTokens` — generic over role, returns the right `NativeTypeStyle`
- `BrandPickerHeader` / `ActiveTokensPanel` — RTL render snapshot per dark/light mode

### Definition of done

- ≥ 70% line coverage on each of the 8 files
- Suppress comments (`// fallow-ignore-next-line complexity`) removed from the now-covered files
- `pnpm test` green
- `fallow audit` complexity findings drop by 4+

### Estimated effort
Half- to full-day. Mostly mechanical; main trick is mocking `expo-font` + `@react-native-async-storage/async-storage`.

---

## Phase 5 — Big render-function splits (lowest priority)

**Defer until these components are touched for other reasons.**

### Candidates

| File | Why | Approach |
|---|---|---|
| `Input/InputField.tsx` (159 LOC, cyclomatic 27) | Conditional rendering of slots × addons × shape × validation × loading | Extract `<InputAffix>` for start/end addons; `<InputShell>` for shape+focus styling |
| `BottomNavigation/BottomNavItem.tsx` (105 LOC, cyclomatic 24) | Indicator state + label visibility + icon variant | Extract `useBottomNavItemState` |
| `ListItem/ListItem.tsx` (136 LOC, cyclomatic 22) | start/end slots × stacking × interactive vs static | Extract `<ListItemSlot>` |
| `Button/Button.tsx` `renderOrnament` (70 LOC) | SVG fill + stroke + side-mirroring | Extract `<ButtonOrnament side={...}>` component |
| `PaginationDots/PaginationDots.tsx` `handleKeyDown` (35 LOC, cyclomatic 15) | 4 keys × loop / boundary logic | Lookup table: `{ ArrowRight: () => step(1), ... }` + `focusAfterKey` flag set in one place |

### Definition of done (per component)

- Component file < 100 lines
- Cyclomatic ≤ 10 per function
- Stories + tests still pass
- `fallow audit` complexity findings drop by 1

### Estimated effort
1 day each. Tackle when the component is being actively edited anyway.

---

## Recommended order

```
Phase 1 (Layout decomp)        ┐ Independent
Phase 2 (appearanceClassMap)   │ Independent
Phase 3 (buttonStateBase)      │ Independent
Phase 4 (Mobile tests)         ┘ Independent
                                  ↓ all four ship
   ┌──── fallow audit ────┐
   │  complexity:  30 → ~3 │
   │  duplication: 18 → ~5 │
   └───────────────────────┘
                                  ↓
Phase 5 (component splits)        Optional, opportunistic
```

**Phases 1–4 can run in parallel sessions.** No file overlap. Each phase has
clear definition of done so any agent (or human) can pick one cold and
execute end-to-end.

---

## Verification protocol (run after each phase)

```bash
# 1. Typecheck still clean
pnpm typecheck

# 2. Tests still green
pnpm test

# 3. Audit shows the targeted reduction
fallow audit | jq '.summary'

# 4. No new dead code introduced
fallow audit | jq '.dead_code.summary'

# 5. Smoke-test the affected app
pnpm dev          # platform — for Phase 1
pnpm storybook    # ui — for Phases 2/3
pnpm dev:native   # mobile — for Phase 4
```

A phase is "done" when:
- Steps 1–4 pass
- The diff vs `main` is ≤ 1 commit on a feature branch named
  `chore/fallow-audit-phase-{N}-{description}`
- Manual smoke test confirms no behavioural regression

---

## Out of scope (intentionally deferred)

- The 13 complexity findings inside `apps/platform/src/app/(platform)/layout.tsx`
  are split across Phase 1 (architecture) and Phase 5 (line-level cleanup) —
  Phase 5 only kicks in if Phase 1 leaves anything > 200 lines.
- Test files (`*.test.tsx`) appear in the duplication report (Badge, CounterBadge,
  FAB, IconButton). Test duplication is acceptable in moderation; address only
  if the same assertion is copy-pasted ≥ 4 times.
- The `OneUIFrameShapeUtil.patchFrameBodyFill` complexity finding (CRAP 72)
  is inside a tldraw extension we don't own; suppress with a comment if it
  re-appears.

---

## Origin of this plan

Generated 2026-04-30 from the `fallow audit` JSON output during the
`feat/surface-migration-settings-brandpicker` push. Re-run `fallow audit`
before starting each phase to refresh the baseline numbers — some findings
may have already been addressed by other in-flight work.
