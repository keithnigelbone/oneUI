import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/counter_badge_color_resolve.dart';
import 'package:ui_flutter/engine/indicator_badge_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';

void main() {
  testWidgets(
      'CounterBadge honours component overrides for negative appearance', (
    tester,
  ) async {
    const overrideHex = '#FF00AA';
    late BuildContext ctx;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: NativeDesignSystemPayload(
              componentCustomProperties: const {
                '--CounterBadge-backgroundColor-bold': overrideHex,
              },
              dimensionContexts: const [],
              activeDimensionKey: 'L:default',
            ),
            child: Builder(
              builder: (context) {
                ctx = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      ),
    );

    final paint = resolveCounterBadgeColors(
      ctx,
      OneUiScope.of(ctx).designSystem!,
      variant: 'bold',
      appearance: 'negative',
    );
    expect(paint.background, oneUiHexColor(overrideHex));
  });

  testWidgets(
      'IndicatorBadge honours component overrides for negative appearance', (
    tester,
  ) async {
    const overrideHex = '#00AAFF';
    late BuildContext ctx;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: NativeDesignSystemPayload(
              componentCustomProperties: const {
                '--IndicatorBadge-backgroundColor': overrideHex,
              },
              dimensionContexts: const [],
              activeDimensionKey: 'L:default',
            ),
            child: Builder(
              builder: (context) {
                ctx = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      ),
    );

    final paint = resolveIndicatorBadgeColors(
      ctx,
      OneUiScope.of(ctx).designSystem!,
      appearance: 'negative',
    );
    expect(paint.background, oneUiHexColor(overrideHex));
  });
}
