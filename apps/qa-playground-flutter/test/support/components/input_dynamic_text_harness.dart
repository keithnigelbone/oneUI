/// InputDynamicText harness for QA playground widget tests.
///
/// Mirrors [icon_button_harness.dart]:
///   - [qaInputDynamicTextTestDesignSystem] — synthetic DS with distinct body
///     font sizes + condensed button heights per f-step (non-circular asserts).
///   - [pumpInputDynamicTextQaHarness] — offline synthetic pump.
///   - [pumpInputDynamicTextJioHarnessSettled] — Jio fixture for goldens + E2E.
///   - Real-value accessors (TextStyle, button height, Semantics, Row layout).
library;

export '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        pumpOneUiQaApp,
        pumpOneUiQaHarness,
        kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'dart:math' as math;

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
import 'package:ui_flutter/utils/touch_target_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestDesignSystem;
import 'input_harness.dart'
    show ensureInputIconsLoaded, pumpInputJioHarnessSettled;

export 'input_harness.dart'
    show ensureInputIconsLoaded, pumpInputJioHarnessSettled;

/// Body fontSize px per Figma row size — locked to [qaInputDynamicTextTestTypography].
const Map<OneUiInputLabelSize, double> kQaInputDynamicTextBodyFontSizePx = {
  OneUiInputLabelSize.s: 11,
  OneUiInputLabelSize.m: 12,
  OneUiInputLabelSize.l: 14,
};

/// Condensed trailing-button height per f-step — locked to
/// [qaInputDynamicTextTestDesignSystem].
const Map<int, double> kQaInputDynamicTextButtonCondensedHeightPx = {
  8: 28,
  10: 32,
  12: 36,
};

/// Expected trailing-button height — condensed token height clamped to WCAG touch
/// floor on touch-first platforms (mirrors [enforceButtonTouchMinHeight]).
double expectedInputDynamicTextHelperButtonHeightPx(
  int buttonFStep, {
  String platformId = 'S',
}) {
  final tokenHeight = kQaInputDynamicTextButtonCondensedHeightPx[buttonFStep]!;
  if (!isTouchFirstV2PlatformId(platformId)) {
    return tokenHeight;
  }
  return math.max(tokenHeight, kOneUiWcagTouchTargetMinPx);
}

NativeDesignSystemPayload qaInputDynamicTextTestDesignSystem() {
  final base = qaInputFieldTestDesignSystem();
  final props = Map<String, dynamic>.from(base.componentCustomProperties);

  const condensedHeights = {
    '8': 28.0,
    '10': 32.0,
    '12': 36.0,
  };
  for (final entry in condensedHeights.entries) {
    props['--Button-condensedMinHeight-${entry.key}'] =
        '${entry.value.toInt()}px';
    props['--Button-condensedPaddingVertical-${entry.key}'] = '4px';
    props['--Button-condensedPaddingHorizontal-${entry.key}'] = '8px';
    props['--Button-fontSize-${entry.key}'] = '12px';
    props['--Button-lineHeight-${entry.key}'] = '16px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': base.activeDimensionContext,
  })!;
}

