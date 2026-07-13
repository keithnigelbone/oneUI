/// Shared harness for InputDynamicText / InputFeedback tests (Android, iOS, web proxy).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';

/// VM-tested platforms — semantics tree is shared on Android, iOS, and desktop/web.
const List<TargetPlatform> kInputInternalsTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeTypographySnapshot inputInternalsTypography() {
  return NativeTypographySnapshot.tryParse({
    'body': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16, 'fontWeight': 400},
        'S': {'fontSize': 12, 'lineHeight': 17, 'fontWeight': 400},
        'M': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 400},
      },
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16, 'fontWeight': 500},
        'S': {'fontSize': 12, 'lineHeight': 17, 'fontWeight': 500},
        'M': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 500},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

NativeDesignSystemPayload inputInternalsDesignSystem() {
  final props = <String, dynamic>{
    '--InputDynamicText-gap': '6px',
    '--InputFeedback-gap': '4px',
    '--InputFeedback-borderRadius-m': '8px',
    '--Spacing-1': '4px',
    '--Spacing-1-5': '6px',
    '--Spacing-2': '8px',
    '--Spacing-6': '24px',
    '--Shape-2': '8px',
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Disabled-Opacity': '0.38',
  };

  void addButtonSizing(String suffix) {
    props['--Button-fontSize-$suffix'] = '14px';
    props['--Button-lineHeight-$suffix'] = '20px';
    props['--Button-minHeight-$suffix'] = '40px';
    props['--Button-paddingVertical-$suffix'] = '10px';
    props['--Button-paddingHorizontal-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix'] = '16px';
    props['--Button-paddingHorizontalEnd-$suffix'] = '16px';
    props['--Button-condensedMinHeight-$suffix'] = '32px';
    props['--Button-condensedPaddingVertical-$suffix'] = '6px';
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
        '--Spacing-6': '24px',
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig inputInternalsThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'neutral',
        'negative',
        'positive',
        'warning',
        'informative',
        'secondary',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpInputInternalsApp(Widget child) {
  final surface = buildRootSurfaceContext(
    themeConfig: inputInternalsThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: inputInternalsTypography(),
        designSystem: inputInternalsDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> pumpInputInternalsLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

/// Runs [body] on Android, iOS, and desktop (web semantics proxy).
void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kInputInternalsTestPlatforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

SemanticsData semanticsDataForLabel(WidgetTester tester, String label) {
  final finder = find.bySemanticsLabel(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

Finder semanticsWithLiveRegionFinder() {
  return find.byWidgetPredicate(
    (w) => w is Semantics && (w.properties.liveRegion ?? false),
  );
}

void expectSemanticsLiveRegions(WidgetTester tester, {required int count}) {
  expect(semanticsWithLiveRegionFinder(), findsNWidgets(count));
}

Finder trailingDynamicTextButtonFinder() {
  return find.descendant(
    of: find.byType(OneUiInputDynamicText),
    matching: find.byType(OneUiFocusInteractive),
  );
}

SemanticsData trailingDynamicTextButtonSemantics(WidgetTester tester) {
  expect(trailingDynamicTextButtonFinder(), findsOneWidget);
  return tester
      .getSemantics(trailingDynamicTextButtonFinder())
      .getSemanticsData();
}
