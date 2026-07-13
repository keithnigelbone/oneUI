# Codebase Concerns

**Analysis Date:** 2026-05-29

---

## Summary

The design system engine and token layer are directionally sound. The surface migration is functionally complete for the Jio base brand. The concerns below are concentrated in three areas: (1) active test failures in the shared engine, (2) incomplete migrations that leave legacy patterns alive in production CSS and platform editor code, and (3) component API gaps where Figma spec and code diverge.

---

## Tech Debt

### [HIGH] 14 Failing Tests in @oneui/shared (current state)

**Files:**
- `packages/shared/src/engine/__tests__/surfaceNew.test.ts` (11 failures)
- `packages/shared/src/engine/__tests__/engineDrift.test.ts` (2 failures)
- `packages/shared/src/engine/__tests__/buildNativeTheme.test.ts` (1 failure)
- `packages/shared/src/agent/__tests__/knowledgeSources.test.ts` (1 failure)

**Issues found:**
- `resolveInteractionOverlay` tests expect an object `{ step, opacity }` but the function returns a bare step number — API contract mismatch between test and implementation.
- `resolveContent > high token` expects `step 200` but receives `step 100` — off-by-one in the extreme step selection logic.
- `engineDrift.test.ts` calls `Object.keys()` on an undefined return value from `resolveMultiRoleTokenSets` — indicates a structural gap in the exported API.
- `buildNativeTheme` test calls `.toMatch()` on `undefined` — `flattenRoleTokens` returns `undefined` for some surface/content/state slots.
- `knowledgeSources.test.ts` — string comparison failure on `renderCoreInvariantsStructured` output; likely a source file changed without the test snapshot being updated.

**Impact:** `pnpm test` fails hard; `turbo` exits 1; CI is broken on the current branch.
**Fix approach:** Run the four test files in isolation, inspect actual vs expected values, and reconcile the implementation or update the test expectations. Do NOT simply update snapshots — verify the algorithm output is correct first.

---

### [HIGH] Legacy Token Usage in Production Component CSS (1467 strict-mode violations)

**Issue:** `pnpm exec tsx scripts/check-legacy-tokens.ts --strict` reports 1467 legacy V1/V3 token references across styled components.

**Files with highest density:**
- `packages/ui/src/components/Button/Button.module.css`
- `packages/ui/src/components/Chip/Chip.module.css`
- `packages/ui/src/components/IconButton/IconButton.module.css`
- `packages/ui/src/components/Input/Input.module.css`
- `packages/ui/src/components/ListItem/ListItem.module.css`
- `packages/ui/src/components/Stepper/Stepper.module.css`
- `packages/ui/src/components/SingleTextButton/SingleTextButton.module.css`
- `packages/ui/src/components/SelectableButton/SelectableButton.module.css`

**Legacy tokens still present:** `--Primary-FG-Bold`, `--Primary-BG-Subtle`, `--Primary-Default-High`, `--Surface-Bold`, `--Surface-Subtle`, `--Text-High`, `--Text-Medium`, `--Text-Low`, `--Text-OnBold-High`.

**Impact:** Multi-brand and nested Surface previews can produce incorrect colors when the V4 alias fallback chain differs from the new unified token resolution. The risk is highest inside `<Surface mode="bold">` nesting where both the inner component and outer container read from the same alias chain.

**Fix approach:** Replace legacy aliases with their unified equivalents per the table in `CLAUDE.md`. Do component-by-component starting with Button, Chip, Input. The lenient gate (`pnpm check:legacy-tokens` without `--strict`) passes today; the strict gate is the true requirement.

---

### [HIGH] 4-Deep CSS Variable Fallback Chains in Several Components

**Files:**
- `packages/ui/src/components/Tabs/Tabs.module.css` line 83: `var(--Primary-Tinted, var(--Primary-TintedA11y, var(--Primary-Bold, var(--Surface-Bold))))`
- `packages/ui/src/components/Tabs/Tabs.module.css` line 310: same pattern for indicator
- `packages/ui/src/components/SingleTextButton/SingleTextButton.module.css` line 27, 33
- `packages/ui/src/components/SelectableButton/SelectableButton.module.css` lines 26, 30
- `packages/ui/src/components/SelectableIconButton/SelectableIconButton.module.css` lines 25, 29
- `packages/ui/src/components/Input/Input.module.css` lines 65, 332, 347
- `packages/ui/src/components/SelectableSingleTextButton/SelectableSingleTextButton.module.css` line 27

