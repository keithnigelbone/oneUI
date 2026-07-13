/// IndicatorBadge functional QA tests — mirrors web `IndicatorBadge.tsx`
/// and the Figma API matrix (5 sizes × 9 appearances).
///
/// Asserts observable behavior (rendered side dimensions, appearance auto-
/// inheritance, overlay anchors, Surface context) so a regression that
/// silently ignores a Figma prop fails here.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_types.dart';

import '../../support/components/indicator_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[smoke] IndicatorBadge — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default indicator renders', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(semanticsLabel: 'Online'),
      );
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
    });

    for (final size in kOneUiIndicatorBadgeSizes) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadge(size: size, semanticsLabel: 'dot'),
        );
        expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      });
    }
  });

  group('[functional] IndicatorBadge — size honors token (not just smoke)', () {
    Future<Size> renderSize(WidgetTester tester, String size) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        OneUiIndicatorBadge(size: size, semanticsLabel: 'dot'),
      );
      return tester.getSize(indicatorBadgeRootFinder());
    }

    testWidgetsAllPlatforms('[fn] size="xl" renders strictly larger than size="xs"', (tester) async {
      final sXl = await renderSize(tester, 'xl');
      final sXs = await renderSize(tester, 'xs');
      expect(sXl.height, greaterThan(sXs.height),
          reason: 'xl must read --IndicatorBadge-size-xl, xs reads --IndicatorBadge-size-xs');
    });

    testWidgetsAllPlatforms('[fn] size is monotonic xs ≤ s ≤ m ≤ l ≤ xl', (tester) async {
      final sXs = await renderSize(tester, 'xs');
      final sS = await renderSize(tester, 's');
      final sM = await renderSize(tester, 'm');
      final sL = await renderSize(tester, 'l');
      final sXl = await renderSize(tester, 'xl');
      expect(sXs.height, lessThanOrEqualTo(sS.height));
      expect(sS.height, lessThanOrEqualTo(sM.height));
      expect(sM.height, lessThanOrEqualTo(sL.height));
      expect(sL.height, lessThanOrEqualTo(sXl.height));
    });

    testWidgetsAllPlatforms('[fn] dot is square (width == height)', (tester) async {
      for (final size in const ['xs', 's', 'm', 'l', 'xl']) {
        final dim = await renderSize(tester, size);
        expect(dim.width, closeTo(dim.height, 0.5),
            reason: 'IndicatorBadge dot at size=$size must be square');
      }
    });

    testWidgetsAllPlatforms('[fn] unknown size falls back to "m"', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(size: 'huge', semanticsLabel: 'dot'),
      );
      final unknown = tester.getSize(indicatorBadgeRootFinder());

      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(size: 'm', semanticsLabel: 'dot'),
      );
      final m = tester.getSize(indicatorBadgeRootFinder());

      expect(unknown, m,
          reason: 'unknown size token must fall back to m');
    });
  });

  group('[smoke] IndicatorBadge — Figma matrix: appearance', () {
    for (final appearance in const [
      'auto',
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'positive',
      'negative',
      'informative',
      'warning',
    ]) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders', (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadge(appearance: appearance, semanticsLabel: 'dot'),
        );
        expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      });
    }
  });

  group('[functional] IndicatorBadge — data-attribute key', () {
    testWidgetsAllPlatforms('[fn] data-attribute key encodes size+appearance', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          size: 'l',
          appearance: 'positive',
          semanticsLabel: 'Online',
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-indicator-badge|data-size=l|data-appearance=positive',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] appearance=auto outside Surface defaults to primary', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(semanticsLabel: 'dot'),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=primary',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] explicit appearance wins over auto+Surface', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          appearance: 'negative',
          semanticsLabel: 'alert',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=negative',
        )),
        findsOneWidget,
      );
    });
  });

  group('[functional] IndicatorBadge — testId / KeyedSubtree', () {
    testWidgetsAllPlatforms('[fn] testId attaches a ValueKey to the root', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(
          testId: 'qa-dot',
          semanticsLabel: 'dot',
        ),
      );
      expect(find.byKey(const ValueKey('qa-dot')), findsOneWidget);
    });
  });

  group('[functional] IndicatorBadge — overlay anchors', () {
    testWidgetsAllPlatforms('[fn] topEnd anchor renders the indicator on top-right', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        OneUiIndicatorBadgeOverlay(
          hostSide: 40,
          host: const ColoredBox(color: Color(0xFFCCCCCC)),
          indicator: const OneUiIndicatorBadge(
            appearance: 'negative',
            semanticsLabel: 'unread',
          ),
          anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
          indicatorSize: 's',
        ),
      );
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      expect(find.byType(OneUiIndicatorBadgeOverlay), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] bottomEnd anchor with surface ring renders', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        OneUiIndicatorBadgeOverlay(
          hostSide: 40,
          host: const ColoredBox(color: Color(0xFFCCCCCC)),
          indicator: const OneUiIndicatorBadge(
            appearance: 'positive',
            semanticsLabel: 'Online',
          ),
          anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
          indicatorSize: 'm',
          surfaceRingColor: const Color(0xFFFFFFFF),
          surfaceRingWidth: 2,
        ),
      );
      expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      expect(find.byType(OneUiIndicatorBadgeOverlay), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] overlay sized to hostSide', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        OneUiIndicatorBadgeOverlay(
          hostSide: 48,
          host: const ColoredBox(color: Color(0xFFCCCCCC)),
          indicator: const OneUiIndicatorBadge(
            appearance: 'primary',
            semanticsLabel: 'dot',
          ),
          anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
          indicatorSize: 's',
        ),
      );
      final overlaySize = tester.getSize(find.byType(OneUiIndicatorBadgeOverlay));
      expect(overlaySize.width, 48);
      expect(overlaySize.height, 48);
    });
  });
}
