import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/bottom_navigation_color_resolve.dart';
import 'package:ui_flutter/engine/bottom_navigation_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload _bottomNavDs({
  required String itemHeight1Line,
  String? itemBorderRadius,
}) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      '--Spacing-0': '0px',
      '--Spacing-1': '4px',
      '--Spacing-1-5': '6px',
      '--Spacing-4': '16px',
      '--Spacing-5': '20px',
      '--Spacing-6': '24px',
      '--Spacing-14': '56px',
      '--Spacing-16': '64px',
      '--Spacing-18': '72px',
      '--Shape-2': itemBorderRadius ?? '8px',
      '--BottomNavItem-height-1line': itemHeight1Line,
      '--Stroke-S': '0.5px',
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Disabled-Opacity': '0.5',
      '--Motion-Duration-Discreet-S': '150ms',
      '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
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

ThemeConfig _theme({int primaryBase = 600, int secondaryBase = 1300}) {
  return ThemeConfig(
    appearances: {
      'primary':
          buildScaleDefinition('primary', buildColoredPalette(), primaryBase),
      'secondary': buildScaleDefinition(
          'secondary', buildGreyscalePalette(), secondaryBase),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
      'informative':
          buildScaleDefinition('informative', buildColoredPalette(), 600),
    },
  );
}

Widget _harness({
  required NativeDesignSystemPayload ds,
  required String brandHash,
  required Widget child,
  ThemeConfig? themeConfig,
  String surfaceMode = 'default',
  String surfaceAppearance = 'primary',
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
        child: OneUiSurface(
          mode: surfaceMode,
          appearance: surfaceAppearance,
          child: KeyedSubtree(key: ValueKey(brandHash), child: child),
        ),
      ),
    ),
  );
}

void main() {
  group('BottomNavigation brand switching', () {
    testWidgets('item height updates when component tokens change',
        (tester) async {
      late double heightA;
      late double heightB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-height-a',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              heightA = resolveBottomNavigationLayout(
                context,
                ds,
                labelType: kOneUiBottomNavLabel1Line,
              ).itemHeight;
              return const OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                children: [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(heightA, 64);

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-height-b',
          ds: _bottomNavDs(itemHeight1Line: '72px'),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              heightB = resolveBottomNavigationLayout(
                context,
                ds,
                labelType: kOneUiBottomNavLabel1Line,
              ).itemHeight;
              return const OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                children: [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(heightB, 72);
    });

    testWidgets('accent colour updates when primary theme role changes',
        (tester) async {
      late Color accentA;
      late Color accentB;

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-color-a',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          themeConfig: _theme(primaryBase: 600),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              accentA = resolveBottomNavigationColors(
                context,
                ds,
                appearance: 'primary',
              ).accent;
              return const OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                defaultValue: 'home',
                children: [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-color-b',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          themeConfig: _theme(primaryBase: 1800),
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              accentB = resolveBottomNavigationColors(
                context,
                ds,
                appearance: 'primary',
              ).accent;
              return const OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                defaultValue: 'home',
                children: [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(accentA, isNot(equals(accentB)));
    });

    testWidgets('colours adapt on nested subtle surface after brand switch',
        (tester) async {
      late Color lowOnDefault;
      late Color lowOnSubtle;

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-surface-a',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          themeConfig: _theme(secondaryBase: 1300),
          surfaceMode: 'default',
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              lowOnDefault = resolveBottomNavigationColors(
                context,
                ds,
                appearance: 'secondary',
              ).textLow;
              return OneUiBottomNavigation(
                semanticsLabel: 'Surface',
                appearance: 'secondary',
                defaultValue: 'home',
                children: const [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-surface-b',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          themeConfig: _theme(secondaryBase: 2000),
          surfaceMode: 'subtle',
          surfaceAppearance: 'secondary',
          child: Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              lowOnSubtle = resolveBottomNavigationColors(
                context,
                ds,
                appearance: 'secondary',
              ).textLow;
              return OneUiBottomNavigation(
                semanticsLabel: 'Surface',
                appearance: 'secondary',
                defaultValue: 'home',
                children: const [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(lowOnDefault.toARGB32(), isNot(lowOnSubtle.toARGB32()));
    });

    testWidgets('renders all six items when brand passes six children (web)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _harness(
          brandHash: 'bn-six-tabs',
          ds: _bottomNavDs(itemHeight1Line: '64px'),
          child: OneUiBottomNavigation(
            semanticsLabel: 'Six tabs',
            children: [
              for (var i = 0; i < 6; i++)
                OneUiBottomNavItem(
                  value: 'tab-$i',
                  icon: 'home',
                  label: 'Tab $i',
                  testId: 'tab-$i',
                ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.bySemanticsLabel('Tab 0'), findsOneWidget);
      expect(find.bySemanticsLabel('Tab 5'), findsOneWidget);
    });
  });

  test('clampOneUiBottomNavChildren matches RN slice behaviour', () {
    final children = List<Widget>.generate(6, (i) => Text('tab-$i'));
    final clamped = clampOneUiBottomNavChildren(children);
    expect(clamped, hasLength(kOneUiBottomNavMaxItems));
    expect((clamped.last as Text).data, 'tab-4');
  });
}
