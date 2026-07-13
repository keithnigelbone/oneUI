# Legacy `[data-surface]` context-CSS removal — plan

> Next-step optimization after RFC-0003 + the static/dynamic split. Drops the redundant role-token emissions inside the depth-1 `[data-surface="<mode>"]` blocks (~58 KB/brand) and migrates the few non-redundant pieces into the step-keyed cascade so they also work at depth ≥ 2.

## 1. Goal

Shrink `<style id="oneui-foundation-tokens">` from ~253 KB → ~205 KB per brand by removing the dead-weight role-token emissions inside legacy `[data-surface="<mode>"]` context blocks. These were superseded by `[data-surface-step="N"]` step-lookup CSS during the arbitrary-nesting work — they agree at depth 1 and lose to step-lookup at depth ≥ 2.

Bonus: fixes the known halo-gap bug at depth ≥ 2 if the halo-gap remapping currently relies on the legacy blocks.

## 2. Current state

- `generateNewContextCSS(palette, theme)` emits `~58 KB` of depth-1 `[data-surface="<mode>"]` blocks per theme.
- `generateNewStepLookupCSS(palette)` emits `~228 KB` of `[data-surface-step="N"]` blocks (theme-agnostic, all 25 steps × all roles).
- Both fire simultaneously at depth 1 (`<Surface>` writes both attributes). At depth ≥ 2 only step-lookup is correct.
- 10 components have CSS rules that **select on** `[data-surface="<mode>"]` (Input/Slider/Surface/Spinner/ListItem/Divider/PaginationDots/Switch/TouchSlider/Badge — 40 selectors total). Those rules apply component-specific styling; they do NOT consume the role-token emissions inside the legacy blocks. They remain unaffected.

## 3. Audit — what's actually inside `generateNewContextCSS`

**Required first step.** Token categories to enumerate:

| Category | Likely redundant with step-lookup? | Notes |
|---|---|---|
| `--{Role}-{Surface}` (Bold/Subtle/Minimal/etc.) | Yes | step-lookup emits identical values |
| `--{Role}-{Content}` (High/Medium/Low/Tinted/TintedA11y/Stroke-*) | Yes | step-lookup emits identical values |
| `--{Role}-{State}` (Hover/Pressed/Bold-Hover/etc.) | Verify | currently emitted in legacy blocks; need to confirm step-lookup also covers them |
| `--{Role}-Bold-{Content}` (Bold-High/Bold-Medium/Bold-TintedA11y) | Yes | step-lookup covers these |
| `--Surface-Halo-Gap` | NO — non-redundant | CLAUDE.md: emitted in cssGenNew, "remapped inside every `[data-surface]` block to the matching `--Surface-Fill-{Mode}` token." Currently only works at depth 1. |
| `--Surface-Main` / surface fill aliases | Verify | check if any non-redundant aliases live in context blocks |
| `--Text-*` legacy aliases | Verify | step-lookup may not emit these; appearance-redirect CSS handles role-to-Text remapping |
| Border / focus tokens | Verify | likely emitted in root, but check |

**Concrete audit command:** for each `[data-surface="<mode>"]` block, list emitted token prefixes and cross-reference with what step-lookup emits at the corresponding step. Anything in legacy but NOT in step-lookup = non-redundant.

## 4. Migration strategy

### Phase 1 — confirm redundancy
1. Write a script that runs both emitters, parses each block's declarations, and produces a coverage report: per token, "emitted by step-lookup", "emitted by legacy context", or "both".
2. For "legacy only" tokens, decide per-token: migrate or drop.

### Phase 2 — move non-redundant pieces to step-lookup blocks
Most important candidate: **`--Surface-Halo-Gap`**.
- Today: emitted at `:root` (default) and remapped inside each `[data-surface="<mode>"]` block.
- After: emit at `:root` (default) and remap inside each `[data-surface-step="N"]` block to the matching step's `--Surface-Fill-{Mode}`.
- This is a small change to `cssGenNew.ts` — add the halo-gap declaration to the step-lookup decl maps when each step is rendered.
- Side benefit: fixes the halo-gap-at-depth-≥-2 bug noted in CLAUDE.md.

