/// IndicatorBadge visual-regression tests — captures golden PNGs across every
/// Figma matrix combination.
///
/// Workflow:
///   1. After an intentional visual change:
///      flutter test --update-goldens test/components/indicator_badge/indicator_badge_golden_test.dart
///   2. Inspect new PNGs in test/components/indicator_badge/goldens/ before
///      committing.
///   3. CI re-runs without `--update-goldens`; pixel diffs fail.
///
/// Coverage layout (Figma IndicatorBadge sheet):
///   - "core dots"        — 9 appearances at size m
///   - "size × appearance" — 5 sizes × 4 high-signal appearances = 20 baselines
///   - "overlay variants"  — topEnd on icon, bottomEnd on avatar (with ring)
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_types.dart';

import '../../support/components/indicator_badge_harness.dart';

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

const _kSizes = <OneUiIndicatorBadgeSize>['xs', 's', 'm', 'l', 'xl'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden] IndicatorBadge — core dots (size m)', () {
    for (final app in _kAppearances) {
      testWidgets('appearance=$app / size=m', (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadge(
            size: 'm',
            appearance: app,
            semanticsLabel: 'dot',
          ),
        );
        await expectLater(
          find.byType(OneUiIndicatorBadge),
          matchesGoldenFile('goldens/indicator_badge_m_$app.png'),
        );
      });
    }
  });

  group('[golden] IndicatorBadge — size × appearance matrix', () {
    const highSignalAppearances = ['primary', 'negative', 'positive', 'warning'];
    for (final size in _kSizes) {
      for (final app in highSignalAppearances) {
        testWidgets('size=$size appearance=$app', (tester) async {
          await pumpIndicatorBadgeQaHarnessSettled(
            tester,
            OneUiIndicatorBadge(
              size: size,
              appearance: app,
              semanticsLabel: 'dot',
            ),
          );
          await expectLater(
            find.byType(OneUiIndicatorBadge),
            matchesGoldenFile('goldens/indicator_badge_size_${size}_$app.png'),
          );
        });
      }
    }
  });

  group('[golden] IndicatorBadge — overlay anchors', () {
    testWidgets('topEnd anchor on icon tile (no ring)', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        SizedBox(
          width: 40,
          height: 40,
          child: OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFE0E0E0)),
            indicator: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'negative',
              semanticsLabel: 'unread',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
            indicatorSize: 's',
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiIndicatorBadgeOverlay),
        matchesGoldenFile('goldens/indicator_badge_overlay_top_end.png'),
      );
    });

    testWidgets('bottomEnd anchor on avatar tile (with surface ring)', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        SizedBox(
          width: 48,
          height: 48,
          child: OneUiIndicatorBadgeOverlay(
            hostSide: 48,
            host: const DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFB0C4DE),
              ),
            ),
            indicator: const OneUiIndicatorBadge(
              size: 'm',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 'm',
            surfaceRingColor: const Color(0xFFFFFFFF),
            surfaceRingWidth: 2,
          ),
        ),
      );
      await expectLater(
        find.byType(OneUiIndicatorBadgeOverlay),
        matchesGoldenFile('goldens/indicator_badge_overlay_bottom_end_ringed.png'),
      );
    });
  });
}
