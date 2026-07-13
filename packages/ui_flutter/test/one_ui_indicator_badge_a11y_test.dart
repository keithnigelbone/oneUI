import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_a11y.dart';

void main() {
  group('resolveOneUiIndicatorBadgeSemantics', () {
    test('empty label is not accessible', () {
      expect(
        resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '   ').accessible,
        isFalse,
      );
    });

    test('non-empty label is accessible', () {
      final a11y =
          resolveOneUiIndicatorBadgeSemantics(semanticsLabel: 'Online');
      expect(a11y.accessible, isTrue);
      expect(a11y.label, 'Online');
    });
  });
}
