/// InputField platform-specific QA tests — mobile tap vs desktop keyboard.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';

import '../../support/components/input_field_harness.dart';

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
    await ensureInputIconsLoaded();
  });

  group('[platform][mobile] InputField', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] enterText updates value',
        (tester) async {
      String? last;
      await pumpInputFieldJioHarnessSettled(
        tester,
        OneUiInputField(
          label: 'Name',
          placeholder: 'Name',
          onChanged: (v) => last = v,
        ),
      );
      await tester.enterText(find.byType(TextField), 'Ada');
      await tester.pumpAndSettle();
      expect(last, 'Ada');
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] tap focuses the text field',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', placeholder: 'email'),
      );
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(FocusScope.of(tester.element(find.byType(TextField))).focusedChild,
          isNotNull);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled field blocks editing',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Locked', value: 'x', disabled: true),
      );
      expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] error feedback renders for AT',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', error: 'Invalid format'),
      );
      expect(find.text('Invalid format'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.role == SemanticsRole.alert,
          ),
          findsWidgets,
        );
      });
    });
  });

  group('[platform][web] InputField', () {
    _onPlatforms(
        _kWebDesktopPlatforms, '[web] enterText via keyboard updates value',
        (tester) async {
      String? last;
      await pumpInputFieldJioHarnessSettled(
        tester,
        OneUiInputField(
          label: 'Name',
          onChanged: (v) => last = v,
        ),
      );
      await tester.enterText(find.byType(TextField), 'Bob');
      await tester.pumpAndSettle();
      expect(last, 'Bob');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] tab focuses the control',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', placeholder: 'email'),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(FocusScope.of(tester.element(find.byType(TextField))).focusedChild,
          isNotNull);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] disabled field is not editable',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Off', value: 'locked', disabled: true),
      );
      expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] hover does not crash on label row',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Hover', placeholder: 'x'),
      );
      final shell =
          inputShellFinder(within: inputFieldInnerInputFinder()).first;
      final center = tester.getCenter(shell);
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: center);
      await gesture.moveTo(center);
      await tester.pumpAndSettle();
      expect(inputFieldRootFinder(), findsOneWidget);
    });
  });
}
