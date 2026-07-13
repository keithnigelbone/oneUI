# Button — QA test plan

**Component:** `OneUiButton`
**Source:** `packages/ui_flutter/lib/widgets/one_ui_button.dart`
**Types:** `packages/ui_flutter/lib/widgets/one_ui_button_types.dart`
**Parity:** web `Button.tsx`, RN `Button.native.tsx`, web QA `button-qa.spec.ts`

## Test files

| File | Layer |
|------|-------|
| `button_functional_test.dart` | Functional `[fn]` + `[smoke]` |
| `button_a11y_test.dart` | Resolver `[a11y]` + semantics |

## Figma API (reference)

| Property | Values | Notes |
|----------|--------|-------|
| `size` | xs / s / m / l | f-step 6 / 8 / 10 / 12; aliases via `sizeAlias` |
| `attention` | high / medium / low | Maps to bold / subtle / ghost variant |
| `appearance` | auto, neutral, primary, secondary, sparkle, positive, negative, informative, warning, brand-bg | `auto` inherits surface parent; explicit roles must exist on theme |
| `condensed` | true / false | Ignored when `contained=false` |
| `contained` | true / false | `false` triggers separate uncontained render path |
| `start` | none / Icon / CircularProgressIndicator | Hidden but layout-preserved while loading |
| `end` | none / Icon / CircularProgressIndicator | Hidden but layout-preserved while loading |
| `fullWidth` | true / false | Ignored when `contained=false` |
| `disabled` | true / false | Blocks callbacks, removes tap action from semantics |
| `loading` | true / false | Shows spinner, hides slot content while preserving size, sets busy hint, blocks callbacks |
| `content` (code-only) | Text or CircularProgressIndicator | Text-only when `loading=false`; CPI-only when `loading=true` |

## Conditional rules (tested explicitly)

- `condensed` is a no-op when `contained=false` — both branches render the same min-height.
- `fullWidth` is a no-op when `contained=false` — uncontained always shrink-wraps.
- `loading=true` ⇒ start/end slots wrapped in `Visibility(visible:false, maintainSize:true)` so button width does not collapse.
- Press handler precedence: `onPressed ?? onPress ?? onClick` (no double-fire).
- `semanticButtonType.submit` ⇒ inside a `Form`, `onPressed` only fires when `Form.validate()` returns true.
- `semanticButtonType.reset` ⇒ inside a `Form`, calls `Form.reset()` AND fires `onPressed`.

## P0 accessibility checks

- [x] Accessible name (label / `semanticsLabel` override)
- [x] `Semantics.isButton` flag + `tap` action when enabled
- [x] Disabled = no tap action, `isEnabled: false`
- [x] Loading = `isEnabled: false` + hint contains "Loading"
- [x] `semanticsHint` merges with loading hint as `"<hint>. Loading"`
- [x] `semanticsExpanded` = both `hasExpandedState` and `isExpanded` flags flow through
- [x] `semanticsControlsSemanticsIdentifiers` ⇒ `Semantics.controlsNodes` (web `aria-controls`)
- [x] `excludeFromSemantics` removes the control from the AT tree
- [x] `autofocus` requests primary focus on first frame
- [x] Touch target ≥ 44×44 at default size (WCAG 2.5.5 / CLAUDE.md)

## False-confidence guardrails

These tests deliberately use observable side-effects so a regression that
silently ignores a Figma prop fails the suite. The previous smoke loops
only asserted `find.text('Button')`, which would pass even if the prop
were never read.

- **`size`** — asserts `tester.getSize(button).height` matches the
  `--Button-minHeight-<step>` seeded by `qaButtonTestDesignSystem`.
- **`condensed`** — asserts a different height than non-condensed for the
  same size; asserts EQUAL height to non-condensed when `contained=false`.
- **`fullWidth`** — asserts width equals parent box width when `true`, less
  than parent when `false`, and ignores fullWidth entirely when uncontained.
- **`attention`** — asserts the resulting variant via the `DecoratedBox`
  border presence (ghost = no border, subtle = 1px border).
- **`loading`** — walks the `Visibility` widgets and asserts every loading-
  time wrapper has `maintainSize: true` so the Figma "don't change
  dimensions while loading" invariant cannot regress unnoticed.

## Coverage notes

Color tokens (`--Primary-Bold` etc.) are not asserted here — that's the
brand-engine's responsibility and is covered by Convex snapshot tests in
`packages/ui_flutter/test/`. These widget tests focus on the API contract,
layout invariants, and a11y semantics.

## Run

```bash
cd apps/qa-playground-flutter
flutter test test/components/button/
```
