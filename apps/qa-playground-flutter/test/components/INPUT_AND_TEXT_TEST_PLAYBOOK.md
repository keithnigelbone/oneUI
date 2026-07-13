# Test-Generation Playbook — Input family + Text (Flutter QA)

> **Audience:** an AI coding model generating Flutter QA tests for the
> qa-playground-flutter app. Follow this document literally. Do not invent
> APIs, file paths, or token names — every fact you need is below or in the
> reference suites it points at.

## 0. Mission

Add **complete, high-confidence** QA coverage for these 5 Flutter widgets, matching
the EXISTING pattern used by `icon_button`, `checkbox_field`, `badge`, `avatar`,
`button`, `chip`:

| Component | Production widget (`packages/ui_flutter/lib/widgets/`) | Test dir (`apps/qa-playground-flutter/test/components/`) |
|-----------|--------------------------------------------------------|----------------------------------------------------------|
| Input | `one_ui_input.dart` | `input/` |
| InputDynamicText | `one_ui_input_dynamic_text.dart` | `input_dynamic_text/` |
| InputFeedback | `one_ui_input_feedback.dart` | `input_feedback/` |
| InputField | `one_ui_input_field.dart` | `input_field/` |
| Text | `one_ui_text.dart` | `text/` |

**Source of truth = Figma** (the API tables shown in the task images, transcribed in
§5). The Flutter widget must match Figma + the web component. Where it does NOT, that
is a **real component bug** — you write a RED-by-design regression test for it and add
it to the bug list (§8). Where Flutter matches web, you write a GREEN parity proof.

### Current state (what already exists — DO NOT duplicate)

Each of the 5 dirs already has `*_functional_test.dart` and `*_a11y_test.dart`.
**Read them first** and extend, do not rewrite. None of them have figma-parity,
platform, golden, regression, or e2e tiers, and **no harness exists** for any of
them in `test/support/components/`. Those are your deliverables.

---

## 1. The ONE rule: No false confidence

Every assertion MUST read a **real rendered value** and compare it to the **correct
expected value**. Never assert a tautology (re-reading the token you just set), never
assert "it didn't throw", never trust a snapshot alone.

- **Probe before you assert.** Pump the real widget, read the actual value
  (`tester.getSize`, `BoxDecoration`, `SemanticsData`, `TextStyle`, `Opacity.opacity`,
  rendered `Text` content), and quote that probed value in a comment. The
  `checkbox_field_regression_test.dart` does this on every test — copy that style.
- **RED-by-design is correct.** A regression test that asserts the *desired* behaviour
  and fails because the widget ships a bug is working as intended. The failure IS the
  ticket. Do not weaken it to make it pass.
- **Goldens are necessary but not sufficient.** A golden proves pixels are stable; it
  does NOT prove behaviour. Always pair goldens with functional/a11y assertions that
  read semantics, sizes, callbacks, and text decorations.

---

## 2. Repo orientation (exact paths)

```
apps/qa-playground-flutter/
  test/
    components/<name>/                 ← test tiers per component
    support/
      components/<name>_harness.dart   ← per-component harness (YOU create these)
      components/component_harness.dart← generic pump (already used by input_functional)
      pump_one_ui_app.dart             ← pumpOneUiQaApp, qaInputFieldTestDesignSystem
      test_widgets_all_platforms.dart  ← testWidgetsAllPlatforms (runs ×3 platforms)
      semantics_helpers.dart           ← withSemanticsHandle
    foundations/jio_fixture.dart       ← ensureJioFixtureReady, jioFixture (goldens)
  integration_test/<name>_e2e_test.dart← on-device e2e (YOU create these)
packages/ui_flutter/lib/widgets/       ← production widgets + *_types.dart APIs
```

### Reference suites to COPY (gold standard)

- **`test/components/icon_button/`** + `test/support/components/icon_button_harness.dart`
  — the most complete suite: functional, a11y, figma_parity, platform, golden
  (light/dark/surface), regression, e2e, README. Mirror its file layout and harness
  shape exactly.
- **`test/components/checkbox_field/checkbox_field_regression_test.dart`** — the
  canonical regression/attribution suite: `[confirmed]` / `[debatable]` / `[parity]`
  groups, probed comments, a `[meta]` burn-down counter. This is the template for §8.
