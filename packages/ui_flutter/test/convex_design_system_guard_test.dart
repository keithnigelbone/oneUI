import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/convex_design_system_guard.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';

void main() {
  test('oneUiConvexGapPlaceholder is debug-only', () {
    final widget = oneUiConvexGapPlaceholder(['token chain unresolved']);
    if (kDebugMode) {
      expect(widget, isA<ConvexGapCard>());
    } else {
      expect(widget, isA<SizedBox>());
      final box = widget as SizedBox;
      expect(box.width, 0);
      expect(box.height, 0);
    }
  });

  test('oneUiMissingDesignSystemPlaceholder is debug-only', () {
    final widget =
        oneUiMissingDesignSystemPlaceholder(['missing designSystem']);
    if (kDebugMode) {
      expect(widget, isA<ConvexGapCard>());
    } else {
      expect(widget, isA<SizedBox>());
      final box = widget as SizedBox;
      expect(box.width, 0);
      expect(box.height, 0);
    }
  });

  testWidgets('oneUiConvexGapPlaceholder renders without throwing', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: oneUiConvexGapPlaceholder(['missing designSystem']),
        ),
      ),
    );
    if (kDebugMode) {
      expect(find.byType(ConvexGapCard), findsOneWidget);
    } else {
      expect(find.byType(ConvexGapCard), findsNothing);
    }
  });

  testWidgets('oneUiMissingDesignSystemPlaceholder renders without throwing', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: oneUiMissingDesignSystemPlaceholder(['missing designSystem']),
        ),
      ),
    );
    if (kDebugMode) {
      expect(find.byType(ConvexGapCard), findsOneWidget);
    } else {
      expect(find.byType(ConvexGapCard), findsNothing);
    }
  });
}
