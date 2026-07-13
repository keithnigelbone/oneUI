import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/focus_ring_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

ThemeConfig _primaryThemeConfig() {
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition(
        'primary',
        accent,
        600,
        anchorBoldToBaseStep: true,
      ),
    },
  );
}

NativeDesignSystemPayload _minimalDs() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
      },
    },
  })!;
}

void main() {
  testWidgets('focus halo gap on bold surface matches container fill not page',
      (tester) async {
    final themeConfig = _primaryThemeConfig();
    final ds = _minimalDs();
    final root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
    );

    Color? rootGap;
    Color? boldGap;
    Color? boldFill;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (ctx) {
                rootGap = resolveOneUiFocusRingSpec(
                  ctx,
                  ds,
                  semanticAppearanceFallback: 'primary',
                )?.innerGapShadowColor;
                return OneUiSurface(
                  mode: 'bold',
                  child: Builder(
                    builder: (inner) {
                      boldFill = oneUiHexColor(
                        OneUiSurfaceScope.tokensForAppearance(inner, 'primary')
                            .surfaces[kSurfaceBold]!,
                      );
                      boldGap = resolveOneUiFocusRingSpec(
                        inner,
                        ds,
                        semanticAppearanceFallback: 'primary',
                      )?.innerGapShadowColor;
                      return const SizedBox();
                    },
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );

    expect(rootGap, isNotNull);
    expect(boldGap, isNotNull);
    expect(boldFill, isNotNull);
    expect(boldGap, isNot(equals(rootGap)),
        reason:
            'nested bold surface must remap halo gap away from page default');
  });
}
