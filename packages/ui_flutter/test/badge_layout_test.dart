import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/badge_parity_measure.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';

void main() {
  testWidgets(
      'Badge outer height matches --Badge-height token (CSS border-box)',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-height-xl': '32px',
        '--Badge-paddingHorizontal-xl': '6px',
        '--Badge-gap-xl': '6px',
        '--Badge-borderRadius-xl': '10px',
        '--Badge-fontSize-xl': '16px',
        '--Badge-lineHeight-xl': '20px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: const Center(
              child: OneUiBadge(
                size: 'xl',
                attention: 'high',
                semanticsLabel: 'Badge',
                child: 'Badge',
              ),
            ),
          ),
        ),
      ),
    );

    final badge = find.byType(OneUiBadge);
    expect(badge, findsOneWidget);
    final ro = tester.renderObject(badge);
    final metrics = measureBadgeLiveMetrics(ro);
    expect(metrics, isNotNull);
    expect(metrics!.height, 32);
    expect(metrics.padLeft, 6);
    expect(metrics.fontSize, 16);
  });

  testWidgets('Badge shrink-wraps in a wide parent (inline-flex parity)',
      (tester) async {
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
            child: const SizedBox(
              width: 400,
              child: Center(
                child: OneUiBadge(
                  attention: 'high',
                  semanticsLabel: 'Badge',
                  child: 'Badge',
                ),
              ),
            ),
          ),
        ),
      ),
    );

    final size = tester.getSize(find.byType(OneUiBadge));
    expect(size.width, lessThan(120));
    expect(size.width, greaterThan(40));
  });

  testWidgets('Badge gap is measured from Row.spacing when slotted',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-height-m': '20px',
        '--Badge-paddingHorizontal-m': '6px',
        '--Badge-gap-m': '4px',
        '--Badge-borderRadius-m': '6px',
        '--Badge-fontSize-m': '12px',
        '--Badge-lineHeight-m': '16px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: const OneUiBadge(
              size: 'm',
              attention: 'high',
              semanticsLabel: 'Badge',
              start: Icon(Icons.favorite, size: 12),
              child: 'Badge',
            ),
          ),
        ),
      ),
    );

    final metrics =
        measureBadgeLiveMetrics(tester.renderObject(find.byType(OneUiBadge)));
    expect(metrics, isNotNull);
    expect(metrics!.gap, 4);
  });

  testWidgets('Badge label does not overflow when brand height token is tight',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-height-m': '16px',
        '--Badge-paddingHorizontal-m': '6px',
        '--Badge-gap-m': '4px',
        '--Badge-borderRadius-m': '6px',
        '--Badge-fontSize-m': '12px',
        '--Badge-lineHeight-m': '16px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: const Center(
              child: OneUiBadge(
                size: 'm',
                attention: 'high',
                semanticsLabel: 'Badge',
                child: 'Badge',
              ),
            ),
          ),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    final size = tester.getSize(find.byType(OneUiBadge));
    expect(size.width, greaterThan(39.7));
    expect(size.height, 16);
  });

  testWidgets(
      'long label truncates without RenderFlex overflow in narrow layout', (
    tester,
  ) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: const {
        '--Badge-height-m': '20px',
        '--Badge-paddingHorizontal-m': '6px',
        '--Badge-gap-m': '4px',
        '--Badge-borderRadius-m': '6px',
        '--Badge-fontSize-m': '12px',
        '--Badge-lineHeight-m': '16px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: const SizedBox(
              width: 72,
              child: OneUiBadge(
                attention: 'high',
                semanticsLabel: 'status',
                child: 'Very long badge label',
              ),
            ),
          ),
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(find.text('Very long badge label'), findsOneWidget);
  });

  testWidgets('CounterBadge stays circular inside fixed-height Badge slot',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-height-m': '20px',
        '--CounterBadge-height-xs': '12px',
        '--CounterBadge-paddingHorizontal-xs': '2px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: buildStorybookDemoThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'L',
            density: 'default',
            designSystem: ds,
            child: const OneUiBadge(
              size: 'm',
              attention: 'high',
              semanticsLabel: 'Badge',
              start: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
              child: 'Badge',
            ),
          ),
        ),
      ),
    );

    final counterSize = tester.getSize(
      find.descendant(
        of: find.byType(OneUiCounterBadge),
        matching: find.byWidgetPredicate(
          (w) => w is SizedBox && w.height != null && w.height! > 0,
        ),
      ),
    );
    expect(counterSize.height, counterSize.width);
    expect(counterSize.height, lessThan(20));
  });
}