- **`test/support/components/icon_button_harness.dart`** — the canonical harness:
  synthetic DS for offline tests + Jio fixture for goldens + real-value accessors.

---

## 3. Test tiers to produce (per component)

Create every tier below for **each** of the 5 components. Tags in `[brackets]` go in
the test description string (the suites grep on them).

| File | Tag(s) | Harness | What it validates |
|------|--------|---------|-------------------|
| `<name>_functional_test.dart` *(exists — extend)* | `[smoke]` `[fn]` | synthetic | Callbacks, value/onChanged, disabled, slots, size/attention/shape resolution, testId |
| `<name>_a11y_test.dart` *(exists — extend)* | `[a11y]` | synthetic | Semantics label/role/state, live regions, keyboard, describedby associations |
| `<name>_figma_parity_test.dart` | `[figma]` | synthetic | EVERY Figma API value (see §5 matrices) against real rendered behaviour |
| `<name>_platform_test.dart` | `[platform]` | synthetic | android/iOS touch vs linux/desktop keyboard+hover differences |
| `<name>_golden_test.dart` | `[golden]` | Jio fixture | Light-mode pixel regression across the matrix |
| `<name>_golden_dark_test.dart` | `[golden][dark]` | Jio fixture | Dark-mode token remapping (high-signal subset) |
| `<name>_golden_surface_test.dart` | `[golden][surface]` | Jio fixture | Rendered inside `Surface(mode=bold/subtle/minimal/elevated)` |
| `<name>_regression_test.dart` | `[regression][confirmed\|debatable\|parity]` `[meta]` | Jio fixture | Bug burn-down + parity proofs (§8) |
| `integration_test/<name>_e2e_test.dart` | `[e2e]` | Jio fixture | Real-device render + gestures + a11y name |
| `<name>/README.md` | — | — | Run commands, tier table, Figma matrix, regression burn-down |

> Text has no `golden_surface` requirement for interactivity, but DO add a surface
> golden anyway (text colour must remap on tinted/dark surfaces — that is a real
> surface-context concern).

---

## 4. Harness: build one per component

No Input/Text harness exists yet. Create `test/support/components/<name>_harness.dart`
modelled on `icon_button_harness.dart`. Each harness MUST expose:

1. **A synthetic-DS pump** for offline tiers (functional/a11y/figma/platform):
   ```dart
   Future<void> pump<Name>QaHarness(WidgetTester tester, Widget child,
       {bool settle = true}) async { ... pumpOneUiQaApp(child, designSystem: ...); }
   ```
   Reuse `qaInputFieldTestDesignSystem()` from `pump_one_ui_app.dart` as the base
   payload (the IconButton harness does exactly this) and override only the
   component-specific custom properties you need to pin (e.g. container px, border
   widths) so size assertions are **not circular**.

2. **A Jio-fixture pump** for goldens + e2e (production token resolution):
   ```dart
   Future<void> pump<Name>JioHarnessSettled(WidgetTester tester, Widget child,
       {bool? darkMode, String? surfaceMode, String surfaceAppearance = 'primary',
        String platformId = 'S', String density = 'default'}) async { ... }
   ```
   Copy `pumpIconButtonJioApp` / `pumpIconButtonJioHarnessSettled` verbatim and rename.
   For a composed widget (InputField) you may simply **alias** an existing pump the way
   `checkbox_field_harness.dart` re-exports `pumpCheckboxJioHarnessSettled` — do not
   create a second design system that can drift.

3. **Real-value accessors** (the no-false-confidence layer). Examples to provide:
   - `inputFieldRootFinder()` → `find.byType(OneUiInput)` etc.
   - `inputTextField(tester)` → the inner `EditableText`/`TextField` widget.
   - `inputDecoration(tester)` → the real `BoxDecoration` (read `.color`, `.border`,
     `.borderRadius`).
   - `inputSemanticsData(tester, label)` → `tester.getSemantics(...).getSemanticsData()`.
   - `textStyleOf(tester, finder)` → the resolved `TextStyle` (read `fontSize`,
     `fontWeight`, `decoration`, `color`).
   - `feedbackLiveRegion(tester)` → reads `Semantics.properties.liveRegion` / `role`.

