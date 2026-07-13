import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/badge_color_resolve.dart';
import 'package:ui_flutter/engine/badge_slot_context.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

/// Storybook demo theme plus `sparkle` so `appearance="auto"` resolves without
/// dev warnings (web default outside Surface).
ThemeConfig _badgeTestThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(appearances: {
    ...buildStorybookDemoThemeConfig().appearances,
    'sparkle': buildScaleDefinition('Sparkle', grey, 1300),
  });
}

Widget _badgeHarness({
  required Widget child,
  ThemeConfig? themeConfig,
}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: themeConfig ?? _badgeTestThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        designSystem: NativeDesignSystemPayload(
          componentCustomProperties: const {
            '--Badge-height-m': '20px',
            '--Badge-paddingHorizontal-m': '6px',
            '--Badge-gap-m': '4px',
            '--CounterBadge-height-xs': '12px',
            '--IndicatorBadge-size-s': '8px',
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
  testWidgets(
      'default payload encodes size m attention high appearance sparkle',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'status',
          child: 'Active',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|data-attention=high|data-appearance=sparkle',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('attention medium encodes subtle variant in payload',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          attention: 'medium',
          semanticsLabel: 'status',
          child: 'Active',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=subtle|data-attention=medium|data-appearance=sparkle',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('renders children text', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'status',
          child: 'Active',
        ),
      ),
    );
    expect(find.text('Active'), findsOneWidget);
  });

  testWidgets('renders without children when aria-label provided',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(semanticsLabel: 'empty badge'),
      ),
    );
    expect(find.byType(OneUiBadge), findsOneWidget);
    expect(find.bySemanticsLabel('empty badge'), findsOneWidget);
  });

  testWidgets('semantics live region (web role=status)', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: '3 notifications',
          child: 'Badge',
        ),
      ),
    );
    final semantics =
        tester.getSemantics(find.bySemanticsLabel('3 notifications'));
    expect(semantics.label, '3 notifications');
  });

  testWidgets('empty badge emits anonymous live region (web role=status)',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(child: const OneUiBadge()),
    );
    final handle = tester.ensureSemantics();
    try {
      final nodes = tester.widgetList<Semantics>(
        find.descendant(
          of: find.byType(OneUiBadge),
          matching: find.byType(Semantics),
        ),
      );
      expect(
        nodes.any((s) => s.properties.liveRegion == true),
        isTrue,
        reason: 'Empty badge must expose Semantics(liveRegion: true)',
      );
    } finally {
      handle.dispose();
    }
  });

  testWidgets('testId exposed via Semantics.identifier', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          testId: 'qa-badge',
          semanticsLabel: 'b',
          child: 'X',
        ),
      ),
    );
    final handle = tester.ensureSemantics();
    try {
      final node = tester.getSemantics(find.byType(OneUiBadge));
      expect(node.getSemanticsData().identifier, 'qa-badge');
    } finally {
      handle.dispose();
    }
  });

  testWidgets('explicit variant omits data-attention from payload key',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'b',
          variant: 'bold',
          attention: 'low',
          child: 'A',
        ),
      ),
    );
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|data-appearance=sparkle',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('empty string child renders no Text widget', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(semanticsLabel: 'b', child: ''),
      ),
    );
    expect(find.byType(Text), findsNothing);
    expect(find.bySemanticsLabel('b'), findsOneWidget);
  });

  testWidgets('badge height grows at 2x text scale (WCAG 1.4.4)',
      (tester) async {
    Future<double> badgeHeight({required TextScaler scaler}) async {
      await tester.pumpWidget(
        MediaQuery(
          data: MediaQueryData(textScaler: scaler),
          child: _badgeHarness(
            child: const OneUiBadge(
              appearance: 'primary',
              semanticsLabel: 'Status',
              child: 'Active',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      return tester.getSize(find.byType(OneUiBadge)).height;
    }

    final base = await badgeHeight(scaler: TextScaler.noScaling);
    final scaled = await badgeHeight(scaler: const TextScaler.linear(2.0));
    expect(scaled, greaterThan(base));
  });

  testWidgets('CounterBadge in Badge slot shows digits at xs bold (not dot)',
      (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: BadgeSlotSizeScope(
          sizes: kBadgeSlotSizes['m']!,
          child: Builder(
            builder: (context) {
              final state = resolveOneUiCounterBadgeState(
                context: context,
                value: 3,
                attention: 'high',
              );
              expect(state.visualDisplayValue, '3',
                  reason:
                      'Web/RN show numerals at every size inside Badge slots');
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  });

  testWidgets('start slot renders CounterBadge', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'badge',
          start: OneUiCounterBadge(
            value: 3,
            appearance: 'negative',
            semanticsLabel: '3',
          ),
          child: 'Badge',
        ),
      ),
    );
    expect(find.byType(OneUiCounterBadge), findsOneWidget);
    expect(find.text('Badge'), findsOneWidget);
  });

  testWidgets('end slot renders IndicatorBadge', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'badge',
          end: OneUiIndicatorBadge(
            appearance: 'negative',
            semanticsLabel: 'Unread',
          ),
          child: 'Badge',
        ),
      ),
    );
    expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
  });

  testWidgets('both slots render', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'badge',
          start: OneUiCounterBadge(value: 1, semanticsLabel: '1'),
          end: OneUiIndicatorBadge(semanticsLabel: 'dot'),
          child: 'Badge',
        ),
      ),
    );
    expect(find.byType(OneUiCounterBadge), findsOneWidget);
    expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
  });

  testWidgets('CounterBadge in slot stays circular (fixed height)',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'badge',
          start: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
          child: 'Badge',
        ),
      ),
    );
    final counterSize = tester.getSize(find.byType(OneUiCounterBadge));
    expect(counterSize.height, counterSize.width);
  });

  testWidgets('badge shrink-wraps with slots in a wide parent', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const SizedBox(
          width: 400,
          child: Align(
            alignment: Alignment.centerLeft,
            child: OneUiBadge(
              semanticsLabel: 'badge',
              start: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
              child: 'Badge',
            ),
          ),
        ),
      ),
    );
    final outerSize = tester.getSize(find.byType(OneUiBadge));
    expect(outerSize.width, lessThan(200));
  });

  testWidgets('appearance auto inherits inside Surface', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiSurface(
          mode: 'minimal',
          appearance: 'secondary',
          child: OneUiBadge(
            appearance: 'auto',
            semanticsLabel: 'badge',
            child: 'Badge',
          ),
        ),
      ),
    );
    expect(find.byType(OneUiBadge), findsOneWidget);
  });

  testWidgets('invalid appearance encodes neutral in payload', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          appearance: 'primry',
          semanticsLabel: 'status',
          child: 'Active',
        ),
      ),
    );
    expect(tester.takeException(), isA<FlutterError>());
    expect(
      find.byKey(
        const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|data-attention=high|data-appearance=neutral',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('long label does not overflow in narrow parent', (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const SizedBox(
          width: 72,
          child: OneUiBadge(
            semanticsLabel: 'status',
            child: 'Very long badge label',
          ),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('widget child does not render debug toString text',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'status',
          child: Icon(Icons.favorite, size: 12),
        ),
      ),
    );
    expect(find.textContaining('Instance of'), findsNothing);
    expect(find.byType(Icon), findsOneWidget);
  });

  testWidgets('slot labels remain when slot exposes accessibility',
      (tester) async {
    await tester.pumpWidget(
      _badgeHarness(
        child: const OneUiBadge(
          semanticsLabel: 'badge label',
          start: OneUiCounterBadge(
            value: 3,
            semanticsLabel: 'counter only',
          ),
          child: 'Badge',
        ),
      ),
    );
    expect(find.bySemanticsLabel('counter only'), findsOneWidget);
    expect(find.bySemanticsLabel('badge label'), findsOneWidget);
  });

  testWidgets('ghost badge uses strokeMedium border in high-contrast mode', (
    tester,
  ) async {
    late BuildContext ctx;

    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(highContrast: true),
          child: OneUiSurfaceBootstrap(
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
                builder: (context) {
                  ctx = context;
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        ),
      ),
    );

    final paint = resolveBadgeColors(
      ctx,
      OneUiScope.of(ctx).designSystem!,
      variant: 'ghost',
      appearance: 'primary',
    );
    final role = OneUiSurfaceScope.tokensForAppearance(ctx, 'primary');
    expect(
      paint.borderColor,
      oneUiHexColor(role.content['strokeMedium']!),
    );
  });
}
