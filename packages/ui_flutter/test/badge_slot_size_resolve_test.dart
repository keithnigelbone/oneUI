import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/badge_slot_context.dart';
import 'package:ui_flutter/engine/counter_badge_size_resolve.dart';
import 'package:ui_flutter/engine/indicator_badge_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/dimensions_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

Widget _harness({required Widget child, NativeDesignSystemPayload? ds}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: ds ??
            NativeDesignSystemPayload(
              componentCustomProperties: const {},
              dimensionContexts: const [],
              activeDimensionKey: 'L:default',
            ),
        child: child,
      ),
    ),
  );
}

void main() {
  testWidgets('CounterBadge in Badge slot uses slot spacing override',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        child: BadgeSlotSizeScope(
          sizes: kBadgeSlotSizes['xl']!,
          child: Builder(
            builder: (context) {
              final scope = OneUiScope.of(context);
              final expected = resolveSpacingPx(
                designSystem: scope.designSystem,
                platformsConfig: scope.platformsFoundationConfig,
                platformId: scope.platformId,
                density: scope.density,
                spacingName: kBadgeSlotSizes['xl']!.counterSpacing,
              );
              final layout = resolveCounterBadgeLayout(
                context,
                scope.designSystem!,
                size: 'l',
                inheritSlotGeometry: true,
              );
              expect(layout.height, expected);
              return const SizedBox();
            },
          ),
        ),
      ),
    );
  });

  testWidgets(
      'CounterBadge without tokens falls back to spacing scale per size', (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(
        child: Builder(
          builder: (context) {
            final ds = OneUiScope.of(context).designSystem!;
            final xs = resolveCounterBadgeLayout(context, ds, size: 'xs');
            final l = resolveCounterBadgeLayout(context, ds, size: 'l');
            expect(xs.height, lessThan(l.height));
            expect(xs.height, isNot(16));
            expect(l.height, isNot(16));
            return const SizedBox();
          },
        ),
      ),
    );
  });

  testWidgets('IndicatorBadge spacing fallback matches token defaults per size',
      (
    tester,
  ) async {
    await tester.pumpWidget(
      _harness(
        child: Builder(
          builder: (context) {
            final scope = OneUiScope.of(context);
            for (final entry in kIndicatorBadgeSizeSpacingFallback.entries) {
              final layout = resolveIndicatorBadgeLayout(
                context,
                scope.designSystem!,
                size: entry.key,
              );
              final expected = resolveSpacingPx(
                designSystem: scope.designSystem,
                platformsConfig: scope.platformsFoundationConfig,
                platformId: scope.platformId,
                density: scope.density,
                spacingName: entry.value,
              );
              expect(
                layout.side,
                expected,
                reason: 'size ${entry.key} must use Spacing-${entry.value}',
              );
            }
            return const SizedBox();
          },
        ),
      ),
    );
  });

  testWidgets('IndicatorBadge in Badge xs slot resolves 4px dot',
      (tester) async {
    await tester.pumpWidget(
      _harness(
        child: BadgeSlotSizeScope(
          sizes: kBadgeSlotSizes['xs']!,
          child: Builder(
            builder: (context) {
              final scope = OneUiScope.of(context);
              final expected = resolveSpacingPx(
                designSystem: scope.designSystem,
                platformsConfig: scope.platformsFoundationConfig,
                platformId: scope.platformId,
                density: scope.density,
                spacingName: kBadgeSlotSizes['xs']!.indicatorSpacing,
              );
              final layout = resolveIndicatorBadgeLayout(
                context,
                scope.designSystem!,
                size: 'xs',
                inheritSlotGeometry: true,
              );
              expect(layout.side, expected);
              return const SizedBox();
            },
          ),
        ),
      ),
    );
  });
}
