/// CounterBadge visual-regression tests — DARK MODE.
///
/// Re-runs the most-discriminating subset of the light-mode matrix under
/// `darkMode: true` to validate surface step flip (2500 → 100) and on-bold
/// contrast inversion.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';

import '../../support/components/counter_badge_harness.dart';

const _kDarkAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
];

const _kAttentions = <String>['high', 'medium', 'low'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][dark] CounterBadge — attention × appearance matrix (dark)', () {
    for (final att in _kAttentions) {
      for (final app in _kDarkAppearances) {
        testWidgets('$att / $app (dark)', (tester) async {
          await pumpCounterBadgeQaHarnessSettled(
            tester,
            OneUiCounterBadge(
              value: 8,
              attention: att,
              appearance: app,
              semanticsLabel: '8',
            ),
            darkMode: true,
          );
          await expectLater(
            find.byType(OneUiCounterBadge),
            matchesGoldenFile('goldens/dark/counter_badge_dark_${att}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden][dark] CounterBadge — xs size (dark)', () {
    testWidgets('xs / high / primary (dark)', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 3,
          size: 'xs',
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '3',
        ),
        darkMode: true,
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/dark/counter_badge_dark_dot_xs_high.png'),
      );
    });
  });
}
