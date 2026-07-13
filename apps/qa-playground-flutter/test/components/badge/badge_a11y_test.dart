/// Badge accessibility QA tests — mirrors web `role="status"` /
/// RN `accessibilityLiveRegion: 'polite'` and the resolver contract from
/// `packages/ui_flutter/lib/widgets/one_ui_badge_a11y.dart`.
///
/// Two layers:
///   - Pure resolver tests   — `resolveOneUiBadgeAccessibilityLabel`,
///                              `resolveOneUiBadgeSemantics`.
///   - Widget semantics tests — Semantics tree exposed to AT, label/hint
///                              precedence, live-region flag, slot exclusion.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_badge_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_status_semantics.dart';

import '../../support/components/badge_harness.dart';

void main() {
  // Preload the Jio Convex fixture before any testWidgets runs.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[a11y] resolveOneUiBadgeAccessibilityLabel', () {
    test('[a11y] prefers semanticsLabel over child', () {
      expect(
        resolveOneUiBadgeAccessibilityLabel(
          semanticsLabel: '3 notifications',
          child: 'Badge',
        ),
        '3 notifications',
      );
    });

    test('[a11y] falls back to string child', () {
      expect(resolveOneUiBadgeAccessibilityLabel(child: 'New'), 'New');
    });

    test('[a11y] falls back to numeric child via toString', () {
      expect(resolveOneUiBadgeAccessibilityLabel(child: 5), '5');
    });

    test('[a11y] returns null when neither label nor stringy child present', () {
      expect(resolveOneUiBadgeAccessibilityLabel(), isNull);
    });

    test('[a11y] empty semanticsLabel falls back to child', () {
      expect(
        resolveOneUiBadgeAccessibilityLabel(semanticsLabel: '', child: 'Beta'),
        'Beta',
      );
    });

    test('[a11y] empty child string returns null', () {
      // An empty string is treated as "no visible text" — matches web rule
      // (empty <Badge> renders without role=status).
      expect(resolveOneUiBadgeAccessibilityLabel(child: ''), isNull);
    });
  });

  group('[a11y] resolveOneUiBadgeSemantics', () {
    test('[a11y] inaccessible when both label and child are empty', () {
      final cfg = resolveOneUiBadgeSemantics();
      expect(cfg.accessible, isFalse);
      expect(cfg.label, isNull);
    });

    test('[a11y] accessible with label, exposes live region', () {
      final cfg = resolveOneUiBadgeSemantics(
        semanticsLabel: 'Status changed',
        hasVisibleText: false,
      );
      expect(cfg.accessible, isTrue);
      expect(cfg.label, 'Status changed');
      expect(cfg.isLiveRegion, isTrue,
          reason: 'badges are role=status — assistive tech must announce changes');
    });

    test('[a11y] usesTextRole true only when visible text present', () {
      final cfg1 = resolveOneUiBadgeSemantics(
        semanticsLabel: 'X',
        hasVisibleText: true,
      );
      expect(cfg1.usesTextRole, isTrue);

      final cfg2 = resolveOneUiBadgeSemantics(
        semanticsLabel: 'X',
        hasVisibleText: false,
      );
      expect(cfg2.usesTextRole, isFalse);
    });

    test('[a11y] hint flows through', () {
      final cfg = resolveOneUiBadgeSemantics(
        child: 'New',
        semanticsHint: 'Open inbox for details',
      );
      expect(cfg.hint, 'Open inbox for details');
    });
  });

  group('[a11y] Badge widget — semantics contract', () {
    testWidgetsAllPlatforms('[a11y] exposes semanticsLabel as accessible name', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: '3 notifications', child: 'Badge'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('3 notifications'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] label-only badge without child renders an accessible node', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'empty badge'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('empty badge'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] string child becomes accessible name when no label', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(child: 'Beta'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Beta'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsLabel overrides visible child text', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Custom announcement',
          child: 'Beta',
        ),
      );
      withSemanticsHandle(tester, () {
        // The label is what AT reads; the visible text remains a visual element
        // (excluded from semantics on the inner subtree).
        expect(find.bySemanticsLabel('Custom announcement'), findsOneWidget);
        expect(find.bySemanticsLabel('Beta'), findsNothing,
            reason: 'visible child must not also surface as a Semantics label');
      });
    });

    testWidgetsAllPlatforms('[a11y] live region flag is set on first paint (web role=status / RN politeness=polite)', (tester) async {
      await pumpBadgeQaHarnessFirstFrame(
        tester,
        const OneUiBadge(semanticsLabel: 'Status', child: 'Active'),
      );
      withSemanticsHandle(tester, () {
        expect(find.byType(OneUiStatusSemantics), findsOneWidget,
            reason:
                'Labelled badges mount inside OneUiStatusSemantics (web '
                'role=status / RN polite live region).');
        expect(find.bySemanticsLabel('Status'), findsOneWidget,
            reason:
                'Status label must be exposed to AT on first paint so mount '
                'announcements can fire.');
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint forwarded to AT', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'Inbox',
          semanticsHint: 'Three unread messages',
          child: '3',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = badgeSemanticsData(tester, semanticsLabel: 'Inbox');
        expect(data.hint, contains('Three unread messages'));
      });
    });

    testWidgetsAllPlatforms('[a11y] empty badge emits status live region (web role=status)', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(),
      );
      withSemanticsHandle(tester, () {
        final badgeSemantics = find.descendant(
          of: badgeRootFinder(),
          matching: find.byType(Semantics),
        );
        expect(badgeSemantics, findsAtLeastNWidgets(1),
            reason:
                'Empty badges still emit role=status so AT can announce when '
                'content is added dynamically (BADGE-FN-005).');
        final node = tester.getSemantics(find.byType(OneUiBadge));
        expect(
          node.getSemanticsData().hasFlag(SemanticsFlag.isLiveRegion),
          isTrue,
          reason: 'Anonymous empty badge must expose a polite live region.',
        );
      });
    });

    testWidgetsAllPlatforms('[a11y] slot semantics excluded when badge has its own label', (tester) async {
      // The badge's own label wins — slot semantics must not leak. We use a
      // plain SizedBox with a custom Semantics(label) marker because the
      // CounterBadge token resolution path requires fixture tokens beyond
      // the badge's own slots, and the slot exclusion contract is what we
      // care about here, not the specific slot widget.
      await pumpBadgeQaHarnessSettled(
        tester,
        OneUiBadge(
          semanticsLabel: 'badge label',
          start: Semantics(
            label: 'slot only',
            container: true,
            child: const SizedBox(width: 8, height: 8),
          ),
          child: 'Badge',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('badge label'), findsOneWidget);
        expect(find.bySemanticsLabel('slot only'), findsNothing,
            reason: 'slot semantics must be excluded when the badge has a label');
      });
    });
  });

  group('[a11y] Badge — Figma matrix touch points', () {
    // The badge is non-interactive, so WCAG 2.5.5 touch target does NOT apply
    // (it's not a control). We still pin the Semantics surface so a future
    // regression that promotes it to a button/control gets flagged.
    testWidgetsAllPlatforms('[a11y] does NOT expose isButton flag', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'Status', child: 'New'),
      );
      withSemanticsHandle(tester, () {
        final data = badgeSemanticsData(tester, semanticsLabel: 'Status');
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
            reason: 'badge is a status chip, not a button — must not surface as one');
        expect(data.hasAction(SemanticsAction.tap), isFalse,
            reason: 'badge is non-interactive — must not expose tap action');
      });
    });

    testWidgetsAllPlatforms('[a11y] live region survives appearance/size changes on first paint', (tester) async {
      for (final size in const ['xs', 's', 'm', 'l', 'xl']) {
        for (final appearance in const ['primary', 'negative', 'positive']) {
          final label = 'Status $size $appearance';
          await pumpBadgeQaHarnessFirstFrame(
            tester,
            OneUiBadge(
              size: size,
              appearance: appearance,
              semanticsLabel: label,
              child: 'New',
            ),
          );
          withSemanticsHandle(tester, () {
            expect(find.byType(OneUiStatusSemantics), findsOneWidget,
                reason:
                    'Each labelled badge must mount OneUiStatusSemantics for '
                    'size=$size appearance=$appearance.');
            expect(find.bySemanticsLabel(label), findsOneWidget,
                reason:
                    'Status label must reach AT for size=$size '
                    'appearance=$appearance.');
          });
        }
      }
    });
  });
}
