/// RadioField visual-regression tests — LIGHT. Captures golden PNGs across the
/// Figma matrix: composition modes (integrated/multi), sizes, content slots
/// (description / required / infoIcon / feedback), readOnly, disabled.
///
/// Rendered with the real Jio fixture (production token resolution).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

const _kSizes = <String>['s', 'm', 'l'];

OneUiRadioField _multi({
  String size = 'm',
  bool checked = false,
  bool readOnly = false,
  bool disabled = false,
  bool required = false,
  bool infoIcon = false,
  String? description,
  String? error,
}) {
  return OneUiRadioField(
    size: size,
    label: 'Plan',
    readOnly: readOnly,
    disabled: disabled,
    required: required,
    infoIcon: infoIcon,
    description: description,
    error: error,
    defaultValue: checked ? 'basic' : null,
    children: [
      OneUiRadio(value: 'basic', label: 'Basic'),
      OneUiRadio(value: 'pro', label: 'Pro'),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // size × checked — 6 baselines
  group('[golden] RadioField — size × checked', () {
    for (final size in _kSizes) {
      for (final checked in [false, true]) {
        final ck = checked ? 'checked' : 'unchecked';
        testWidgets('$size / $ck', (tester) async {
          await pumpRadioJioHarnessSettled(tester, _multi(size: size, checked: checked));
          await expectLater(
            find.byType(OneUiRadioField),
            matchesGoldenFile('goldens/radio_field_${size}_$ck.png'),
          );
        });
      }
    }
  });

  // content slots — 4 baselines
  group('[golden] RadioField — content slots', () {
    testWidgets('description', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(description: 'Pick exactly one.'));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_description.png'));
    });

    testWidgets('required', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(required: true));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_required.png'));
    });

    testWidgets('infoIcon', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(infoIcon: true));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_infoicon.png'));
    });

    testWidgets('feedback (error)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(error: 'Choose a plan'));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_feedback.png'));
    });
  });

  // readOnly / disabled — 2 baselines
  group('[golden] RadioField — readOnly / disabled', () {
    testWidgets('readonly / checked', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(readOnly: true, checked: true));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_readonly.png'));
    });

    testWidgets('disabled / checked', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _multi(disabled: true, checked: true));
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_disabled.png'));
    });
  });

  // integrated single — 2 baselines
  group('[golden] RadioField — integrated single', () {
    testWidgets('integrated unchecked', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Enable feature', description: 'Turns the feature on.'),
      );
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_integrated_unchecked.png'));
    });

    testWidgets('integrated checked', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Enable feature', defaultChecked: true),
      );
      await expectLater(find.byType(OneUiRadioField),
          matchesGoldenFile('goldens/radio_field_integrated_checked.png'));
    });
  });
}
