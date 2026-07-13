# SegmentedControl — Web ↔ Native parity

| Area | Web | React Native |
|------|-----|--------------|
| Component | `SegmentedControl.tsx` (Base UI `ToggleGroup` + `Toggle`) | `SegmentedControl.native.tsx` (`Pressable`) |
| Contract | `SegmentedControl.shared.ts` | `interface.ts` + `SegmentedControlContext.ts` |
| Compound API | `SegmentedControl` + `SegmentedControl.Item` | Same (`Object.assign` namespace) |

Layers cross-check: `jdssegmentedcontrol-4` / `jdssegmentedcontrol` (`size` S/M/L, `attention`, `shape`, icon vs text content) — enums align with the web `.shared.ts` public API, which is the source of truth.

## Functional API

| Prop / behavior | Web | RN |
|-----------------|-----|-----|
| `value` / `defaultValue` / `onValueChange` (single-select, always one selected) | ✓ | ✓ controlled + uncontrolled |
| `size` `s` / `m` / `l` (default `m`) | ✓ | ✓ `SegmentedControl.styles.native.ts` |
| `attention` `high` / `medium` / `low` (default `high`) | ✓ | ✓ selected-segment paint |
| `appearance` (9 roles + `auto` → parent Surface → primary) | ✓ | ✓ `useSurfaceTokens` |
| `trackEmphasis` `high` / `medium` / `low` (default `high`) | ✓ | ✓ track fill + border |
| `shape` `pill` / `rectangular` | ✓ `Shape-Pill` / `Shape-2` | ✓ `theme.shape.Pill` / `theme.shape['3XS']` |
| `equalWidth` (default `true` text · `false` icon) | ✓ | ✓ same default rule |
| `type` `text` / `icon` (icon = fixed square cells) | ✓ | ✓ |
| `disabled` (group) + per-item `disabled` | ✓ | ✓ + `DISABLED_OPACITY` (0.38) |
| Item `start` (icon) / `end` (CounterBadge) slots | ✓ | ✓ `ReactNode` |
| Item `value` | ✓ | ✓ |
| Track role = parent Surface appearance ?? `neutral` | ✓ `useSurfaceAppearance` | ✓ `useSurfaceAppearance` passed into `useSegmentedControlGroupState` |
| Low-attention selected role = track role (parent ?? neutral) | ✓ | ✓ `selectedAppearance` |
| Surface context remapping | `[data-surface]` CSS | `<Surface mode>` parent + explicit `useSurfaceTokens` |
| `className` | ✓ | — |
| `style` | `CSSProperties` | `ViewStyle` (on the track) |
| `data-testid` | ✓ | `testID` |
| Item `onClick` | ✓ | `onPress` (+ `onClick` alias) |

## Paint model

Web resolves these through the `[data-surface]` cascade + the `.appearance*` role
class map on the group root; native resolves the equivalent `NativeRoleTokens`
explicitly. `selectedRole = useSurfaceTokens(selectedAppearance)`,
`trackRole = useSurfaceTokens(trackAppearance)`.

| State | Web token | RN |
|-------|-----------|-----|
| Track — emphasis `high` | `--{Track}-Minimal` | `trackRole.surfaces.minimal` |
| Track — emphasis `medium` | `--{Track}-Ghost` + `--{Track}-Stroke-Medium` border | `trackRole.surfaces.ghost` + `trackRole.content.strokeMedium` |
| Track — emphasis `low` | `--{Track}-Ghost`, no border | `trackRole.surfaces.ghost`, transparent border |
| Unselected label / icon | `--{Track}-High` | `trackRole.content.high` |
| Unselected hover (track `high`) | `--{Track}-Subtle` | `trackRole.surfaces.subtle` |
| Unselected hover (track `medium`/`low`) | `--{Track}-Minimal` | `trackRole.surfaces.minimal` |
| Unselected pressed | `--{Track}-Subtle-Pressed` / `--{Track}-Pressed` | `trackRole.states.subtlePressed` / `.pressed` |
| Selected `high` fill / text | `--{Role}-Bold` / `--{Role}-Bold-TintedA11y` + `Elevation-1` | `selectedRole.surfaces.bold` / `.onBoldContent.tintedA11y` + elevation level 1 |
| Selected `high` hover / pressed | `--{Role}-Bold-Hover` / `-Pressed` | `selectedRole.states.boldHover` / `.boldPressed` |
| Selected `medium`/`low` fill / text | `--{Role}-Subtle` / `--{Role}-TintedA11y` | `selectedRole.surfaces.subtle` / `.content.tintedA11y` |
| Selected `medium`/`low` hover / pressed | `--{Role}-Subtle-Hover` / `-Pressed` | `selectedRole.states.subtleHover` / `.subtlePressed` |