**Issue:** 4-level `var()` fallback chains were a transitional pattern during the V4→new-surface migration. They degrade debuggability and mask missing token injections. `CLAUDE.md` explicitly calls out `Tabs.module.css` as needing rewrite to unified names first.

**Fix approach:** Replace each 4-deep chain with the single unified name. For example: `var(--Primary-Tinted, var(--Primary-TintedA11y, var(--Primary-Bold, var(--Surface-Bold))))` → `var(--Primary-TintedA11y)`. Only a single 1-deep fallback to a legacy alias is acceptable during the cleanup window.

---

### [HIGH] Component Editor Uses Legacy Spacing Token Names

**File:** `apps/platform/src/design-tools/ComponentTokenEditor/ComponentTokenEditorContext.tsx`

**Issue:** `SIZE_ORDER` is keyed by T-shirt sizes (`6XS` through `15XL`). `generateSpacingTokens()` returns `Spacing-0-5` through `Spacing-40` keyed on old scale. When `foundationData.spacing.config.scale` is present, it sorts arbitrary scale keys by T-shirt order and emits `Spacing-${step}`. The source CSS already passes the numeric spacing gate; the editor UI does not.

**Impact:** The component editor can discover and persist legacy spacing choices that the component CSS source no longer uses. If a designer saves a token override through the editor, the persisted value may reference a token name that modern code does not resolve correctly.

**Fix approach:** Replace T-shirt-keyed option generation with the canonical numeric token list. Add normalization for any legacy persisted values at the API boundary before save or CSS generation.

---

### [HIGH] Convex Save Mutation Not Implemented in ComponentTokenEditor

**File:** `apps/platform/src/design-tools/ComponentTokenEditor/PropertyPanel/PropertyPanel.tsx` (line 323)

**Issue:** `// TODO: Implement Convex save mutation` — the property panel has no backend persistence. Token override edits made in the editor are lost on page reload.

**Impact:** The ComponentTokenEditor feature is incomplete. Any work done in the editor is not persisted.

**Fix approach:** Wire a Convex mutation at the `// TODO` site using the existing `componentThemes` table in `packages/convex/convex/schema.ts`.

---

### [MEDIUM] Legacy Typography Tokens in Production Components

**Files (selection):**
- `packages/ui/src/components/NavigationMenu/NavigationMenu.module.css` lines 42, 94: `var(--Typography-LineHeight-Normal)` (legacy)
- `packages/ui/src/components/SingleTextButton/SingleTextButtonPreview.tsx` lines 68, 86: `'var(--Typography-Size-XS)'` (legacy inline style)
- Platform component docs pages: 199 legacy typography alias matches across 38 files

**Impact:** When typography V2 aliases (`--Body-M-LineHeight`, role-specific size tokens) replace the legacy names, these usages will silently fall back to unresolved values. `NavigationMenu` line-height will collapse if `--Typography-LineHeight-Normal` is ever removed from the token emit.

**Fix approach:** `NavigationMenu.module.css` → replace with `--Body-M-LineHeight`. `SingleTextButtonPreview.tsx` → replace with `--Label-XS-FontSize`. Platform docs pages → systematic grep-and-replace.

---

### [MEDIUM] Multi-Brand Overview Page Reads from DOM CSS Vars (Theme Scope Mismatch)

**File:** `apps/platform/src/app/(platform)/(studio)/brand/overview/OverviewContent.tsx`

**Issue:** In Default Theme mode (`themeScope === 'preview'`), `FoundationStyleProvider` injects the PLATFORM brand CSS (One UI Theme), not the editing brand's CSS. If `OverviewContent` reads surface colors from `getComputedStyle(document.documentElement)`, it returns the platform brand's colors, not the editing brand's colors (e.g. Tira, Theater).

**Impact:** Brand overview swatches and surface previews show incorrect (platform brand) colors when viewing non-Jio brands in Default Theme mode. Multi-brand is visually broken in this path.

**Fix approach:** Replace DOM `getComputedStyle` reads with direct computation via `useSurfaceTokenVarsNew({ foundationData: editingBrandData, theme })` — this resolves from Convex data, not the DOM, and works regardless of theme scope. See `packages/ui/src/hooks/useSurfaceTokenVarsNew.ts`.

**Reference:** `project_surface_migration_status.md` § Root Cause of Multi-Brand Issues, item 2.

---

### [MEDIUM] Convex Token Table Contains Stale V4-Era Data

**Files:** `packages/convex/convex/tokens.ts`, `packages/convex/convex/utils/tokenResolver.ts`

