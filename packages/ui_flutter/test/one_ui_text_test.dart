import 'package:flutter/semantics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import 'text_test_harness.dart';

void main() {
  group('resolveOneUiTextSize', () {
    test('body 3XS clamps to 2XS', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.body, '3XS'), '2XS');
    });

    test('display accepts L M S', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.display, 'L'), 'L');
      expect(resolveOneUiTextSize(OneUiTextVariant.display, 'XL'), 'L');
    });
  });

  group('resolveOneUiTextState', () {
    test('auto appearance resolves to neutral', () {
      final s = resolveOneUiTextState(appearance: 'auto');
      expect(s.resolvedAppearance, 'neutral');
    });

    test('none attention resolves to high', () {
      final s = resolveOneUiTextState(attention: OneUiTextAttention.none);
      expect(s.resolvedAttention, OneUiTextAttention.high);
    });
  });

  group('OneUiText widget integration', () {
    testWidgetsAllPlatforms('display variant uses larger type than body',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiText(
                  variant: OneUiTextVariant.body, size: 'M', text: 'body'),
              OneUiText(
                  variant: OneUiTextVariant.display,
                  size: 'M',
                  text: 'display'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final bodySize = tester.widget<Text>(find.text('body')).style?.fontSize;
      final displaySize =
          tester.widget<Text>(find.text('display')).style?.fontSize;
      expect(bodySize, isNotNull);
      expect(displaySize, isNotNull);
      expect(displaySize!, greaterThan(bodySize!));
    });

    testWidgetsAllPlatforms('renders with Convex typography snapshot',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(text: 'The quick brown fox')),
      );
      await tester.pumpAndSettle();
      expect(find.text('The quick brown fox'), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('shows gap card without typography snapshot', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: Center(child: OneUiText(text: 'x'))),
        ),
      );
      expect(find.byType(ConvexGapCard), findsOneWidget);
    });
  });
}
