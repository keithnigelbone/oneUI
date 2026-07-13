import 'package:flutter/material.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

FlatRoleTokens minimalFlatRole() {
  return FlatRoleTokens(
    surfaces: {
      kSurfaceBold: '#aa0000',
      kSurfaceSubtle: '#eeeeee',
      kSurfaceMinimal: '#f5f5f5',
    },
    content: {
      'high': '#111111',
      'low': '#666666',
      'medium': '#444444',
      'tintedA11y': '#0050b3',
      'strokeMedium': '#999999',
    },
    onBoldContent: {'high': '#ffffff', 'tintedA11y': '#ffffff'},
    onSubtleContent: {},
    states: {'hover': '#dddddd'},
  );
}

NativeDesignSystemPayload minimalInputDesignSystem() {
  final props = <String, dynamic>{
    '--Input-borderWidth': '1px',
    '--Input-borderWidthFocus': '2px',
    '--Input-disabledOpacity': '0.4',
    '--Input-rootStackGap': '6px',
    '--Input-slotGap': '6px',
    '--Stroke-M': '1px',
    '--Spacing-0-5': '2px',
    '--Spacing-0': '0px',
    '--Spacing-1': '4px',
    '--Spacing-1-5': '6px',
    '--Spacing-2': '8px',
    '--Spacing-2-5': '10px',
    '--Spacing-3': '12px',
    '--Spacing-4': '16px',
    '--Spacing-5': '20px',
    '--Spacing-6': '24px',
    '--Spacing-8': '32px',
    '--Spacing-10': '40px',
    '--Spacing-12': '48px',
    '--Shape-2': '8px',
    '--Shape-3': '12px',
    '--Shape-Pill': '9999px',
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Disabled-Opacity': '0.38',
    '--Focus-Outline-Width': '2px',
    '--Focus-Outline': '#0000aa',
    '--Stroke-XL': '2px',
    '--Surface-Halo-Gap': '#ffffff',
    '--Surface-Main': '#ffffff',
  };

  void addButtonSizing(String suffix) {
    props['--Button-fontSize-$suffix'] = '14px';
    props['--Button-lineHeight-$suffix'] = '20px';
    props['--Button-minHeight-$suffix'] = '40px';
    props['--Button-paddingVertical-$suffix'] = '10px';
    props['--Button-paddingHorizontal-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix'] = '16px';
    props['--Button-paddingHorizontalEnd-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix-slot'] = '12px';
    props['--Button-paddingHorizontalEnd-$suffix-slot'] = '12px';
    props['--Button-iconSize-$suffix'] = '18px';
    props['--Button-condensedMinHeight-$suffix'] = '36px';
    props['--Button-condensedPaddingVertical-$suffix'] = '8px';
    props['--Button-condensedPaddingHorizontal-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalStart-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalEnd-$suffix'] = '12px';
    props['--Button-iconGapStart-$suffix'] = '4px';
    props['--Button-iconGapEnd-$suffix'] = '4px';
  }

  for (final suffix in ['6', '8', '10', '12']) {
    addButtonSizing(suffix);
  }

  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--Button-borderWidth-$v'] = v == 'ghost' ? '0px' : '1px';
  }

  for (final sz in ['8', '10', '12']) {
    props['--Input-height-$sz'] = '40px';
    props['--Input-paddingHorizontal-$sz'] = '12px';
    props['--Input-paddingVertical-$sz'] = '6px';
    props['--Input-borderRadius-$sz'] = '8px';
    props['--Input-iconSize-$sz'] = '16px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Spacing-2': '8px',
        '--Spacing-3': '12px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'body': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

ThemeConfig minimalThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpInputHarness(Widget child) {
  final surface = buildRootSurfaceContext(
    themeConfig: minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: minimalTypography(),
        designSystem: minimalInputDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}
