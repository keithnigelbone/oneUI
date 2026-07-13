/// Functional + semantics tests for [OneUiButton].
///
/// Mirrors `packages/ui/src/components/Button/Button.test.tsx` and
/// `packages/ui-native/src/components/Button/Button.native.test.tsx` where
/// those map to Flutter (semantics / press / disabled / loading / slots).
import 'package:flutter/semantics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

NativeDesignSystemPayload _minimalButtonDesignSystem() {
  final props = <String, dynamic>{
    '--Button-fontWeight': '600',
    '--Button-textTransform': 'none',
    '--Button-letterSpacing': 'normal',
    '--Button-borderRadius': '9999px',
    '--Button-iconGap': '4px',
    '--Disabled-Opacity': '0.38',
  };

  void addSizing(String suffix) {
    props['--Button-fontSize-$suffix'] = '14px';
    props['--Button-lineHeight-$suffix'] = '20px';
    props['--Button-minHeight-$suffix'] = '40px';
    props['--Button-paddingVertical-$suffix'] = '10px';
    props['--Button-paddingHorizontal-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix'] = '16px';
    props['--Button-paddingHorizontalEnd-$suffix'] = '16px';
    props['--Button-paddingHorizontalStart-$suffix-slot'] = '12px';
    props['--Button-paddingHorizontalEnd-$suffix-slot'] = '12px';
    props['--Button-iconSize-$suffix'] = '18px';
    props['--Button-condensedMinHeight-$suffix'] = '36px';
    props['--Button-condensedPaddingVertical-$suffix'] = '8px';
    props['--Button-condensedPaddingHorizontal-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalStart-$suffix'] = '12px';
    props['--Button-condensedPaddingHorizontalEnd-$suffix'] = '12px';
    props['--Button-iconGapStart-$suffix'] = '4px';
    props['--Button-iconGapEnd-$suffix'] = '4px';
  }

  for (final suffix in ['6', '8', '10', '12']) {
    addSizing(suffix);
  }

  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--Button-borderWidth-$v'] = v == 'ghost' ? '0px' : '1px';
  }

  void addLinkButtonSizing(String suffix) {
    props['--LinkButton-minHeight-$suffix'] = switch (suffix) {
      '6' => '14px',
      '8' => '16px',
      '12' => '24px',
      _ => '20px',
    };
    props['--LinkButton-iconSize-$suffix'] = switch (suffix) {
      '6' => '14px',
      '8' => '16px',
      '12' => '24px',
      _ => '20px',
    };
  }

  for (final suffix in ['6', '8', '10', '12']) {
    addLinkButtonSizing(suffix);
  }
  props['--LinkButton-paddingHorizontal'] = '2px';
  props['--LinkButton-iconGap'] = '4px';
  props['--LinkButton-borderRadius'] = '4px';

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

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

ThemeConfig _minimalThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
        'brand-bg',
        'tertiary',
        'quaternary',
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