4. **Async preload in `setUpAll`** if the component renders SVG icons
   (InputFeedback default icons, InputField info icon, Input mic/slot icons). A lazy
   icon load inside the fake-async `testWidgets` zone HANGS to the 10-min timeout.
   Preload in real-async `setUpAll`, exactly like IconButton:
   ```dart
   setUpAll(() async {
     await ensureJioFixtureReady();         // goldens only
     await ensureIconButtonIconsLoaded();   // or JioIconCatalog.instance.ensureLoaded()
   });
   ```
   This is the #1 cause of "test hangs forever" — never skip it for icon-bearing tiers.

`testWidgetsAllPlatforms` runs each body **3×** (android, iOS, linux). Use it for
platform-agnostic behaviour. Use plain `testWidgets` + `debugDefaultTargetPlatformOverride`
when a test is intentionally platform-specific (touch target, keyboard activation).

---

## 5. Figma API matrices (the source of truth)

Transcribed from the Figma boards in the task. Every value here needs a `[figma]`
test that asserts real rendered behaviour, plus golden coverage of the high-signal
subset. The exact Dart enums/constants are in each `*_types.dart`.

### 5.1 Input — `one_ui_input_types.dart`
- **size:** `xs` `s` `m` `l` → numeric f-steps `6` `8` `10` `12`
  (`kOneUiInputNumericSizes`). Web coerces `xs`→`s`; **native ships `xs` as f6** —
  test this divergence explicitly.
- **attention:** `medium` `high` (`OneUiInputAttention`).
- **appearance:** `auto` + `neutral` `primary` `secondary` `sparkle` `negative`
  `positive` `informative` `warning` (`kOneUiInputFigmaAppearances`). `auto` → nearest
  Surface role else `secondary`; **`brand-bg` falls back to `secondary`** (no input
  tokens) — assert both via `resolveOneUiInputAppearance`.
- **shape:** `default` `pill` (`OneUiInputShape`).
- **start / start2 / end / end2 slots:** `none` `Icon` `IconButton` `Avatar` `Image`
  `ChipGroup` `Text` `Button` (start2/end2 are `none`/`Text`). Assert each slot renders
  and is positioned start vs end.
- **state:** `idle` `focus/active` `filled` `readOnly` `feedback`.
- **disabled:** `true` `false`.
- core: `placeholder`, `value`, `onChanged`, `testId`.

### 5.2 InputDynamicText — `one_ui_input_dynamic_text_types.dart`
- **size:** `s` `m` `l` (`kOneUiInputDynamicTextFigmaSizes`); body step per size =
  `XS`/`S`/`M` (`oneUiInputDynamicTextBodySize`); trailing Button f-step `8`/`10`/`12`.
- **content:** `Text` | `none` (leading dynamic text, e.g. character count).
- **end:** `none` | `Button` (trailing "Helper Button").
- **disabled:** `true` `false`.
- **aria-live** on leading copy (`OneUiInputDynamicTextAriaLive`: off/polite/assertive)
  — character counts should announce. Assert `trailingOnly`, `isEmpty` states from
  `resolveOneUiInputDynamicTextState`.

### 5.3 InputFeedback — `one_ui_input_feedback_types.dart`
- **size:** `s` `m` `l` → `8`/`10`/`12` (`numericStep`).
- **attention:** `low` `medium` `high` (default **`low`**).
- **variant:** `negative` `positive` `warning` `informative` — each has a
  `defaultIconName` (`error`/`checkCircle`/`warning`/`info`) and a `surfaceRole`.
- **feedbackMessage:** `<input text/>`; **customIcon:** nested icon prop.
- **role / live region:** `negative` → `alert` → `assertive`; others → `status` →
  `polite` (`resolveOneUiInputFeedbackState`). This is the highest-value a11y assertion
  for this component — read the real `Semantics` role + `liveRegion`.

### 5.4 InputField — `one_ui_input_field_types.dart`
- **size:** `s` `m` `l` (`kOneUiInputFieldFigmaSizes`); labelSize derives from numeric.
- Booleans: **label**, **required**, **infoIcon**, **description**, **feedback** (slot),
  **dynamicText**, **disabled** — each `true`/`false`.
