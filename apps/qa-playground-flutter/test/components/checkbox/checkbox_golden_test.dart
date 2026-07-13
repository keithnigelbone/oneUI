/// Checkbox visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma matrix: states (unchecked/checked/indeterminate) × sizes (s/m/l) ×
/// key appearances, plus readOnly, disabled, label+description, errorHighlight.
///
/// Rendered with the real Jio fixture (production token resolution). Wrap each
/// scenario in [wrapOneUiGoldenChild] and capture via [oneUiGoldenCaptureFinder]
/// for tight, deterministic snapshots (see `test/support/golden_capture.dart`).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';
import '../../support/golden_capture.dart';

const _kStates = <String>['unchecked', 'checked', 'indeterminate'];
const _kSizes = <String>['s', 'm', 'l'];
const _kKeyAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

OneUiCheckbox _build({
  required String state,
  String size = 'm',
  String appearance = 'secondary',
  bool readOnly = false,
}) {
  return OneUiCheckbox(
    ariaLabel: 'cb',
    size: size,
    appearance: appearance,
    readOnly: readOnly,
    checked: state == 'checked',
    indeterminate: state == 'indeterminate',
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // state × size (appearance=secondary) — 9 baselines
  group('[golden] Checkbox — state × size (secondary)', () {
    for (final state in _kStates) {
      for (final size in _kSizes) {
        testWidgets('$state / $size', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_build(state: state, size: size)),
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/checkbox_${state}_$size.png'),
          );
        });
      }
    }
  });

  // state × appearance (size=m) — 12 baselines
  group('[golden] Checkbox — state × appearance (size=m)', () {
    for (final state in _kStates) {
      for (final app in _kKeyAppearances) {
        testWidgets('$state / $app', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_build(state: state, appearance: app)),
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/checkbox_${state}_$app.png'),
          );
        });
      }
    }
  });

  // readOnly × state — 3 baselines
  group('[golden] Checkbox — readOnly', () {
    for (final state in _kStates) {
      testWidgets('readonly / $state', (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(_build(state: state, readOnly: true)),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/checkbox_readonly_$state.png'),
        );
      });
    }
  });

  // disabled × state — 2 baselines
  group('[golden] Checkbox — disabled', () {
    for (final state in ['unchecked', 'checked']) {
      testWidgets('disabled / $state', (tester) async {
        await pumpCheckboxJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            OneUiCheckbox(
              ariaLabel: 'cb',
              disabled: true,
              appearance: 'primary',
              checked: state == 'checked',
            ),
          ),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/checkbox_disabled_$state.png'),
        );
      });
    }
  });

  // label + description — 3 baselines (label-only, label+desc, desc-only)
  group('[golden] Checkbox — label + description', () {
    testWidgets('label only', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(OneUiCheckbox(label: 'Accept terms', checked: true)),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_label_only.png'),
      );
    });

    testWidgets('label + description', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          OneUiCheckbox(
            label: 'Subscribe',
            description: 'Weekly digest only.',
            checked: true,
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_label_description.png'),
      );
    });

    testWidgets('description only', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(OneUiCheckbox(description: 'Weekly digest only.')),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_description_only.png'),
      );
    });
  });

  // errorHighlight — 1 baseline
  group('[golden] Checkbox — errorHighlight', () {
    testWidgets('errorHighlight / unchecked', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          OneUiCheckbox(label: 'Required', errorHighlight: true, checked: false),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_errorhighlight.png'),
      );
    });
  });
}
