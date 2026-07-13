/// BottomNavigation harness for QA playground widget / golden / e2e tests.
///
/// Mirrors [avatar_harness.dart]: the production-grade Jio Convex fixture
/// renders `OneUiBottomNavigation` byte-identical to what users see in
/// `qa-playground:flutter`. No synthetic palette, no algorithmic drift.
///
/// A second, *synthetic* design system ([qaBottomNavTestDesignSystem]) pins
/// every `--BottomNav*` and `--Spacing-*` token to a fixed px value so
/// layout-measurement tests can assert exact dimensions WITHOUT re-parsing the
/// token cascade (which would make the assertion circular / self-confirming).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ThemeConfig;
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

export '../pump_one_ui_app.dart'
    show pumpOneUiQaApp, pumpOneUiQaHarness, kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

// ===========================================================================
// Canonical measurement table — the synthetic design system pins these px so
// layout tests compare against KNOWN numbers, never against the resolver's own
// output (that would be a tautology, the definition of false confidence).
// ===========================================================================

/// Item shell height per label type (matches Figma BottomNav.Item heights).
const Map<String, double> kQaBottomNavItemHeightPx = {
  'none': 56,
  '1line': 64,
  '2line': 72,
};

/// Icon box size per label type. Icon-only ("none") uses the larger glyph.
const Map<String, double> kQaBottomNavIconSizePx = {
  'none': 24,
  '1line': 20,
  '2line': 20,
};

const double kQaBottomNavPaddingHorizontalPx = 16;
const double kQaBottomNavItemGapPx = 0;
const double kQaBottomNavLabel2LineBoxHeightPx = 24;

/// Synthetic BottomNavigation token payload with fixed px values. Used by
/// measurement tests; rendering parity tests should prefer the Jio fixture.
NativeDesignSystemPayload qaBottomNavTestDesignSystem() {
  final props = <String, dynamic>{
    '--BottomNavItem-height-none': '${kQaBottomNavItemHeightPx['none']}px',
    '--BottomNavItem-height-1line': '${kQaBottomNavItemHeightPx['1line']}px',
    '--BottomNavItem-height-2line': '${kQaBottomNavItemHeightPx['2line']}px',
    '--BottomNavItem-iconSize': '${kQaBottomNavIconSizePx['1line']}px',
    '--BottomNavItem-iconSize-none': '${kQaBottomNavIconSizePx['none']}px',
    '--BottomNavItem-borderRadius': '8px',
    '--BottomNavItem-stateLayerBorderRadius': '8px',
    '--BottomNavItem-padding': '4px',
    '--BottomNavItem-gap': '6px',
    '--BottomNavItem-innerPadding': '4px',
    '--BottomNavItem-label2LineHeight': '${kQaBottomNavLabel2LineBoxHeightPx}px',
    '--BottomNavigation-paddingHorizontal':
        '${kQaBottomNavPaddingHorizontalPx}px',
    '--BottomNavigation-paddingVertical': '0px',
    '--BottomNavigation-itemGap': '${kQaBottomNavItemGapPx}px',
    '--BottomNavigation-dividerWidth': '0.5px',
    '--Disabled-Opacity': '0.5',
    '--Motion-Duration-Discreet-S': '150ms',
    '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
  };

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
        '--Spacing-1-5': '6px',
        '--Spacing-2': '8px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-14': '56px',
        '--Spacing-16': '64px',
        '--Spacing-18': '72px',
        '--Shape-2': '8px',
        '--Stroke-S': '0.5px',
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

NativeTypographySnapshot qaBottomNavTestTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        '3XS': {'fontSize': 10, 'lineHeight': 14},
        '2XS': {'fontSize': 11, 'lineHeight': 15},
        'XS': {'fontSize': 12, 'lineHeight': 16},
        'S': {'fontSize': 14, 'lineHeight': 20},
        'M': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

const int _kDarkRootStep = 100;

/// Bottom navigation always lives at the bottom of a full-height screen. The
/// harness gives it a realistic phone-width viewport so `Expanded` children
/// and 2-line ellipsis behave like the real app.
Widget pumpBottomNavQaApp(
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  NativeTypographySnapshot? typography,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double width = 360,
  bool useJioFixture = true,
}) {
  final fx = useJioFixture ? jioFixture : null;
  final effectiveDark = darkMode ?? (fx?.darkMode ?? false);
  final effectiveStep = darkMode == null
      ? (fx?.rootParentStep ?? 2500)
      : (effectiveDark ? _kDarkRootStep : 2500);

  Widget inner = child;
  if (surfaceMode != null) {
    inner = OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: inner,
    );
  }

  // Pin the bar to the bottom of a phone-shaped column so layout matches the
  // real app (full-width, intrinsic height, bottom-anchored).
  inner = Align(
    alignment: Alignment.bottomCenter,
    child: SizedBox(width: width, child: inner),
  );

  return MaterialApp(
    debugShowCheckedModeBanner: false,
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? fx?.themeConfig ?? _fallbackThemeConfig(),
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: (darkMode == null && fx != null) ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography:
            typography ?? fx?.nativeTypography ?? qaBottomNavTestTypography(),
        designSystem: designSystem ?? fx?.designSystem ?? qaBottomNavTestDesignSystem(),
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: inner,
        ),
      ),
    ),
  );
}

