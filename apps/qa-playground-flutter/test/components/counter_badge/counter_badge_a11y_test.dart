/// CounterBadge accessibility QA tests — mirrors web `role="status"` /
/// RN `accessibilityLiveRegion: 'polite'` and the resolver contract from
/// `packages/ui_flutter/lib/widgets/one_ui_counter_badge_a11y.dart`.
///
/// Two layers:
///   - Pure resolver tests   — `resolveOneUiCounterBadgeSemantics`.
///   - Widget semantics tests — Semantics tree, label precedence, live-region
///                              flag, hidden-state semantics.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_a11y.dart';

import '../../support/components/counter_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[a11y] resolveOneUiCounterBadgeSemantics', () {
    test('[a11y] prefers semanticsLabel over displayValue', () {
      final cfg = resolveOneUiCounterBadgeSemantics(
        semanticsLabel: '3 unread messages',
        displayValue: '3',
      );
      expect(cfg.accessible, isTrue);
      expect(cfg.label, '3 unread messages');
    });

    test('[a11y] falls back to displayValue when no semanticsLabel', () {
      final cfg = resolveOneUiCounterBadgeSemantics(displayValue: '5');
      expect(cfg.accessible, isTrue);
      expect(cfg.label, '5');
    });

    test('[a11y] returns non-accessible when both empty', () {
      final cfg = resolveOneUiCounterBadgeSemantics(displayValue: '');
      expect(cfg.accessible, isFalse);
      expect(cfg.label, isNull);
    });

    test('[a11y] empty semanticsLabel falls back to displayValue', () {
      final cfg = resolveOneUiCounterBadgeSemantics(
        semanticsLabel: '',
        displayValue: '7',
      );
      expect(cfg.accessible, isTrue);
      expect(cfg.label, '7');
    });

    test('[a11y] whitespace semanticsLabel falls back to displayValue', () {
      // The trim path treats '   ' the same as ''. CB-A11Y-001 in the audit
      // flags this for adding a dev warning, but the trim contract itself is
      // tested here.
      final cfg = resolveOneUiCounterBadgeSemantics(
        semanticsLabel: '   ',
        displayValue: '7',
      );
      expect(cfg.accessible, isTrue);
      expect(cfg.label, '7');
    });
  });

  group('[a11y] CounterBadge widget — semantics contract', () {
    testWidgetsAllPlatforms('[a11y] exposes semanticsLabel as accessible name', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5, semanticsLabel: '5 messages'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('5 messages'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] falls back to displayValue when semanticsLabel omitted', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('5'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] live region is off after settle (re-enables on label change)',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5, semanticsLabel: '5 items'),
      );
      withSemanticsHandle(tester, () {
        final data = counterBadgeSemanticsData(tester, semanticsLabel: '5 items');
        expect(data.hasFlag(SemanticsFlag.isLiveRegion), isFalse,
            reason:
                'OneUiStatusSemantics clears liveRegion after the first announcement '
                'so static counters do not spam AT on parent rebuild.');
        expect(data.label, '5 items',
            reason: 'Label must remain exposed for inspection.');
      });
    });

    testWidgetsAllPlatforms('[a11y] does NOT expose isButton flag', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5, semanticsLabel: '5'),
      );
      withSemanticsHandle(tester, () {
        final data = counterBadgeSemanticsData(tester, semanticsLabel: '5');
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
            reason: 'CounterBadge is a status chip, not a button');
        expect(data.hasAction(SemanticsAction.tap), isFalse,
            reason: 'CounterBadge is non-interactive — must not expose tap');
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] hidden state (value=0) retains semantics for AT announcement',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 0, semanticsLabel: '0 unread'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('0 unread'), findsOneWidget,
            reason:
                'Hidden badge keeps its status semantics wrapper so 1→0 '
                'transitions announce (CB-FN-007).');
      });
    });

    testWidgetsAllPlatforms('[a11y] status label survives appearance/size changes',
        (tester) async {
      for (final size in const ['xs', 's', 'm', 'l', 'xl']) {
        for (final appearance in const ['primary', 'negative', 'positive']) {
          await pumpCounterBadgeQaHarnessSettled(
            tester,
            OneUiCounterBadge(
              value: 5,
              size: size,
              appearance: appearance,
              semanticsLabel: 'Status $size $appearance',
            ),
          );
          withSemanticsHandle(tester, () {
            final data = counterBadgeSemanticsData(
              tester,
              semanticsLabel: 'Status $size $appearance',
            );
            expect(data.label, 'Status $size $appearance',
                reason: 'status label must hold for size=$size appearance=$appearance');
            expect(data.hasFlag(SemanticsFlag.isLiveRegion), isFalse,
                reason:
                    'live region must clear after settle for size=$size appearance=$appearance');
          });
        }
      }
    });
  });

  group('[a11y] CounterBadge — xs size semantics', () {
    testWidgetsAllPlatforms('[a11y] xs high announces explicit semanticsLabel',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          size: 'xs',
          attention: 'high',
          semanticsLabel: '5 unread',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('5 unread'), findsOneWidget);
      });
    });
  });
}
