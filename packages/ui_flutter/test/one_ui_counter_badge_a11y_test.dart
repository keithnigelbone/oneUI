import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_a11y.dart';

void main() {
  group('resolveOneUiCounterBadgeSemantics', () {
    test('whitespace-only semanticsLabel warns and falls back to displayValue',
        () {
      final a11y = resolveOneUiCounterBadgeSemantics(
        semanticsLabel: '   ',
        displayValue: '5',
      );
      expect(a11y.accessible, isTrue);
      expect(a11y.label, '5');
    });

    test('falls back to displayValue when semanticsLabel absent', () {
      final a11y = resolveOneUiCounterBadgeSemantics(
        displayValue: '12',
      );
      expect(a11y.accessible, isTrue);
      expect(a11y.label, '12');
    });

    test('explicit semanticsLabel wins over displayValue', () {
      final a11y = resolveOneUiCounterBadgeSemantics(
        semanticsLabel: '3 unread messages',
        displayValue: '3',
      );
      expect(a11y.label, '3 unread messages');
    });

    test('dot-mode without semanticsLabel is not accessible', () {
      final a11y = resolveOneUiCounterBadgeSemantics(
        displayValue: '5',
        isDotMode: true,
      );
      expect(a11y.accessible, isFalse);
    });
  });
}
