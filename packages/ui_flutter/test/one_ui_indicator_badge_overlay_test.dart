import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';

Widget _overlayHarness({required Widget child}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: const {
            '--IndicatorBadge-size-xs': '6px',
            '--IndicatorBadge-size-s': '8px',
            '--Spacing-9': '36px',
            '--Spacing-10': '40px',
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
  testWidgets('topEnd anchor pins indicator top-right to host corner',
      (tester) async {
    const hostSide = 36.0;
    const indicatorSide = 6.0;

    await tester.pumpWidget(
      _overlayHarness(
        child: OneUiIndicatorBadgeOverlay(
          hostSide: hostSide,
          host: const DecoratedBox(
            decoration:
                BoxDecoration(color: Color(0xFFE0E0E0), shape: BoxShape.circle),
          ),
          indicatorSize: 'xs',
          anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
          indicator: const SizedBox(
            width: indicatorSide,
            height: indicatorSide,
            child: ColoredBox(color: Color(0xFFFF0000)),
          ),
        ),
      ),
    );

    final hostBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(DecoratedBox).first,
      ),
    );
    final indicatorBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(ColoredBox),
      ),
    );

    final hostTopRight =
        hostBox.localToGlobal(hostBox.size.topRight(Offset.zero));
    final indicatorTopRight = indicatorBox.localToGlobal(
      indicatorBox.size.topRight(Offset.zero),
    );

    expect(indicatorTopRight.dx, closeTo(hostTopRight.dx, 0.5));
    expect(indicatorTopRight.dy, closeTo(hostTopRight.dy, 0.5));
  });

  testWidgets('bottomEnd anchor pins indicator wrapper to host corner',
      (tester) async {
    const hostSide = 40.0;
    const indicatorSide = 8.0;
    const ring = 2.0;

    await tester.pumpWidget(
      _overlayHarness(
        child: OneUiIndicatorBadgeOverlay(
          hostSide: hostSide,
          host: const DecoratedBox(
            decoration:
                BoxDecoration(color: Color(0xFFE0E0E0), shape: BoxShape.circle),
          ),
          indicatorSize: 's',
          anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
          surfaceRingColor: Colors.white,
          surfaceRingWidth: ring,
          indicator: const SizedBox(
            width: indicatorSide,
            height: indicatorSide,
            child: ColoredBox(color: Color(0xFF00AA00)),
          ),
        ),
      ),
    );

    final hostBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(DecoratedBox).at(1),
      ),
    );
    final ringBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(DecoratedBox).last,
      ),
    );

    final hostBottomRight =
        hostBox.localToGlobal(hostBox.size.bottomRight(Offset.zero));
    final ringBottomRight =
        ringBox.localToGlobal(ringBox.size.bottomRight(Offset.zero));

    expect(ringBottomRight.dx, closeTo(hostBottomRight.dx, 0.5));
    expect(ringBottomRight.dy, closeTo(hostBottomRight.dy, 0.5));
  });

  testWidgets('withComponents showcase pins OneUiIndicatorBadge to icon corner',
      (tester) async {
    const hostSide = 36.0;

    await tester.pumpWidget(
      _overlayHarness(
        child: OneUiIndicatorBadgeOverlay(
          hostSide: hostSide,
          host: const DecoratedBox(
            decoration:
                BoxDecoration(color: Color(0xFFE0E0E0), shape: BoxShape.circle),
          ),
          indicatorSize: 'xs',
          anchor: OneUiIndicatorBadgeOverlayAnchor.topEnd,
          indicator: const OneUiIndicatorBadge(
            size: 'xs',
            appearance: 'negative',
            semanticsLabel: '3 notifications',
          ),
        ),
      ),
    );

    final hostBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(DecoratedBox).first,
      ),
    );
    final badgeBox = tester.renderObject<RenderBox>(
      find.descendant(
        of: find.byType(OneUiIndicatorBadgeOverlay),
        matching: find.byType(OneUiIndicatorBadge),
      ),
    );

    final hostTopRight =
        hostBox.localToGlobal(hostBox.size.topRight(Offset.zero));
    final badgeTopRight =
        badgeBox.localToGlobal(badgeBox.size.topRight(Offset.zero));

    expect(badgeTopRight.dx, closeTo(hostTopRight.dx, 0.5));
    expect(badgeTopRight.dy, closeTo(hostTopRight.dy, 0.5));
  });
}