- Gating rules to assert (from `resolveOneUiInputFieldState`):
  - `hasInfoIcon = infoIcon && hasLabel && labelSlot == null` (info icon needs a label).
  - `isInvalid = invalid || ariaInvalid || error != ''`.
  - `hasFeedback = error != '' || feedback != null`.
  - describedby IDs: `feedbackSemanticsId`, `descriptionSemanticsId`,
    `dynamicTextSemanticsId` — assert these are wired to real `Semantics(identifier:)`
    and associated with the control.
- **Nested from Input:** attention, appearance, shape, start/start2/end/end2, state.
- `labelContent` is Figma-only (ignore in code).

### 5.5 Text — `one_ui_text_types.dart`
- **variant:** `body` `label` `title` `headline` `display` `code`.
- **size:** per variant — body `2XS..2XL`, label `3XS..2XL`, display/headline/title
  `L`/`M`/`S`, code `M`/`S`/`XS`. Out-of-range sizes **clamp** (`resolveOneUiTextSize`) —
  test the clamp (e.g. display size `XL` → `L`).
- **weight:** `high` `medium` `low` — BUT only `body`/`label`/`code` honour it;
  display/headline/title are **fixed medium**, code is **fixed medium**
  (`resolveOneUiTextWeight`). Assert the scoping.
- **attention:** `none` `high` `medium` `low` `tintedA11y` — `none`→`high`;
  display/headline/title are **high-only** (`resolveOneUiTextAttention`).
- **appearance:** `auto` + roles; **`auto`→`neutral`**.
- **italic / underline / strikethrough:** booleans — assert they produce a real
  `TextDecoration` / `FontStyle` on the rendered `TextStyle`, not just a data flag.
  Underline metrics vary by variant×weight (`resolveOneUiTextUnderlineMetrics`).
- **textAlign:** `left` `center` `right`. **numberOfLines**, **text**, **lang/script**,
  **scriptMode** (`ui`/`reading`).

---

## 6. Tier-by-tier templates

Use these skeletons. Replace `<Name>`, widget type, and props. Keep imports minimal and
real (no unused imports — `pnpm`/`flutter analyze` must pass).

### 6.1 figma_parity (offline synthetic harness)
```dart
/// <Name> Figma-parity QA suite — `[figma]`.
/// Exercises every Figma API value against the real widget on the synthetic
/// measurement harness (offline). Per-role COLOURS are covered by Jio goldens.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_<name>.dart';
import 'package:ui_flutter/widgets/one_ui_<name>_types.dart';
import '../../support/components/<name>_harness.dart';

void main() {
  setUpAll(() async { await ensure<Name>IconsLoaded(); }); // only if icon-bearing

  group('[figma] <Name> — size', () {
    for (final s in kOneUi<Name>FigmaSizes) {
      testWidgetsAllPlatforms('[figma] size=$s resolves', (tester) async {
        await pump<Name>QaHarness(tester, OneUi<Name>(/* size: s, ... */));
        // PROBE a REAL value (font size / container px / numeric step) and assert it.
        expect(/* real rendered metric */, /* expected for s */);
      });
    }
  });
  // ... one group per Figma axis in §5 (attention, appearance, shape, slots, states)
}
```

### 6.2 golden (Jio fixture)
```dart
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_<name>.dart';
import '../../support/components/<name>_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensure<Name>IconsLoaded(); // if icon-bearing
  });

  testWidgets('size=m / primary', (tester) async {
    await pump<Name>JioHarnessSettled(tester, const OneUi<Name>(/* ... */));
    await expectLater(find.byType(OneUi<Name>),
        matchesGoldenFile('goldens/<name>_m_primary.png'));
  });
}
```
- Put PNGs under `test/components/<name>/goldens/` (+ `goldens/dark/`, `goldens/surface/`).
- Generate baselines: `flutter test --update-goldens test/components/<name>/`.
- For infinite animations (none expected here, but if any) freeze tickers with a
  `TickerMode(enabled: false, ...)` wrapper as IconButton does for the spinner.

### 6.3 regression (Jio fixture) — see §8 for content
Copy the exact structure of `checkbox_field_regression_test.dart`: top doc comment
defining `[confirmed]` / `[debatable]` / `[parity]`, one group each, probed comments on
every test, and a `[regression][meta]` group with a burn-down counter.

