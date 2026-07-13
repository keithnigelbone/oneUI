import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/divider_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import 'divider_test_harness.dart';

void main() {
  testWidgets(
      'neutral appearance uses primary stroke role inside nested surface', (
    tester,
  ) async {
    final theme = ThemeConfig(
      appearances: {
        'primary': buildScaleDefinition('primary', buildColoredPalette(), 600),
        'neutral':
            buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      },
    );
    final ds = dividerTestDesignSystem();

    late Color rootNeutral;
    late Color nestedNeutral;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: theme,
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: Column(
              children: [
                Builder(
                  builder: (context) {
                    rootNeutral = resolveDividerColors(
                      context,
                      ds,
                      resolvedAppearance: 'neutral',
                      attention: 'low',
                    ).lineColor;
                    return const SizedBox.shrink();
                  },
                ),
                OneUiSurface(
                  mode: 'subtle',
                  child: Builder(
                    builder: (context) {
                      nestedNeutral = resolveDividerColors(
                        context,
                        ds,
                        resolvedAppearance: 'neutral',
                        attention: 'low',
                      ).lineColor;
                      return const SizedBox.shrink();
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(rootNeutral.toARGB32(), isNot(nestedNeutral.toARGB32()));
  });
}
