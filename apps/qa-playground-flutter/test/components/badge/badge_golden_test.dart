/// Badge visual-regression tests — captures golden PNGs of the component
/// across every meaningful API combination. Headless, single-platform on
/// purpose (Android default) so baselines stay deterministic.
///
/// Workflow:
///   1. After an intentional visual change, regenerate baselines:
///      flutter test --update-goldens test/components/badge/badge_golden_test.dart
///   2. Inspect the new PNGs in test/components/badge/goldens/ before committing.
///   3. CI re-runs without `--update-goldens`; pixel diffs fail the suite.
///
/// Coverage layout (mirrors the Figma badge sheet at the top of this PR):
///   - "core states"             — high/medium/low × size m + slot variations.
///   - "attention × appearance"  — 3 × 8 = 24 baselines at size m.
///   - "size × attention"        — 5 × 3 = 15 baselines at appearance=primary.
///   - "slot configurations"     — label-only, start-only, end-only, both,
///                                 with Icon / Counter / Indicator / Avatar
///                                 to mirror the Figma "start/end" rows.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/badge_harness.dart';

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

const _kSizes = <OneUiBadgeSize>['xs', 's', 'm', 'l', 'xl'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] Badge — core states', () {
    testWidgets('high attention / primary', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_high_primary.png'),
      );
    });

    testWidgets('medium attention / primary', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'medium',
          appearance: 'primary',
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_medium_primary.png'),
      );
    });

    testWidgets('low attention / primary', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'low',
          appearance: 'primary',
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_low_primary.png'),
      );
    });

    testWidgets('with start icon', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          start: OneUiIcon(icon: 'check'),
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_with_start_icon.png'),
      );
    });

    testWidgets('with end icon', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          end: OneUiIcon(icon: 'arrow_forward'),
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_with_end_icon.png'),
      );
    });

    testWidgets('with both start + end icons', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          start: OneUiIcon(icon: 'check'),
          end: OneUiIcon(icon: 'arrow_forward'),
          child: 'Badge',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_with_both_icons.png'),
      );
    });

    testWidgets('label only (no slots)', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          child: 'Label only',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_label_only.png'),
      );
    });
  });

  group('[golden] Badge — attention × appearance matrix', () {
    for (final att in _kAttentions) {
      for (final app in _kAppearances) {
        testWidgets('$att / $app', (tester) async {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'b',
              attention: att,
              appearance: app,
              child: 'Badge',
            ),
          );
          await expectLater(
            find.byType(OneUiBadge),
            matchesGoldenFile('goldens/badge_matrix_${att}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden] Badge — size × attention matrix', () {
    for (final size in _kSizes) {
      for (final att in _kAttentions) {
        testWidgets('size=$size attention=$att', (tester) async {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'b',
              size: size,
              attention: att,
              appearance: 'primary',
              child: 'Badge',
            ),
          );
          await expectLater(
            find.byType(OneUiBadge),
            matchesGoldenFile('goldens/badge_size_${size}_$att.png'),
          );
        });
      }
    }
  });

  group('[golden] Badge — slot variations (Figma start/end matrix)', () {
    // Nested CounterBadge / IndicatorBadge slot baselines live with the
    // dev-owned widget tests in
    // `packages/ui_flutter/test/one_ui_badge_widget_test.dart`, which use a
    // synthetic design-system payload that supplies the per-slot Convex
    // tokens. Here we cover Icon + Avatar slots — the rest is dev-test
    // territory.

    testWidgets('start: Avatar', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          attention: 'high',
          appearance: 'primary',
          start: OneUiAvatar(size: 'xs', alt: 'AB'),
          child: 'User',
        ),
      );
      await expectLater(
        find.byType(OneUiBadge),
        matchesGoldenFile('goldens/badge_slot_start_avatar.png'),
      );
    });
  });
}
