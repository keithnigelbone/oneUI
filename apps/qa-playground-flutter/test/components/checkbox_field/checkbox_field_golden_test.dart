/// CheckboxField visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma matrix: states (unchecked/checked/indeterminate) × sizes (s/m/l) ×
/// key appearances, plus the field-specific affordances Checkbox does NOT have —
/// description line, feedback (error) row, required asterisk, info icon, and the
/// disabled / readOnly chrome.
///
/// Rendered with the real Jio fixture (production token resolution), so the
/// baselines are byte-identical to the qa-playground:flutter app. Capture is
/// pinned via [wrapOneUiGoldenChild] + [oneUiGoldenCaptureFinder] so the whole
/// shell (label + description + feedback) is in the frame.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';
import '../../support/golden_capture.dart';

const _kStates = <String>['unchecked', 'checked', 'indeterminate'];
const _kSizes = <String>['s', 'm', 'l'];
const _kKeyAppearances = <String>[
  'secondary',
  'primary',
  'positive',
  'negative',
];

OneUiCheckboxField _build({
  required String state,
  String size = 'm',
  String appearance = 'secondary',
  bool readOnly = false,
}) {
  return OneUiCheckboxField(
    label: 'Field',
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
  group('[golden] CheckboxField — state × size (secondary)', () {
    for (final state in _kStates) {
      for (final size in _kSizes) {
        testWidgets('$state / $size', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_build(state: state, size: size)),
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/checkbox_field_${state}_$size.png'),
          );
        });
      }
    }
  });

  // state × appearance (size=m) — 12 baselines
  group('[golden] CheckboxField — state × appearance (size=m)', () {
    for (final state in _kStates) {
      for (final app in _kKeyAppearances) {
        testWidgets('$state / $app', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(_build(state: state, appearance: app)),
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/checkbox_field_${state}_$app.png'),
          );
        });
      }
    }
  });

  // readOnly × state — 3 baselines
  group('[golden] CheckboxField — readOnly', () {
    for (final state in _kStates) {
      testWidgets('readonly / $state', (tester) async {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(_build(state: state, readOnly: true)),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/checkbox_field_readonly_$state.png'),
        );
      });
    }
  });

  // disabled × state — 2 baselines
  group('[golden] CheckboxField — disabled', () {
    for (final state in ['unchecked', 'checked']) {
      testWidgets('disabled / $state', (tester) async {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          wrapOneUiGoldenChild(
            OneUiCheckboxField(
              label: 'Disabled field',
              disabled: true,
              appearance: 'primary',
              checked: state == 'checked',
            ),
          ),
        );
        await expectLater(
          oneUiGoldenCaptureFinder(),
          matchesGoldenFile('goldens/checkbox_field_disabled_$state.png'),
        );
      });
    }
  });

  // description / required / info / feedback — field-only affordances — 6 baselines
  group('[golden] CheckboxField — field affordances', () {
    testWidgets('label + description', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(
            label: 'Subscribe',
            description: 'Weekly digest only.',
            checked: true,
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_label_description.png'),
      );
    });

    testWidgets('description only (beside control)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(description: 'Select all that apply.'),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_description_only.png'),
      );
    });

    testWidgets('required asterisk', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(label: 'Accept terms', required: true),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_required.png'),
      );
    });

    testWidgets('info icon', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(label: 'Marketing emails', infoIcon: true),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_info_icon.png'),
      );
    });

    testWidgets('feedback (error)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(
            label: 'Confirm you are human',
            error: 'Please complete verification.',
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_feedback_error.png'),
      );
    });

    testWidgets('description + feedback (full single field)', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          const OneUiCheckboxField(
            label: 'Accept',
            required: true,
            description: 'By accepting you agree to our ToS.',
            error: 'This field is required.',
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_full_single.png'),
      );
    });
  });

  // multi-option field — 1 baseline
  group('[golden] CheckboxField — multi-option', () {
    testWidgets('multi options with header + description', (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        wrapOneUiGoldenChild(
          OneUiCheckboxField(
            label: 'Notification channels',
            description: 'Choose at least one.',
            groupDefaultValue: const ['email'],
            children: [
              OneUiCheckbox(value: 'email', label: 'Email'),
              OneUiCheckbox(value: 'sms', label: 'SMS'),
              OneUiCheckbox(value: 'push', label: 'Push'),
            ],
          ),
        ),
      );
      await expectLater(
        oneUiGoldenCaptureFinder(),
        matchesGoldenFile('goldens/checkbox_field_multi.png'),
      );
    });
  });
}
