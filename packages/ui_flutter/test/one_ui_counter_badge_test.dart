import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_types.dart';

void main() {
  group('oneUiResolveCounterBadgeSize', () {
    test('known sizes pass through', () {
      for (final size in kOneUiCounterBadgeSizes) {
        expect(oneUiResolveCounterBadgeSize(size), size);
      }
    });

    test('unknown size falls back to m', () {
      expect(oneUiResolveCounterBadgeSize('huge'), 'm');
    });
  });

  group('resolveOneUiCounterBadgeState', () {
    test('attention maps to variant', () {
      expect(kCounterBadgeAttentionToVariant['high'], 'bold');
      expect(kCounterBadgeAttentionToVariant['medium'], 'subtle');
      expect(kCounterBadgeAttentionToVariant['low'], 'ghost');
    });

    test('display value caps at max', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 150,
        max: 99,
      );
      expect(state.displayValue, '99+');
      expect(state.isHidden, false);
    });

    test('hides zero unless showZero', () {
      final hidden = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 0,
      );
      expect(hidden.isHidden, true);

      final shown = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 0,
        showZero: true,
      );
      expect(shown.isHidden, false);
      expect(shown.displayValue, '0');
    });

    test('hides negative values', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: -1,
      );
      expect(state.isHidden, true);
    });

    test('defaults attention high and appearance primary', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 5,
      );
      expect(state.dataAttention, 'high');
      expect(state.dataVariant, 'bold');
      expect(state.dataAppearance, 'primary');
      expect(state.dataSize, 'm');
    });

    test('xs high uses dot-mode (hides visual numerals)', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 8,
        size: 'xs',
        attention: 'high',
      );
      expect(state.isDotMode, isTrue);
      expect(state.visualDisplayValue, '');
      expect(state.displayValue, '8');
    });

    test('xs medium shows digits', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 8,
        size: 'xs',
        attention: 'medium',
      );
      expect(state.visualDisplayValue, '8');
    });

    test('xl size is accepted', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 3,
        size: 'xl',
      );
      expect(state.dataSize, 'xl');
    });

    test('explicit variant wins for dataAttention when attention conflicts',
        () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 5,
        variant: 'subtle',
        attention: 'high',
      );
      expect(state.dataVariant, 'subtle');
      expect(state.dataAttention, 'medium');
    });

    test('explicit attention preserved when variant is derived', () {
      final state = resolveOneUiCounterBadgeState(
        context: _FakeBuildContext(),
        value: 5,
        attention: 'low',
      );
      expect(state.dataVariant, 'ghost');
      expect(state.dataAttention, 'low');
    });
  });
}

class _FakeBuildContext implements BuildContext {
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}
