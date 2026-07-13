/// CounterBadge visual-regression tests — captures golden PNGs of the
/// component across every meaningful API combination.
///
/// Workflow:
///   1. After an intentional visual change, regenerate baselines:
///      flutter test --update-goldens test/components/counter_badge/counter_badge_golden_test.dart
///   2. Inspect the new PNGs in test/components/counter_badge/goldens/ before
///      committing.
///   3. CI re-runs without `--update-goldens`; pixel diffs fail the suite.
///
/// Coverage layout (mirrors the Figma CounterBadge sheet):
///   - "core states"            — high/medium/low × size m (numerals)
///   - "attention × appearance" — 3 × 8 = 24 baselines at size m
///   - "size × attention"       — 5 × 3 = 15 baselines at appearance=primary
///   - "dot mode"               — xs + high renders as a dot
///   - "overflow"               — 99+ display value
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_types.dart';

import '../../support/components/counter_badge_harness.dart';

const _kAppearances = <String>[
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

const _kAttentions = <String>['high', 'medium', 'low'];

const _kSizes = <OneUiCounterBadgeSize>['xs', 's', 'm', 'l', 'xl'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] CounterBadge — core states', () {
    testWidgets('high attention / primary', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_high_primary.png'),
      );
    });

    testWidgets('medium attention / primary', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'medium',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_medium_primary.png'),
      );
    });

    testWidgets('low attention / primary', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          attention: 'low',
          appearance: 'primary',
          semanticsLabel: '8',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_low_primary.png'),
      );
    });
  });

  group('[golden] CounterBadge — attention × appearance matrix', () {
    for (final att in _kAttentions) {
      for (final app in _kAppearances) {
        testWidgets('$att / $app', (tester) async {
          await pumpCounterBadgeQaHarnessSettled(
            tester,
            OneUiCounterBadge(
              value: 8,
              attention: att,
              appearance: app,
              semanticsLabel: '8',
            ),
          );
          await expectLater(
            find.byType(OneUiCounterBadge),
            matchesGoldenFile('goldens/counter_badge_matrix_${att}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden] CounterBadge — size × attention matrix', () {
    for (final size in _kSizes) {
      for (final att in _kAttentions) {
        testWidgets('size=$size attention=$att', (tester) async {
          await pumpCounterBadgeQaHarnessSettled(
            tester,
            OneUiCounterBadge(
              value: 8,
              size: size,
              attention: att,
              appearance: 'primary',
              semanticsLabel: '8',
            ),
          );
          await expectLater(
            find.byType(OneUiCounterBadge),
            matchesGoldenFile('goldens/counter_badge_size_${size}_$att.png'),
          );
        });
      }
    }
  });

  group('[golden] CounterBadge — xs dot-mode (high)', () {
    testWidgets('xs / high → dot (no visible digit)', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          size: 'xs',
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '5 new',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_dot_xs_high.png'),
      );
    });

    testWidgets('xs / high / negative → dot mode', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 1,
          size: 'xs',
          attention: 'high',
          appearance: 'negative',
          semanticsLabel: 'alert',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_dot_negative.png'),
      );
    });
  });

  group('[golden] CounterBadge — overflow', () {
    testWidgets('value=120 max=99 → "99+"', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 120,
          max: 99,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '99+',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_overflow_99plus.png'),
      );
    });

    testWidgets('value=1500 max=999 → "999+"', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 1500,
          max: 999,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '999+',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_overflow_999plus.png'),
      );
    });
  });

  group('[golden] CounterBadge — showZero', () {
    testWidgets('value=0 showZero=true', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 0,
          showZero: true,
          attention: 'high',
          appearance: 'primary',
          semanticsLabel: '0',
        ),
      );
      await expectLater(
        find.byType(OneUiCounterBadge),
        matchesGoldenFile('goldens/counter_badge_show_zero.png'),
      );
    });
  });
}
