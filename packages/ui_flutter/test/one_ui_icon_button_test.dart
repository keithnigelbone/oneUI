/// Functional + accessibility tests for [OneUiIconButton].
///
/// Mirrors `packages/ui/src/components/IconButton/IconButton.test.tsx` and
/// `packages/ui-native/src/components/IconButton/interface.ts` (`useIconButtonState`).
library;
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';

NativeDesignSystemPayload _minimalIconButtonDesignSystem() {
  final props = <String, dynamic>{
    '--IconButton-borderRadius': '9999px',
    '--Disabled-Opacity': '0.38',
    '--Loading-Opacity': '0.38',
  };

  for (final sz in ['4', '6', '8', '10', '12', '14']) {
    props['--IconButton-containerSize-$sz'] = '40px';
    props['--IconButton-iconSize-$sz'] = '20px';
    props['--IconButton-containerSize-$sz-condensed'] = '36px';
    props['--IconButton-condensedContainerSize-$sz'] = '36px';
  }
  for (final v in ['bold', 'subtle', 'ghost']) {
    props['--IconButton-borderWidth-$v'] = '0px';
  }

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': {
        '--Stroke-XL': '2px',
        '--Focus-Outline-Width': '2px',
        '--Focus-Outline': '#0000aa',
        '--Surface-Halo-Gap': '#ffffff',
        '--Surface-Main': '#ffffff',
        '--Shape-Pill': '9999px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig _minimalThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'neutral',
        'secondary',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition('Role', grey, 1300),
    },
  );
}

