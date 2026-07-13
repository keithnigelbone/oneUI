import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/cpi_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

import 'cpi_test_harness.dart';

void main() {
  testWidgets('unconfigured appearance uses neutral bold (web --Surface-Bold)',
      (tester) async {
    final colored = buildColoredPalette();
    final grey = buildGreyscalePalette();
    final themeConfig = ThemeConfig(appearances: {
      'primary': buildScaleDefinition('Primary', colored, 600,
          anchorBoldToBaseStep: true),
      'neutral': buildScaleDefinition('Neutral', grey, 1300),
    });

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: Builder(
            builder: (context) {
              final ds = cpiTestDesignSystem();
              final primary =
                  resolveCpiColors(context, ds, appearance: 'primary');
              final sparkle =
                  resolveCpiColors(context, ds, appearance: 'sparkle');
              final neutral =
                  resolveCpiColors(context, ds, appearance: 'neutral');

              expect(sparkle.indicator, neutral.indicator);
              expect(sparkle.track, neutral.track);
              expect(sparkle.indicator, isNot(primary.indicator));
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  });
}
