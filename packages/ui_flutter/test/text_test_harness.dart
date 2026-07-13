/// Shared harness for [OneUiText] widget + semantics tests (web + mobile).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

/// VM-tested platforms — Flutter semantics tree is shared on Android, iOS, and desktop/web.
const List<TargetPlatform> kOneUiTextTestPlatforms = [
  TargetPlatform.android,
  TargetPlatform.iOS,
  TargetPlatform.linux,
];

NativeTypographySnapshot textTestTypography() {
  Map<String, dynamic> roleSizes(Map<String, (double, double)> sizes,
          {int fw = 500}) =>
      {
        for (final e in sizes.entries)
          e.key: {
            'fontSize': e.value.$1,
            'lineHeight': e.value.$2,
            'fontWeight': fw,
            'fontFamily': 'JioType',
          },
      };

  return NativeTypographySnapshot.tryParse({
    'body': {
      'sizes': roleSizes({
        '2XS': (10, 14),
        'XS': (11, 16),
        'S': (12, 17),
        'M': (14, 20),
        'L': (16, 22),
        'XL': (18, 24),
        '2XL': (20, 28),
      }),
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'label': {
      'sizes': roleSizes({
        '3XS': (9, 12),
        '2XS': (10, 14),
        'XS': (11, 16),
        'S': (12, 17),
        'M': (14, 20),
        'L': (16, 22),
        'XL': (18, 24),
        '2XL': (20, 28),
      }),
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'title': {
      'sizes':
          roleSizes({'S': (16, 22), 'M': (18, 24), 'L': (20, 28)}, fw: 800),
    },
    'headline': {
      'sizes':
          roleSizes({'S': (22, 28), 'M': (26, 32), 'L': (30, 36)}, fw: 900),
    },
    'display': {
      'sizes':
          roleSizes({'S': (28, 34), 'M': (32, 38), 'L': (36, 42)}, fw: 900),
    },
    'code': {
      'sizes': roleSizes({'XS': (11, 16), 'S': (12, 17), 'M': (14, 20)}),
      'weights': {'high': 500, 'medium': 400, 'low': 400},
    },
    'fontFamilies': {
      'primary': 'JioType',
      'code': 'JetBrains Mono',
    },
  })!;
}

ThemeConfig textTestThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'neutral',
        'secondary',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpTextApp(Widget child) {
  final root = buildRootSurfaceContext(
    themeConfig: textTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'L',
    density: 'default',
    nativeTypography: textTestTypography(),
    child: OneUiSurfaceScope(
      value: root,
      child: MaterialApp(home: Scaffold(body: Center(child: child))),
    ),
  );
}

/// Locates the debug payload [KeyedSubtree] emitted by [OneUiText].
Finder findOneUiTextPayload() {
  return find.byWidgetPredicate(
    (widget) =>
        widget is KeyedSubtree &&
        widget.key is ValueKey<String> &&
        (widget.key! as ValueKey<String>).value.startsWith('oneui-text|'),
  );
}

String oneUiTextPayloadValue(WidgetTester tester) {
  final widget = tester.widget<KeyedSubtree>(findOneUiTextPayload());
  return (widget.key! as ValueKey<String>).value;
}

/// Runs [body] on Android, iOS, and desktop (web semantics proxy) targets.
void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kOneUiTextTestPlatforms) {
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
