import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

Widget _indicatorHarness({required Widget child}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: const {
            '--IndicatorBadge-size-m': '10px',
            '--IndicatorBadge-size-xs': '6px',
            '--IndicatorBadge-borderRadius': '9999px',
          },
          dimensionContexts: const [],
          activeDimensionKey: 'L:default',
        ),
        child: Center(child: child),
      ),
    ),
  );
}

void main() {
  testWidgets('default payload encodes m and primary', (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiIndicatorBadge(semanticsLabel: 'Online'),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=primary',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('invalid appearance encodes neutral in payload', (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiIndicatorBadge(
          appearance: 'primry',
          semanticsLabel: 'Status',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=neutral',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('negative appearance encodes in payload', (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiIndicatorBadge(
          appearance: 'negative',
          semanticsLabel: 'Offline',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=negative',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('renders circular dot with no text', (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiIndicatorBadge(semanticsLabel: 'Status'),
      ),
    );
    expect(find.byType(Text), findsNothing);
    expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
  });

  testWidgets('xs size encodes in payload', (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiIndicatorBadge(
          size: 'xs',
          semanticsLabel: 'Unread',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-indicator-badge|data-size=xs|data-appearance=primary',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('auto inherits surface appearance inside Surface',
      (tester) async {
    await tester.pumpWidget(
      _indicatorHarness(
        child: const OneUiSurface(
          mode: 'subtle',
          appearance: 'secondary',
          child: OneUiIndicatorBadge(
            appearance: 'auto',
            semanticsLabel: 'Active',
          ),
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-indicator-badge|data-size=m|data-appearance=secondary',
        ),
      ),
      findsOneWidget,
    );
  });
}
