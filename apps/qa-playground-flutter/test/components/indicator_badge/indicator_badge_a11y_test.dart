/// IndicatorBadge accessibility QA tests.
///
/// Two layers:
///   - Pure resolver tests   — `resolveOneUiIndicatorBadgeSemantics`.
///   - Widget semantics tests — Semantics tree, required-label contract,
///                              non-interactive surface.
///
/// Live-region: Flutter uses `announceChanges: false` (RN image-role parity) so
/// static presence dots do not spam AT on parent rebuilds. Web `role="status"`
/// polite announcements apply when the label changes via [OneUiStatusSemantics].
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_a11y.dart';

import '../../support/components/indicator_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[a11y] resolveOneUiIndicatorBadgeSemantics', () {
    test('[a11y] non-empty label is accessible', () {
      final a11y = resolveOneUiIndicatorBadgeSemantics(semanticsLabel: 'Online');
      expect(a11y.accessible, isTrue);
      expect(a11y.label, 'Online');
    });

    test('[a11y] empty label is not accessible', () {
      final a11y = resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '');
      expect(a11y.accessible, isFalse);
      expect(a11y.label, isNull);
    });

    test('[a11y] whitespace-only label is not accessible', () {
      final a11y = resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '   ');
      expect(a11y.accessible, isFalse);
    });

    test('[a11y] label is trimmed of surrounding whitespace', () {
      final a11y = resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '  Online  ');
      expect(a11y.accessible, isTrue);
      expect(a11y.label, 'Online');
    });
  });

  group('[a11y] IndicatorBadge widget — semantics contract', () {
    testWidgetsAllPlatforms('[a11y] exposes semanticsLabel as accessible name', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(semanticsLabel: 'Online'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Online'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] live region is off for static dots (RN parity)', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(semanticsLabel: 'Unread'),
      );
      withSemanticsHandle(tester, () {
        final node = tester.getSemantics(find.bySemanticsLabel('Unread'));
        final data = node.getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isLiveRegion), isFalse,
            reason:
                'Static presence dots use announceChanges:false so AT is not '
                're-fired on every parent rebuild');
      });
    });

    testWidgetsAllPlatforms('[a11y] does NOT expose isButton flag', (tester) async {
      await pumpIndicatorBadgeQaHarnessSettled(
        tester,
        const OneUiIndicatorBadge(semanticsLabel: 'Online'),
      );
      withSemanticsHandle(tester, () {
        final data = indicatorBadgeSemanticsData(tester, semanticsLabel: 'Online');
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
            reason: 'IndicatorBadge is a status dot, not a button');
        expect(data.hasAction(SemanticsAction.tap), isFalse,
            reason: 'IndicatorBadge is non-interactive — must not expose tap');
      });
    });

    testWidgetsAllPlatforms('[a11y] live region stays off across appearance/size matrix', (tester) async {
      for (final size in const ['xs', 's', 'm', 'l', 'xl']) {
        for (final appearance in const ['primary', 'negative', 'positive']) {
          await pumpIndicatorBadgeQaHarnessSettled(
            tester,
            OneUiIndicatorBadge(
              size: size,
              appearance: appearance,
              semanticsLabel: 'Status $size $appearance',
            ),
          );
          withSemanticsHandle(tester, () {
            final data = indicatorBadgeSemanticsData(
              tester,
              semanticsLabel: 'Status $size $appearance',
            );
            expect(data.hasFlag(SemanticsFlag.isLiveRegion), isFalse,
                reason:
                    'announceChanges:false must hold for size=$size appearance=$appearance');
          });
        }
      }
    });
  });
}
