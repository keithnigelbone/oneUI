library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

/// Android + iOS = Flutter mobile (RN parity). Linux = desktop / **Flutter web**
/// semantics and focus behaviour in VM tests.
const List<TargetPlatform> kOneUiLogoTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

const String kLogoTestSvg = '''
<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10"/>
</svg>''';

ThemeConfig logoTestThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in ['primary', 'neutral', 'secondary'])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpLogoApp(Widget child) {
  final root = buildRootSurfaceContext(
    themeConfig: logoTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'L',
    density: 'default',
    child: OneUiSurfaceScope(
      value: root,
      child: MaterialApp(home: Scaffold(body: Center(child: child))),
    ),
  );
}

Future<void> pumpLogoStoryHarness(WidgetTester tester, Widget page) async {
  await tester.pumpWidget(pumpLogoApp(page));
  await tester.pumpAndSettle();
}

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kOneUiLogoTestPlatforms) {
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
