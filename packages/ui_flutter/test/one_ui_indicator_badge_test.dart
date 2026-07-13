import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_types.dart';

void main() {
  group('oneUiResolveIndicatorBadgeSize', () {
    test('known sizes pass through', () {
      for (final size in kOneUiIndicatorBadgeSizes) {
        expect(oneUiResolveIndicatorBadgeSize(size), size);
      }
    });

    test('unknown size falls back to m', () {
      expect(oneUiResolveIndicatorBadgeSize('huge'), 'm');
      expect(oneUiResolveIndicatorBadgeSize(''), 'm');
    });
  });

  group('resolveOneUiIndicatorBadgeState', () {
    test('auto appearance defaults to primary', () {
      final state = resolveOneUiIndicatorBadgeState(
        context: _FakeBuildContext(),
        appearance: 'auto',
      );
      expect(state.resolvedAppearance, 'primary');
      expect(state.size, 'm');
      expect(state.dataSize, 'm');
      expect(state.dataAppearance, 'primary');
    });

    test('explicit appearance wins', () {
      final state = resolveOneUiIndicatorBadgeState(
        context: _FakeBuildContext(),
        appearance: 'negative',
      );
      expect(state.resolvedAppearance, 'negative');
      expect(state.dataAppearance, 'negative');
    });

    test('invalid size resolves to m', () {
      final state = resolveOneUiIndicatorBadgeState(
        context: _FakeBuildContext(),
        size: 'bogus',
      );
      expect(state.dataSize, 'm');
    });
  });

  group('resolveOneUiIndicatorBadgeSemantics', () {
    test('requires non-empty label', () {
      expect(
        resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '').accessible,
        false,
      );
      expect(
        resolveOneUiIndicatorBadgeSemantics(semanticsLabel: 'Online')
            .accessible,
        true,
      );
    });
  });
}

class _FakeBuildContext implements BuildContext {
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}