ThemeConfig _fallbackThemeConfig() {
  // Only reached when useJioFixture: false AND no themeConfig provided — the
  // synthetic measurement path. Re-uses the Jio fixture theme when present.
  return jioFixture.themeConfig;
}

Future<void> pumpBottomNavQaHarness(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  NativeTypographySnapshot? typography,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double width = 360,
  bool useJioFixture = true,
}) async {
  await ensureJioFixtureReady();
  await JioIconCatalog.instance.ensureLoaded();
  await tester.pumpWidget(pumpBottomNavQaApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    typography: typography,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
    width: width,
    useJioFixture: useJioFixture,
  ));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> pumpBottomNavQaHarnessSettled(
  WidgetTester tester,
  Widget child, {
  ThemeConfig? themeConfig,
  bool? darkMode,
  NativeDesignSystemPayload? designSystem,
  NativeTypographySnapshot? typography,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  String platformId = 'S',
  String density = 'default',
  double width = 360,
  bool useJioFixture = true,
}) async {
  await ensureJioFixtureReady();
  await JioIconCatalog.instance.ensureLoaded();
  await tester.pumpWidget(pumpBottomNavQaApp(
    child,
    themeConfig: themeConfig,
    darkMode: darkMode,
    designSystem: designSystem,
    typography: typography,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    platformId: platformId,
    density: density,
    width: width,
    useJioFixture: useJioFixture,
  ));
  await tester.pumpAndSettle();
}

// ===========================================================================
// Finders & semantics helpers
// ===========================================================================

Finder bottomNavRootFinder() => find.byType(OneUiBottomNavigation);

Finder bottomNavItemFinder() => find.byType(OneUiBottomNavItem);

/// A bottom-nav tab is exposed via `find.bySemanticsLabel`.
Finder bottomNavTabFinder(String label) => find.bySemanticsLabel(label);

SemanticsData bottomNavTabSemanticsData(WidgetTester tester, String label) {
  final finder = bottomNavTabFinder(label);
  expect(finder, findsOneWidget,
      reason: 'expected exactly one tab labelled "$label"');
  return tester.getSemantics(finder).getSemanticsData();
}

void expectBottomNavTabSelected(
  WidgetTester tester,
  String label, {
  required bool selected,
}) {
  final handle = tester.ensureSemantics();
  try {
    final data = bottomNavTabSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.isSelected), selected,
        reason:
            'tab "$label" expected isSelected=$selected (aria-current parity)');
  } finally {
    handle.dispose();
  }
}

void expectBottomNavTabDisabled(WidgetTester tester, String label) {
  final handle = tester.ensureSemantics();
  try {
    final data = bottomNavTabSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse,
        reason: 'tab "$label" expected disabled (isEnabled cleared)');
  } finally {
    handle.dispose();
  }
}

void expectBottomNavTabLink(
  WidgetTester tester,
  String label, {
  required String? href,
}) {
  final handle = tester.ensureSemantics();
  try {
    final data = bottomNavTabSemanticsData(tester, label);
    if (href == null) {
      expect(data.linkUrl, isNull);
      expect(data.hasFlag(SemanticsFlag.isLink), isFalse);
      return;
    }
    expect(data.linkUrl, Uri.parse(href));
    expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
  } finally {
    handle.dispose();
  }
}

/// Counts token-backed tab buttons (excludes the nav container landmark).
int countBottomNavTabButtons(WidgetTester tester) {
  var count = 0;
  for (final element in find
      .byWidgetPredicate(
        (widget) => widget is Semantics && widget.properties.button == true,
      )
      .evaluate()) {
    final label = (element.widget as Semantics).properties.label;
    if (label != null && label.trim().isNotEmpty) {
      count++;
    }
  }
  return count;
}

/// The rendered px width of the i-th tab's Expanded slot. Used to assert the
/// items share width equally (the Figma row layout).
double bottomNavItemWidth(WidgetTester tester, int index) {
  final items = bottomNavItemFinder();
  return tester.getSize(items.at(index)).width;
}

/// Number of [OneUiBottomNavItem] currently in the tree.
int bottomNavItemCount(WidgetTester tester) =>
    bottomNavItemFinder().evaluate().length;