/// Same surface + scope stack as Storybook; supplies Convex-shaped payload for tests.
Widget pumpButtonApp(Widget child) {
  final surface = buildRootSurfaceContext(
    themeConfig: _minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        nativeTypography: _minimalTypography(),
        designSystem: _minimalButtonDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

/// Settles layout without waiting on infinite ticker animations ([OneUiCircularProgressIndicator]).
Future<void> _pumpButtonLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Finder _buttonSemanticsFinder() => find.byType(OneUiFocusInteractive);

/// Focus halo uses a [DecoratedBox] with two [BoxShadow]s (gap + outline).
int _countFocusHaloDecorations(WidgetTester tester) {
  var count = 0;
  for (final element in find.byType(DecoratedBox).evaluate()) {
    final decoration = (element.widget as DecoratedBox).decoration;
    if (decoration is BoxDecoration &&
        (decoration.boxShadow?.length ?? 0) >= 2) {
      count++;
    }
  }
  return count;
}

SemanticsData _buttonSemanticsData(WidgetTester tester) =>
    tester.getSemantics(_buttonSemanticsFinder()).getSemanticsData();

void main() {
  group('resolveOneUiButtonAppearance', () {
    testWidgets('auto resolves to primary on page surface', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(const OneUiButton(label: 'Auto', appearance: 'auto')),
      );
      await _pumpButtonLayout(tester);
      expect(
        resolveOneUiButtonAppearance(
          tester.element(find.byType(OneUiButton)),
          'auto',
        ),
        'primary',
      );
    });
  });

  group('OneUiButton functional', () {
    testWidgets('renders label text', (tester) async {
      await tester
          .pumpWidget(pumpButtonApp(const OneUiButton(label: 'Test Button')));
      await tester.pumpAndSettle();
      expect(find.text('Test Button'), findsOneWidget);
    });

    testWidgets('invokes onPressed when tapped', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(label: 'Tap me', onPressed: () => hits++),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Tap me'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgets('onPress aliases to onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(label: 'Press', onPress: () => hits++),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Press'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgets('onClick aliases to onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(label: 'Click', onClick: () => hits++),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Click'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgets('does not invoke callback when disabled', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(label: 'Nope', disabled: true, onPressed: () => hits++),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Nope'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgets('does not invoke callback when loading', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(label: 'Load', loading: true, onPressed: () => hits++),
        ),
      );
      await _pumpButtonLayout(tester);
      await tester.tap(find.text('Load'), warnIfMissed: false);
      await _pumpButtonLayout(tester);
      expect(hits, 0);
    });

    testWidgets('renders ConvexGapCard without designSystem', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: null,
              child: const Scaffold(
                body: OneUiButton(label: 'Broken'),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.text('Broken'), findsNothing);
    });

    testWidgets('all Figma numeric sizes render', (tester) async {
      for (final size in [6, 8, 10, 12]) {
        await tester.pumpWidget(
            pumpButtonApp(OneUiButton(label: 'S$size', size: size)));
        await tester.pumpAndSettle();
        expect(find.text('S$size'), findsOneWidget);
      }
    });

    testWidgets('t-shirt size aliases resolve', (tester) async {
      for (final alias in ['xs', 's', 'm', 'l']) {
        await tester.pumpWidget(
            pumpButtonApp(OneUiButton(label: alias, sizeAlias: alias)));
        await tester.pumpAndSettle();
        expect(find.text(alias), findsOneWidget);
      }
    });

    testWidgets('deprecated numeric size coerces without throwing',
        (tester) async {
      await tester.pumpWidget(
          pumpButtonApp(const OneUiButton(label: 'Coerced', size: 14)));
      await tester.pumpAndSettle();
      expect(find.text('Coerced'), findsOneWidget);
      expect(oneUiResolveButtonSizeStep(size: 14), 12);
    });

    testWidgets('variants render', (tester) async {
      for (final variant in OneUiButtonVariant.values) {
        await tester.pumpWidget(
          pumpButtonApp(OneUiButton(label: 'v', variant: variant)),
        );
        await tester.pumpAndSettle();
        expect(find.text('v'), findsOneWidget);
      }
    });

    testWidgets('appearances resolve surface tokens', (tester) async {
      const roles = [
        'primary',
        'secondary',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
        'neutral',
      ];
      for (final appearance in roles) {
        await tester.pumpWidget(
          pumpButtonApp(OneUiButton(label: appearance, appearance: appearance)),
        );
        await tester.pumpAndSettle();
        expect(find.text(appearance), findsOneWidget);
      }
    });

    testWidgets('attention maps to variant', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'H', attention: OneUiButtonAttention.high),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('H'), findsOneWidget);

      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'M', attention: OneUiButtonAttention.medium),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'L', attention: OneUiButtonAttention.low),
        ),
      );
      await tester.pumpAndSettle();
    });

    testWidgets('explicit variant overrides attention', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'O',
            variant: OneUiButtonVariant.ghost,
            attention: OneUiButtonAttention.high,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('O'), findsOneWidget);
    });

    testWidgets('condensed and fullWidth render', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'C', condensed: true),
        ),
      );
      await tester.pumpAndSettle();
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'W', fullWidth: true),
        ),
      );
      await tester.pumpAndSettle();
    });

    testWidgets('contained false renders transparent uncontained form',
        (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'Flat', contained: false),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(find.text('Flat'), findsOneWidget);
      final boxes = tester.widgetList<DecoratedBox>(find.byType(DecoratedBox));
      expect(
        boxes.any(
          (d) =>
              d.decoration is BoxDecoration &&
              (d.decoration as BoxDecoration).color?.alpha == 0,
        ),
        isTrue,
      );
    });

    testWidgets('contained false ignores condensed and fullWidth',
        (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Flat layout',
            contained: false,
            condensed: true,
            fullWidth: true,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(find.text('Flat layout'), findsOneWidget);
      expect(find.byType(ConvexGapCard), findsNothing);
    });

    testWidgets('contained false ghost uses high text colour', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Ghost link',
            contained: false,
            attention: OneUiButtonAttention.low,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      final text = tester.widget<Text>(find.text('Ghost link'));
      expect(text.style?.color, isNotNull);
      expect(text.style!.color!.alpha, greaterThan(0));
    });

    testWidgets(
        'contained false minHeight follows --LinkButton-minHeight override',
        (tester) async {
      final ds = _minimalButtonDesignSystem();
      final overridden = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          ...ds.componentCustomProperties,
          '--LinkButton-minHeight-10': '48px',
        },
        'dimensionContexts': ds.dimensionContexts,
        'activeDimensionKey': ds.activeDimensionKey,
        'activeDimensionContext': ds.activeDimensionContext,
      })!;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: overridden,
              child: const Scaffold(
                body: Center(
                  child: OneUiButton(
                    label: 'Token sized',
                    size: 10,
                    contained: false,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await _pumpButtonLayout(tester);

      final constrained = tester.widget<ConstrainedBox>(
        find
            .descendant(
              of: find.byType(OneUiButton),
              matching: find.byType(ConstrainedBox),
            )
            .first,
      );
      expect(constrained.constraints.minHeight, 48);
    });

    testWidgets('contained false icon slot uses --LinkButton-iconSize override',
        (tester) async {
      final ds = _minimalButtonDesignSystem();
      final overridden = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          ...ds.componentCustomProperties,
          '--LinkButton-iconSize-10': '28px',
        },
        'dimensionContexts': ds.dimensionContexts,
        'activeDimensionKey': ds.activeDimensionKey,
        'activeDimensionContext': ds.activeDimensionContext,
      })!;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: overridden,
              child: const Scaffold(
                body: Center(
                  child: OneUiButton(
                    label: 'With icon',
                    size: 10,
                    contained: false,
                    start: OneUiButtonSlotIcon(),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await _pumpButtonLayout(tester);

      final iconBox = tester.widget<SizedBox>(
        find
            .descendant(
              of: find.byType(OneUiButton),
              matching: find.byWidgetPredicate(
                (w) => w is SizedBox && w.width == 28 && w.height == 28,
              ),
            )
            .first,
      );
      expect(iconBox.width, 28);
      expect(iconBox.height, 28);
    });

    testWidgets('start and end slots', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Slots',
            start: const Icon(Icons.star, size: 14, semanticLabel: ''),
            end: const Icon(Icons.chevron_right, size: 14, semanticLabel: ''),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
    });

    testWidgets('start slot propagates button appearance to nested OneUiIcon', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Delete',
            appearance: 'negative',
            start: OneUiIcon(icon: 'delete'),
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=negative|data-emphasis=high',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('start widget wins over semantic icon string', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Prec',
            start: const Icon(Icons.favorite, size: 14, semanticLabel: ''),
            startSemanticIcon: 'bogus',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets(
        'loading keeps label in tree but hidden — Figma layout preserve',
        (tester) async {
      await tester.pumpWidget(
          pumpButtonApp(const OneUiButton(label: 'Still', loading: true)));
      await _pumpButtonLayout(tester);
      expect(find.text('Still'), findsOneWidget);
      final hiddenLabel = tester.widget<Visibility>(
        find.descendant(
          of: find.byType(OneUiButton),
          matching: find.ancestor(
            of: find.text('Still'),
            matching: find.byType(Visibility),
          ),
        ),
      );
      expect(hiddenLabel.visible, isFalse);
      expect(hiddenLabel.maintainSize, isTrue);
    });

    testWidgets('loading hides start and end slots while preserving layout',
        (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Busy',
            loading: true,
            start: const Icon(Icons.star, size: 14, semanticLabel: ''),
            end: const Icon(Icons.chevron_right, size: 14, semanticLabel: ''),
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      final hiddenSlots = tester.widgetList<Visibility>(
        find.descendant(
            of: find.byType(OneUiButton), matching: find.byType(Visibility)),
      );
      expect(
          hiddenSlots.where((v) => !v.visible).length, greaterThanOrEqualTo(3));
    });

    testWidgets('shows progress indicator while loading', (tester) async {
      await tester.pumpWidget(
          pumpButtonApp(const OneUiButton(label: 'Busy', loading: true)));
      await _pumpButtonLayout(tester);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    testWidgets('loading spinner size matches Button SPINNER_SIZE_MAP',
        (tester) async {
      const map = <int, String>{6: 'XS', 8: 'S', 10: 'M', 12: 'L'};
      for (final entry in map.entries) {
        await tester.pumpWidget(
          pumpButtonApp(
            OneUiButton(label: 'Load', size: entry.key, loading: true),
          ),
        );
        await _pumpButtonLayout(tester);
        final cpi = tester.widget<OneUiCircularProgressIndicator>(
          find.byType(OneUiCircularProgressIndicator),
        );
        expect(cpi.size, entry.value, reason: 'button f-step ${entry.key}');
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('child overrides label rendering', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'ignored',
            child: const Text('CUSTOM'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('CUSTOM'), findsOneWidget);
    });
  });

  group('OneUiButton semantics / a11y', () {
    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(const OneUiButton(label: 'Save', testId: 'save-button')),
      );
      expect(find.byKey(const ValueKey('save-button')), findsOneWidget);
    });

    testWidgets('expose button role + label via semantics', (tester) async {
      await tester.pumpWidget(pumpButtonApp(const OneUiButton(label: 'Hello')));
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.label, contains('Hello'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('marks disabled (not enabled)', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(const OneUiButton(label: 'Off', disabled: true)),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.label, contains('Off'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('loading disables actions and adds Loading hint',
        (tester) async {
      await tester.pumpWidget(
          pumpButtonApp(const OneUiButton(label: 'Wait', loading: true)));
      await _pumpButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.label, contains('Wait'));
        expect(d.hint, contains('Loading'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
        expect(d.label, contains('Loading'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsLabel overrides computed label', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'X', semanticsLabel: 'Custom label'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.text('X'), findsOneWidget);
        final d = _buttonSemanticsData(tester);
        // Parent [Semantics.label] merges with visible text (RN/web hide duplicate via a11y tree).
        expect(d.label, contains('Custom label'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('merge semanticsHint with busy hint', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Menu',
            loading: true,
            semanticsHint: 'Opens panel',
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.hint, 'Opens panel. Loading');
        expect(d.label, contains('Menu'));
        expect(d.label, contains('Loading'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('expanded state for disclosures', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Disclose',
            semanticsExpanded: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isExpanded), isTrue);
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('excludeFromSemantics hides control', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Hidden',
            excludeFromSemantics: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('forceFocusRing paints visible focus halo', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(
            label: 'Focused preview',
            forceFocusRing: true,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      final focusInteractive = tester.widget<OneUiFocusInteractive>(
        find.byWidgetPredicate(
            (w) => w is OneUiFocusInteractive && w.forceFocusRing),
      );
      expect(focusInteractive.forceFocusRing, isTrue);
      expect(focusInteractive.focusRing, isNotNull);
      expect(_countFocusHaloDecorations(tester), greaterThanOrEqualTo(1));
    });

    testWidgets('focus ring resolves without dimension Focus-Outline hex',
        (tester) async {
      final ds = _minimalButtonDesignSystem();
      final stripped = NativeDesignSystemPayload(
        componentCustomProperties: ds.componentCustomProperties,
        dimensionContexts: const [],
        activeDimensionKey: 'S:default',
      );
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: stripped,
              child: Scaffold(
                body: Center(
                  child: OneUiButton(
                    label: 'Ring',
                    forceFocusRing: true,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(_countFocusHaloDecorations(tester), greaterThanOrEqualTo(1));
    });

    testWidgets('semanticsControls passes control IDs', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Owns',
            semanticsControlsSemanticsIdentifiers: {'panel-region'},
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _buttonSemanticsData(tester);
        expect(d.controlsNodes, isNotNull);
        expect(d.controlsNodes!.contains('panel-region'), isTrue);
      } finally {
        handle.dispose();
      }
    });
  });

  group('OneUiButton keyboard / focus', () {
    testWidgets('is focusable via Tab', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(const OneUiButton(label: 'Tab target')),
      );
      await _pumpButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await _pumpButtonLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('autofocus requests initial focus', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(
          const OneUiButton(label: 'Autofocus', autofocus: true),
        ),
      );
      await _pumpButtonLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('Enter activates onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Activate',
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('Space activates onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Activate',
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onClick fires on keyboard Enter', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Click alias',
            autofocus: true,
            onClick: () => hits++,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('keyboard does not activate when disabled', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          OneUiButton(
            label: 'Disabled',
            disabled: true,
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpButtonLayout(tester);
      expect(hits, 0);
    });
  });

  group('OneUiSemanticButtonType', () {
    testWidgets('submit validates form before callback', (tester) async {
      var submits = 0;
      await tester.pumpWidget(
        pumpButtonApp(
          Form(
            autovalidateMode: AutovalidateMode.disabled,
            child: Column(
              children: [
                TextFormField(
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'required' : null,
                ),
                OneUiButton(
                  label: 'Send',
                  semanticButtonType: OneUiSemanticButtonType.submit,
                  onPressed: () => submits++,
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();
      expect(submits, 0);

      await tester.enterText(find.byType(TextFormField), 'ok');
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();
      expect(submits, 1);
    });
  });

  group('OneUiButton a11y regressions', () {
    Future<List<String>> captureDebugPrints(
        Future<void> Function() body) async {
      final captured = <String>[];
      final previous = debugPrint;
      debugPrint = (String? message, {int? wrapWidth}) {
        if (message != null) captured.add(message);
      };
      try {
        await body();
      } finally {
        debugPrint = previous;
      }
      return captured;
    }

    testWidgets('loading does not print CPI semantics warnings',
        (tester) async {
      final prints = await captureDebugPrints(() async {
        await tester.pumpWidget(
          pumpButtonApp(const OneUiButton(label: 'Submit', loading: true)),
        );
        await _pumpButtonLayout(tester);
      });

      expect(
        prints.where((line) =>
            line.contains('OneUiCircularProgressIndicator: semanticsLabel')),
        isEmpty,
      );
    });

    testWidgets(
        'arrow_forward semantic icon resolves without unknown-icon warning',
        (tester) async {
      final prints = await captureDebugPrints(() async {
        await tester.pumpWidget(
          pumpButtonApp(
            const OneUiButton(
              label: 'Next',
              end: OneUiIcon(
                  icon: 'arrow_forward', emphasis: OneUiIconEmphasis.high),
            ),
          ),
        );
        await _pumpButtonLayout(tester);
      });

      expect(
        prints
            .where((line) => line.startsWith('One UI: unknown semantic icon')),
        isEmpty,
      );
      expect(find.byIcon(Icons.arrow_forward), findsOneWidget);
    });

    testWidgets(
        'enforces 44px min height on touch platforms when token is below floor',
        (tester) async {
      await tester.pumpWidget(pumpButtonApp(const OneUiButton(label: 'Tap')));
      await _pumpButtonLayout(tester);
      expect(tester.getSize(_buttonSemanticsFinder()).height,
          greaterThanOrEqualTo(44));
    });

    testWidgets('condensed meets 44px touch floor on mobile', (tester) async {
      await tester.pumpWidget(
        pumpButtonApp(const OneUiButton(label: 'C', condensed: true)),
      );
      await _pumpButtonLayout(tester);
      expect(tester.getSize(_buttonSemanticsFinder()).height,
          greaterThanOrEqualTo(44));
    });
  });
}
