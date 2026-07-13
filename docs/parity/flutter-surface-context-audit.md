# Flutter surface context audit

Systematic parity checklist: Flutter `OneUiSurface` + colour resolvers vs web `[data-surface]` brand CSS + React / React Native.

**Source of truth:** Web brand CSS injection (`cssGenNew.ts` / `[data-surface]` remapping) and Convex `nativeTheme:getNativeThemeSnapshot` (`rootRoles` + `componentCustomProperties`).

## Engine invariants (must hold for every component)

| # | Invariant | Web | Flutter |
|---|-----------|-----|---------|
| E1 | Nested surface depth | `[data-surface]` blocks remap `--{Role}-*` | `OneUiSurface` increments `surfaceDepth`; `resolveRolesInsideSurface` |
| E2 | No root-pinned hex inside nested surfaces | Literals only at `:root` | `oneUiIsRootPinnedLiteral` → skip in `resolveColorFromComponentPropertyKeys` |
| E3 | Role slots before fill literals when nested | `--Button-roleBold` peels to remapped `var(--Primary-Bold)` | `oneUiComponentColorKeyOrder` promotes `--*-role*` keys |
| E4 | `var(--Primary-*)` resolves at **current** surface step | CSS cascade | `resolveButtonTokenColor` + `OneUiSurfaceScope.tokensMaybe` |
| E5 | Slot icons on tinted controls | `--Icon-color` / `--_ch-default-accent-a11y` | `BadgeSlotIconColorScope` + component role tinted keys |
| E6 | Unselected / chrome on parent role | `data-unselected-appearance` | Use parent surface `appearance`, not widget default `primary` |
| E7 | `appearance="auto"` | Component CSS default (e.g. Chip → secondary) | Match web module default, not `primary` |
| E8 | Storybook surface demos | New JSX per row OK | **New widget instance per row** (no reuse in `for` loop) |
| E9 | Focus halo gap | `--Surface-Halo-Gap` remapped per surface | `resolveOneUiFocusRingSpec` + scoped tokens |
| E10 | Cross-role bold-on-bold | Web resets parent step | `OneUiSurface` `isCrossRoleBoldOnBold` |
| E11 | Role token lookup | `useSurfaceTokens(appearance)` → primary → neutral | `OneUiSurfaceScope.tokensForAppearance` (not strict `tokensMaybe` for paint) |
| E12 | Gap card only when role absent from brand | N/A | `isAppearanceConfigured` checks `themeConfig.appearances`, not snapshot cache |
| E13 | JSON role key drift | `brand-bg` in engine | `normalizeAppearanceRoleKey` on `rootRoles` + `themeConfig` parse |

**Shared helpers:** `nested_surface_component_resolve.dart`, `tokens/appearance_roles.dart`, `theme/surface_scope.dart`

## Per-component audit matrix

Status: **OK** = resolver uses shared nested helper + surface story exists; **GAP** = known fix needed; **TODO** = not yet audited.

| Component | Resolver | Surface story | Slot icon scope | Nested literal skip | Notes |
|-----------|----------|---------------|-----------------|---------------------|-------|
| Button | `button_color_resolve.dart` | `button_story_catalog` | N/A (label in button) | OK (shared) | `useRoleSlots` only when `appearance == primary` — matches web `.appearancePrimary` |
| IconButton | `icon_button_color_resolve.dart` | `icon_button_story_catalog` | N/A | OK (shared) | Same role-slot rule as Button |
| Chip | `chip_color_resolve.dart` | `chip_story_catalog` | OK | OK | `unselectedAppearance`, `auto` → secondary |
| ChipGroup | (uses Chip) | `chip_group_story_catalog` | OK | OK | One group per surface row |
| Badge | `badge_color_resolve.dart` | `badge_story_catalog` | OK | OK | No web `--Badge-role*`; slot uses role `tintedA11y` |
| CounterBadge | `counter_badge_color_resolve.dart` | — | — | OK (shared) | |
| IndicatorBadge | `indicator_badge_color_resolve.dart` | `indicator_badge_story_catalog` | — | Partial | Single bg key only |
| Icon | `icon_color_resolve.dart` | `icon_story_catalog` | via BadgeSlot | OK (shared) | |
| IconContained | `icon_contained_color_resolve.dart` | `icon_contained_story_catalog` | — | OK (shared) | |
| Avatar | `avatar_color_resolve.dart` | `avatar_story_catalog` | — | OK (shared) | |
| Text | `text_color_resolve.dart` | `text_story_catalog` | N/A | Uses role tokens | |
| CPI | `cpi_color_resolve.dart` | `circular_progress_indicator_story_catalog` | N/A | OK (shared) | |
| Input | `input_color_resolve.dart` | `input_field_story_catalog` | OK (feedback) | OK (`resolveInputExplicit…`) | `neutral` → `primary` when nested |
| InputFeedback | `input_feedback_resolve.dart` | internals catalog | OK | TODO audit | |
| Image | `image_style_resolve.dart` | — | N/A | TODO | Non-colour mostly |

## Audit procedure (run before marking a component “done”)

1. Open web `*.module.css` + `*.stories.tsx` Surface Context story.
2. Open RN `interface.ts` + native surface story if present.
3. Confirm Flutter story uses `OneUiSurface` + correct fill override (`--{Role}-Fill-{mode}`).
4. Grep resolver for `rawComponentCascade` — must go through `resolveColorFromComponentPropertyKeys` (or explicit skip for non-colour keys).
5. Widget test: nested `OneUiSurface(mode: bold)` + pinned `#hex` in DS → colour must **not** equal pinned hex.
6. Visual: Storybook hot restart on Swadesh + Reliance + Jio (light/dark) for bold/subtle rows.

## Common failure signatures

- Icon/slot **black on light tinted surface** → missing `BadgeSlotIconColorScope` or not reading `--{Component}-roleTintedA11y`.
- **Same colours on all ChipGroup sizes** → group context not propagated (empty default on child).
- **Bold row looks like page primary** → root hex override or `appearance auto` mapped to `primary`.
- **Surface story only first row works** → reused StatefulWidget in Flutter loop.

## Convex / nativeTheme

- `rootRoles`: page-root hex per role — must match `buildNativeTheme` / RN provider.
- `componentCustomProperties`: role slots often `var(--Primary-*)`; safe on nested surfaces; **pinned `#hex` is not**.
- Re-fetch snapshot after brand edits; Flutter Storybook uses same HTTP query as RN.

## Next pass (user-directed)

Work through the matrix top-to-bottom: fix **GAP**/**TODO**, add widget test per row, extend `docs/parity/*-web-native-parity.md` links from this doc.
