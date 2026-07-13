/// Functional, engine, and semantics tests for [OneUiSelectableButton].
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_design_system.dart';
import 'package:ui_flutter/brand/selectable_button_default_component_tokens.dart';
import 'package:ui_flutter/engine/button_color_resolve.dart';
import 'package:ui_flutter/engine/button_decoration.dart';
import 'package:ui_flutter/engine/button_ornament_chrome.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/selectable_button_color_resolve.dart';
import 'package:ui_flutter/engine/selectable_button_size_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_loading_spinner.dart';
import 'package:ui_flutter/widgets/one_ui_selectable_button.dart';
import 'package:ui_flutter/widgets/one_ui_selectable_button_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_selectable_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

const _swadeshOrnamentSvg =
    '<svg width="40" height="56" viewBox="0 0 40 56" fill="none" '
    'xmlns="http://www.w3.org/2000/svg">'
    '<path d="M0 56H12.53C12.53 56 24.19 55.81 28.54 41.98C32.44 30.4 37.86 28.35 40 28C37.86 27.64 32.45 25.6 28.54 14.02C24.19 0.190001 12.53 0 12.53 0H0"/>'
    '</svg>';

ButtonOrnamentConfig _swadeshOrnament() => ButtonOrnamentConfig(
      svgContent: _swadeshOrnamentSvg,
      aspectRatio: 40 / 56,
      mirror: true,
      placement: 'edges',
    );

NativeTypographySnapshot _minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

NativeDesignSystemPayload _selectableButtonDs() {
  final baseDs = defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default');
  final merged = Map<String, String>.from(baseDs.componentCustomProperties);
  merged.addAll(kSelectableButtonDefaultComponentTokenProperties);
  return NativeDesignSystemPayload(
    componentCustomProperties: merged,
    dimensionContexts: baseDs.dimensionContexts,
    activeDimensionKey: baseDs.activeDimensionKey,
    activeDimensionContext: baseDs.activeDimensionContext,
  );
}