/// Six-role snapshot so [resolveOneUiTextTypographyStyle] does not fall back to
/// foundation tables (which would make size assertions circular / drift).
NativeTypographySnapshot qaInputDynamicTextTestTypography() {
  const bodySizes = {
    'XS': {'fontSize': 11, 'lineHeight': 16},
    'S': {'fontSize': 12, 'lineHeight': 17},
    'M': {'fontSize': 14, 'lineHeight': 20},
  };
  const labelSizes = {
    ...bodySizes,
    'L': {'fontSize': 16, 'lineHeight': 22},
  };
  const fixedSizes = {
    'M': {'fontSize': 14, 'lineHeight': 20},
  };
  return NativeTypographySnapshot.tryParse({
    'display': {'sizes': fixedSizes},
    'headline': {'sizes': fixedSizes},
    'title': {'sizes': fixedSizes},
    'body': {
      'sizes': bodySizes,
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'label': {
      'sizes': labelSizes,
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'code': {
      'sizes': {
        'M': {'fontSize': 13, 'lineHeight': 18}
      },
      'weights': {'medium': 500},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

ThemeConfig qaInputDynamicTextTestThemeConfig() {
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

Widget pumpInputDynamicTextQaApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) {
  final ds = designSystem ?? qaInputDynamicTextTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaInputDynamicTextTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return OneUiBrandLoadState(
    loading: false,
    snapshot: null,
    brandOverview: const {'brandHash': 'qa-input-dynamic-text'},
    child: OneUiScope(
      platformId: 'S',
      density: 'default',
      nativeTypography: qaInputDynamicTextTestTypography(),
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
    ),
  );
}

Future<void> ensureInputDynamicTextIconsLoaded() => ensureInputIconsLoaded();

Finder inputDynamicTextRootFinder() => find.byType(OneUiInputDynamicText);

Finder inputDynamicTextLeadingExpandedFinder() => find.descendant(
      of: inputDynamicTextRootFinder(),
      matching: find.byType(Expanded),
    );

bool inputDynamicTextHasLeadingContent(WidgetTester tester) =>
    inputDynamicTextLeadingExpandedFinder().evaluate().isNotEmpty;

Finder inputDynamicTextLeadingTextFinder(String text) => find.descendant(
      of: inputDynamicTextLeadingExpandedFinder(),
      matching: find.text(text),
    );

Finder inputDynamicTextHelperButtonFinder() => find.descendant(
      of: inputDynamicTextRootFinder(),
      matching: find.byType(OneUiButton),
    );

Finder inputDynamicTextHelperInteractiveFinder() => find.descendant(
      of: inputDynamicTextRootFinder(),
      matching: find.byType(OneUiFocusInteractive),
    );

Finder inputDynamicTextOuterRowFinder() => find
    .descendant(
      of: inputDynamicTextRootFinder(),
      matching: find.byType(Row),
    )
    .first;

Finder inputDynamicTextLiveRegionFinder() => find.descendant(
      of: inputDynamicTextRootFinder(),
      matching: find.byWidgetPredicate(
        (w) => w is Semantics && (w.properties.liveRegion ?? false),
      ),
    );

TextStyle inputDynamicTextLeadingTextStyle(WidgetTester tester, String text) {
  final finder = inputDynamicTextLeadingTextFinder(text);
  expect(finder, findsOneWidget);
  return tester.widget<Text>(finder).style ?? const TextStyle();
}

double inputDynamicTextHelperButtonHeightPx(WidgetTester tester) {
  final interactive = inputDynamicTextHelperInteractiveFinder();
  if (interactive.evaluate().isNotEmpty) {
    return tester.getSize(interactive).height;
  }
  final button = inputDynamicTextHelperButtonFinder();
  expect(button, findsOneWidget);
  return tester.getSize(button).height;
}

MainAxisAlignment inputDynamicTextRowAlignment(WidgetTester tester) {
  return tester.widget<Row>(inputDynamicTextOuterRowFinder()).mainAxisAlignment;
}

SemanticsData inputDynamicTextLeadingSemantics(
    WidgetTester tester, String text) {
  final finder = find.descendant(
    of: inputDynamicTextRootFinder(),
    matching: find.bySemanticsLabel(text),
  );
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

SemanticsData inputDynamicTextHelperButtonSemantics(WidgetTester tester) {
  final interactive = inputDynamicTextHelperInteractiveFinder();
  if (interactive.evaluate().isNotEmpty) {
    return tester.getSemantics(interactive).getSemanticsData();
  }
  final button = inputDynamicTextHelperButtonFinder();
  expect(button, findsOneWidget);
  return tester.getSemantics(button).getSemanticsData();
}

Future<void> pumpInputDynamicTextQaHarness(
  WidgetTester tester,
  Widget child, {
  bool settle = true,
}) async {
  await ensureInputDynamicTextIconsLoaded();
  await tester.pumpWidget(pumpInputDynamicTextQaApp(child));
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 16));
  }
}

Future<void> pumpInputDynamicTextJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  return pumpInputJioHarnessSettled(
    tester,
    child,
    darkMode: darkMode,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  );
}