**Issue:** The `api.tokens.list` query returns tokens stored in a Convex table that was synced via Figma or manual sync during the V4 era. After the surface migration replaced the V4 algorithm, these stored tokens were not updated. Most brands (Tira, Theater, sub-brands) have stale V4-format token data in this table.

**Impact:** Any platform feature that reads from the Convex tokens table (rather than computing from live CSS injection) will see V4-era token values. This affects any future feature that tries to build on the token sync pipeline.

**Fix approach:** Either re-sync tokens from Figma for each brand, or deprecate the token table and compute all token values from the live CSS engine instead.

---

### [MEDIUM] Check:Literals Fails on Shell.module.css (1200px Literal)

**File:** `packages/ui/src/components/Platform/Shell/Shell.module.css` (line 176)

**Issue:** `pnpm check:literals` fails — `max-width: 1200px` is a hard-coded pixel literal. The file has a comment marking it `INTENTIONAL-LITERAL` with a product layout rationale, but the literal gate does not have an allowlist entry for this file.

**Impact:** The `check:literals` gate currently fails. This blocks the "zero violations" quality requirement before shipping.

**Fix approach:** Either add a `--Dimension-*` or layout-specific token for the 1200px readable-column cap, or add this file/line to the `check:literals` allowlist with an explicit rationale comment per the project's known-exception pattern.

---

### [MEDIUM] Auth Context Hardcoded in Figma Integration Hooks

**Files:**
- `apps/platform/src/hooks/useFigmaSync.ts` (lines 168, 245): `syncedBy: 'current-user'`
- `apps/platform/src/hooks/useFigmaConnection.ts` (line 102): `userId: 'current-user'`

**Issue:** `// TODO: Get from auth context` — Figma sync records are stored with a hardcoded `'current-user'` string instead of the actual authenticated user ID.

**Impact:** Figma sync audit trails are meaningless. If multiple users sync from the same workspace, all records show `'current-user'` as the actor.

**Fix approach:** Read the authenticated user ID from the Convex auth context (e.g. `useConvexAuth()` or `useQuery(api.users.currentUser)`).

---

## Known Bugs

### Radio and CheckboxGroup: a11y label wrapping pattern

**Files:**
- `packages/ui/src/components/Radio/Radio.test.tsx` (line 143)
- `packages/ui/src/components/CheckboxGroup/CheckboxGroup.test.tsx` (line 96)

**Issue:** Both components render `<label>` wrapping `<span role="checkbox">` / `<span role="radio">`. The accessible name is applied to the label, not the interactive ARIA element. ARIA spec requires the `aria-label` or `aria-labelledby` be on the element with the ARIA role.

**Impact:** Screen readers may not announce the label for the interactive element. WCAG 2.1 AA violation risk.

**Fix approach:** Refactor the label–control association: either use `aria-labelledby` pointing to the label's text node, or restructure so the native element receives the accessible name directly.

---

### NumberField: Input Has No Accessible Name

**File:** `packages/ui/src/components/NumberField/NumberField.test.tsx` (line 16)

**Issue:** NumberField's `label` prop is rendered inside a `ScrubArea`, not as an accessible label associated with the input. The input field itself has no accessible name.

**Impact:** Screen readers cannot identify the input's purpose. WCAG 2.1 AA violation.

---

### CounterBadge: XS+High Dot-Only Mode Missing

**File:** `apps/qa-playground/src/components/counter-badge/CounterBadgeQaShowcase.tsx` (line 101)

**Issue:** Figma documents `size="xs"` + `level="high"` as a solid dot without numerals. The component always renders `displayValue` regardless of this size/level combination.

**Impact:** Visual parity gap vs Figma spec. QA validation grid explicitly flags this.

---

### ModeNav: `aria-current="page"` Not Tested

**File:** `packages/ui/src/components/Platform/ModeNav/ModeNav.test.tsx` (line 35)

**Issue:** ModeNav passes `aria-current="page"` to the active Button but this assertion is commented out with a `// TODO`. The accessibility contract is not test-covered.

---

## Migration In Progress

### Surface Algorithm: New System Works for Jio; Multi-Brand Partially Broken

**Status:** Base Jio brand: working. Non-Jio brands (Tira, Theater, sub-brands) in Default Theme mode: broken for overview page surface swatches.

**Root cause:** `FoundationStyleProvider.tsx` injects the platform brand (One UI Theme) in Default Theme mode, not the editing brand. DOM `getComputedStyle` reads return the wrong brand's values. See § Multi-Brand Overview Page above.

