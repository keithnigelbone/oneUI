/// Radio visual-regression tests — LIGHT. Captures golden PNGs across the Figma
/// matrix: checked/unchecked × sizes (s/m/l) × key appearances, plus readOnly,
/// disabled, label+description.
///
/// Rendered with the real Jio fixture (production token resolution), so the
/// baselines are byte-identical to the qa-playground:flutter app.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

const _kStates = <String>['unchecked', 'checked'];
const _kSizes = <String>['s', 'm', 'l'];
const _kKeyAppearances = <String>['secondary', 'primary', 'positive', 'negative'];

Widget _build({
  required String state,
  String size = 'm',
  String appearance = 'secondary',
  bool readOnly = false,
  bool disabled = false,
  String label = 'r',
  String? description,
}) {
  final checked = state == 'checked';
  return OneUiRadioGroup(
    defaultValue: checked ? 'a' : null,
    readOnly: readOnly,
    disabled: disabled,
    children: [
      OneUiRadio(
        value: 'a',
        size: size,
        appearance: appearance,
        label: label,
        description: description,
      ),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // state × size (appearance=secondary) — 6 baselines
  group('[golden] Radio — state × size (secondary)', () {
    for (final state in _kStates) {
      for (final size in _kSizes) {
        testWidgets('$state / $size', (tester) async {
          await pumpRadioJioHarnessSettled(tester, _build(state: state, size: size));
          await expectLater(
            find.byType(OneUiRadioGroup),
            matchesGoldenFile('goldens/radio_${state}_$size.png'),
          );
        });
      }
    }
  });

  // state × appearance (size=m) — 8 baselines
  group('[golden] Radio — state × appearance (size=m)', () {
    for (final state in _kStates) {
      for (final app in _kKeyAppearances) {
        testWidgets('$state / $app', (tester) async {
          await pumpRadioJioHarnessSettled(tester, _build(state: state, appearance: app));
          await expectLater(
            find.byType(OneUiRadioGroup),
            matchesGoldenFile('goldens/radio_${state}_$app.png'),
          );
        });
      }
    }
  });

  // readOnly × state — 2 baselines
  group('[golden] Radio — readOnly', () {
    for (final state in _kStates) {
      testWidgets('readonly / $state', (tester) async {
        await pumpRadioJioHarnessSettled(tester, _build(state: state, readOnly: true));
        await expectLater(
          find.byType(OneUiRadioGroup),
          matchesGoldenFile('goldens/radio_readonly_$state.png'),
        );
      });
    }
  });

  // disabled × state — 2 baselines
  group('[golden] Radio — disabled', () {
    for (final state in _kStates) {
      testWidgets('disabled / $state', (tester) async {
        await pumpRadioJioHarnessSettled(
          tester,
          _build(state: state, appearance: 'primary', disabled: true),
        );
        await expectLater(
          find.byType(OneUiRadioGroup),
          matchesGoldenFile('goldens/radio_disabled_$state.png'),
        );
      });
    }
  });

  // label + description — 2 baselines
  group('[golden] Radio — label + description', () {
    testWidgets('label only', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _build(state: 'checked', label: 'Accept terms'));
      await expectLater(
        find.byType(OneUiRadioGroup),
        matchesGoldenFile('goldens/radio_label_only.png'),
      );
    });

    testWidgets('label + description', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        _build(state: 'checked', label: 'Pro', description: 'Best for teams.'),
      );
      await expectLater(
        find.byType(OneUiRadioGroup),
        matchesGoldenFile('goldens/radio_label_description.png'),
      );
    });
  });
}
