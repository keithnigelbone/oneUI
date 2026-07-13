/// IconButton — on-device integration tests.
///
/// Renders [OneUiIconButton] on the connected emulator / simulator using the
/// Jio-fixture harness, exercising real engine behaviour:
///   - real token resolution + brand colours
///   - real pointer ripples / press feedback
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
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../test/support/components/icon_button_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureIconButtonIconsLoaded();
  });

  group('IconButton — on-device', () {
    testWidgets('[e2e] default high attention renders + responds to tap',
        (tester) async {
      var hits = 0;
      await pumpIconButtonJioHarnessSettled(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          attention: OneUiIconButtonAttention.high,
          appearance: 'primary',
          onPressed: () => hits++,
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconButton), findsOneWidget);
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(hits, 1);
    });

    testWidgets('[e2e] sizes render at strictly increasing heights', (tester) async {
      final sizes = <String, double>{};
      for (final alias in ['2xs', 'xs', 's', 'm', 'l', 'xl']) {
        await pumpIconButtonJioHarnessSettled(
          tester,
          OneUiIconButton(
            icon: 'heart',
            sizeAlias: alias,
            semanticsLabel: alias,
          ),
        );
        await _hold(tester, _demoMode ? 400 : 0);
        sizes[alias] = iconButtonHeightPx(tester);
      }
      expect(sizes['2xs']!, lessThan(sizes['xs']!));
      expect(sizes['xs']!, lessThan(sizes['s']!));
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
      expect(sizes['l']!, lessThan(sizes['xl']!));
    });

    testWidgets('[e2e] each attention level renders distinctly', (tester) async {
      for (final attention in OneUiIconButtonAttention.values) {
        await pumpIconButtonJioHarnessSettled(
          tester,
          OneUiIconButton(
            icon: 'heart',
            attention: attention,
            semanticsLabel: attention.name,
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('[e2e] each key appearance renders', (tester) async {
      for (final app in [
        'secondary',
        'primary',
        'positive',
        'negative',
        'informative',
      ]) {
        await pumpIconButtonJioHarnessSettled(
          tester,
          OneUiIconButton(
            icon: 'heart',
            appearance: app,
            semanticsLabel: app,
          ),
        );
        await _hold(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled state blocks tap and dims', (tester) async {
      var hits = 0;
      await pumpIconButtonJioHarnessSettled(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          disabled: true,
          onPressed: () => hits++,
        ),
      );
      await _hold(tester, 2000);
      expect(iconButtonOpacity(tester), lessThan(1.0));
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(hits, 0);
    });

    testWidgets('[e2e] loading state shows spinner and blocks tap', (tester) async {
      var hits = 0;
      // NOTE: loading renders an infinite-rotation spinner. Use the NON-settling
      // pump — pumpAndSettle() would wait forever on the perpetual animation and
      // hang the on-device run until the 10-minute timeout.
      await pumpIconButtonJioHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          loading: true,
          onPressed: () => hits++,
        ),
      );
      await _hold(tester, 2000);
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pump(const Duration(milliseconds: 100));
      await _hold(tester);
      expect(find.byType(OneUiIconButton), findsOneWidget);
      expect(hits, 0);
    });

    testWidgets('[e2e] wide layout renders wider chrome', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          layout: OneUiIconButtonLayout.wide,
          semanticsLabel: 'Like',
        ),
      );
      await _hold(tester, 2000);
      expect(
        iconButtonWidthPx(tester) / iconButtonHeightPx(tester),
        closeTo(1.5, 0.05),
      );
    });

    testWidgets('[e2e] uncontained form renders', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          contained: false,
          attention: OneUiIconButtonAttention.low,
          semanticsLabel: 'Like',
        ),
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('[e2e] inside Surface auto-adapts (auto appearance)',
        (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          appearance: 'auto',
          semanticsLabel: 'Like',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode icon button renders without contrast holes',
        (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          appearance: 'primary',
          semanticsLabel: 'Like',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('[e2e] labelled control exposes name in AT tree', (tester) async {
      await pumpIconButtonJioHarnessSettled(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like item'),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Like item');
        expect(data.label, contains('Like item'));
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });
  });
}
