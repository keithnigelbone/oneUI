import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/motion_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

NativeDesignSystemPayload _motionDs() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{},
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {},
    },
  })!;
}

void main() {
  testWidgets('tap scale matches web Motion-Tap-Scale chain', (tester) async {
    final ds = _motionDs();
    OneUiTapMotionSpec? spec;

    Future<void> pumpSpec({
      required bool sizeIsXs,
      required bool fullWidthTapScale,
    }) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (ctx) {
                spec = resolveOneUiTapMotionSpec(
                  ctx,
                  ds,
                  sizeIsXs: sizeIsXs,
                  fullWidthTapScale: fullWidthTapScale,
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );
    }

    await pumpSpec(sizeIsXs: false, fullWidthTapScale: false);
    expect(spec!.pressedScale, closeTo(0.97, 0.001), reason: 'default 3%');

    await pumpSpec(sizeIsXs: true, fullWidthTapScale: false);
    expect(spec!.pressedScale, closeTo(0.93, 0.001), reason: 'XS 7%');

    await pumpSpec(sizeIsXs: true, fullWidthTapScale: true);
    expect(spec!.pressedScale, closeTo(0.99, 0.001),
        reason: 'fullWidth wins over XS');
  });
}