**What is complete:** New relative-step surface algorithm in `packages/shared/src/engine/surfaceNew.ts` (1093 lines). CSS emission in `packages/shared/src/engine/cssGenNew.ts` (1399 lines). V4 files deleted. All 21 story files and 4 showcase files updated to unified 5-mode surface pattern.

**What remains:**
- Fix overview page to compute from Convex data rather than DOM vars.
- The `contextCSS` field was added to `brandCSSCache` schema — verify it is being populated and consumed correctly for all brands.

---

### Typography V2: New Tokens Available, Old Tokens Still Widely Used

**Status:** V2 tokens fully defined in `packages/tokens/src/css/typography/typography.css`. New role-specific tokens (`--Body-M-FontSize`, `--Headline-L-FontSize`, etc.) are available. Legacy tokens (`--Typography-Size-*`, `--Typography-Weight-*`, `--Typography-LineHeight-*`) are still emitted for backward compatibility.

**What remains:**
- 274 legacy typography alias matches in 47 UI package component/story files.
- 199 legacy typography matches in 38 platform docs files.
- 14 legacy typography matches in ComponentTokenEditor files.
- `NavigationMenu.module.css` uses `--Typography-LineHeight-Normal` (2 instances).
- `SingleTextButtonPreview.tsx` uses `--Typography-Size-XS` inline (2 instances).

**Risk:** When legacy aliases are eventually removed, these silently break. No deprecation timer is currently set.

---

### Native Token Builders: Motion and Elevation Gaps

**Status:** Spacing and shape native token builders exist (`buildNativeDimensions.ts`). Motion and elevation builders do not exist.

**Files needed:**
- `packages/shared/src/engine/buildNativeMotion.ts` (missing)
- `packages/shared/src/engine/buildNativeElevation.ts` (missing)

**Impact:** Any `packages/ui-native/src` component that uses motion (animation duration/easing) or elevation (shadows) will have to use literal values, which the `check:literals` gate will flag.

**Current workaround:** `GlassView.native.tsx` uses `INTENTIONAL-LITERAL` comment to suppress the gate for a blur intensity literal. This is tracked as a native-rewrite TODO.

**Reference:** `docs/native-spacing-shape-plan.md` § 7 (Out of Scope).

---

### Component Coverage: 25 of 72 Components Missing Required Files

**Reported by:** `pnpm audit:component-files` (as of 2026-05-14 audit)

**Components missing stories (Storybook coverage gap):** Accordion, ChatSurface, CheckboxGroup, Collapsible, Dialog, Fieldset, Form, Link, Menu, Meter, NavigationMenu, NumberField, Popover, PreviewCard, Progress, ScrollArea, SegmentedControl, Separator, Toast, Toggle, ToggleGroup, Toolbar.

**Components missing tests:** ChatSurface, Fieldset, Form, Meter, NavigationMenu, PreviewCard, ScrollArea, Toast, Toolbar.

**Components missing shared files:** SegmentedControl, Surface.

**Risk:** These components cannot pass the 8-story Storybook requirement from `docs/DEVELOPER_GUIDE.md`. Missing tests mean regressions won't be caught. Missing shared files break the `check:metadata` gate.

---

### Registry/Metadata/Catalog Out of Sync (Multiple Failing Gates)

**Gates currently failing** (as of 2026-05-14 audit):
- `pnpm check:metadata` — Modal's `body` slot not in `ModalProps`; Text meta lists `variant`/`size` not in `TextProps`.
- `pnpm check:jio-alpha-catalog` — 21 missing slug-map entries.
- `pnpm check:machine-docs-fresh` / `pnpm docs:machine:check` — 15 generated docs drifts, including SingleTextButton docs and CircularProgressIndicator, IconButton, Spinner, Text.
- `pnpm check:support-matrix` — ChatComposer and Modal missing matrix artifacts.
- `pnpm check:parity` — Native parity not implemented for most web components.

**Impact:** Platform docs, Storybook discoverability, AI/AST composition, and machine-generated docs all read from different registry contracts that are drifting from each other.

**Fix approach:** Regenerate machine docs (`pnpm docs:machine:generate`), fix Modal and Text meta slots, add missing slug-map entries, add ChatComposer support matrix artifacts.

---

### Component Editor Chrome Still Uses Raw HTML Controls

