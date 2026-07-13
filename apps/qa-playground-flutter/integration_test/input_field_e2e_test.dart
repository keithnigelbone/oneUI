/// InputField — on-device integration tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../test/support/components/input_field_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('InputField — on-device', () {
    testWidgets('[e2e] renders label + description + input', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          description: 'Work email only.',
          placeholder: 'you@company.com',
        ),
      );
      await _hold(tester, 2000);
      expect(inputFieldRootFinder(), findsOneWidget);
      expect(find.text('Work email only.'), findsOneWidget);
    });

    testWidgets(
        '[e2e] all sizes render at non-decreasing shell heights (S-360 touch clamp)',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in kOneUiInputFieldFigmaSizes) {
        await pumpInputFieldJioHarnessSettled(
          tester,
          OneUiInputField(label: 'Field', size: size, placeholder: size),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        final numeric = resolveOneUiInputNumericSize(size);
        expect(
          inputFieldShellHeightPx(tester),
          expectedInputShellHeightPx(numeric),
          reason: 'size=$size on S-360 (WCAG touch floor)',
        );
        sizes[size] = inputFieldShellHeightPx(tester);
      }
      // s/m clamp to 44px on mobile — monotonic, not strictly increasing.
      expect(sizes['s']!, lessThanOrEqualTo(sizes['m']!));
      expect(sizes['m']!, lessThanOrEqualTo(sizes['l']!));
      expect(sizes['l']!, greaterThan(sizes['s']!),
          reason: 'l (f12) exceeds touch-clamped s/m floor');
    });

    testWidgets('[e2e] enterText fires onChanged', (tester) async {
      String? last;
      await pumpInputFieldJioHarnessSettled(
        tester,
        OneUiInputField(
          label: 'Name',
          onChanged: (v) => last = v,
        ),
      );
      await tester.enterText(find.byType(TextField), 'Ada Lovelace');
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expect(last, 'Ada Lovelace');
    });

    testWidgets('[e2e] required field renders asterisk', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Full name', required: true),
      );
      await _hold(tester, 2000);
      expect(inputFieldHasRequiredAsterisk(tester), isTrue);
    });

    testWidgets('[e2e] info icon renders beside label', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'PIN', infoIcon: true),
      );
      await _hold(tester, 2000);
      expect(inputFieldHasInfoIcon(tester), isTrue);
    });

    testWidgets('[e2e] error feedback renders + alert role for AT',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          error: 'Enter a valid email address.',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('Enter a valid email address.'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.role == SemanticsRole.alert,
          ),
          findsWidgets,
        );
      });
    });

    testWidgets('[e2e] ariaLabel exposed as accessible name', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Visible',
          ariaLabel: 'Email address',
          placeholder: 'email',
        ),
      );
      await _hold(tester, 2000);
      expect(find.bySemanticsLabel('Email address'), findsOneWidget);
    });

    testWidgets('[e2e] dark mode renders', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          placeholder: 'you@example.com',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(inputFieldRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] inside bold surface renders', (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          description: 'On bold surface.',
          placeholder: 'email',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(inputFieldRootFinder(), findsOneWidget);
    });
  });
}
