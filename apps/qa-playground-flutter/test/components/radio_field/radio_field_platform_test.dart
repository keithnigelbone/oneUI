/// RadioField platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// The field delegates interaction to its [OneUiRadio] options, so platform
/// behaviour is exercised through a multi-option field:
///   - Android / iOS: pointer tap selects + announces the radio role.
///   - linux / macOS: the focused option paints the 2-layer halo; pointer tap
///     selects.
///
/// Keyboard activation (Space/arrows) is NOT asserted passing here — it is a
/// genuine gap captured RED in `radio_field_regression_test.dart`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[platform][mobile] RadioField', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap selects + announces the radio role',
        (tester) async {
      String? value;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', onValueChange: (v) => value = v, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(value, 'b');
      withSemanticsHandle(tester, () {
        final data = radioSemanticsData(tester, 'B', checked: true);
        expect(data.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled field is not selected by tap',
        (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', disabled: true, onValueChange: (_) => changed = true,
            children: [OneUiRadio(value: 'a', label: 'A')]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  group('[platform][web] RadioField', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] focused option paints the 2-layer focus ring',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', children: [
          OneUiRadio(value: 'a', label: 'A', autofocus: true),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
      final shadows = radioBoxDecoration(tester, within: radioRootFinder().at(0)).boxShadow;
      expect(shadows, isNotNull);
      expect(shadows!.length, 2);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] pointer tap selects the control', (tester) async {
      String? value;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', onValueChange: (v) => value = v, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(value, 'a');
    });
  });
}