**Files (highest hotspots from 2026-05-14 audit):**
- `apps/platform/src/design-tools/ComponentTokenEditor/DecorationSection.tsx`
- `apps/platform/src/design-tools/ComponentTokenEditor/EditorToolbar.tsx`
- `apps/platform/src/design-tools/ComponentTokenEditor/PropertyPanel/PropertyPanel.tsx`
- `apps/platform/src/design-tools/ComponentTokenEditor/ActionsMenu.tsx`
- `apps/platform/src/design-tools/ComponentTokenEditor/GranularTargetSelector.tsx`
- `apps/platform/src/design-tools/ComponentTokenEditor/TokenSelector.tsx`

**Issue:** 28 raw `<button>/<select>/<input>/<textarea>` elements across 13 files. The editor chrome is not dogfooding the design system.

**Impact:** Editor UI bypasses the token cascade. Colors, typography, and spacing in the editor are not brand-responsive.

---

### Publishing Pipeline: Phase C Not Complete

**File:** `docs/PUBLISHING-INFRA-TODO.md`

**Issue:** Package publishing to Azure DevOps JioDS feed (Phase C) requires external setup: Azure PAT creation, GitHub Actions secret, and feed scope approval for `@jds4`. No code changes required, but the first publish has not happened.

**Status:** Phases A and B (library readiness, package naming) complete. Phase C (CI stitching, first publish) pending external admin action.

---

## Risk Areas

### Large Files — Complexity Candidates

| File | Lines | Risk |
|------|-------|------|
| `packages/ui/cdn-bootstrap/jio.ts` | 9875 | Auto-generated baked CSS. Do not edit. Re-run `pnpm cdn:bake-jio` after token changes. |
| `apps/platform/src/app/(platform)/(studio)/foundations/color/ColorContent.tsx` | 2916 | Very large single component; high cognitive load for changes. |
| `apps/platform/src/design-tools/ExperienceCanvas/ExperienceCanvas.tsx` | 2096 | Complex canvas system; no tests confirmed. |
| `apps/platform/src/app/(platform)/(studio)/foundations/typography/tabs.tsx` | 2088 | Typography editor tabs; all 5 tabs in one file. |
| `packages/convex/convex/schema.ts` | 1965 | Entire Convex schema in one file. |
| `apps/platform/src/app/(platform)/(studio)/components/[component]/editor/EditorContent.tsx` | 1557 | Component editor entry point; props-threading complexity. |
| `packages/shared/src/engine/cssGenNew.ts` | 1399 | CSS generation engine. Business-critical; change with tests. |
| `packages/shared/src/engine/surfaceNew.ts` | 1093 | Surface algorithm. Business-critical; change with tests. |

---

### Fragile Areas

**`packages/shared/src/engine/cssGenNew.ts` + `surfaceNew.ts`:**
- Files: `packages/shared/src/engine/cssGenNew.ts`, `packages/shared/src/engine/surfaceNew.ts`
- Why fragile: Any change to token naming or surface resolution order affects ALL brands, ALL components, ALL themes simultaneously. The `validateBrandCSS` gate catches size/count violations but not behavioral regressions.
- Safe modification: Run `pnpm --filter @oneui/shared test` and `pnpm --filter @oneui/ui test` after every change. Check Storybook visually for the full surface matrix.
- Test coverage: 100/100 tests in `cssGenNew.test.ts` pass; 14 failures currently in `surfaceNew.test.ts`.

**`apps/platform/src/components/FoundationStyleProvider.tsx`:**
- Why fragile: Controls WHICH brand's CSS is injected globally. Setting `injectionMode: 'none'` silently removes all surface/typography/stroke tokens. The `themeScope` logic has a known asymmetry (Default Theme injects platform brand; Brand Theme injects editing brand) that is correctly documented but easy to misread.
- Safe modification: Read `docs/surface-context-awareness.md` § Theme Scope Mismatch before touching this file. Never set `injectionMode: 'none'`.

**`apps/platform/src/app/(platform)/_layout/` (17 files):**
- Why fragile: Recently decomposed from a 1042-line monolith. Hooks (`useBrandsCatalog`, `useShellNavigation`, `useBrandSwitching`) have tests, but the rendered shell components (`Sidebar.tsx`, `PlatformShell.tsx`, `BrandSwitching.tsx`) have no render tests.
- Safe modification: Touch hooks via the existing test suite. Changes to `PlatformShell.tsx` layout should be validated by smoke-testing the platform dev server.

---

### Duplicate Assets

**Jio icon data JSON (813 KB duplicated):**
- `apps/platform/public/jio-icons-data.json` (832 741 bytes)
- `packages/icons-jio/src/data.json` (832 741 bytes)