### 6.4 platform
```dart
import 'package:flutter/foundation.dart';
// ... assert touch-target / keyboard / hover differences with
// debugDefaultTargetPlatformOverride = TargetPlatform.android | iOS | linux
// (always reset to null in a finally block).
```

### 6.5 e2e (`integration_test/<name>_e2e_test.dart`)
Mirror `integration_test/icon_button_e2e_test.dart`: real device render, real gesture
(`tester.enterText`, `tester.tap`), assert accessible name, dark-mode, inside-Surface.
For any non-settling animation use the non-settling pump (don't call `pumpAndSettle`).

---

## 7. Per-component scenario checklists (audit completely)

Write a `[figma]`/`[fn]`/`[a11y]` test for EACH bullet. This is the "complete audit".

**Input:** every size (incl. native `xs`=f6 vs web coerce); both attentions; all 9
appearances incl. `auto` resolution + `brand-bg`→secondary; both shapes; each
start/start2/end/end2 slot type renders & positions; each state (idle/focus/filled/
readOnly/feedback); disabled blocks editing + dims; `onChanged` fires; controlled
`value`; placeholder shows; readOnly stays enabled (distinct from disabled); focus ring
on keyboard focus; testId locator.

**InputDynamicText:** each size → body step + button step; leading content only;
trailing Button only (`trailingOnly`); both; empty (`isEmpty`) renders nothing
meaningful; disabled dims + blocks button; helper Button `onPressed` fires;
`aria-live` announces leading count.

**InputFeedback:** each variant → correct default icon + surface role; each size →
numeric step; each attention (default low); `feedbackMessage` text renders; `customIcon`
overrides default; negative→alert/assertive, others→status/polite (real Semantics);
empty message renders nothing.

**InputField:** each size; label on/off; required asterisk gated on label; infoIcon
gated on label (and `labelSlot==null`); description on/off + describedby association;
feedback slot/error → InputField shows feedback + isInvalid; dynamicText row on/off;
disabled cascades to inner Input; nested appearance/attention/shape/slots forwarded;
accessible name resolution order (accessibilityLabel → ariaLabel → label).

**Text:** each variant renders correct typography role; size clamping per variant;
weight scoping (body/label/code honour, others fixed medium); attention scoping
(display/headline/title high-only); appearance `auto`→neutral; italic→`FontStyle.italic`;
underline→`TextDecoration.underline` with correct thickness; strikethrough→lineThrough;
textAlign maps; numberOfLines truncates with ellipsis; colour remaps inside Surface.

---

## 8. Deliverable: real component bug list

Produce a markdown bug report **and** a RED regression test for each confirmed/debatable
finding. Use bug-ID prefixes: **INP-**, **IDT-**, **IFB-**, **IFD-**, **TXT-**, with
`-FN-` / `-A11Y-` / `-DEB-` segments (e.g. `INP-A11Y-001`, `TXT-FN-001`,
`IFD-DEB-001`). Mirror the IconButton (`IBT-DEB-00x`) / CheckboxField (`CBF-*`) scheme.

### 8.1 Required format (one block per bug)
```
### <BUG-ID> — <short title>
**Description:** <detailed: what the component does, where, which API path, vs Figma/web>
**Actual:** <the probed real value — quote it, e.g. `SemanticsData.identifier == ""`>
**Expected:** <correct behaviour per Figma + web>
**RCA:** <root cause from reading the production widget source — file:line>
**How to Fix:** <concrete change in the production widget>
**Severity:** confirmed | debatable
**Test:** <regression test name that holds this RED>
```

### 8.2 Methodology (MANDATORY — no false confidence)
For EVERY candidate:
1. Read the Figma API (§5) and the web component
   (`packages/ui/src/components/<Comp>/`) to establish the correct contract.
2. Pump the REAL Flutter widget and probe the actual value. Quote it in the test
   comment ("PROBED: ...").
3. Classify:
   - **`[confirmed]`** — web does the right thing, Flutter does not → RED until Flutter
     fixed.
   - **`[debatable]`** — web SHARES the gap (hardening / design call) → RED, lower
     confidence.
   - **`[parity]`** — Flutter matches web → GREEN proof (NOT a bug; document it so the
     suspicion isn't re-raised).
4. Write the test so it stays RED until the production widget is fixed, then flips green.

### 8.3 Candidate areas to INVESTIGATE (NOT pre-confirmed — you must probe each)
These are leads from reading the type files + the known IconButton/CheckboxField bugs.
Verify each against the real widget AND web before writing it up:
- **Input/InputField `testId` → only `ValueKey`, not `Semantics(identifier:)`** —
  same class as `IBT-DEB-001` / `CBF-FN-001`. Probe `SemanticsData.identifier`.
- **Mobile touch target < 44px** for small Input/InputField sizes (WCAG 2.5.5) — same
  class as `CBF-DEB-001`. Probe the inner control box height under
  `TargetPlatform.android`.
- **InputField `required` not exposed to AT** (visual asterisk only, no
  `Semantics(required:)`) — same class as `CBF-A11Y-002`.
- **describedby wiring:** are `descriptionSemanticsId` / `feedbackSemanticsId` /
  `dynamicTextSemanticsId` actually attached to real `Semantics(identifier:)` nodes AND
  referenced from the control, or computed but dropped?
- **InputFeedback live region:** does `negative`→`assertive`/`alert` and others→
  `polite`/`status` actually emit on the rendered `Semantics`, or only in the resolver?
- **Input invalid/feedback state** → does it surface `aria-invalid` /
  `SemanticsValidationResult.invalid`?
- **Text underline/strikethrough/italic** → real `TextStyle.decoration` /
  `FontStyle.italic`, or only a data attribute with no visual effect?
- **Text weight/attention scoping** → are display/headline/title actually forced to
  fixed medium / high-only at render, matching `resolveOneUiTextWeight` /
  `resolveOneUiTextAttention`?
- **Input `xs` native vs web coercion** → confirm native renders f6 (not coerced to f8)
  and decide whether that divergence is intended (likely `[parity]`/by-design, document
  it).

Anything that turns out parity-aligned goes in the `[parity]` group with a note — that
is a valid, valuable result, not a failure to find a bug.

---

## 9. Definition of done

- [ ] Harness created for each component in `test/support/components/<name>_harness.dart`
      (synthetic pump + Jio pump + real-value accessors + icon preload).
- [ ] All 9 tiers (§3) present for each component; existing functional/a11y extended.
- [ ] Every Figma API value in §5 has a `[figma]` test asserting a REAL rendered value.
- [ ] Golden baselines generated (light/dark/surface) and committed under
      `test/components/<name>/goldens/`.
- [ ] Regression suite per component with `[confirmed]`/`[debatable]`/`[parity]` groups,
      probed comments, and a `[meta]` burn-down counter.
- [ ] e2e test per component in `integration_test/`.
- [ ] `<name>/README.md` per component (run commands, tier table, Figma matrix,
      regression burn-down) — copy `icon_button/README.md`'s shape.
- [ ] Bug list (§8 format) produced; each confirmed/debatable bug has a RED test.
- [ ] `flutter analyze` clean (no unused imports, no hardcoded literals where a token
      exists). `dart format` applied.

### Run commands
```bash
# Headless tiers for one component
flutter test test/components/input/

# Single tier
flutter test test/components/input/input_figma_parity_test.dart

# Goldens (need Jio fixture network); bless after intentional changes
flutter test test/components/input/input_golden_test.dart
flutter test --update-goldens test/components/input/

# E2E on device
flutter test integration_test/input_e2e_test.dart -d emulator-5554

# From monorepo root (the QA wrapper)
pnpm qa:flutter:component -- input
```

### Common pitfalls (from the existing suites)
- **Hang to 10-min timeout** → icon catalog lazily loaded inside fake-async. Fix:
  preload in real-async `setUpAll` (§4.4).
- **Circular size assertions** → asserting a px you set in the same DS. Fix: pin
  distinct px in the synthetic DS and assert the rendered `getSize`.
- **`pumpAndSettle` hangs** on a never-ending animation → use the non-settling pump.
- **Semantics reads return nothing** → wrap in `withSemanticsHandle` /
  `tester.ensureSemantics()` and dispose the handle.
- **Asserting on the wrong node** → for composed widgets (InputField wraps Input wraps
  feedback) target the specific subtree with `find.descendant`.
</content>
</invoke>
