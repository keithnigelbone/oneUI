/// BottomNavigation widget-test harness — Android/iOS (mobile) + Linux (web/desktop semantics proxy).
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

import 'input_field_test_harness.dart' show inputFieldTestTypography;

const List<TargetPlatform> kBottomNavigationTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeDesignSystemPayload bottomNavigationTestDesignSystem() {
  final props = <String, String>{
    for (final n in ['0', '1', '1-5', '4', '5', '6', '14', '16', '18'])
      '--Spacing-$n': switch (n) {
        '0' => '0px',
        '1' => '4px',
        '1-5' => '6px',
        '4' => '16px',
        '5' => '20px',
        '6' => '24px',
        '14' => '56px',
        '16' => '64px',
        '18' => '72px',
        _ => '8px',
      },
    '--Shape-2': '8px',
    '--Stroke-S': '0.5px',
    '--Stroke-XL': '2px',
    '--Focus-Outline-Width': '2px',
    '--Disabled-Opacity': '0.5',
    '--Motion-Duration-Discreet-S': '150ms',
    '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.4, 0, 0.2, 1)',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

ThemeConfig bottomNavigationTestThemeConfig() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'neutral',
        'secondary',
        'sparkle',
        'positive',
        'informative',
      ])
        role: buildScaleDefinition(
          role,
          role == 'primary' || role == 'sparkle' ? accent : grey,
          role == 'primary' ? 600 : 1300,
        ),
    },
  );
}

/// Full-size shell for BottomNavigation Storybook pages.
Widget pumpBottomNavigationStoryApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  String brandHash = 'bottom-navigation-story-brand',
}) {
  final ds = designSystem ?? bottomNavigationTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: bottomNavigationTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return OneUiBrandLoadState(
    loading: false,
    snapshot: null,
    brandOverview: {'brandHash': brandHash},
    child: OneUiScope(
      platformId: 'S',
      density: 'default',
      nativeTypography: inputFieldTestTypography(),
      designSystem: ds,
      child: OneUiSurfaceScope(
        value: surface,
        child: MaterialApp(
          home: Scaffold(
            body: SizedBox.expand(child: child),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpBottomNavigationStoryHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpBottomNavigationStoryApp(child, designSystem: designSystem),
  );
  await tester.pumpAndSettle();
}

Widget pumpBottomNavigationApp(Widget child) {
  final root = buildRootSurfaceContext(
    themeConfig: bottomNavigationTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'L',
    density: 'default',
    designSystem: bottomNavigationTestDesignSystem(),
    child: OneUiSurfaceScope(
      value: root,
      child: MaterialApp(home: Scaffold(body: Center(child: child))),
    ),
  );
}

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kBottomNavigationTestPlatforms) {
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

void withSemanticsHandle(
  WidgetTester tester,
  void Function() body,
) {
  final handle = tester.ensureSemantics();
  try {
    body();
  } finally {
    handle.dispose();
  }
}

Finder bottomNavTabFinder(String label) => find.bySemanticsLabel(label);

/// Semantics for a bottom-nav tab (`role=button` / RN `accessibilityRole=tab`).
SemanticsData bottomNavTabSemanticsData(WidgetTester tester, String label) {
  final finder = bottomNavTabFinder(label);
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

void expectBottomNavTabSelected(
  WidgetTester tester,
  String label, {
  required bool selected,
}) {
  withSemanticsHandle(tester, () {
    final data = bottomNavTabSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.isSelected), selected);
  });
}

void expectBottomNavTabDisabled(WidgetTester tester, String label) {
  withSemanticsHandle(tester, () {
    final data = bottomNavTabSemanticsData(tester, label);
    expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
    expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
  });
}

void expectBottomNavTabLink(
  WidgetTester tester,
  String label, {
  required String? href,
}) {
  withSemanticsHandle(tester, () {
    final data = bottomNavTabSemanticsData(tester, label);
    if (href == null) {
      expect(data.linkUrl, isNull);
      expect(data.hasFlag(SemanticsFlag.isLink), isFalse);
      return;
    }
    expect(data.linkUrl, Uri.parse(href));
    expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
  });
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
