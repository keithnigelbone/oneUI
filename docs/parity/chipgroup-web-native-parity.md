# ChipGroup — Web ↔ Native ↔ Flutter parity

| Area | Web | React Native | Flutter (`ui_flutter`) |
|------|-----|--------------|------------------------|
| Component | `ChipGroup.tsx` | `ChipGroup.native.tsx` | `one_ui_chip_group.dart` |
| Contract | `ChipGroup.shared.ts` | `interface.ts` | `one_ui_chip_group_types.dart` + `one_ui_chip_group_a11y.dart` |

## Functional API (selection + layout)

| Prop / behavior | Web | RN | Flutter |
|-----------------|-----|-----|---------|
| `value` / `defaultValue` / `onValueChange` | ✓ | ✓ | ✓ |
| `multiple` | ✓ | ✓ | ✓ |
| `orientation` | ✓ | ✓ | ✓ |
| `wrap` (+ horizontal scroll when `wrap={false}`) | ✓ | ✓ | ✓ |
| `size` / `variant` / `appearance` (context) | ✓ | ✓ | ✓ |
| `maxSelections` / `required` | ✓ | ✓ | ✓ (`computeNextChipGroupValues`) |
| `disabled` | ✓ | ✓ | ✓ (propagates to chips) |
| `loopFocus` + arrow keys | ✓ Base UI | Prop only (not wired) | ✓ custom roving focus |
| `className` / `style` | ✓ | `style` | N/A (wrap in `Padding` / parent) |
| `testID` / `data-testid` | — / — | `testID` | `testId` / `testID` |

## Accessibility props

| Prop | Web | RN | Flutter |
|------|-----|-----|---------|
| `aria-label` | ✓ | ✓ | `semanticsLabel` / `ariaLabel` |
| `aria-labelledby` | ✓ | ✓ (exposes group; label not resolved) | `semanticsLabelledBy` / `ariaLabelledBy` + `Semantics.identifier` |
| `accessibilityHint` | — | ✓ | `semanticsHint` / `accessibilityHint` |
| Per-chip `selected` | `aria-pressed` | `accessibilityState.selected` | `Semantics.selected` |

## Storybook stories

Web and Flutter both ship: Default, Variants, Sizes, States, Multi Select, Interactive, Responsive, Surface Context.

## Visual

Token layout (`--Spacing-2` gap), wrap/scroll, and surface-context secondary fills align with web after Flutter surface/role fixes. Re-check per brand in Storybook.

Audit: [native-a11y-audit/interactive.md](../native-a11y-audit/interactive.md).
