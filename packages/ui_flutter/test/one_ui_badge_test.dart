import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/badge_slot_padding.dart';
import 'package:ui_flutter/widgets/badge_slot_utils.dart';
import 'package:ui_flutter/widgets/one_ui_badge_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';

void main() {
  group('oneUiResolveBadgeSize', () {
    test('known sizes pass through', () {
      for (final size in kOneUiBadgeSizes) {
        expect(oneUiResolveBadgeSize(size), size);
      }
    });

    test('unknown size falls back to m', () {
      expect(oneUiResolveBadgeSize('huge'), 'm');
      expect(oneUiResolveBadgeSize(''), 'm');
    });
  });

  group('one_ui_badge_types — API parity with Badge.shared.ts', () {
    test('attention maps to variant', () {
      expect(kBadgeAttentionToVariant['high'], 'bold');
      expect(kBadgeAttentionToVariant['medium'], 'subtle');
      expect(kBadgeAttentionToVariant['low'], 'ghost');
    });

    test('resolveOneUiBadgeState prefers explicit variant over attention', () {
      final s = resolveOneUiBadgeState(
        attention: 'low',
        variant: 'bold',
      );
      expect(s.resolvedVariant, 'bold');
    });

    test('defaults variant to bold when unset', () {
      final s = resolveOneUiBadgeState();
      expect(s.resolvedVariant, 'bold');
      expect(s.dataAttention, 'high');
      expect(s.dataVariant, 'bold');
    });

    test('attention medium maps to subtle variant in data attrs', () {
      final s = resolveOneUiBadgeState(attention: 'medium');
      expect(s.resolvedVariant, 'subtle');
      expect(s.dataAttention, 'medium');
    });

    test('defaults size to m', () {
      expect(resolveOneUiBadgeState().size, 'm');
    });

    test('defaults appearance to sparkle when auto outside Surface', () {
      expect(resolveOneUiBadgeState(appearance: 'auto').resolvedAppearance,
          'sparkle');
    });

    test('inherits surface appearance when auto inside Surface', () {
      final s = resolveOneUiBadgeState(
        appearance: 'auto',
        surfaceAppearance: 'secondary',
      );
      expect(s.resolvedAppearance, 'secondary');
    });

    test('explicit appearance wins over surface', () {
      final s = resolveOneUiBadgeState(
        appearance: 'negative',
        surfaceAppearance: 'secondary',
      );
      expect(s.resolvedAppearance, 'negative');
    });

    test('all sizes are supported', () {
      expect(kOneUiBadgeSizes, ['xs', 's', 'm', 'l', 'xl']);
    });
  });

  group('badge_slot_utils — React slot root detection', () {
    test('detects CounterBadge and IndicatorBadge', () {
      expect(
          isBadgeNestedSlotWidget(const OneUiCounterBadge(value: 1)), isTrue);
      expect(
        isBadgeNestedSlotWidget(const OneUiIndicatorBadge(semanticsLabel: 'x')),
        isTrue,
      );
      expect(isBadgeNestedSlotWidget(const Text('icon')), isFalse);
    });

    test('surface immune matches nested badge widgets', () {
      expect(
          isSurfaceImmuneSlotWidget(const OneUiCounterBadge(value: 2)), isTrue);
    });
  });

  group('one_ui_badge_a11y — badgeA11y.test.ts parity', () {
    test('maps semanticsLabel to accessible label with live region', () {
      final s = resolveOneUiBadgeSemantics(
        semanticsLabel: 'Status',
        child: 'New',
      );
      expect(s.label, 'Status');
      expect(s.accessible, isTrue);
      expect(s.isLiveRegion, isTrue);
    });

    test('falls back to string child for label', () {
      expect(
        resolveOneUiBadgeAccessibilityLabel(child: 'Beta'),
        'Beta',
      );
    });

    test('whitespace-only semanticsLabel is ignored with warning', () {
      expect(
        resolveOneUiBadgeAccessibilityLabel(
          semanticsLabel: '   ',
          child: 'Beta',
        ),
        'Beta',
      );
    });

    test('plain text child detection rejects widgets', () {
      expect(badgeChildrenArePlainText('Beta'), isTrue);
      expect(badgeChildrenArePlainText(const Text('x')), isFalse);
      expect(badgePlainTextChild(const Text('x')), isNull);
    });

    test('empty or whitespace-only string child is absent for rendering', () {
      expect(badgePlainTextChild(''), isNull);
      expect(badgePlainTextChild('   '), isNull);
      expect(badgePlainTextChild('Beta'), 'Beta');
    });

    test('hasPlainTextChild is false for empty string child', () {
      final plan = resolveOneUiBadgeA11yPlan(
        semanticsLabel: 'b',
        child: '',
      );
      expect(plan.hasPlainTextChild, isFalse);
    });

    test('root defers to accessible slots (RN getBadgeRootAccessibilityProps)',
        () {
      final plan = resolveOneUiBadgeA11yPlan(
        semanticsLabel: '3 unread messages',
        child: 'New',
        start: const OneUiCounterBadge(
          value: 3,
          semanticsLabel: '3',
        ),
      );
      expect(plan.rootAccessible, isFalse);
      expect(plan.hideSlotsFromA11y, isFalse);
      expect(plan.exposeVisibleTextToA11y, isTrue);
    });

    test('root accessible when slots are decorative', () {
      final plan = resolveOneUiBadgeA11yPlan(
        semanticsLabel: 'Status',
        child: 'New',
      );
      expect(plan.rootAccessible, isTrue);
      expect(plan.hideVisualTextFromA11y, isTrue);
    });

    test('offscreen badge label when label-only with accessible slot', () {
      final plan = resolveOneUiBadgeA11yPlan(
        semanticsLabel: '3 unread messages',
        start: const OneUiCounterBadge(value: 3, semanticsLabel: '3'),
      );
      expect(plan.offscreenBadgeLabel, isTrue);
    });

    test(
        'widget child without label emits anonymous status region (web role=status)',
        () {
      final plan = resolveOneUiBadgeA11yPlan(
        child: const SizedBox(width: 4, height: 4),
      );
      expect(plan.label, isNull);
      expect(plan.emitAnonymousStatusRegion, isTrue);
      expect(plan.anonymousStatusLabel, isNull);
      expect(plan.rootAccessible, isFalse);
    });

    test('Text widget child derives anonymous status label for live region',
        () {
      final plan = resolveOneUiBadgeA11yPlan(
        child: const Text('Beta'),
      );
      expect(plan.emitAnonymousStatusRegion, isTrue);
      expect(plan.anonymousStatusLabel, 'Beta');
    });

    test('detects accessible slot children', () {
      expect(
        badgeSlotExposesAccessibility(
          const OneUiCounterBadge(value: 3, semanticsLabel: '3'),
        ),
        isTrue,
      );
      expect(
        badgeSlotExposesAccessibility(
          const OneUiIndicatorBadge(semanticsLabel: 'alert'),
        ),
        isTrue,
      );
    });

    test('accessible when label from child only', () {
      final s = resolveOneUiBadgeSemantics(child: 'Beta');
      expect(s.accessible, isTrue);
      expect(s.usesTextRole, isFalse);
    });

    test('usesTextRole when visible children (RN accessibilityRole text)', () {
      final s = resolveOneUiBadgeSemantics(
        semanticsLabel: 'Only label',
        hasVisibleText: true,
      );
      expect(s.usesTextRole, isTrue);
    });

    test('no text role when label-only without children', () {
      final s = resolveOneUiBadgeSemantics(semanticsLabel: 'Only label');
      expect(s.usesTextRole, isFalse);
    });

    test('maps semanticsHint', () {
      final s = resolveOneUiBadgeSemantics(
        child: 'Beta',
        semanticsHint: 'Double tap for details',
      );
      expect(s.hint, 'Double tap for details');
    });

    test('not accessible without label or child text', () {
      final s = resolveOneUiBadgeSemantics();
      expect(s.accessible, isFalse);
    });
  });

  group('BadgeSlotPaddingFlags', () {
    test('empty flags default false', () {
      const f = BadgeSlotPaddingFlags.empty();
      expect(f.startIsBadge, isFalse);
      expect(f.endIsBadge, isFalse);
    });
  });
}
