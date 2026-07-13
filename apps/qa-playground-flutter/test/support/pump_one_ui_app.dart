/// Shared OneUiScope shell for QA component widget tests.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

const List<TargetPlatform> kOneUiQaTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeDesignSystemPayload qaInputFieldTestDesignSystem({
  String fieldGapPx = '6px',
  String feedbackGapPx = '4px',
}) {
  final props = <String, dynamic>{
    '--InputField-gap': fieldGapPx,
    '--InputFeedback-gap': feedbackGapPx,
    '--InputDynamicText-gap': '4px',
    '--Input-borderWidth': '1px',
    '--Input-borderWidthFocus': '2px',
    '--Input-disabledOpacity': '0.4',
    '--Input-rootStackGap': '6px',
    '--Input-slotGap': '6px',
    '--Shape-2': '8px',
    '--Shape-1-5': '6px',
    '--Shape-2-5': '10px',
    '--Shape-Pill': '9999px',
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Disabled-Opacity': '0.38',
    '--IconButton-borderRadius': '9999px',
    '--Loading-Opacity': '0.38',
  };

  for (final sz in ['4', '6', '8', '10', '12', '14']) {
    props['--IconButton-containerSize-$sz'] = '32px';
    props['--IconButton-iconSize-$sz'] = '16px';
    props['--IconButton-containerSize-$sz-condensed'] = '28px';
    props['--IconButton-condensedContainerSize-$sz'] = '28px';
  }
  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--IconButton-borderWidth-$v'] = '0px';
  }

  for (final sz in ['6', '8', '10', '12']) {
    props['--Button-fontSize-$sz'] = '14px';
    props['--Button-lineHeight-$sz'] = '20px';
    props['--Button-minHeight-$sz'] = '36px';
    props['--Button-paddingVertical-$sz'] = '8px';
    props['--Button-paddingHorizontal-$sz'] = '12px';
    props['--Button-paddingHorizontalStart-$sz'] = '12px';
    props['--Button-paddingHorizontalEnd-$sz'] = '12px';
    props['--Button-paddingHorizontalStart-$sz-slot'] = '10px';
    props['--Button-paddingHorizontalEnd-$sz-slot'] = '10px';
    props['--Button-iconSize-$sz'] = '16px';
    props['--Button-iconGapStart-$sz'] = '4px';
    props['--Button-iconGapEnd-$sz'] = '4px';
    props['--Button-condensedMinHeight-$sz'] = '32px';
    props['--Button-condensedPaddingVertical-$sz'] = '6px';
    props['--Button-condensedPaddingHorizontal-$sz'] = '10px';
    props['--Button-condensedPaddingHorizontalStart-$sz'] = '10px';
    props['--Button-condensedPaddingHorizontalEnd-$sz'] = '10px';
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
        '--Spacing-0': '0px',
        '--Spacing-0-5': '2px',
        '--Spacing-1': '4px',
        '--Spacing-1-5': fieldGapPx,
        '--Spacing-2': '8px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
        '--Shape-2': '8px',
        '--Shape-1-5': '6px',
        '--Shape-2-5': '10px',
        '--Stroke-M': '1px',
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
        '--Shape-Pill': '9999px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

NativeTypographySnapshot qaInputFieldTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'body': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

ThemeConfig qaInputFieldTestThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'negative',
        'positive',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpOneUiQaApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  bool brandLoading = false,
  String brandHash = 'qa-test-brand',
}) {
  final ds = designSystem ?? qaInputFieldTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaInputFieldTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  Widget tree = OneUiScope(
    platformId: 'S',
    density: 'default',
    nativeTypography: qaInputFieldTestTypography(),
    designSystem: ds,
    child: OneUiSurfaceScope(
      value: surface,
      child: MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(width: 348, child: child),
          ),
        ),
      ),
    ),
  );

  tree = OneUiBrandLoadState(
    loading: brandLoading,
    snapshot: null,
    brandOverview: {'brandHash': brandHash},
    child: tree,
  );

  return tree;
}

Future<void> pumpOneUiQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpOneUiQaApp(child, designSystem: designSystem),
  );
  await tester.pumpAndSettle();
}

Finder qaInputFieldTextFieldFinder() {
  return find.byWidgetPredicate(
    (w) => w is Semantics && (w.properties.textField ?? false),
  );
}

SemanticsNode qaInputFieldTextFieldSemantics(WidgetTester tester) {
  return tester.getSemantics(qaInputFieldTextFieldFinder().first);
}
