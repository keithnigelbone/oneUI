import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/circular_progress_indicator_showcase.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

Widget _harness(Widget child) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: const {},
          dimensionContexts: const [],
          activeDimensionKey: 'L:default',
        ),
        child: Builder(
          builder: (context) => SingleChildScrollView(
            child: child,
          ),
        ),
      ),
    ),
  );
}

void main() {
  testWidgets('variants section mounts', (tester) async {
    await tester.pumpWidget(
      _harness(Builder(builder: buildCpiVariantsSection)),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
  });

  testWidgets('sizes section mounts', (tester) async {
    await tester.pumpWidget(
      _harness(Builder(builder: buildCpiSizesSection)),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
  });

  testWidgets('appearances section mounts', (tester) async {
    await tester.pumpWidget(
      _harness(Builder(builder: buildCpiAppearancesSection)),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
  });
}
