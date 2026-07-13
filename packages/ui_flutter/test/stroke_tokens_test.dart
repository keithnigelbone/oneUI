import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/tokens/stroke_tokens.dart';

void main() {
  group('resolveStrokeWidth', () {
    test('static Stroke-M stays 1px without brand data', () {
      final w = resolveStrokeWidth(
        staticStrokeRows[2],
        platform: 'L',
        density: 'default',
      );
      expect(w, 1);
    });

    test('dynamic Stroke-2XL uses dimension context for platform × density',
        () {
      final ds = NativeDesignSystemPayload(
        componentCustomProperties: const {},
        dimensionContexts: [
          NativeDimensionContext(
            platformId: 'L',
            densityId: 'compact',
            dimensions: {'--Dimension-f-6': '2.75px'},
            gridMargin: '16px',
            gridGutter: '8px',
          ),
        ],
        activeDimensionKey: 'L:compact',
      );
      final w = resolveStrokeWidth(
        dynamicStrokeRows[0],
        platform: 'L',
        density: 'compact',
        designSystem: ds,
      );
      expect(w, closeTo(2.75, 0.001));
    });

    test('dynamic stroke shifts when density changes (static tables)', () {
      final compact = resolveStrokeWidth(
        dynamicStrokeRows.last,
        platform: 'S',
        density: 'compact',
      );
      final open = resolveStrokeWidth(
        dynamicStrokeRows.last,
        platform: 'S',
        density: 'open',
      );
      expect(open, greaterThan(compact));
    });
  });
}
