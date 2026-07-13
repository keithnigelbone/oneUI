import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/tokens/appearance_roles.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';

void main() {
  test('normalizeAppearanceRoleKey', () {
    expect(normalizeAppearanceRoleKey('Brand-Bg'), 'brand-bg');
    expect(normalizeAppearanceRoleKey('brandBg'), 'brand-bg');
    expect(normalizeAppearanceRoleKey('sparkle'), 'sparkle');
  });

  testWidgets('tokensForAppearance resolves sparkle when only in themeConfig', (
    tester,
  ) async {
    final grey = buildGreyscalePalette();
    final themeConfig = ThemeConfig(
      appearances: {
        'primary': buildScaleDefinition('Primary', grey, 600),
        'sparkle': buildScaleDefinition('Sparkle', buildColoredPalette(), 1400),
        'brand-bg': buildScaleDefinition('BrandBg', grey, 1300,
            anchorBoldToBaseStep: true),
      },
    );
    final root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
      rootRolesJson: {
        'primary': _minimalRootRoleJson(),
      },
    );

    late FlatRoleTokens sparkleTokens;
    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: Builder(
            builder: (ctx) {
              sparkleTokens =
                  OneUiSurfaceScope.tokensForAppearance(ctx, 'sparkle');
              return const SizedBox();
            },
          ),
        ),
      ),
    );

    expect(sparkleTokens.surfaces[kSurfaceBold], isNotNull);
    expect(
      OneUiSurfaceScope.isAppearanceConfigured(
        tester.element(find.byType(SizedBox)),
        'sparkle',
      ),
      isTrue,
    );
  });

  testWidgets(
      'IconButton sparkle renders without gap card when role configured', (
    tester,
  ) async {
    final grey = buildGreyscalePalette();
    final themeConfig = ThemeConfig(
      appearances: {
        'primary': buildScaleDefinition('Primary', grey, 600),
        'sparkle': buildScaleDefinition('Sparkle', buildColoredPalette(), 1400),
        'brand-bg': buildScaleDefinition('BrandBg', grey, 1300,
            anchorBoldToBaseStep: true),
      },
    );
    final root = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: 2500,
      darkMode: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceScope(
          value: root,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: _minimalIconButtonDs(),
            child: const Center(
              child: OneUiIconButton(
                icon: 'add',
                appearance: 'sparkle',
                semanticsLabel: 'Sparkle',
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(ConvexGapCard), findsNothing);
    expect(find.textContaining('theme has no appearance'), findsNothing);
    expect(find.byType(OneUiIconButton), findsOneWidget);
  });
}

NativeDesignSystemPayload _minimalIconButtonDs() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      '--IconButton-borderRadius': '9999px',
      '--IconButton-containerSize-10': '40px',
      '--IconButton-iconSize-10': '18px',
      '--IconButton-borderWidth-bold': '0px',
      '--IconButton-borderWidth-subtle': '0px',
      '--IconButton-borderWidth-ghost': '0px',
      '--Disabled-Opacity': '0.38',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': <String, String>{},
    },
  })!;
}

Map<String, dynamic> _minimalRootRoleJson() => {
      'surfaces': {
        'bold': '#333333',
        'subtle': '#eeeeee',
        'minimal': '#f5f5f5',
        'default': '#ffffff',
        'ghost': '#ffffff',
        'moderate': '#cccccc',
        'elevated': '#fafafa',
      },
      'content': {
        'high': '#111111',
        'tintedA11y': '#222222',
        'strokeLow': '#999999',
      },
      'onBoldContent': {
        'high': '#ffffff',
        'tintedA11y': '#ffffff',
      },
      'states': {},
    };