Widget pumpSelectableButtonApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
  ButtonOrnamentConfig? buttonOrnament,
}) {
  final surface = buildRootSurfaceContext(
        themeConfig: buildStorybookDemoThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
  final ds = designSystem ?? _selectableButtonDs();

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: _minimalTypography(),
        designSystem: ds,
        buttonOrnament: buttonOrnament,
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> _pumpLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Finder _sbSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData _sbSemanticsByLabel(WidgetTester tester, String label) {
  return tester.getSemantics(_sbSemanticsFinder(label)).getSemanticsData();
}

BoxDecoration? _coreDecoration(WidgetTester tester) {
  for (final deco in tester.widgetList<DecoratedBox>(find.byType(DecoratedBox))) {
    final box = deco.decoration;
    if (box is BoxDecoration &&
        box.borderRadius != null &&
        (box.boxShadow == null || box.boxShadow!.isEmpty)) {
      return box;
    }
  }
  return null;
}

void main() {
  group('resolveSelectableButtonAccessibilityLabel', () {
    test('prefers semanticsLabel then ariaLabel then label', () {
      expect(
        resolveSelectableButtonAccessibilityLabel(
          semanticsLabel: ' A ',
          ariaLabel: 'B',
          label: 'C',
        ),
        'A',
      );
      expect(
        resolveSelectableButtonAccessibilityLabel(ariaLabel: 'Aria', label: 'C'),
        'Aria',
      );
      expect(
        resolveSelectableButtonAccessibilityLabel(label: ' Visible '),
        'Visible',
      );
    });

    test('widget child does not auto-extract label without semanticsLabel', () {
      expect(
        resolveSelectableButtonAccessibilityLabel(
          child: const Text('Child'),
        ),
        isNull,
      );
    });

    test('returns null when no label source', () {
      expect(resolveSelectableButtonAccessibilityLabel(), isNull);
      expect(
        resolveSelectableButtonAccessibilityLabel(label: '  '),
        isNull,
      );
    });
  });

  group('resolveOneUiSelectableButtonSemantics', () {
    test('maps toggle state and enabled/busy flags', () {
      final s = resolveOneUiSelectableButtonSemantics(
        label: 'Like',
        selected: true,
        disabled: false,
        loading: false,
      );
      expect(s.label, 'Like');
      expect(s.selected, isTrue);
      expect(s.enabled, isTrue);
      expect(s.busy, isFalse);
    });

    test('disabled and loading both set enabled false', () {
      expect(
        resolveOneUiSelectableButtonSemantics(
          label: 'x',
          selected: false,
          disabled: true,
          loading: false,
        ).enabled,
        isFalse,
      );
      expect(
        resolveOneUiSelectableButtonSemantics(
          label: 'x',
          selected: false,
          disabled: false,
          loading: true,
        ).enabled,
        isFalse,
      );
      expect(
        resolveOneUiSelectableButtonSemantics(
          label: 'x',
          selected: false,
          disabled: false,
          loading: true,
        ).busy,
        isTrue,
      );
    });

    test('falls back to Selectable button when label missing', () {
      expect(
        resolveOneUiSelectableButtonSemantics(
          selected: false,
          disabled: false,
          loading: false,
        ).label,
        'Selectable button',
      );
    });

    test('forwards semanticsHint', () {
      expect(
        resolveOneUiSelectableButtonSemantics(
          label: 'Save',
          semanticsHint: 'Toggles favourite',
          selected: false,
          disabled: false,
          loading: false,
        ).hint,
        'Toggles favourite',
      );
    });
  });

  group('SelectableButton types / state', () {
    test('resolveSelectableButtonSize defaults invalid to m', () {
      expect(resolveSelectableButtonSize(null), 'm');
      expect(resolveSelectableButtonSize(''), 'm');
      expect(resolveSelectableButtonSize('xl'), 'm');
      expect(resolveSelectableButtonSize('M'), 'm');
    });

    test('resolveSelectableButtonAttention defaults invalid to high', () {
      expect(resolveSelectableButtonAttention(null), 'high');
      expect(resolveSelectableButtonAttention(''), 'high');
      expect(resolveSelectableButtonAttention('LOW'), 'low');
      expect(resolveSelectableButtonAttention('bogus'), 'high');
    });

    test('selectableButtonOrnamentIsGhost matches Button ghost semantics', () {
      expect(
        selectableButtonOrnamentIsGhost(selected: false, attention: 'high'),
        isTrue,
      );
      expect(
        selectableButtonOrnamentIsGhost(selected: true, attention: 'low'),
        isTrue,
      );
      expect(
        selectableButtonOrnamentIsGhost(selected: true, attention: 'high'),
        isFalse,
      );
      expect(
        selectableButtonOrnamentIsGhost(selected: true, attention: 'medium'),
        isFalse,
      );
    });

    test('selectableButtonOrnamentVariantKind maps attention like Button', () {
      expect(
        selectableButtonOrnamentVariantKind(selected: true, attention: 'high'),
        OneUiButtonVariantKind.bold,
      );
      expect(
        selectableButtonOrnamentVariantKind(selected: true, attention: 'medium'),
        OneUiButtonVariantKind.subtle,
      );
      expect(
        selectableButtonOrnamentVariantKind(selected: true, attention: 'low'),
        OneUiButtonVariantKind.ghost,
      );
      expect(
        selectableButtonOrnamentVariantKind(selected: false, attention: 'high'),
        OneUiButtonVariantKind.ghost,
      );
    });

    test('slot and spinner size helpers', () {
      expect(selectableButtonSlotIconSize('xs'), '3-5');
      expect(selectableButtonSlotIconSize('l'), '6');
      expect(selectableButtonLoadingSpinnerSize('m'), '4');
    });

    testWidgets('resolveOneUiSelectableButtonState encodes data attributes',
        (tester) async {
      late OneUiSelectableButtonState captured;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              captured = resolveOneUiSelectableButtonState(
                ctx,
                size: 's',
                attention: 'low',
                appearance: 'primary',
                contained: true,
                condensed: true,
                disabled: true,
                loading: true,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(captured.size, 's');
      expect(captured.attention, 'low');
      expect(captured.condensed, isTrue);
      expect(captured.isDisabled, isTrue);
      expect(captured.dataAttrs['data-size'], 's');
      expect(captured.dataAttrs['data-attention'], 'low');
      expect(captured.dataAttrs.containsKey('data-condensed'), isTrue);
      expect(captured.dataAttrs.containsKey('data-loading'), isTrue);
      expect(captured.dataAttrs.containsKey('data-disabled'), isTrue);
    });

    testWidgets('condensed ignored when uncontained', (tester) async {
      late OneUiSelectableButtonState captured;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              captured = resolveOneUiSelectableButtonState(
                ctx,
                size: 'm',
                attention: 'high',
                appearance: 'primary',
                contained: false,
                condensed: true,
                disabled: false,
                loading: false,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(captured.condensed, isFalse);
      expect(captured.dataAttrs.containsKey('data-condensed'), isFalse);
    });

    testWidgets('appearance auto inherits from nested surface', (tester) async {
      late String appearance;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          OneUiSurface(
            mode: 'subtle',
            appearance: 'secondary',
            child: Builder(
              builder: (ctx) {
                appearance = resolveOneUiSelectableButtonAppearance(ctx, 'auto');
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
      expect(appearance, 'secondary');
    });
  });

  group('resolveSelectableButtonPaint', () {
    testWidgets('unselected contained uses ghost stroke border', (tester) async {
      late SelectableButtonResolvedPaint paint;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              paint = resolveSelectableButtonPaint(
                ctx,
                OneUiScope.designSystemOf(ctx)!,
                selected: false,
                hovered: false,
                contained: true,
                attention: 'high',
                appearance: 'primary',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(paint.background.alpha, 0);
      expect(paint.borderWidth, greaterThan(0));
      expect(paint.borderColor.alpha, greaterThan(0));
    });

    testWidgets('high selected uses bold fill', (tester) async {
      late SelectableButtonResolvedPaint paint;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              paint = resolveSelectableButtonPaint(
                ctx,
                OneUiScope.designSystemOf(ctx)!,
                selected: true,
                hovered: false,
                contained: true,
                attention: 'high',
                appearance: 'primary',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(paint.background.alpha, greaterThan(0));
      expect(paint.foreground.alpha, greaterThan(0));
    });

    testWidgets('low selected stays transparent with accent border', (tester) async {
      late SelectableButtonResolvedPaint paint;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              paint = resolveSelectableButtonPaint(
                ctx,
                OneUiScope.designSystemOf(ctx)!,
                selected: true,
                hovered: false,
                contained: true,
                attention: 'low',
                appearance: 'primary',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(paint.background.alpha, 0);
      expect(paint.borderColor.alpha, greaterThan(0));
      expect(paint.borderWidth, greaterThan(0));
    });

    testWidgets('uncontained selected adds font weight hint', (tester) async {
      late SelectableButtonResolvedPaint paint;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              paint = resolveSelectableButtonPaint(
                ctx,
                OneUiScope.designSystemOf(ctx)!,
                selected: true,
                hovered: false,
                contained: false,
                attention: 'medium',
                appearance: 'primary',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(paint.uncontainedSelectedFontWeight, isNotNull);
      expect(paint.background.alpha, 0);
    });
  });

  group('resolveSelectableButtonLayout', () {
    testWidgets('condensed contained reduces min height vs default', (tester) async {
      late SelectableButtonResolvedLayout normal;
      late SelectableButtonResolvedLayout condensed;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              final ds = OneUiScope.designSystemOf(ctx)!;
              normal = resolveSelectableButtonLayout(
                ctx,
                ds,
                size: 'm',
                condensed: false,
                hasStart: false,
                hasEnd: false,
              );
              condensed = resolveSelectableButtonLayout(
                ctx,
                ds,
                size: 'm',
                condensed: true,
                hasStart: false,
                hasEnd: false,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(condensed.minHeight, lessThan(normal.minHeight));
    });

    testWidgets('uncontained icon size tracks label font size', (tester) async {
      late double iconSize;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          Builder(
            builder: (ctx) {
              final layout = resolveSelectableButtonLayout(
                ctx,
                OneUiScope.designSystemOf(ctx)!,
                size: 'm',
                condensed: false,
                hasStart: false,
                hasEnd: false,
              );
              iconSize = selectableButtonResolvedIconSize(layout, contained: false);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(iconSize, greaterThan(0));
    });
  });

  group('button ornament chrome', () {
    testWidgets('ghost ornament stroke uses border colour not css-decoration',
        (tester) async {
      late BuildContext ctx;
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      final baseDs = defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default');
      final merged = Map<String, String>.from(baseDs.componentCustomProperties);
      merged.addAll({
        '--SelectableButton-cssDecorationInsetStrokeWidth': 'var(--Stroke-L)',
        '--SelectableButton-cssDecorationColor': 'transparent',
        '--Button-cssDecorationInsetStrokeWidth-ghost': 'var(--Stroke-L)',
      });
      final ds = NativeDesignSystemPayload(
        componentCustomProperties: merged,
        dimensionContexts: baseDs.dimensionContexts,
        activeDimensionKey: baseDs.activeDimensionKey,
        activeDimensionContext: baseDs.activeDimensionContext,
      );
      final stroke = resolveButtonOrnamentStroke(
        context: ctx,
        ds: ds,
        ornament: _swadeshOrnament(),
        variantKind: OneUiButtonVariantKind.ghost,
        fillPaint: const Color(0x00000000),
        foreground: const Color(0xFF112233),
        tokenBorderWidthPx: 1,
        componentPrefix: '--SelectableButton',
        appearance: 'primary',
        platformId: 'S',
        density: 'default',
        ghostStrokeColor: const Color(0xFFC45434),
      );
      expect(stroke.bodyFill.alpha, 0);
      expect(stroke.strokeWidthPx, 1);
      expect(stroke.strokeColor, const Color(0xFFC45434));
    });

    testWidgets('bold ornament keeps fill paint on caps', (tester) async {
      late BuildContext ctx;
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              ctx = context;
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      final ds = _selectableButtonDs();
      const fill = Color(0xFFC45434);
      final stroke = resolveButtonOrnamentStroke(
        context: ctx,
        ds: ds,
        ornament: _swadeshOrnament(),
        variantKind: OneUiButtonVariantKind.bold,
        fillPaint: fill,
        foreground: const Color(0xFF000000),
        tokenBorderWidthPx: 0,
        componentPrefix: '--SelectableButton',
        appearance: 'primary',
        platformId: 'S',
        density: 'default',
      );
      expect(stroke.bodyFill, fill);
    });
  });

  group('OneUiSelectableButton — guard / layout', () {
    testWidgets('missing design system shows ConvexGapCard', (tester) async {
      final surface = buildRootSurfaceContext(
        themeConfig: buildStorybookDemoThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: surface,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: null,
              child: const Scaffold(
                body: OneUiSelectableButton(label: 'Broken'),
              ),
            ),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.text('Broken'), findsNothing);
    });

    testWidgets('all sizes and attention levels render without gap card',
        (tester) async {
      for (final size in kOneUiSelectableButtonSizes) {
        for (final attention in kOneUiSelectableButtonAttentions) {
          await tester.pumpWidget(
            pumpSelectableButtonApp(
              OneUiSelectableButton(
                label: '$size-$attention',
                size: size,
                attention: attention,
                defaultSelected: true,
              ),
            ),
          );
          await _pumpLayout(tester);
          expect(find.byType(ConvexGapCard), findsNothing);
          expect(find.text('$size-$attention'), findsOneWidget);
          await tester.pumpWidget(const SizedBox.shrink());
        }
      }
    });

    testWidgets('condensed contained renders smaller chrome', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Condensed',
            condensed: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      final deco = _coreDecoration(tester);
      expect(deco, isNotNull);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('fullWidth contained expands to parent width', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const SizedBox(
            width: 320,
            child: OneUiSelectableButton(
              label: 'Wide',
              fullWidth: true,
            ),
          ),
        ),
      );
      await _pumpLayout(tester);
      final infinitySized = tester.widgetList<SizedBox>(
        find.descendant(
          of: find.byType(OneUiSelectableButton),
          matching: find.byWidgetPredicate(
            (w) => w is SizedBox && w.width == double.infinity,
          ),
        ),
      );
      expect(infinitySized, isNotEmpty);
    });

    testWidgets('fullWidth ignored when uncontained', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const SizedBox(
            width: 320,
            child: OneUiSelectableButton(
              label: 'Like',
              fullWidth: true,
              contained: false,
            ),
          ),
        ),
      );
      await _pumpLayout(tester);
      final infinitySized = tester.widgetList<SizedBox>(
        find.descendant(
          of: find.byType(OneUiSelectableButton),
          matching: find.byWidgetPredicate(
            (w) => w is SizedBox && w.width == double.infinity,
          ),
        ),
      );
      expect(infinitySized, isEmpty);
    });

    testWidgets('default contained buttons are not full width', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const SizedBox(
            width: 400,
            child: OneUiSelectableButton(label: 'Like'),
          ),
        ),
      );
      await _pumpLayout(tester);
      final chromeBoxes = tester.renderObjectList<RenderBox>(
        find.descendant(
          of: find.byType(OneUiSelectableButton),
          matching: find.byType(DecoratedBox),
        ),
      );
      final chromeWidth = chromeBoxes
          .map((b) => b.size.width)
          .where((w) => w > 0 && w < 400)
          .fold<double>(0, (a, b) => a > b ? a : b);
      expect(chromeWidth, greaterThan(0));
      expect(chromeWidth, lessThan(400));
    });

    testWidgets('start and end slots render when not loading', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Save',
            defaultSelected: true,
            start: OneUiIcon(icon: 'heart', excludeFromSemantics: true),
            end: OneUiIcon(icon: 'chevron-right', excludeFromSemantics: true),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(OneUiIcon), findsNWidgets(2));
    });

    testWidgets('loading preserves slotted button width', (tester) async {
      const slotted = OneUiSelectableButton(
        label: 'Save',
        defaultSelected: true,
        start: OneUiIcon(icon: 'heart', excludeFromSemantics: true),
        end: OneUiIcon(icon: 'chevron-right', excludeFromSemantics: true),
      );

      double maxChromeWidth() {
        final chromeBoxes = tester.renderObjectList<RenderBox>(
          find.descendant(
            of: find.byType(OneUiSelectableButton),
            matching: find.byType(DecoratedBox),
          ),
        );
        return chromeBoxes
            .map((b) => b.size.width)
            .where((w) => w > 0)
            .fold<double>(0, (a, b) => a > b ? a : b);
      }

      await tester.pumpWidget(pumpSelectableButtonApp(slotted));
      await _pumpLayout(tester);
      final widthBefore = maxChromeWidth();

      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Save',
            defaultSelected: true,
            loading: true,
            start: OneUiIcon(icon: 'heart', excludeFromSemantics: true),
            end: OneUiIcon(icon: 'chevron-right', excludeFromSemantics: true),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(maxChromeWidth(), closeTo(widthBefore, 1));
    });

    testWidgets('custom child widget renders instead of label string',
        (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            child: Text('CUSTOM'),
            defaultSelected: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.text('CUSTOM'), findsOneWidget);
      expect(find.text('Like'), findsNothing);
    });

    testWidgets('contained=false with start slot does not throw', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Liked',
            contained: false,
            defaultSelected: true,
            start: OneUiIcon(icon: 'heart', excludeFromSemantics: true),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(OneUiSelectableButton), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('appearances render without gap card', (tester) async {
      for (final role in kOneUiSelectableButtonCanonicalAppearances) {
        await tester.pumpWidget(
          pumpSelectableButtonApp(
            OneUiSelectableButton(
              label: 'Ag',
              appearance: role,
              defaultSelected: true,
            ),
          ),
        );
        await _pumpLayout(tester);
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(find.byType(OneUiFocusInteractive), findsOneWidget);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('brand ornament renders cap SVGs for low attention', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Low',
            attention: 'low',
            defaultSelected: true,
          ),
          buttonOrnament: _swadeshOrnament(),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(SvgPicture), findsWidgets);
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Like',
            testId: 'like-toggle',
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byKey(const ValueKey('like-toggle')), findsOneWidget);
    });
  });

  group('OneUiSelectableButton — toggle behaviour', () {
    testWidgets('starts unselected by default', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(const OneUiSelectableButton(label: 'Like')),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Like');
        expect(d.hasFlag(SemanticsFlag.hasToggledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isToggled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('defaultSelected sets selected semantics', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Like', defaultSelected: true),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('tap toggles uncontrolled selection', (tester) async {
      var changes = 0;
      bool? last;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          OneUiSelectableButton(
            label: 'Like',
            onSelectedChange: (v) {
              changes++;
              last = v;
            },
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(_sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isTrue);
      expect(changes, 1);
      expect(last, isTrue);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isFalse);
      expect(changes, 2);
      expect(last, isFalse);
    });

    testWidgets('controlled selected does not change on tap', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Like', selected: false),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isFalse);
    });

    testWidgets('controlled mode notifies onSelectedChange', (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          OneUiSelectableButton(
            label: 'Like',
            selected: selected,
            onSelectedChange: (v) => selected = v,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(selected, isTrue);
    });

    testWidgets('Space toggles selection when focused', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(const OneUiSelectableButton(label: 'Like')),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpLayout(tester);
      expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isTrue);
    });

    testWidgets('disabled does not toggle', (tester) async {
      var changes = 0;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          OneUiSelectableButton(
            label: 'Like',
            disabled: true,
            onSelectedChange: (_) => changes++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(changes, 0);
    });

    testWidgets('loading does not toggle and shows spinner', (tester) async {
      var changes = 0;
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          OneUiSelectableButton(
            label: 'Like',
            loading: true,
            start: const OneUiIcon(icon: 'heart', excludeFromSemantics: true),
            onSelectedChange: (_) => changes++,
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(OneUiLoadingSpinner), findsOneWidget);
      expect(find.byType(OneUiIcon), findsOneWidget);
      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);
      expect(changes, 0);
    });

    testWidgets('defaultSelected updates when prop changes in uncontrolled mode',
        (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Like', defaultSelected: false),
        ),
      );
      await _pumpLayout(tester);
      expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isFalse);

      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Like', defaultSelected: true),
        ),
      );
      await _pumpLayout(tester);
      expect(
          _sbSemanticsByLabel(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isTrue);
    });
  });

  group('OneUiSelectableButton — semantics / a11y', () {
    testWidgets('exposes button role, label, and tap action', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(const OneUiSelectableButton(label: 'Hello')),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Hello');
        expect(d.label, contains('Hello'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasToggledState), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsLabel overrides visible label', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Visible',
            semanticsLabel: 'Favourite item',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Favourite item');
        expect(d.label, contains('Favourite item'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('ariaLabel overrides when semanticsLabel absent', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Visible',
            ariaLabel: 'Aria favourite',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Aria favourite');
        expect(d.label, contains('Aria favourite'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint is exposed on toggle', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Like',
            semanticsHint: 'Double tap to favourite',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Like');
        expect(d.hint, 'Double tap to favourite');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled marks semantics not enabled', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Off', disabled: true),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Off');
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('loading disables semantics actions', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(label: 'Wait', loading: true),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Wait');
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hint, contains('Loading'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('fallback label when no visible text', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            start: OneUiIcon(icon: 'heart', excludeFromSemantics: true),
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Selectable button');
        expect(d.label, contains('Selectable button'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('testId is exposed as semantics identifier', (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(
          const OneUiSelectableButton(
            label: 'Like',
            testId: 'sb-like',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sbSemanticsByLabel(tester, 'Like');
        expect(d.identifier, 'sb-like');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('selected state reflected in semantics after toggle',
        (tester) async {
      await tester.pumpWidget(
        pumpSelectableButtonApp(const OneUiSelectableButton(label: 'Toggle')),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _sbSemanticsByLabel(tester, 'Toggle')
              .hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }

      await tester.tap(find.byType(OneUiSelectableButton));
      await _pumpLayout(tester);

      final handle2 = tester.ensureSemantics();
      try {
        expect(
          _sbSemanticsByLabel(tester, 'Toggle')
              .hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle2.dispose();
      }
    });
  });
}