Both files are identical. `apps/platform` should import from `packages/icons-jio` and remove the public copy. Until then, every update to the icon set requires updating both files in sync.

---

## Security Considerations

**`NODE_TLS_REJECT_UNAUTHORIZED=0` in build scripts:**
- Risk: Three root-level scripts disable TLS certificate verification.
- Files: `package.json` scripts `build:foundation`, `build:brand-css`, `pack:all`
- Current mitigation: These scripts only run in CDN build contexts, not during `pnpm dev` or test.
- Recommendation: Identify why TLS verification fails (likely a corporate proxy or self-signed cert in the CI environment) and fix the root cause rather than suppressing TLS errors globally.

---

## Component API Gaps (Figma vs Code)

These are tracked in `apps/qa-playground/` showcases as explicit TODO items:

| Component | Missing | Files |
|-----------|---------|-------|
| `Button` | `accent` prop (Figma "accent" maps to `appearance` — no separate prop) | `apps/qa-playground/src/components/button/ButtonQaShowcase.tsx:441` |
| `SelectableSingleTextButton` | `accent` prop + `content` enum prop | `apps/qa-playground/src/components/selectable-single-text-button/SelectableSingleTextButtonQaShowcase.tsx:336` |
| `Badge` | `accent` prop | `apps/qa-playground/src/components/badge/BadgeQaShowcase.tsx:382` |
| `CounterBadge` | dot-only mode for `size="xs" level="high"` | `apps/qa-playground/src/components/counter-badge/CounterBadgeQaShowcase.tsx:101` |
| `TabGroup` / `PaginationDots` | `data-testid` prop not forwarded to root element | `apps/qa-playground/src/components/tabs/TabsQaShowcase.tsx:71` |
| `Stepper` | `start`/`end` slot props (Figma "Code only" rows) | `apps/qa-playground/src/components/stepper/StepperQaShowcase.tsx:251` |
| `Divider` | `brand-bg` appearance not in `DividerAppearance` | `apps/qa-playground/src/components/divider/DividerQaShowcase.tsx:35` |
| `IndicatorBadge` | `value` readout variant | `apps/qa-playground/src/components/indicator-badge/IndicatorBadgeQaShowcase.tsx:145` |
| `Avatar` | `accent` prop (Figma lists `primary | secondary | sparkle`) | `apps/qa-playground/src/components/avatar/AvatarQaShowcase.tsx:219` |

---

## Deprecated Schema Fields

**File:** `packages/convex/convex/schema.ts`

| Field | Status | Notes |
|-------|--------|-------|
| `dimensions.scale` (line 362) | DEPRECATED — shape t-shirt sizes no longer used; f-step scale is source of truth | Old records still exist; schema allows the field for round-trip compatibility |
| `algorithmVersion` on foundations (line 151) | Persisted marker (`2` = V4 era). Not gating any runtime behavior today | Kept for backward compatibility of old records |
| Legacy `typographyConfigs` / `typographyV2Configs` tables (line 282) | Comment says "legacy" — superseded by dimension configs | May still have live records for old brands |

---

## Developer Experience Pain Points

**Node version mismatch:** Repo requires `>=20.0.0` but the shell running quality gates in the 2026-05-14 audit was Node `18.20.8`, causing engine warnings across all commands. Developers on Node 18 will see warnings on every `pnpm` command.

**Check:literals vs intentional literals:** `Shell.module.css` uses `INTENTIONAL-LITERAL` comment pattern that is not in the `check:literals` allowlist, causing a gate failure. The allowlist mechanism needs to be extended to cover this case, or the comment convention needs to be enforced by the script.

**FIXME(WS5) in check-ai-vocab.ts:** `scripts/check-ai-vocab.ts` (line 46) has an explicit `FIXME(WS5)` with an exclude list of docs paths that will need to be removed once a WS5 docs workstream PR merges. This is a temporary workaround that will fail silently if WS5 lands without cleaning up the exclude list.

**RFC-0004 deferred surface edge case:** Fill-bearing non-`<Surface>` components (Badge inside Badge, Accordion inside Accordion with same mode) produce identical colors because they inherit the parent's surface step context. The current workaround (`surfaceShield` class in `Badge.module.css`) detaches the inner component from the cascade entirely. RFC-0004 (`docs/rfcs/0004-fill-bearing-container-surface-context.md`) is drafted but deferred. New component authors may accidentally hit this edge case when building nested fill-bearing components.

---

*Concerns audit: 2026-05-29*