For state tokens (`--{Role}-Hover` etc.) if not already in step-lookup, same pattern: add to the step-lookup decl maps.

### Phase 3 — drop redundant role-token emissions from legacy context
- Modify `generateSurfaceContextCSS` (or its caller in `computeNewStacking.ts`) to emit only the non-redundant tokens identified in Phase 1.
- Keep the `[data-surface="<mode>"]` selectors alive (components still select on them for their own rules) but with empty/minimal declaration bodies.

### Phase 4 — measure
- Re-run `compare-css-bundle.ts`. Expected: `contextCSS` drops from ~58 KB → ~5–10 KB. Total per-brand bundle: ~253 KB → ~205 KB.
- Visual regression sweep in Storybook on representative stories (focus halos, surface contexts, component variants).

## 5. Risks

| Risk | Mitigation |
|---|---|
| A non-redundant token slips through the audit and silently disappears | Phase 1's coverage report must list every token in `generateNewContextCSS` output. Anything not provably duplicated by step-lookup stays. |
| Focus halo breaks at depth 1 after halo-gap migration | Migrate halo-gap by ADDING to step-lookup blocks first, then removing from legacy. Two-step rollout — verify visually before removing. |
| Component CSS that selects on `[data-surface="<mode>"]` breaks if `<Surface>` stops setting the attribute | Don't touch `<Surface>`. Keep emitting `data-surface` for component-side selectors. Only the legacy emit-CSS goes away. |
| Specificity differences cause subtle cascade changes | Step-lookup and legacy currently both have specificity 0,1,0. Empty legacy blocks won't change the cascade order for tokens we keep emitting. |
| Tests assert on specific legacy emissions | Update tests to assert tokens resolve at step (already the pattern from Approach B tests). Don't assert on legacy block presence. |

## 6. Validation

1. **Unit:** existing `cssGenNew.test.ts` tests still pass. Add new tests asserting that halo-gap and any other migrated token resolves correctly at every step in both light and dark.
2. **Visual:** Storybook snapshot diff on 5–10 representative stories: focus halos (Button, Input), nested surfaces (Surface > Surface > Button), surface modes (Slider, Switch).
3. **Size:** `compare-css-bundle.ts` shows the expected drop. Commit threshold check to `check-perf.ts`.
4. **Manual:** quick brand-switch + theme-toggle smoke test in Storybook.

## 7. Rollout

Single PR is fine — changes are contained to:
- `packages/shared/src/engine/cssGenNew.ts` (migrate non-redundant tokens to step-lookup blocks; trim legacy context emissions)
- `packages/shared/src/engine/__tests__/cssGenNew.test.ts` (new resolution tests for migrated tokens)
- No component CSS changes.
- No platform/Storybook config changes.

Optional env-flag escape hatch (`ONEUI_LEGACY_CONTEXT_CSS=1`) for one release cycle if anyone wants to A/B compare.

## 8. Expected outcome

| Metric | Today | After this work |
|---|---|---|
| `<style id="oneui-foundation-tokens">` bytes/brand | 253 KB | ~205 KB (−19%) |
| Halo-gap correctness at depth ≥ 2 | Broken (per CLAUDE.md) | Fixed |
| Brand-switch payload | 253 KB | ~205 KB |
| Theme-toggle payload | 253 KB (whole bundle rebuilds) | ~205 KB |

Theme-toggle flicker still happens (rootCSS + transparentMaterialCSS remain theme-dependent at 16 + 45 KB). That's a separate, smaller optimization for later — merge both themes' rootCSS into a single theme-merged emission similar to step-lookup, or split the bundle into theme-agnostic + theme-overlay sheets.
