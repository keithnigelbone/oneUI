import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/color_math.dart';
import 'package:ui_flutter/engine/indicator_badge_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

SemanticsData _semanticsForLabel(WidgetTester tester, String label) {
  return tester.getSemantics(find.bySemanticsLabel(label)).getSemanticsData();
}

bool _isLiveRegion(SemanticsData data) =>
    data.hasFlag(SemanticsFlag.isLiveRegion);

void main() {
  group('resolveIndicatorBadgeColors contrast guard', () {
    testWidgets(
        'adds stroke when bold dot fails 3:1 on same-role subtle surface', (
      tester,
    ) async {
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
                componentCustomProperties: const {},
                dimensionContexts: const [],
                activeDimensionKey: 'L:default',
              ),
              child: OneUiSurface(
                mode: 'subtle',
                appearance: 'warning',
                child: Builder(
                  builder: (context) {
                    ctx = context;
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ),
          ),
        ),
      );

      final paint = resolveIndicatorBadgeColors(
        ctx,
        OneUiScope.of(ctx).designSystem!,
        appearance: 'warning',
      );

      expect(paint.borderWidth, isNotNull);
      expect(paint.borderColor, isNotNull);

      final role = OneUiSurfaceScope.tokensForAppearance(ctx, 'warning');
      final dotRgb = hexToRgbTuple(
        normalizePaletteHexForEngine(role.surfaces['bold']!),
      );
      final parentRgb = hexToRgbTuple(
        normalizePaletteHexForEngine(role.surfaces['subtle']!),
      );
      expect(
        getContrastRatioRgb(dotRgb, parentRgb),
        lessThan(kIndicatorBadgeMinContrast),
      );
    });

    testWidgets('adds stroke in high-contrast mode even on default surface', (
      tester,
    ) async {
      late BuildContext ctx;

      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(highContrast: true),
            child: OneUiSurfaceBootstrap(
              themeConfig: buildStorybookDemoThemeConfig(),
              darkMode: false,
              child: OneUiScope(
                platformId: 'L',
                density: 'default',
                designSystem: NativeDesignSystemPayload(
                  componentCustomProperties: const {},
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
        ),
      );

      final paint = resolveIndicatorBadgeColors(
        ctx,
        OneUiScope.of(ctx).designSystem!,
        appearance: 'warning',
      );

      expect(paint.borderWidth, isNotNull);
      expect(paint.borderColor, isNotNull);
    });
  });

  group('OneUiIndicatorBadge semantics', () {
    testWidgets('never enables liveRegion (RN image role parity)', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceBootstrap(
            themeConfig: buildStorybookDemoThemeConfig(),
            darkMode: false,
            child: OneUiScope(
              platformId: 'L',
              density: 'default',
              designSystem: NativeDesignSystemPayload(
                componentCustomProperties: const {},
                dimensionContexts: const [],
                activeDimensionKey: 'L:default',
              ),
              child: StatefulBuilder(
                builder: (context, setState) {
                  return Column(
                    children: [
                      const OneUiIndicatorBadge(semanticsLabel: 'Online'),
                      TextButton(
                        onPressed: () => setState(() {}),
                        child: const Text('rebuild'),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      );

      final handle = tester.ensureSemantics();
      try {
        await tester.pumpAndSettle();
        expect(_isLiveRegion(_semanticsForLabel(tester, 'Online')), isFalse);

        await tester.tap(find.text('rebuild'));
        await tester.pumpAndSettle();

        expect(_isLiveRegion(_semanticsForLabel(tester, 'Online')), isFalse);
      } finally {
        handle.dispose();
      }
    });
  });
}