### Slots & bold-on-bold badges

Web wraps a selected segment's slots with `data-surface` + `data-surface-step`
so a nested `CounterBadge` re-steps `--{Role}-Bold` and stays distinguishable on a
bold segment. Native mirrors this: `resolveSegmentSlotSurface` returns `bold`
(attention `high`) or `subtle` (attention `medium`/`low`), and `SegmentSlot`
wraps the slot in `<Surface mode={…}>` (fill suppressed) so the badge resolves at
the segment's step. The slot also publishes `SlotParentAppearanceProvider`
(CounterBadge role inheritance) and `ComponentSlotIconContext` (icon size + tint =
segment text colour).

## Accessibility

| Prop / behavior | Web | RN |
|-----------------|-----|-----|
| Group landmark | Base UI `ToggleGroup` (labeled group) | `accessibilityRole="tablist"` when `aria-label` set |
| Segment | `<button aria-pressed>` (`Toggle`) | `accessibilityRole="tab"` + `accessibilityState.selected` |
| Icon-only segment name | `aria-label` required | Same + dev warning |
| Segment label | `children` text | `aria-label` ?? string `children` |
| Disabled | `disabled` attribute | `accessibilityState.disabled` + `Pressable disabled` |
| `accessibilityHint` | — | ✓ (group + item) |

**Role mapping note:** web renders single-select toggle buttons (`aria-pressed`);
native uses the `tablist` / `tab` idiom (the conventional RN mapping for a
segmented control — iOS `UISegmentedControl` surfaces as tabs). Both announce the
"one of N selected" semantics with a persistent selected member. Helpers:
`getSegmentedControlAccessibilityProps`, `getSegmentItemAccessibilityProps`,
`resolveSegmentItemAccessibilityLabel` in `interface.ts` (unit-tested in
`SegmentedControlA11y.test.ts`).

## Storybook ↔ native showcase

| Web story | Native showcase export |
|-----------|------------------------|
| Default | `SegmentedControlDefault` |
| AttentionLevels | `SegmentedControlAttentionLevels` |
| TrackEmphasis | `SegmentedControlTrackEmphasisLevels` |
| Sizes | `SegmentedControlSizes` |
| Shapes | `SegmentedControlShapes` |
| EqualWidth | `SegmentedControlEqualWidth` |
| WithSlots | `SegmentedControlWithSlots` |
| IconOnly | `SegmentedControlIconOnly` |
| Appearances | `SegmentedControlAppearances` |
| States | `SegmentedControlStates` |
| SurfaceContext | `SegmentedControlSurfaceContext` |
| CounterBadgeOnBoldSurface | `SegmentedControlOnBoldSurface` |
| NestedSurfaces | `SegmentedControlNestedSurfaces` (transparent-material hero nest omitted — native `Surface` has no `mediaContext`) |

## Known gaps

- **Keyboard navigation / focus halo** — Web uses Base UI roving focus + a
  `--Surface-Halo-Gap` double ring on `:focus-visible`; native relies on OS
  accessibility traversal and has no persistent focus ring on touch targets.
- **`Material-Fill` / `Material-Text`** — Web's optional per-role metallic
  selected fill (`--{Role}-Material-Fill`) is not wired on the segment fill yet;
  native paints the solid `surfaces.bold`. (Surface-level metallic still works via
  `<Surface mode="bold">`.)
- **`aria-labelledby`** — Accepted on props for API parity; native cannot resolve
  an element id, so use `aria-label` for the announced name.
- **Semantic icon-name string slots** — Native slots take `ReactNode` (e.g.
  `<Icon icon={glyph} />`); string catalog names are a shared library-wide gap.
- **CounterBadge auto-size** — Web clones the `end` `CounterBadge` to set its
  `size` to the segment size (`counterBadgeSizeForSegment`). Native does not
  auto-inject (the RN `CounterBadge` has no `displayName` to detect safely) — pass
  `size` explicitly on the badge for non-`m` segments.
- **`check:parity` shared-import rule** — Like every modern native component
  (Button, Card, Tabs, …), the native file owns its contract in `interface.ts`
  and does **not** import from `@oneui/ui/.../shared` (per the build playbook and
  `.cursor/rules/ui-native-component-build.mdc`). The script's legacy
  "MISSING SHARED IMPORT" line for SegmentedControl is the same accepted baseline
  as those components; the file-presence gate passes.
