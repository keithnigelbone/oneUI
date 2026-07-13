/// RadioField Figma-parity QA suite — `[figma]`.
///
/// Exercises EVERY value of the Figma RadioField API end-to-end against the real
/// widget. The field propagates `size` + `appearance` + `disabled` + `readOnly`
/// + `invalid` onto each [OneUiRadio] option (web `enhanceRadioOptions`), so the
/// option box renders at the field size (unlike a bare RadioGroup).
///
/// Figma API surface (source of truth):
///   size        s | m | l
///   appearance  auto | neutral | primary | secondary | sparkle |
///               negative | positive | informative | warning
///   accent      primary | secondary | sparkle   (N/A — ignored)
///   checked     t | f
///   readOnly    t | f
///   label       t | f
///   required    t | f
///   infoIcon    t | f
///   description t | f
///   feedback    t | f
///   disabled    t | f
///   content     t | f   (Figma-only: label/description/feedback/info/required)
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

const _kFigmaAppearances = <String>[
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

const _kBoxPxBySize = <String, double>{'s': 16, 'm': 20, 'l': 24};

Widget _field({
  String size = 'm',
  String appearance = 'auto',
  bool checked = false,
  bool readOnly = false,
  bool disabled = false,
  bool required = false,
  bool infoIcon = false,
  String? description,
  String? error,
  String label = 'Plan',
}) {
  return OneUiRadioField(
    size: size,
    appearance: appearance,
    readOnly: readOnly,
    disabled: disabled,
    required: required,
    infoIcon: infoIcon,
    description: description,
    error: error,
    label: label,
    defaultValue: checked ? 'a' : null,
    children: [
      OneUiRadio(value: 'a', label: 'A'),
      OneUiRadio(value: 'b', label: 'B'),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // SIZE — propagates to the option box.
  // ===========================================================================

  group('[figma] RadioField — size', () {
    for (final entry in _kBoxPxBySize.entries) {
      testWidgetsAllPlatforms(
          '[figma] size=${entry.key} renders ${entry.value}px option boxes', (tester) async {
        await pumpRadioJioHarnessSettled(tester, _field(size: entry.key, checked: true));
        expect(radioBoxSizePx(tester, within: radioRootFinder().at(0)), entry.value);
      });
    }

    testWidgetsAllPlatforms('[figma] unset size defaults to m (20px)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(checked: true));
      expect(radioBoxSizePx(tester, within: radioRootFinder().at(0)), 20);
    });
  });

  // ===========================================================================
  // APPEARANCE — drives the checked fill of each option.
  // ===========================================================================

  group('[figma] RadioField — appearance', () {
    for (final app in _kFigmaAppearances) {
      testWidgetsAllPlatforms('[figma] appearance=$app fills the checked option', (tester) async {
        await pumpRadioJioHarnessSettled(tester, _field(appearance: app, checked: true));
        final fill = radioBoxDecoration(tester, within: radioRootFinder().at(0)).color;
        expect(fill, isNotNull);
        expect(fill, isNot(Colors.transparent));
      });
    }

    testWidgetsAllPlatforms('[figma] appearance=auto resolves to secondary', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(appearance: 'auto', checked: true));
      final auto = radioBoxDecoration(tester, within: radioRootFinder().at(0)).color;
      await pumpRadioJioHarnessSettled(tester, _field(appearance: 'secondary', checked: true));
      final sec = radioBoxDecoration(tester, within: radioRootFinder().at(0)).color;
      expect(auto, sec);
    });
  });

  // ===========================================================================
  // CHECKED / READONLY / DISABLED
  // ===========================================================================

  group('[figma] RadioField — checked / readOnly / disabled', () {
    testWidgetsAllPlatforms('[figma] checked exposes the selected option', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(checked: true));
      expectRadioChecked(tester, 'A', checked: true);
      expectRadioChecked(tester, 'B', checked: false);
    });

    testWidgetsAllPlatforms('[figma] readOnly keeps options enabled (opacity 1.0)', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(readOnly: true, checked: true));
      expectRadioEnabled(tester, 'A');
      expect(radioFieldOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[figma] disabled dims the field (Opacity 0.5) + marks not enabled',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(disabled: true));
      expect(radioFieldOpacity(tester), 0.5);
      expectRadioDisabled(tester, 'A');
    });
  });

  // ===========================================================================
  // CONTENT — label / description / required / infoIcon / feedback.
  // ===========================================================================

  group('[figma] RadioField — content slots', () {
    testWidgetsAllPlatforms('[figma] label=true renders the field label', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(label: 'Choose a plan'));
      expect(find.text('Choose a plan'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] description=true renders the description', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(description: 'Pick exactly one.'));
      expect(find.text('Pick exactly one.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] required=true renders the asterisk', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(required: true));
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] infoIcon=true renders the info button (needs a label)',
        (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(infoIcon: true));
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgetsAllPlatforms('[figma] feedback (error) renders the message', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field(error: 'Choose a plan'));
      expect(find.text('Choose a plan'), findsOneWidget);
    });
  });

  // ===========================================================================
  // FULL MATRIX — size × checked × readOnly (the Figma states sheet).
  // ===========================================================================

  group('[figma] RadioField — states sheet matrix (size × checked × readOnly)', () {
    for (final size in ['s', 'm', 'l']) {
      for (final readOnly in [false, true]) {
        final ro = readOnly ? 'ro' : 'rw';
        for (final checked in [false, true]) {
          final ck = checked ? 'checked' : 'unchecked';
          testWidgetsAllPlatforms('[figma] $size / $ck / $ro', (tester) async {
            await pumpRadioJioHarnessSettled(
              tester,
              _field(size: size, checked: checked, readOnly: readOnly),
            );
            expect(radioBoxSizePx(tester, within: radioRootFinder().at(0)), _kBoxPxBySize[size]);
            expectRadioChecked(tester, 'A', checked: checked);
          });
        }
      }
    }
  });

  // ===========================================================================
  // GROUP ROLE
  // ===========================================================================

  group('[figma] RadioField — group role', () {
    testWidgetsAllPlatforms('[figma] multi field exposes the radiogroup role', (tester) async {
      await pumpRadioJioHarnessSettled(tester, _field());
      withSemanticsHandle(tester, () {
        final grp = find.descendant(
          of: radioGroupFinder(),
          matching: find.byWidgetPredicate(
              (w) => w is Semantics && w.properties.role == SemanticsRole.radioGroup),
        );
        expect(grp, findsOneWidget);
      });
    });
  });
}
