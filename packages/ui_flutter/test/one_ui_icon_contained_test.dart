import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_directional_icon.dart';
import 'package:ui_flutter/engine/icon_contained_color_resolve.dart';
import 'package:ui_flutter/engine/icon_contained_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';
import 'package:flutter_svg/flutter_svg.dart';

Widget _harness(Widget child) {
  final themeConfig = buildStorybookDemoThemeConfig();
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig,
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'S',
    density: 'default',
    child: OneUiSurfaceScope(
      value: root,
      child: MaterialApp(home: Scaffold(body: Center(child: child))),
    ),
  );
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('resolveIconContainedColors', () {
    testWidgets('brand-bg high attention resolves without throwing',
        (tester) async {
      late BuildContext ctx;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      final colors = resolveIconContainedColors(
        ctx,
        appearance: 'brand-bg',
        attention: OneUiIconContainedAttention.high,
      );
      expect(colors.background.alpha, greaterThan(0));
      expect(colors.foreground.alpha, greaterThan(0));
      expect(colors.background, isNot(equals(colors.foreground)));
    });

    testWidgets('brand-bg medium attention resolves without throwing',
        (tester) async {
      late BuildContext ctx;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      final colors = resolveIconContainedColors(
        ctx,
        appearance: 'brand-bg',
        attention: OneUiIconContainedAttention.medium,
      );
      expect(colors.background.alpha, greaterThan(0));
      expect(colors.foreground.alpha, greaterThan(0));
    });
  });

  group('resolveOneUiIconContainedState', () {
    test('defaults to secondary appearance, medium attention, size m', () {
      final s = resolveOneUiIconContainedState();
      expect(s.size, 'm');
      expect(s.attention, OneUiIconContainedAttention.medium);
      expect(s.appearance, 'secondary');
      expect(s.isDisabled, isFalse);
    });

    test('resolves appearance auto to primary in pure state', () {
      final s = resolveOneUiIconContainedState(appearance: 'auto');
      expect(s.appearance, 'primary');
      expect(s.dataAttributes['data-appearance'], 'primary');
    });

    test('preserves brand-bg appearance (web appearanceBrandBg parity)', () {
      final s = resolveOneUiIconContainedState(appearance: 'brand-bg');
      expect(s.appearance, 'brand-bg');
      expect(s.dataAttributes['data-appearance'], 'brand-bg');
    });

    test('invalid appearance falls back to primary', () {
      final s = resolveOneUiIconContainedState(appearance: 'destructive');
      expect(s.appearance, 'primary');
      expect(s.dataAttributes['data-appearance'], 'primary');
    });

    test('invalid size falls back to m', () {
      expect(resolveOneUiIconContainedState(size: 'xxl').size, 'm');
      expect(oneUiResolveIconContainedSize('invalid'), 'm');
    });

    for (final sz in kOneUiIconContainedSizes) {
      test('accepts Figma size $sz', () {
        expect(oneUiResolveIconContainedSize(sz), sz);
      });
    }

    test('emits data-size, data-attention, data-appearance', () {
      final s = resolveOneUiIconContainedState(
        size: 'l',
        attention: OneUiIconContainedAttention.medium,
        appearance: 'secondary',
        disabled: true,
      );
      expect(s.dataAttributes['data-size'], 'l');
      expect(s.dataAttributes['data-attention'], 'medium');
      expect(s.dataAttributes['data-appearance'], 'secondary');
      expect(s.isDisabled, isTrue);
    });
  });

  group('resolveOneUiIconContainedAppearance', () {
    testWidgets('auto inherits surface parent appearance', (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          OneUiSurface(
            mode: 'subtle',
            appearance: 'negative',
            child: Builder(
              builder: (context) {
                captured = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
      expect(
        resolveOneUiIconContainedAppearance(captured, 'auto'),
        'negative',
      );
    });

    testWidgets('null appearance inherits surface like auto at runtime',
        (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          OneUiSurface(
            mode: 'subtle',
            appearance: 'positive',
            child: Builder(
              builder: (context) {
                captured = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
      expect(
        resolveOneUiIconContainedAppearance(captured, null),
        'positive',
      );
    });

    testWidgets('null appearance outside surface falls back to primary',
        (tester) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              captured = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(resolveOneUiIconContainedAppearance(captured, null), 'primary');
    });
  });

  group('oneUiIconContainedEffectiveLabel', () {
    test('prefers explicit semanticsLabel', () {
      expect(
        oneUiIconContainedEffectiveLabel(semanticsLabel: 'Favourite'),
        'Favourite',
      );
    });

    test('omitted semanticsLabel returns null (decorative)', () {
      expect(oneUiIconContainedEffectiveLabel(), isNull);
    });

    test('whitespace-only semanticsLabel returns null', () {
      expect(oneUiIconContainedEffectiveLabel(semanticsLabel: '   '), isNull);
    });
  });

  group('resolveOneUiIconContainedSemantics', () {
    test('hides when aria-hidden', () {
      expect(
        resolveOneUiIconContainedSemantics(
          semanticsLabel: 'Heart',
          excludeFromSemantics: true,
          isDisabled: false,
        ).exposed,
        isFalse,
      );
    });

    test('maps disabled to label suffix', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Heart',
        isDisabled: true,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.label, 'Heart, disabled');
    });

    test('forwards semanticsHint', () {
      expect(
        resolveOneUiIconContainedSemantics(
          semanticsLabel: 'Heart',
          semanticsHint: 'Opens favourites',
          isDisabled: false,
        ).hint,
        'Opens favourites',
      );
    });
  });

  group('OneUiIconContained semantics', () {
    testWidgets('exposes image semantics with aria-label', (tester) async {
      await tester.pumpWidget(
        _harness(const OneUiIconContained(
            icon: 'star', semanticsLabel: 'Favourite')),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
    });

    testWidgets('inner glyph is excluded from semantics tree', (tester) async {
      await tester.pumpWidget(
        _harness(
            const OneUiIconContained(icon: 'heart', semanticsLabel: 'Heart')),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('heart'), findsNothing);
      expect(find.bySemanticsLabel('Heart'), findsOneWidget);
    });

    testWidgets('excludeFromSemantics hides from assistive tech',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: 'star',
            semanticsLabel: 'Hidden',
            excludeFromSemantics: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Hidden'), findsNothing);
    });

    testWidgets('semanticsHint is announced', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: 'star',
            semanticsLabel: 'Heart',
            semanticsHint: 'Opens favourites',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Heart'))
            .getSemanticsData();
        expect(data.hint, 'Opens favourites');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled appends disabled to semantics label', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: 'home',
            disabled: true,
            semanticsLabel: 'Disabled',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Disabled, disabled'))
            .getSemanticsData();
        expect(data.label.toLowerCase(), contains('disabled'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: 'star',
            semanticsLabel: 'Star',
            testId: 'icon-contained-root',
          ),
        ),
      );
      expect(find.byKey(const ValueKey('icon-contained-root')), findsOneWidget);
    });
  });

  group('resolveIconContainedBorderRadiusPx', () {
    testWidgets('missing tokens use container/2 stadium fallback (not 9999)',
        (tester) async {
      const containerPx = 40.0;
      await tester.pumpWidget(
        OneUiScope(
          platformId: 'S',
          density: 'default',
          child: MaterialApp(
            home: Builder(
              builder: (ctx) {
                final radius = resolveIconContainedBorderRadiusPx(
                  ctx,
                  containerPx: containerPx,
                );
                expect(radius, isNot(9999.0));
                expect(radius, containerPx / 2);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
    });

    testWidgets('Shape-0 recipe resolves to square corners', (tester) async {
      final ds = NativeDesignSystemPayload(
        componentCustomProperties: {
          '--IconContained-borderRadius': 'var(--Shape-0)',
        },
        dimensionContexts: const [],
        activeDimensionKey: 'web:default',
      );
      await tester.pumpWidget(
        OneUiScope(
          platformId: 'S',
          density: 'default',
          designSystem: ds,
          child: MaterialApp(
            home: Builder(
              builder: (ctx) {
                expect(resolveIconContainedBorderRadiusPx(ctx), 0);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
    });
  });

  group('IconContained on bold surface', () {
    testWidgets('high attention fill contrasts bold surface background',
        (tester) async {
      final palette = buildColoredPalette();
      final scale = buildScaleDefinition(
        'primary',
        palette,
        600,
        anchorBoldToBaseStep: true,
      );
      final themeConfig = ThemeConfig(appearances: {'primary': scale});
      final root = buildRootSurfaceContext(
        themeConfig: themeConfig,
        rootParentStep: 2500,
        darkMode: false,
      );

      Color? capturedBg;
      await tester.pumpWidget(
        OneUiScope(
          platformId: 'S',
          density: 'default',
          child: OneUiSurfaceScope(
            value: root,
            child: MaterialApp(
              home: OneUiSurface(
                mode: kSurfaceBold,
                child: Builder(
                  builder: (ctx) {
                    final role = OneUiSurfaceScope.tokensOf(ctx, 'primary');
                    capturedBg = oneUiHexColor(role.surfaces[kSurfaceBold]!);
                    return const OneUiIconContained(
                      icon: 'heart',
                      semanticsLabel: 'High',
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final surfaceBg = oneUiHexColor(palette[600]!);
      expect(capturedBg, isNotNull);
      expect(capturedBg!.toARGB32(), isNot(surfaceBg.toARGB32()));
    });
  });

  group('OneUiIconContained rendering', () {
    testWidgets('default widget uses secondary medium data attributes',
        (tester) async {
      await tester.pumpWidget(
        _harness(
            const OneUiIconContained(icon: 'heart', semanticsLabel: 'Heart')),
      );
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-icon-contained|data-size=m|data-attention=medium|data-appearance=primary|disabled=false',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('all Figma appearance roles render with visible colours',
        (tester) async {
      const figmaRoles = [
        'neutral',
        'primary',
        'secondary',
        'brand-bg',
        'negative',
        'positive',
        'warning',
        'informative',
      ];
      for (final role in figmaRoles) {
        await tester.pumpWidget(
          _harness(
            OneUiIconContained(
              icon: 'heart',
              appearance: role,
              semanticsLabel: role,
            ),
          ),
        );
        await tester.pumpAndSettle();
        final opacity = tester.widget<Opacity>(find.byType(Opacity));
        expect(opacity.opacity, 1, reason: role);
      }
    });

    testWidgets('renders Jio glyph inside container', (tester) async {
      await tester.pumpWidget(
        _harness(
            const OneUiIconContained(icon: 'heart', semanticsLabel: 'Heart')),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    testWidgets('renders custom widget glyph at intrinsic size',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: SizedBox(key: Key('custom-glyph'), width: 12, height: 12),
            semanticsLabel: 'Custom',
          ),
        ),
      );
      expect(find.byKey(const Key('custom-glyph')), findsOneWidget);
      expect(tester.getSize(find.byKey(const Key('custom-glyph'))).width, 12);
    });

    testWidgets('disabled reduces opacity', (tester) async {
      await tester.pumpWidget(
        _harness(
          const OneUiIconContained(
            icon: 'home',
            disabled: true,
            semanticsLabel: 'Disabled',
          ),
        ),
      );
      final opacity = tester.widget<Opacity>(find.byType(Opacity));
      expect(opacity.opacity, lessThan(1));
    });

    testWidgets('directional semantic icons mirror in RTL', (tester) async {
      await tester.pumpWidget(
        _harness(
          const Directionality(
            textDirection: TextDirection.rtl,
            child: OneUiIconContained(
              icon: 'chevronRight',
              semanticsLabel: 'Next',
            ),
          ),
        ),
      );
      await tester.pump();
      expect(oneUiSemanticIconMirrorsInRtl('chevronRight'), isTrue);
      expect(
        find.descendant(
          of: find.byType(OneUiIconContained),
          matching: find.byWidgetPredicate(
            (w) =>
                w is Transform &&
                w.transform.getRow(0)[0] == -1 &&
                w.transform.getRow(1)[1] == 1,
          ),
        ),
        findsOneWidget,
      );
    });
  });

  group('resolveIconContainedColors foreground fallback', () {
    testWidgets('medium attention uses global Text-High when tinted absent', (
      tester,
    ) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              captured = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      final role = OneUiSurfaceScope.tokensForAppearance(captured, 'negative');
      final roleWithoutTinted = FlatRoleTokens(
        surfaces: role.surfaces,
        content: Map<String, String>.from(role.content)..remove('tinted'),
        onBoldContent: role.onBoldContent,
        onSubtleContent: role.onSubtleContent,
        states: role.states,
      );
      final synthetic = resolveIconContainedColorsFromRoleTokens(
        captured,
        roleWithoutTinted,
        OneUiIconContainedAttention.medium,
      );
      final textHigh = oneUiHexColor(
        OneUiSurfaceScope.tokensForAppearance(captured, 'neutral')
            .content['high']!,
      );

      expect(synthetic.foreground, textHigh);
    });

    testWidgets('sparse surface map falls back to theme fill without throwing',
        (
      tester,
    ) async {
      late BuildContext captured;
      await tester.pumpWidget(
        _harness(
          Builder(
            builder: (context) {
              captured = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      final role = OneUiSurfaceScope.tokensForAppearance(captured, 'primary');
      final sparse = FlatRoleTokens(
        surfaces: const {},
        content: role.content,
        onBoldContent: role.onBoldContent,
        onSubtleContent: role.onSubtleContent,
        states: role.states,
      );
      final synthetic = resolveIconContainedColorsFromRoleTokens(
        captured,
        sparse,
        OneUiIconContainedAttention.high,
      );

      expect(
        synthetic.background,
        Theme.of(captured).colorScheme.surfaceContainerHighest,
      );
    });
  });
}
