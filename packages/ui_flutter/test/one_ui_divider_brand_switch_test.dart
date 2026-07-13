import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/divider_color_resolve.dart';
import 'package:ui_flutter/engine/divider_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload _dividerDs({
  String strokeM = '1px',
  String strokeS = '0.5px',
  String contentGap = '14px',
  String? dividerColor,
}) {
  final props = <String, dynamic>{
    '--Stroke-S': strokeS,
    '--Stroke-M': strokeM,
    '--Stroke-L': '2px',
    '--Spacing-3-5': contentGap,
    '--Spacing-4': '16px',
    '--Shape-Pill': '9999px',
    '--Divider-strokeWidth-m': strokeM,
    '--Divider-contentGap': contentGap,
  };
  if (dividerColor != null) {
    props['--Divider-color'] = dividerColor;
  }
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': <String, String>{},
    },
  })!;
}

ThemeConfig _theme() {
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition('primary', buildColoredPalette(), 600),
      'secondary':
          buildScaleDefinition('secondary', buildGreyscalePalette(), 1300),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'informative':
          buildScaleDefinition('informative', buildColoredPalette(), 600),
    },
  );
}

NativeDesignSystemPayload _dividerDsWithIconSize(String iconSize) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Stroke-M': '1px',
      '--Spacing-3-5': '14px',
      '--Spacing-4': '16px',
      '--Shape-Pill': '9999px',
      '--Divider-iconSize': iconSize,
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': <String, String>{},
    },
  })!;
}

Widget _harness({
  required NativeDesignSystemPayload ds,
  required String brandHash,
  required Widget child,
  ThemeConfig? themeConfig,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig ?? _theme(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: ds,
        child: KeyedSubtree(key: ValueKey(brandHash), child: child),
      ),
    ),
  );
}

void main() {
  group('Divider brand switching', () {
    testWidgets('stroke width updates when component tokens change',
        (tester) async {
      late double strokeA;
      late double strokeB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-stroke-a',
          ds: _dividerDs(strokeM: '1px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              strokeA = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).strokePx;
              return const OneUiDivider();
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(strokeA, 1);

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-stroke-b',
          ds: _dividerDs(strokeM: '3px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              strokeB = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).strokePx;
              return const OneUiDivider();
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(strokeB, 3);
    });

    testWidgets(
        'component token override for --Divider-color tracks brand switch', (
      tester,
    ) async {
      late Color lineA;
      late Color lineB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-token-a',
          ds: _dividerDs(dividerColor: '#112233'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              lineA = resolveDividerColors(
                context,
                ds,
                resolvedAppearance: 'neutral',
                attention: 'low',
              ).lineColor;
              return const OneUiDivider();
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-token-b',
          ds: _dividerDs(dividerColor: '#445566'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              lineB = resolveDividerColors(
                context,
                ds,
                resolvedAppearance: 'neutral',
                attention: 'low',
              ).lineColor;
              return const OneUiDivider();
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(lineA.toARGB32(), isNot(lineB.toARGB32()));
    });

    testWidgets('icon slot size updates when Divider-iconSize token changes',
        (tester) async {
      late double iconA;
      late double iconB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-icon-a',
          ds: _dividerDsWithIconSize('16px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              iconA = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).iconSizePx;
              return const OneUiDivider(
                content: kOneUiDividerContentIcon,
                child: OneUiIcon(icon: 'star', excludeFromSemantics: true),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(iconA, 16);

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-icon-b',
          ds: _dividerDsWithIconSize('24px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              iconB = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).iconSizePx;
              return const OneUiDivider(
                content: kOneUiDividerContentIcon,
                child: OneUiIcon(icon: 'star', excludeFromSemantics: true),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(iconB, 24);
    });

    testWidgets('content gap updates when spacing tokens change',
        (tester) async {
      late double gapA;
      late double gapB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-gap-a',
          ds: _dividerDs(contentGap: '12px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              gapA = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).contentGapPx;
              return const OneUiDivider(
                content: kOneUiDividerContentText,
                child: 'Section',
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(gapA, 12);

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-gap-b',
          ds: _dividerDs(contentGap: '20px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              gapB = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).contentGapPx;
              return const OneUiDivider(
                content: kOneUiDividerContentText,
                child: 'Section',
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(gapB, 20);
    });

    testWidgets(
        'neutral stroke remaps to primary role inside nested subtle surface', (
      tester,
    ) async {
      final theme = _theme();
      final root = buildRootSurfaceContext(
        themeConfig: theme,
        rootParentStep: 2500,
        darkMode: false,
      );
      final ds = _dividerDs();

      late Color onDefault;
      late Color onSubtle;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: ds,
              child: Builder(
                builder: (context) {
                  onDefault = resolveDividerColors(
                    context,
                    OneUiScope.designSystemOf(context)!,
                    resolvedAppearance: 'neutral',
                    attention: 'low',
                  ).lineColor;
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: ds,
              child: OneUiSurface(
                mode: 'subtle',
                appearance: 'primary',
                child: Builder(
                  builder: (context) {
                    onSubtle = resolveDividerColors(
                      context,
                      OneUiScope.designSystemOf(context)!,
                      resolvedAppearance: 'neutral',
                      attention: 'low',
                    ).lineColor;
                    return const OneUiDivider();
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(onDefault.toARGB32(), isNot(onSubtle.toARGB32()));
    });

    testWidgets('repaints when brand design system tokens change',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          brandHash: 'div-repaint-a',
          ds: _dividerDs(strokeM: '1px'),
          child: const OneUiDivider(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _harness(
          brandHash: 'div-repaint-b',
          ds: _dividerDs(strokeM: '5px'),
          child: const OneUiDivider(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiDivider), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
