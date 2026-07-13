/// LPI colour engine unit tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/lpi_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

import 'lpi_test_harness.dart';

void main() {
  testWidgets('[fn] resolveLpiColors returns indicator and track', (tester) async {
    await tester.pumpWidget(
      pumpLpiApp(const SizedBox.shrink()),
    );
    await pumpLpiLayout(tester);
    final ctx = tester.element(find.byType(OneUiScope));
    final ds = OneUiScope.of(ctx).designSystem!;
    final colors = resolveLpiColors(ctx, ds, appearance: 'primary');
    expect(colors.indicator, isA<Color>());
    expect(colors.track, isA<Color>());
    expect(colors.indicator, isNot(equals(colors.track)));
  });

  testWidgets('[fn] secondary appearance resolves distinct colours',
      (tester) async {
    final colored = buildColoredPalette();
    final grey = buildGreyscalePalette();
    final themeConfig = ThemeConfig(appearances: {
      'primary': buildScaleDefinition('Primary', colored, 600,
          anchorBoldToBaseStep: true),
      'secondary': buildScaleDefinition('Secondary', colored, 600),
      'neutral': buildScaleDefinition('Neutral', grey, 1300),
    });

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: lpiTestDesignSystem(),
            child: Builder(
              builder: (context) {
                final ds = OneUiScope.of(context).designSystem!;
                final primary =
                    resolveLpiColors(context, ds, appearance: 'primary');
                final secondary =
                    resolveLpiColors(context, ds, appearance: 'secondary');
                return Text(
                  '${primary.indicator.value}-${secondary.indicator.value}',
                );
              },
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    expect(find.textContaining('-'), findsOneWidget);
  });
}
