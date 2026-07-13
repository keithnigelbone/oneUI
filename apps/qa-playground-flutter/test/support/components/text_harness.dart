/// Text harness for QA playground widget tests.
library;

import '../semantics_helpers.dart';

export '../pump_one_ui_app.dart'
    show qaInputFieldTestDesignSystem, pumpOneUiQaApp, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';

import '../pump_one_ui_app.dart'
    show
        qaInputFieldTestDesignSystem,
        qaInputFieldTestThemeConfig,
        qaInputFieldTestTypography;

NativeDesignSystemPayload qaTextTestDesignSystem() =>
    qaInputFieldTestDesignSystem();

/// Bundled-font typography config — avoids google_fonts JetBrains fetch offline.
Map<String, dynamic> qaTextTypographyConfig() => {
      'fontSelection': {
        'textFontId': 'jiotype-var',
        'headingFontId': 'jiotype-var',
        'codeFontId': 'jiotype-var',
      },
    };

/// Distinct per-role font sizes so variant / size / weight probes are not circular.
NativeTypographySnapshot qaTextTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'body': {
      'sizes': {
        '2XS': {'fontSize': 10, 'lineHeight': 14},
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 500},
        'L': {'fontSize': 16, 'lineHeight': 22},
        'XL': {'fontSize': 18, 'lineHeight': 24},
        '2XL': {'fontSize': 20, 'lineHeight': 26},
      },
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'label': {
      'sizes': {
        '3XS': {'fontSize': 9, 'lineHeight': 12},
        '2XS': {'fontSize': 10, 'lineHeight': 14},
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
        'XL': {'fontSize': 18, 'lineHeight': 24},
        '2XL': {'fontSize': 20, 'lineHeight': 26},
      },
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'display': {
      'sizes': {
        'L': {'fontSize': 32, 'lineHeight': 40, 'fontWeight': 500},
        'M': {'fontSize': 28, 'lineHeight': 36, 'fontWeight': 500},
        'S': {'fontSize': 24, 'lineHeight': 32, 'fontWeight': 500},
      },
    },
    'headline': {
      'sizes': {
        'L': {'fontSize': 24, 'lineHeight': 30, 'fontWeight': 500},
        'M': {'fontSize': 20, 'lineHeight': 26, 'fontWeight': 500},
        'S': {'fontSize': 18, 'lineHeight': 24, 'fontWeight': 500},
      },
    },
    'title': {
      'sizes': {
        'L': {'fontSize': 18, 'lineHeight': 24, 'fontWeight': 500},
        'M': {'fontSize': 16, 'lineHeight': 22, 'fontWeight': 500},
        'S': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 500},
      },
    },
    'code': {
      'sizes': {
        'M': {'fontSize': 13, 'lineHeight': 18, 'fontWeight': 500},
        'S': {'fontSize': 12, 'lineHeight': 16, 'fontWeight': 500},
        'XS': {'fontSize': 11, 'lineHeight': 14, 'fontWeight': 500},
      },
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto', 'code': 'JioType Variable'},
  })!;
}

Widget pumpTextQaApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  String platformId = 'S',
  String density = 'default',
}) {
  final ds = designSystem ?? qaTextTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: qaInputFieldTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  Widget tree = OneUiScope(
    platformId: platformId,
    density: density,
    nativeTypography: qaTextTestTypography(),
    typographyConfig: qaTextTypographyConfig(),
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
    loading: false,
    snapshot: null,
    brandOverview: const {'brandHash': 'qa-text-test'},
    child: tree,
  );

  return tree;
}

Future<void> pumpTextQaHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  String platformId = 'S',
  String density = 'default',
  bool settle = true,
}) async {
  await tester.pumpWidget(
    pumpTextQaApp(
      child,
      designSystem: designSystem,
      platformId: platformId,
      density: density,
    ),
  );
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
  }
}

const int _kTextDarkRootStep = 100;

Widget pumpTextJioApp(
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kTextDarkRootStep : 2500);

  Widget inner = child;
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography,
        designSystem: designSystem ?? fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: inner,
            ),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpTextJioHarnessSettled(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpTextJioApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
  ));
  await tester.pumpAndSettle();
}

Finder textRootFinder() => find.byType(OneUiText);

Finder textRenderFinder({Finder? within}) => find.descendant(
      of: within ?? textRootFinder(),
      matching: find.byType(Text),
    );

TextStyle textStyleOf(WidgetTester tester, {Finder? within}) {
  final finder = textRenderFinder(within: within);
  expect(finder, findsOneWidget);
  final widget = tester.widget<Text>(finder.first);
  return widget.style ?? const TextStyle();
}

TextAlign? textAlignOf(WidgetTester tester, {Finder? within}) {
  final finder = textRenderFinder(within: within);
  expect(finder, findsOneWidget);
  return tester.widget<Text>(finder.first).textAlign;
}

Color? textColorOf(WidgetTester tester, {Finder? within}) =>
    textStyleOf(tester, within: within).color;

SemanticsData textSemanticsData(WidgetTester tester, {String? label}) {
  final finder = label != null
      ? find.bySemanticsLabel(label)
      : find.descendant(
          of: textRootFinder(),
          matching: find.byWidgetPredicate((w) => w is Semantics),
        );
  expect(finder, findsWidgets);
  return tester.getSemantics(finder.first).getSemanticsData();
}
