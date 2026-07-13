/// Divider widget-test harness — Android/iOS (mobile) + Linux (web/desktop semantics proxy).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import 'input_field_test_harness.dart' show inputFieldTestTypography;

const List<TargetPlatform> kDividerTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeDesignSystemPayload dividerTestDesignSystem() {
  final props = <String, String>{
    for (final n in [
      '2',
      '3',
      '3-5',
      '4',
      '5',
      '6',
      '7',
      '9',
      '14',
      '16',
      '18'
    ])
      '--Spacing-$n': switch (n) {
        '2' => '8px',
        '3' => '12px',
        '3-5' => '14px',
        '4' => '16px',
        '5' => '20px',
        '6' => '24px',
        '7' => '28px',
        '9' => '36px',
        '14' => '56px',
        '16' => '64px',
        '18' => '72px',
        _ => '8px',
      },
    '--Stroke-S': '0.5px',
    '--Stroke-M': '1px',
    '--Stroke-L': '1.5px',
    '--Shape-Pill': '9999px',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

Widget pumpDividerApp(Widget child) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        nativeTypography: inputFieldTestTypography(),
        designSystem: dividerTestDesignSystem(),
        child: Scaffold(
          body: Padding(
            padding: const EdgeInsets.all(24),
            child: child,
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpDividerStoryHarness(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(
    MaterialApp(
      home: OneUiSurfaceBootstrap(
        themeConfig: buildStorybookDemoThemeConfig(),
        darkMode: false,
        child: OneUiScope(
          platformId: 'L',
          density: 'default',
          nativeTypography: inputFieldTestTypography(),
          designSystem: dividerTestDesignSystem(),
          child: Scaffold(
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: child,
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kDividerTestPlatforms) {
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

/// QA payload [KeyedSubtree] — mirrors web `data-*` on the separator root.
Finder dividerPayloadSubtreeFinder() => find.byWidgetPredicate(
      (w) =>
          w is KeyedSubtree &&
          w.key is ValueKey<String> &&
          (w.key! as ValueKey<String>).value.startsWith('oneui-divider'),
    );

/// Root divider landmark — web `role="separator"` (Flutter uses container semantics).
Finder dividerSeparatorFinder() => find.descendant(
      of: dividerPayloadSubtreeFinder(),
      matching: find.byWidgetPredicate(
        (w) => w is Semantics && w.container,
      ),
    );

SemanticsData dividerSeparatorSemantics(WidgetTester tester) {
  final finder = dividerSeparatorFinder();
  expect(finder, findsOneWidget);
  return tester.getSemantics(finder).getSemanticsData();
}

/// Decorative line segments — RN `DIVIDER_LINE_A11Y` / web `aria-hidden` on `.line`.
int dividerHiddenLineSegmentCount(WidgetTester tester) {
  return find
      .descendant(
        of: dividerSeparatorFinder(),
        matching: find.byType(ExcludeSemantics),
      )
      .evaluate()
      .length;
}

/// Constrained vertical divider host (RN showcase uses ~72px height).
Widget verticalDividerHost(Widget child, {double height = 120}) {
  return SizedBox(height: height, child: child);
}

/// Full-width horizontal host — web `width: 100%`.
Widget horizontalDividerHost(Widget child, {double width = 320}) {
  return SizedBox(width: width, child: child);
}
