/// InputFeedback tests — RN `InputFeedbackA11y.test.ts` + widget parity (web + mobile).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/icon_size_resolve.dart';
import 'package:ui_flutter/engine/input_feedback_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import 'input_internals_test_harness.dart';

void main() {
  group('resolveOneUiInputFeedbackSize — RN resolveFeedbackSize', () {
    test('passes valid t-shirt sizes through', () {
      expect(resolveOneUiInputFeedbackSize('s'), OneUiInputFeedbackSize.s);
      expect(resolveOneUiInputFeedbackSize('m'), OneUiInputFeedbackSize.m);
      expect(resolveOneUiInputFeedbackSize('l'), OneUiInputFeedbackSize.l);
    });

    test('maps numeric f-steps', () {
      expect(resolveOneUiInputFeedbackSize(8), OneUiInputFeedbackSize.s);
      expect(resolveOneUiInputFeedbackSize(12), OneUiInputFeedbackSize.l);
      expect(resolveOneUiInputFeedbackSize('m'), OneUiInputFeedbackSize.m);
    });

    test("falls back to m for unknown t-shirt inputs", () {
      expect(resolveOneUiInputFeedbackSize('xl'), OneUiInputFeedbackSize.m);
      expect(resolveOneUiInputFeedbackSize('xs'), OneUiInputFeedbackSize.m);
    });
  });

  group('Figma API constants', () {
    test('documents s/m/l sizes, four variants, three attentions', () {
      expect(kOneUiInputFeedbackFigmaSizes, ['s', 'm', 'l']);
      expect(kOneUiInputFeedbackFigmaVariants.length, 4);
      expect(kOneUiInputFeedbackFigmaAttentions, ['low', 'medium', 'high']);
    });
  });

  group('resolveOneUiInputFeedbackState — RN useInputFeedbackState', () {
    test('defaults to negative / low / m', () {
      final s = resolveOneUiInputFeedbackState(
        feedbackMessage: 'Password must be at least 8 characters.',
      );
      expect(s.resolvedVariant, OneUiInputFeedbackVariant.negative);
      expect(s.resolvedAttention, OneUiInputFeedbackAttention.low);
      expect(s.resolvedSize, OneUiInputFeedbackSize.m);
      expect(s.role, OneUiInputFeedbackRole.alert);
      expect(s.liveRegion, OneUiInputFeedbackLiveRegion.assertive);
      expect(s.message, 'Password must be at least 8 characters.');
      expect(s.hasMessage, isTrue);
    });

    test('positive uses status role with polite live region', () {
      final s = resolveOneUiInputFeedbackState(
        variant: OneUiInputFeedbackVariant.positive,
        feedbackMessage: 'Saved.',
      );
      expect(s.role, OneUiInputFeedbackRole.status);
      expect(s.liveRegion, OneUiInputFeedbackLiveRegion.polite);
    });

    test('assigns status + polite for warning and informative', () {
      for (final variant in [
        OneUiInputFeedbackVariant.warning,
        OneUiInputFeedbackVariant.informative,
      ]) {
        final s = resolveOneUiInputFeedbackState(
          variant: variant,
          feedbackMessage: 'Note',
        );
        expect(s.role, OneUiInputFeedbackRole.status);
        expect(s.liveRegion, OneUiInputFeedbackLiveRegion.polite);
      }
    });

    test('empty message yields hasMessage false', () {
      expect(resolveOneUiInputFeedbackState(feedbackMessage: '   ').hasMessage,
          isFalse);
      expect(resolveOneUiInputFeedbackState(feedbackMessage: '').hasMessage,
          isFalse);
    });

    test('falls back to Text child when feedbackMessage missing', () {
      final s = resolveOneUiInputFeedbackState(
        child: const Text('Child copy'),
      );
      expect(s.message, 'Child copy');
      expect(s.hasMessage, isTrue);
    });

    test('honours role override on negative', () {
      final s = resolveOneUiInputFeedbackState(
        variant: OneUiInputFeedbackVariant.negative,
        feedbackMessage: 'Err',
        roleOverride: OneUiInputFeedbackRole.status,
      );
      expect(s.role, OneUiInputFeedbackRole.status);
      expect(s.liveRegion, OneUiInputFeedbackLiveRegion.polite);
    });

    test('role none disables live region mapping', () {
      final s = resolveOneUiInputFeedbackState(
        feedbackMessage: 'Hidden',
        roleOverride: OneUiInputFeedbackRole.none,
      );
      expect(s.liveRegion, OneUiInputFeedbackLiveRegion.none);
    });

    test('encodes web data-size numeric f-step on state', () {
      final s = resolveOneUiInputFeedbackState(
        size: OneUiInputFeedbackSize.l,
        variant: OneUiInputFeedbackVariant.warning,
        attention: OneUiInputFeedbackAttention.high,
        feedbackMessage: 'Note',
      );
      expect(s.dataSize, '12');
      expect(s.dataVariant, 'warning');
      expect(s.dataAttention, 'high');
      expect(s.dataPayloadKey, contains('data-size=12'));
      expect(s.dataPayloadKey, contains('data-variant=warning'));
      expect(s.dataPayloadKey, contains('data-attention=high'));
    });
  });

  group(
      'resolveOneUiInputFeedbackSemantics — RN getInputFeedbackAccessibilityProps',
      () {
    test('assertive live region + label for negative', () {
      final state = resolveOneUiInputFeedbackState(feedbackMessage: 'Error');
      final a11y = resolveOneUiInputFeedbackSemantics(state: state);
      expect(a11y.container, isTrue);
      expect(a11y.liveRegion, isTrue);
      expect(a11y.label, 'Error');
      expect(a11y.excludeMessageFromTree, isTrue);
      expect(a11y.excludeIconFromTree, isTrue);
    });

    test('polite live region for positive', () {
      final state = resolveOneUiInputFeedbackState(
        variant: OneUiInputFeedbackVariant.positive,
        feedbackMessage: 'Saved',
      );
      final a11y = resolveOneUiInputFeedbackSemantics(state: state);
      expect(a11y.liveRegion, isTrue);
    });

    test('aria-hidden collapses container', () {
      final state = resolveOneUiInputFeedbackState(feedbackMessage: 'x');
      final a11y = resolveOneUiInputFeedbackSemantics(
        state: state,
        ariaHidden: true,
      );
      expect(a11y.container, isFalse);
      expect(a11y.label, isNull);
    });

    test('prefers aria-label over message copy', () {
      final state = resolveOneUiInputFeedbackState(feedbackMessage: 'Message');
      final a11y = resolveOneUiInputFeedbackSemantics(
        state: state,
        ariaLabel: 'Override label',
      );
      expect(a11y.label, 'Override label');
    });

    test('no live region when role is none', () {
      final state = resolveOneUiInputFeedbackState(
        feedbackMessage: 'x',
        roleOverride: OneUiInputFeedbackRole.none,
      );
      final a11y = resolveOneUiInputFeedbackSemantics(state: state);
      expect(a11y.liveRegion, isFalse);
    });
  });

  group('resolveInputFeedbackPaint — token-driven fills', () {
    testWidgets('medium attention uses subtle role background', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const SizedBox(
            width: 320,
            child: OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.informative,
              attention: OneUiInputFeedbackAttention.medium,
              feedbackMessage: 'Info',
            ),
          ),
        ),
      );
      await tester.pump();
      final box = tester.widget<DecoratedBox>(find.byType(DecoratedBox).first);
      final decoration = box.decoration! as BoxDecoration;
      expect(decoration.color, isNot(Colors.transparent));
    });

    testWidgets('low attention keeps transparent background', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Low',
            attention: OneUiInputFeedbackAttention.low,
          ),
        ),
      );
      await tester.pump();
      final box = tester.widget<DecoratedBox>(find.byType(DecoratedBox).first);
      final decoration = box.decoration! as BoxDecoration;
      expect(decoration.color, Colors.transparent);
    });
  });

  group('OneUiInputFeedback widget — functionality', () {
    testWidgets('renders message and default icon', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Password must be at least 8 characters.',
          ),
        ),
      );
      await tester.pump();
      expect(
          find.text('Password must be at least 8 characters.'), findsOneWidget);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('high attention uses filled background', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const SizedBox(
            width: 300,
            child: OneUiInputFeedback(
              variant: OneUiInputFeedbackVariant.negative,
              attention: OneUiInputFeedbackAttention.high,
              feedbackMessage: 'Critical',
            ),
          ),
        ),
      );
      await tester.pump();
      final box = tester.widget<DecoratedBox>(find.byType(DecoratedBox).first);
      final decoration = box.decoration! as BoxDecoration;
      expect(decoration.color, isNot(Colors.transparent));
    });

    testWidgets('returns shrink when no message and no custom icon',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(const OneUiInputFeedback(feedbackMessage: '')),
      );
      await tester.pump();
      expect(find.byType(OneUiIcon), findsNothing);
    });

    testWidgets('custom icon alone does not render without message',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            customIcon:
                OneUiIcon(icon: 'lock', size: '4', excludeFromSemantics: true),
          ),
        ),
      );
      await tester.pump();
      expect(find.byType(OneUiIcon), findsNothing);
      expect(find.byType(DecoratedBox), findsNothing);
    });

    testWidgets('feedback_message snake_case alias renders copy',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(feedback_message: 'From Figma API'),
        ),
      );
      await tester.pump();
      expect(find.text('From Figma API'), findsOneWidget);
    });

    testWidgets('customIconName builds semantic icon', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Help copy',
            customIconName: 'help',
          ),
        ),
      );
      await tester.pump();
      expect(find.text('Help copy'), findsOneWidget);
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    testWidgets('default payload encodes m / negative / low', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(feedbackMessage: 'Error'),
        ),
      );
      await tester.pump();
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-input-feedback|data-size=10|data-variant=negative|'
            'data-attention=low',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('custom icon uses variant tintedA11y like default icon',
        (tester) async {
      Future<Color?> iconColorFor(Widget feedback) async {
        await tester.pumpWidget(pumpInputInternalsApp(feedback));
        await tester.pump();
        final iconThemeFinder = find.descendant(
          of: find.byType(OneUiInputFeedback),
          matching: find.byType(IconTheme),
        );
        expect(iconThemeFinder, findsWidgets);
        return tester.widget<IconTheme>(iconThemeFinder.first).data.color;
      }

      final customColor = await iconColorFor(
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.negative,
          attention: OneUiInputFeedbackAttention.low,
          feedbackMessage: 'Using lock instead of error.',
          customIcon: OneUiIcon(
            icon: 'lock',
            size: '4',
            excludeFromSemantics: true,
          ),
        ),
      );
      final defaultColor = await iconColorFor(
        const OneUiInputFeedback(
          variant: OneUiInputFeedbackVariant.negative,
          attention: OneUiInputFeedbackAttention.low,
          feedbackMessage: 'Using lock instead of error.',
        ),
      );

      expect(customColor, isNotNull);
      expect(customColor, defaultColor);
    });

    testWidgets('testId exposes ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Err',
            testId: 'input-feedback',
          ),
        ),
      );
      await tester.pump();
      expect(find.byKey(const ValueKey('input-feedback')), findsOneWidget);
    });
  });

  group('OneUiInputFeedback semantics — web + mobile parity', () {
    testWidgetsAllPlatforms('negative exposes assertive live region on root',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Password must be at least 8 characters.',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(
          find.bySemanticsLabel('Password must be at least 8 characters.'),
          findsOneWidget,
        );
        final data = semanticsDataForLabel(
          tester,
          'Password must be at least 8 characters.',
        );
        expect(data.role, SemanticsRole.alert);
        expect(data.label, contains('Password must be at least 8 characters.'));
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('positive uses polite live region', (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.positive,
            feedbackMessage: 'Saved successfully.',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Saved successfully.'), findsOneWidget);
        expectSemanticsLiveRegions(tester, count: 1);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('prefers aria-label over visible message',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Visible copy',
            ariaLabel: 'Screen reader label',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Screen reader label'), findsOneWidget);
        expect(find.bySemanticsLabel('Visible copy'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('accessibilityHint on root semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Error',
            accessibilityHint: 'Shown below the password field',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = semanticsDataForLabel(tester, 'Error');
        expect(data.hint, contains('Shown below the password field'));
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('aria-hidden removes feedback from semantics tree',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'Hidden from AT',
            ariaHidden: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden from AT'), findsNothing);
        expect(semanticsWithLiveRegionFinder(), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        'message is announced on root, not duplicated as text node', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            feedbackMessage: 'With icon',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        // Root live region announces copy; decorative icon stays out of the tree.
        expect(find.bySemanticsLabel('With icon'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('resolved icon box matches layout.iconSizePx', (tester) async {
      late double expectedPx;
      await tester.pumpWidget(
        pumpInputInternalsApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              final layout = resolveInputFeedbackLayout(
                context,
                ds,
                size: OneUiInputFeedbackSize.m,
                attention: OneUiInputFeedbackAttention.low,
              );
              expectedPx = layout.iconSizePx;
              return SizedBox(
                width: 320,
                child: OneUiInputFeedback(
                  size: OneUiInputFeedbackSize.m,
                  feedbackMessage: 'Sized icon',
                ),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      final iconBox = tester.widget<SizedBox>(
        find
            .descendant(
              of: find.byType(OneUiInputFeedback),
              matching: find.byWidgetPredicate(
                (w) =>
                    w is SizedBox &&
                    w.width == expectedPx &&
                    w.height == expectedPx,
              ),
            )
            .first,
      );
      expect(iconBox.width, expectedPx);
    });

    testWidgetsAllPlatforms('role override to status uses polite region',
        (tester) async {
      await tester.pumpWidget(
        pumpInputInternalsApp(
          const OneUiInputFeedback(
            variant: OneUiInputFeedbackVariant.negative,
            feedbackMessage: 'Soft error',
            role: OneUiInputFeedbackRole.status,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Soft error'), findsOneWidget);
        expectSemanticsLiveRegions(tester, count: 1);
      } finally {
        handle.dispose();
      }
    });
  });
}
