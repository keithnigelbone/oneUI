/// InputDynamicText — on-device integration tests.
///
/// Renders [OneUiInputDynamicText] on the connected emulator / simulator using
/// the Jio-fixture harness, exercising real engine behaviour:
///   - real token resolution + brand colours
///   - real pointer feedback on trailing helper button
///   - real Semantics (TalkBack / VoiceOver)
///   - dark mode + surface context
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';

import '../test/support/components/input_dynamic_text_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputDynamicTextIconsLoaded();
  });

  group('InputDynamicText — on-device', () {
    testWidgets('[e2e] default row renders content + helper button',
        (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: '0 / 100 characters',
          end: 'Helper Button',
        ),
      );
      await _hold(tester, 2000);
      expect(find.text('0 / 100 characters'), findsOneWidget);
      expect(find.text('Helper Button'), findsOneWidget);
    });

    testWidgets('[e2e] helper button responds to tap', (tester) async {
      var hits = 0;
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        OneUiInputDynamicText(
          content: '12 / 100',
          end: 'Clear',
          onEndClick: () => hits++,
        ),
      );
      await _hold(tester);
      await tester.tap(inputDynamicTextHelperInteractiveFinder());
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(hits, 1);
    });

    testWidgets('[e2e] sizes render at increasing body font sizes',
        (tester) async {
      final sizes = <String, double>{};
      for (final entry in {
        's': OneUiInputLabelSize.s,
        'm': OneUiInputLabelSize.m,
        'l': OneUiInputLabelSize.l,
      }.entries) {
        await pumpInputDynamicTextJioHarnessSettled(
          tester,
          OneUiInputDynamicText(
            size: entry.value,
            content: 'Count ${entry.key}',
          ),
        );
        await _hold(tester, _demoMode ? 400 : 0);
        sizes[entry.key] =
            inputDynamicTextLeadingTextStyle(tester, 'Count ${entry.key}')
                .fontSize!;
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] polite live region on character count', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: 'Updating: 12 / 100 characters',
          ariaLive: OneUiInputDynamicTextAriaLive.polite,
        ),
      );
      await _hold(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(inputDynamicTextLiveRegionFinder(), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[e2e] disabled blocks helper tap', (tester) async {
      var hits = 0;
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          disabled: true,
          onEndClick: () => hits++,
        ),
      );
      await _hold(tester);
      await tester.tap(inputDynamicTextHelperInteractiveFinder(),
          warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgets('[e2e] dark mode renders', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: '0 / 280 characters',
          end: 'Help',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(inputDynamicTextRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] inside bold surface renders', (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          content: 'Dynamic text',
          end: 'Helper Button',
        ),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(inputDynamicTextRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] trailing-only exposes accessible button label',
        (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          end: 'Help',
          endAriaLabel: 'Open contextual help',
        ),
      );
      await _hold(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.label, contains('Open contextual help'));
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });
  });
}
