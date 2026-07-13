import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/chip_color_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_chip_types.dart';

ThemeConfig _twoRoleThemeConfig() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition('primary', accent, 600,
          anchorBoldToBaseStep: true),
      'secondary': buildScaleDefinition('secondary', grey, 1400),
      'neutral': buildScaleDefinition('neutral', grey, 1300),
    },
  );
}

NativeDesignSystemPayload _chipDsWithPrimaryRoleSlots() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      '--Chip-borderWidth': '1px',
      '--Chip-roleBold': 'var(--Primary-Bold)',
      '--Chip-roleBoldHigh': 'var(--Primary-Bold-High)',
      '--Chip-roleTintedA11y': 'var(--Primary-TintedA11y)',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Stroke-M': '1px',
      },
    },
  })!;
}

void main() {
  testWidgets('secondary chips ignore Primary-scoped --Chip-role* slots',
      (tester) async {
    final themeConfig = _twoRoleThemeConfig();
    final ds = _chipDsWithPrimaryRoleSlots();
    late ChipResolvedPaint paint;
    late FlatRoleTokens secondaryRole;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (context) {
                secondaryRole =
                    OneUiSurfaceScope.tokensForAppearance(context, 'secondary');
                final primaryRole =
                    OneUiSurfaceScope.tokensForAppearance(context, 'primary');
                final state = resolveOneUiChipState(
                  attention: 'high',
                  appearance: 'secondary',
                );
                paint = resolveChipPaint(
                  context,
                  ds,
                  state: state,
                  selected: true,
                  pressed: false,
                  roleAppearance: 'secondary',
                );
                expect(
                  paint.background,
                  isNot(oneUiHexColor(primaryRole.surfaces[kSurfaceBold]!)),
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );

    expect(
      paint.background,
      oneUiHexColor(secondaryRole.surfaces[kSurfaceBold]!),
    );
  });

  testWidgets('ghost selected secondary chip paints role tinted border',
      (tester) async {
    final themeConfig = _twoRoleThemeConfig();
    final ds = _chipDsWithPrimaryRoleSlots();
    late ChipResolvedPaint paint;
    late FlatRoleTokens secondaryRole;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (context) {
                secondaryRole =
                    OneUiSurfaceScope.tokensForAppearance(context, 'secondary');
                final state = resolveOneUiChipState(
                  attention: 'low',
                  appearance: 'secondary',
                );
                paint = resolveChipPaint(
                  context,
                  ds,
                  state: state,
                  selected: true,
                  pressed: false,
                  roleAppearance: 'secondary',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );

    expect(paint.borderWidth, greaterThan(0));
    expect(
      paint.borderColor,
      oneUiHexColor(secondaryRole.content['tintedA11y']!),
    );
  });

  testWidgets('primary appearance may use --Chip-roleBold slots',
      (tester) async {
    final themeConfig = _twoRoleThemeConfig();
    final ds = _chipDsWithPrimaryRoleSlots();
    late ChipResolvedPaint paint;
    late FlatRoleTokens primaryRole;

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: themeConfig,
          darkMode: false,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: ds,
            child: Builder(
              builder: (context) {
                primaryRole =
                    OneUiSurfaceScope.tokensForAppearance(context, 'primary');
                final state = resolveOneUiChipState(
                  attention: 'high',
                  appearance: 'primary',
                );
                paint = resolveChipPaint(
                  context,
                  ds,
                  state: state,
                  selected: true,
                  pressed: false,
                  roleAppearance: 'primary',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      ),
    );

    expect(
      paint.background,
      oneUiHexColor(primaryRole.surfaces[kSurfaceBold]!),
    );
  });
}
