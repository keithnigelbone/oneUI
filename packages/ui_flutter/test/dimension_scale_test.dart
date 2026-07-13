import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/tokens/dimension_scale.dart';

/// Golden checks against `packages/shared` static tables / `primitives.css` chain.
void main() {
  group('getDimensionValue', () {
    test('S default f0 = 16', () {
      expect(
        getDimensionValue(platform: 'S', density: 'default', step: 'f0'),
        16,
      );
    });

    test('S compact f0 = 14', () {
      expect(
        getDimensionValue(platform: 'S', density: 'compact', step: 'f0'),
        14,
      );
    });

    test('S/M share base-16 — same f3', () {
      final a =
          getDimensionValue(platform: 'S', density: 'default', step: 'f3');
      final b =
          getDimensionValue(platform: 'M', density: 'default', step: 'f3');
      expect(a, b);
    });

    test('L uses base-18', () {
      expect(
        getDimensionValue(platform: 'L', density: 'default', step: 'f16'),
        180,
      );
    });
  });

  group('getSpacingTokenPx', () {
    test('Spacing-None is 0', () {
      expect(
        getSpacingTokenPx(
            spacingName: 'None', platform: 'S', density: 'default'),
        0,
      );
    });

    test('Spacing-M tracks f0', () {
      final f0 =
          getDimensionValue(platform: 'M', density: 'compact', step: 'f0');
      final m = getSpacingTokenPx(
          spacingName: 'M', platform: 'M', density: 'compact');
      expect(m, f0);
    });

    test('Spacing-4-5 tracks f1', () {
      final f =
          getDimensionValue(platform: 'S', density: 'default', step: 'f1');
      final s = getSpacingTokenPx(
          spacingName: '4-5', platform: 'S', density: 'default');
      expect(s, f);
    });

    test('Spacing-5-5 is midpoint between f2 and f3 (f2-5)', () {
      final f25 = getDimensionValue(
          platform: 'M', density: 'default', step: 'f2-5');
      final s = getSpacingTokenPx(
          spacingName: '5-5', platform: 'M', density: 'default');
      expect(s, f25);
    });
  });

  group('getGridMargin / getGridGutter', () {
    test('matches GRID_VALUES S default', () {
      expect(getGridMargin(platform: 'S', density: 'default'), 16);
      expect(getGridGutter(platform: 'S', density: 'default'), 8);
    });

    test('L open margin', () {
      expect(getGridMargin(platform: 'L', density: 'open'), 70);
    });
  });
}
