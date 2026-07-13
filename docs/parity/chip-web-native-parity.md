# Chip — Web ↔ Native ↔ Flutter parity

| Area | Web | React Native | Flutter (`ui_flutter`) |
|------|-----|--------------|------------------------|
| Component | `Chip.tsx` | `Chip.native.tsx` | `one_ui_chip.dart` |
| Contract | `Chip.shared.ts` | `interface.ts` | `one_ui_chip_types.dart` + `one_ui_chip_a11y.dart` |

## Functional API

| Prop / behavior | Web | RN | Flutter |
|-----------------|-----|-----|---------|
| `size` / `variant` / `attention` / `appearance` | ✓ | ✓ | ✓ |
| `selected` / `defaultSelected` / `onSelectedChange` | ✓ | ✓ | ✓ (`eventDetails` optional 2nd arg) |
| `value` (group) | ✓ | ✓ | ✓ |
| `disabled` | ✓ | ✓ | ✓ (+ group `disabled`) |
| `start` / `end` slots | ✓ | ✓ | ✓ (`OneUiChipSlotIcon`, badges, avatar) |
| Group context (`size`, `variant`, `appearance`) | ✓ | ✓ | ✓ `OneUiChipGroupScope` |
| Default size in group | unset → group `m` | unset → group `m` | `size: ''` → inherit group |
| `className` / `style` | ✓ | `style` | N/A |
| `data-testid` / `testID` | ✓ | ✓ | `testId` / `testID` |
| `autofocus` / dev focus ring | — | — | `autofocus`, `forceFocusRing` (Storybook) |

**RN divergence:** default variant when `attention` unset is `'ghost'` in `interface.ts`; web/shared use `'bold'`. Flutter follows web/shared.

## Accessibility props

| Prop | Web | RN | Flutter |
|------|-----|-----|---------|
| `aria-label` | ✓ | ✓ | `semanticsLabel` / `ariaLabel` |
| `accessibilityHint` | — | ✓ | `semanticsHint` / `accessibilityHint` |
| Toggle / selected | `aria-pressed` | `accessibilityState.selected` | `Semantics.button` + `selected` |
| Focus halo | `:focus-visible` | platform | `OneUiFocusInteractive` |

## Storybook stories

Web and Flutter: Default, Attention Levels, Sizes, States, Focus, With Slots, Interactive, Appearances, Surface Context, Motion.

## Visual

S/M/L, attention → variant, surface context (secondary role + `unselectedAppearance`), slot surface modes match web CSS/RN paint after Flutter `chipRoleAppearanceForTokens` → `resolvedAppearance`.

Audit: [native-a11y-audit/interactive.md](../native-a11y-audit/interactive.md).