Widget pumpIconButtonApp(Widget child) {
  final root = buildRootSurfaceContext(
    themeConfig: _minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: _minimalIconButtonDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> _pumpIconButtonLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Finder _iconButtonSemanticsFinder() => find.byType(OneUiFocusInteractive);

SemanticsData _iconButtonSemanticsData(WidgetTester tester) =>
    tester.getSemantics(_iconButtonSemanticsFinder()).getSemanticsData();

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

OneUiIconButtonResolvedState _state({
  OneUiIconButtonVariant? variant,
  OneUiIconButtonAttention? attention,
  String? appearance,
  bool disabled = false,
  bool loading = false,
  int size = 10,
  String? sizeAlias,
  bool condensed = false,
  OneUiIconButtonLayout layout = OneUiIconButtonLayout.square,
}) {
  return resolveOneUiIconButtonState(
    variant: variant,
    attention: attention,
    appearance: appearance,
    disabled: disabled,
    loading: loading,
    size: size,
    sizeAlias: sizeAlias,
    condensed: condensed,
    layout: layout,
  );
}

void main() {
  group('resolveOneUiIconButtonState', () {
    group('attention / variants', () {
      test('maps attention high to bold', () {
        final s = _state(attention: OneUiIconButtonAttention.high);
        expect(s.variant, OneUiIconButtonVariant.bold);
        expect(s.dataVariant, 'bold');
      });

      test('maps attention medium to subtle', () {
        final s = _state(attention: OneUiIconButtonAttention.medium);
        expect(s.variant, OneUiIconButtonVariant.subtle);
        expect(s.dataVariant, 'subtle');
      });

      test('maps attention low to ghost', () {
        final s = _state(attention: OneUiIconButtonAttention.low);
        expect(s.variant, OneUiIconButtonVariant.ghost);
        expect(s.dataVariant, 'ghost');
      });

      test('variant overrides attention', () {
        final s = _state(
          variant: OneUiIconButtonVariant.ghost,
          attention: OneUiIconButtonAttention.high,
        );
        expect(s.variant, OneUiIconButtonVariant.ghost);
        expect(s.dataVariant, 'ghost');
      });

      test('defaults to bold when neither variant nor attention', () {
        final s = _state();
        expect(s.variant, OneUiIconButtonVariant.bold);
        expect(s.dataVariant, 'bold');
      });

      for (final v in OneUiIconButtonVariant.values) {
        test('variant $v exposes data-variant', () {
          final s = _state(variant: v);
          expect(s.dataVariant, oneUiIconButtonVariantSuffix(v));
        });
      }
    });

    group('sizes', () {
      for (final entry in <(int, String)>[
        (4, '4'),
        (6, '6'),
        (8, '8'),
        (10, '10'),
        (12, '12'),
        (14, '14'),
      ]) {
        test('numeric size ${entry.$1} → data-size ${entry.$2}', () {
          final s = _state(size: entry.$1);
          expect(s.numericSize, entry.$1);
          expect(s.dataSize, entry.$2);
        });
      }

      test('defaults to size 10', () {
        expect(_state().dataSize, '10');
      });

      for (final entry in <(String, String)>[
        ('2xs', '4'),
        ('xs', '6'),
        ('s', '8'),
        ('m', '10'),
        ('l', '12'),
        ('xl', '14'),
      ]) {
        test('alias "${entry.$1}" → data-size ${entry.$2}', () {
          final s = _state(sizeAlias: entry.$1);
          expect(s.dataSize, entry.$2);
        });
      }

      test('legacy alias small → 8', () {
        expect(_state(sizeAlias: 'small').dataSize, '8');
      });

      test('legacy alias medium → 10', () {
        expect(_state(sizeAlias: 'medium').dataSize, '10');
      });

      test('legacy alias large → 12', () {
        expect(_state(sizeAlias: 'large').dataSize, '12');
      });
    });

    group('contained / condensed', () {
      test('data-condensed omitted when uncontained even if condensed true',
          () {
        expect(
          resolveOneUiIconButtonState(condensed: true, contained: false)
              .dataCondensed,
          isNull,
        );
      });

      test('data-condensed set when contained and condensed', () {
        expect(
          resolveOneUiIconButtonState(condensed: true, contained: true)
              .dataCondensed,
          isTrue,
        );
      });
    });

    group('appearances', () {
      test('resolves auto appearance to primary', () {
        expect(_state(appearance: 'auto').dataAppearance, 'primary');
      });

      test('resolves empty appearance to primary', () {
        expect(_state(appearance: '').dataAppearance, 'primary');
      });

      for (final role in [
        'neutral',
        'secondary',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ]) {
        test('appearance $role', () {
          expect(_state(appearance: role).dataAppearance, role);
        });
      }
    });

    group('condensed / layout / loading data attrs', () {
      test('dataCondensed when condensed', () {
        expect(_state(condensed: true).dataCondensed, isTrue);
      });

      test('no dataCondensed when not condensed', () {
        expect(_state().dataCondensed, isNull);
      });

      test('dataLayout 3:2 when wide', () {
        expect(
          _state(layout: OneUiIconButtonLayout.wide).dataLayout,
          '3:2',
        );
      });

      test('no dataLayout when square', () {
        expect(_state().dataLayout, isNull);
      });

      test('dataLoading when loading', () {
        expect(_state(loading: true).dataLoading, isTrue);
      });

      test('isDisabled when disabled or loading', () {
        expect(_state(disabled: true).isDisabled, isTrue);
        expect(_state(loading: true).isDisabled, isTrue);
      });
    });
  });

  group('OneUiIconButton functional', () {
    testWidgets('renders semantic icon name', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add item'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(OneUiIconButton), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('renders custom icon widget', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: Icon(Icons.add, key: Key('custom-icon')),
            semanticsLabel: 'Custom',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byKey(const Key('custom-icon')), findsOneWidget);
    });

    testWidgets('testId finds control (web data-testid / RN testID)',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            testId: 'icon-btn',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byKey(const ValueKey('icon-btn')), findsOneWidget);
    });

    testWidgets('testId emits Semantics.identifier for AT / Appium',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            testId: 'icon-btn',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.byType(OneUiFocusInteractive))
            .getSemanticsData();
        expect(data.identifier, 'icon-btn');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('invokes onPressed when tapped', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton));
      await _pumpIconButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onPress alias invokes callback', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            onPress: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton));
      await _pumpIconButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onClick alias invokes callback', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            onClick: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton));
      await _pumpIconButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onPressed takes precedence over onClick', (tester) async {
      var pressHits = 0;
      var clickHits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            onPressed: () => pressHits++,
            onClick: () => clickHits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton));
      await _pumpIconButtonLayout(tester);
      expect(pressHits, 1);
      expect(clickHits, 0);
    });

    testWidgets('disabled blocks press', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            disabled: true,
            semanticsLabel: 'Disabled',
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton), warnIfMissed: false);
      await _pumpIconButtonLayout(tester);
      expect(hits, 0);
    });

    testWidgets('loading blocks press', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            loading: true,
            semanticsLabel: 'Loading',
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.tap(find.byType(OneUiIconButton), warnIfMissed: false);
      await _pumpIconButtonLayout(tester);
      expect(hits, 0);
    });

    testWidgets('loading shows spinner instead of icon', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            loading: true,
            semanticsLabel: 'Loading',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
      expect(find.byType(OneUiSemanticIcon), findsNothing);
    });

    testWidgets('loading spinner size matches IconButton SPINNER_SIZE_MAP',
        (tester) async {
      const map = <int, String>{
        4: '2XS',
        6: 'XS',
        8: 'S',
        10: 'M',
        12: 'L',
        14: 'XL'
      };
      for (final entry in map.entries) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(
              icon: 'add',
              size: entry.key,
              loading: true,
              semanticsLabel: 'Loading',
            ),
          ),
        );
        await _pumpIconButtonLayout(tester);
        final cpi = tester.widget<OneUiCircularProgressIndicator>(
          find.byType(OneUiCircularProgressIndicator),
        );
        expect(cpi.size, entry.value,
            reason: 'icon button f-step ${entry.key}');
        expect(cpi.variant, 'indeterminate');
        expect(cpi.trackColor, Colors.transparent);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('not loading shows icon not spinner', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(OneUiCircularProgressIndicator), findsNothing);
      expect(find.byType(OneUiSemanticIcon), findsOneWidget);
    });

    testWidgets('all attention levels render', (tester) async {
      for (final a in OneUiIconButtonAttention.values) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(
              icon: 'add',
              attention: a,
              semanticsLabel: a.name,
            ),
          ),
        );
        await _pumpIconButtonLayout(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('all variants render', (tester) async {
      for (final v in OneUiIconButtonVariant.values) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(
              icon: 'add',
              variant: v,
              semanticsLabel: v.name,
            ),
          ),
        );
        await _pumpIconButtonLayout(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('Figma numeric sizes render', (tester) async {
      for (final sz in [4, 6, 8, 10, 12, 14]) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(icon: 'add', size: sz, semanticsLabel: 'S$sz'),
          ),
        );
        await _pumpIconButtonLayout(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('t-shirt size aliases render', (tester) async {
      for (final alias in ['2xs', 'xs', 's', 'm', 'l', 'xl']) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(
              icon: 'add',
              sizeAlias: alias,
              semanticsLabel: alias,
            ),
          ),
        );
        await _pumpIconButtonLayout(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
    });

    testWidgets('condensed and wide layout render', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            condensed: true,
            semanticsLabel: 'Condensed',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);

      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            layout: OneUiIconButtonLayout.wide,
            semanticsLabel: 'Wide',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('fullWidth renders', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            fullWidth: true,
            semanticsLabel: 'Full',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgets('appearance auto resolves without gap card', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            appearance: 'auto',
            semanticsLabel: 'Auto',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('contained false renders transparent uncontained form',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            contained: false,
            semanticsLabel: 'Flat',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
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
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            contained: false,
            condensed: true,
            fullWidth: true,
            semanticsLabel: 'Flat layout',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('contained false ghost uses visible icon colour',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            contained: false,
            attention: OneUiIconButtonAttention.low,
            semanticsLabel: 'Ghost',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final icon =
          tester.widget<OneUiSemanticIcon>(find.byType(OneUiSemanticIcon));
      expect(icon.color, isNotNull);
      expect(icon.color!.alpha, greaterThan(0));
    });

    testWidgets('appearances resolve for configured roles', (tester) async {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'positive',
        'negative',
      ]) {
        await tester.pumpWidget(
          pumpIconButtonApp(
            OneUiIconButton(
              icon: 'add',
              appearance: role,
              semanticsLabel: role,
            ),
          ),
        );
        await _pumpIconButtonLayout(tester);
        expect(find.byType(OneUiIconButton), findsOneWidget);
      }
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
            child: const OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: null,
              child: Scaffold(
                body: OneUiIconButton(icon: 'add', semanticsLabel: 'Broken'),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
    });

    testWidgets('enabled control wires pointer cursor on focus interactive',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(
        find.descendant(
          of: find.byType(OneUiFocusInteractive),
          matching: find.byWidgetPredicate(
            (w) => w is MouseRegion && w.cursor == SystemMouseCursors.click,
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgets('disabled control wires not-allowed cursor', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            disabled: true,
            semanticsLabel: 'Off',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(
        find.descendant(
          of: find.byType(OneUiFocusInteractive),
          matching: find.byWidgetPredicate(
            (w) => w is MouseRegion && w.cursor == SystemMouseCursors.forbidden,
          ),
        ),
        findsOneWidget,
      );
    });
  });

  group('OneUiIconButton semantics / a11y', () {
    testWidgets('button role + aria-label via semanticsLabel', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add item'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.label, contains('Add item'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled announces not enabled (aria-disabled)',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            disabled: true,
            semanticsLabel: 'Add',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.label, contains('Add'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('loading announces busy + Loading hint (aria-busy)',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            loading: true,
            semanticsLabel: 'Add',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.label, contains('Add'));
        expect(d.hint, contains('Loading'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint merges with loading hint', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            loading: true,
            semanticsLabel: 'Menu',
            semanticsHint: 'Opens panel',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.hint, 'Opens panel. Loading');
        expect(d.label, contains('Menu'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint without loading', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Menu',
            semanticsHint: 'Opens panel',
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.hint, 'Opens panel');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('expanded state (aria-expanded)', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Disclose',
            semanticsExpanded: true,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isExpanded), isTrue);
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('collapsed expanded state', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Disclose',
            semanticsExpanded: false,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _iconButtonSemanticsData(tester);
        expect(d.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isExpanded), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('icon glyph excluded from separate semantics (aria-hidden)',
        (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Add'), findsOneWidget);
        // Decorative icon must not duplicate the accessible name as a second node.
        expect(find.bySemanticsLabel('add'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('is focusable via keyboard', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(icon: 'add', semanticsLabel: 'Add'),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await _pumpIconButtonLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('autofocus requests initial focus', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            autofocus: true,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('Space activates control', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpIconButtonApp(
          OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Add',
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpIconButtonLayout(tester);
      expect(hits, 1);
    });

    testWidgets('forceFocusRing paints visible focus halo', (tester) async {
      await tester.pumpWidget(
        pumpIconButtonApp(
          const OneUiIconButton(
            icon: 'add',
            semanticsLabel: 'Focused preview',
            forceFocusRing: true,
          ),
        ),
      );
      await _pumpIconButtonLayout(tester);
      final focusInteractive = tester.widget<OneUiFocusInteractive>(
        find.byWidgetPredicate(
          (w) => w is OneUiFocusInteractive && w.forceFocusRing,
        ),
      );
      expect(focusInteractive.forceFocusRing, isTrue);
      expect(focusInteractive.focusRing, isNotNull);
      expect(_countFocusHaloDecorations(tester), greaterThanOrEqualTo(1));
    });
  });
}
