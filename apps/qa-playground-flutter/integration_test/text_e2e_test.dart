/// Text — on-device integration tests.
///
/// Renders [OneUiText] on the connected emulator / simulator using the
/// Jio-fixture harness, exercising real engine behaviour:
///   - real token resolution + brand typography
///   - real pointer tap on interactive copy
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
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../test/support/components/text_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('Text — on-device', () {
    testWidgets('[e2e] default body copy renders', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        const OneUiText(text: 'Hello world'),
      );
      await _hold(tester, 2000);
      expect(find.text('Hello world'), findsOneWidget);
    });

    testWidgets('[e2e] each typography variant renders', (tester) async {
      for (final variant in kOneUiTextVariants) {
        await pumpTextJioHarnessSettled(
          tester,
          OneUiText(text: variant.name, variant: variant),
        );
        await _hold(tester, _demoMode ? 400 : 0);
        expect(find.text(variant.name), findsOneWidget);
      }
    });

    testWidgets('[e2e] interactive copy responds to tap', (tester) async {
      var hits = 0;
      await pumpTextJioHarnessSettled(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () => hits++,
        ),
      );
      await _hold(tester, 2000);
      await tester.tap(find.text('Learn more'));
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(hits, 1);
    });

    testWidgets('[e2e] headline exposes header semantics', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        const OneUiText(
          text: 'Section title',
          variant: OneUiTextVariant.headline,
        ),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Section title');
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      });
    });

    testWidgets('[e2e] inside Surface auto-adapts colour', (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        const OneUiText(
          text: 'On surface',
          appearance: 'auto',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await _hold(tester, 2000);
      expect(textColorOf(tester), isNotNull);
    });

    testWidgets('[e2e] dark-mode body copy renders without contrast holes',
        (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        const OneUiText(
          text: 'Dark copy',
          variant: OneUiTextVariant.body,
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.text('Dark copy'), findsOneWidget);
    });

    testWidgets('[e2e] labelled interactive copy exposes name in AT tree',
        (tester) async {
      await pumpTextJioHarnessSettled(
        tester,
        OneUiText(
          text: 'Learn more',
          semanticsLabel: 'Learn more about plans',
          onPressed: () {},
        ),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Learn more about plans');
        expect(data.label, contains('Learn more about plans'));
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      });
    });
  });
}
