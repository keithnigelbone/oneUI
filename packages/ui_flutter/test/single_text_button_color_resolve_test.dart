import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/single_text_button_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

void main() {
  testWidgets(
      'unconfigured tertiary appearance uses neutral (web --Surface-Bold fallback)',
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
              final primary =
                  resolveSingleTextButtonRoleTokens(context, 'primary');
              final tertiary =
                  resolveSingleTextButtonRoleTokens(context, 'tertiary');
              final neutral =
                  resolveSingleTextButtonRoleTokens(context, 'neutral');

              expect(tertiary.surfaces[kSurfaceBold], neutral.surfaces[kSurfaceBold]);
              expect(tertiary.surfaces[kSurfaceBold],
                  isNot(primary.surfaces[kSurfaceBold]));
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  });
}
