/// Functional + accessibility tests for [OneUiSelectableIconButton].
///
/// Mirrors `packages/ui/src/components/SelectableIconButton/SelectableIconButton.test.tsx`
/// and `packages/ui_flutter/test/one_ui_icon_button_test.dart`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_design_system.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_loading_spinner.dart';
import 'package:ui_flutter/widgets/one_ui_selectable_icon_button.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';

NativeDesignSystemPayload _minimalSibDesignSystem() {
  final props = <String, dynamic>{
    '--SelectableIconButton-borderRadius': '9999px',
    '--Disabled-Opacity': '0.38',
    '--Loading-Opacity': '0.38',
    '--Stroke-M': '1px',
  };

  for (final sz in ['4', '6', '8', '10', '12', '14']) {
    props['--SelectableIconButton-containerSize-$sz'] = '40px';
    props['--SelectableIconButton-iconSize-$sz'] = '20px';
    props['--SelectableIconButton-containerSize-$sz-condensed'] = '36px';
    props['--SelectableIconButton-condensedContainerSize-$sz'] = '36px';
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
        '--Stroke-M': '1px',
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

Widget _wrapSibScope({
  required Widget child,
  NativeDesignSystemPayload? designSystem,
}) {
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
        designSystem: designSystem ?? _minimalSibDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Widget pumpSibApp(Widget child) => _wrapSibScope(child: child);

Widget pumpSibAppUnbranded(Widget child) => _wrapSibScope(
      child: child,
      designSystem:
          defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default'),
    );

Future<void> _pumpSib(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Finder _sibSemanticsFinder(String label) => find.bySemanticsLabel(label);

SemanticsData _sibSemanticsData(WidgetTester tester, String label) =>
    tester.getSemantics(_sibSemanticsFinder(label)).getSemanticsData();

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

String? _dataPayloadKey(WidgetTester tester) {
  for (final element in find.byType(KeyedSubtree).evaluate()) {
    final key = element.widget.key;
    if (key is ValueKey<String> && key.value.startsWith('oneui-sib')) {
      return key.value;
    }
  }
  return null;
}

OneUiSelectableIconButtonResolvedState _resolveState({
  OneUiSelectableIconButtonAttention attention =
      OneUiSelectableIconButtonAttention.high,
  String appearance = 'primary',
  int size = 10,
  String? sizeAlias,
  bool condensed = false,
  OneUiSelectableIconButtonShape shape =
      OneUiSelectableIconButtonShape.square,
  bool contained = true,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  bool selected = false,
}) {
  return OneUiSelectableIconButtonResolvedState(
    isDisabled: disabled || loading,
    attention: attention,
    appearance: appearance,
    numericSize:
        oneUiResolveSelectableIconButtonSize(size: size, sizeAlias: sizeAlias),
    contained: contained,
    effectiveCondensed: contained && condensed,
    effectiveFullWidth: contained && fullWidth,
    dataAttrs: oneUiSelectableIconButtonDataAttrs(
      numericSize: oneUiResolveSelectableIconButtonSize(
        size: size,
        sizeAlias: sizeAlias,
      ),
      attention: attention,
      contained: contained,
      condensed: contained && condensed,
      shape: shape,
      loading: loading,
      selected: selected,
    ),
    dataPayloadKey: oneUiSelectableIconButtonDataPayloadKey(
      oneUiSelectableIconButtonDataAttrs(
        numericSize: oneUiResolveSelectableIconButtonSize(
          size: size,
          sizeAlias: sizeAlias,
        ),
        attention: attention,
        contained: contained,
        condensed: contained && condensed,
        shape: shape,
        loading: loading,
        selected: selected,
      ),
    ),
  );
}

void main() {
  group('resolveOneUiSelectableIconButtonState', () {
    testWidgets('[fn] auto appearance resolves via surface', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          Builder(
            builder: (context) {
              final state = resolveOneUiSelectableIconButtonState(
                context: context,
                appearance: 'auto',
              );
              expect(state.appearance, 'primary');
              return const SizedBox.shrink();
            },
          ),
        ),
      );
    });

    group('attention', () {
      for (final entry in <(OneUiSelectableIconButtonAttention, String)>[
        (OneUiSelectableIconButtonAttention.high, 'high'),
        (OneUiSelectableIconButtonAttention.medium, 'medium'),
        (OneUiSelectableIconButtonAttention.low, 'low'),
      ]) {
        test('data-attention ${entry.$2}', () {
          final s = _resolveState(attention: entry.$1);
          expect(s.dataAttrs['data-attention'], entry.$2);
        });
      }

      test('defaults to high attention', () {
        expect(_resolveState().dataAttrs['data-attention'], 'high');
      });
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
          final s = _resolveState(size: entry.$1);
          expect(s.numericSize, entry.$1);
          expect(s.dataAttrs['data-size'], entry.$2);
        });
      }

      test('defaults to size 10', () {
        expect(_resolveState().dataAttrs['data-size'], '10');
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
          final s = _resolveState(sizeAlias: entry.$1);
          expect(s.dataAttrs['data-size'], entry.$2);
        });
      }
    });

    group('contained / condensed / shape', () {
      test('[fn] condensed ignored when uncontained', () {
        final attrs = oneUiSelectableIconButtonDataAttrs(
          numericSize: 10,
          attention: OneUiSelectableIconButtonAttention.high,
          contained: false,
          condensed: true,
          shape: OneUiSelectableIconButtonShape.square,
          loading: false,
          selected: false,
        );
        expect(attrs['data-condensed'], isNull);
      });

      test('data-condensed set when contained and condensed', () {
        expect(_resolveState(condensed: true).dataAttrs['data-condensed'], '');
      });

      test('data-contained defaults true', () {
        expect(_resolveState().dataAttrs['data-contained'], 'true');
      });

      test('data-contained false when uncontained', () {
        expect(
          _resolveState(contained: false).dataAttrs['data-contained'],
          'false',
        );
      });

      test('[fn] shape wide sets data-shape 2:3', () {
        final attrs = oneUiSelectableIconButtonDataAttrs(
          numericSize: 10,
          attention: OneUiSelectableIconButtonAttention.high,
          contained: true,
          condensed: false,
          shape: OneUiSelectableIconButtonShape.wide,
          loading: false,
          selected: true,
        );
        expect(attrs['data-shape'], '2:3');
        expect(attrs['data-pressed'], '');
      });

      test('no data-shape for square default', () {
        expect(_resolveState().dataAttrs['data-shape'], isNull);
      });
    });

    group('selected / loading', () {
      test('data-pressed when selected', () {
        expect(_resolveState(selected: true).dataAttrs['data-pressed'], '');
      });

      test('no data-pressed when unselected', () {
        expect(_resolveState(selected: false).dataAttrs['data-pressed'], isNull);
      });

      test('data-loading when loading', () {
        expect(_resolveState(loading: true).dataAttrs['data-loading'], '');
      });

      test('isDisabled when disabled or loading', () {
        expect(_resolveState(disabled: true).isDisabled, isTrue);
        expect(_resolveState(loading: true).isDisabled, isTrue);
      });
    });

    group('appearances', () {
      testWidgets('resolves auto appearance to primary', (tester) async {
        await tester.pumpWidget(
          pumpSibApp(
            Builder(
              builder: (context) {
                final state = resolveOneUiSelectableIconButtonState(
                  context: context,
                  appearance: 'auto',
                );
                expect(state.appearance, 'primary');
                return const SizedBox.shrink();
              },
            ),
          ),
        );
      });

      for (final role in [
        'neutral',
        'secondary',
        'negative',
        'positive',
      ]) {
        testWidgets('appearance $role', (tester) async {
          await tester.pumpWidget(
            pumpSibApp(
              Builder(
                builder: (context) {
                  final state = resolveOneUiSelectableIconButtonState(
                    context: context,
                    appearance: role,
                  );
                  expect(state.appearance, role);
                  return const SizedBox.shrink();
                },
              ),
            ),
          );
        });
      }
    });
  });

  group('OneUiSelectableIconButton functional', () {
    testWidgets('[fn] renders semantic icon', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(OneUiSelectableIconButton), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
      expect(find.byType(OneUiSemanticIcon), findsOneWidget);
    });

    testWidgets('[fn] renders custom icon widget', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: Icon(Icons.favorite, key: Key('custom-icon')),
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byKey(const Key('custom-icon')), findsOneWidget);
    });

    testWidgets('[fn] testId finds control', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
            testId: 'sib-like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byKey(const ValueKey('sib-like')), findsOneWidget);
    });

    testWidgets('[fn] unbranded designSystem renders without gap card',
        (tester) async {
      await tester.pumpWidget(
        pumpSibAppUnbranded(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('[fn] toggles on tap (uncontrolled)', (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpSibApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiSelectableIconButton(
                icon: 'heart',
                selected: selected,
                onSelectedChange: (v) => setState(() => selected = v),
                semanticsLabel: 'Like',
              );
            },
          ),
        ),
      );
      await _pumpSib(tester);
      expect(selected, isFalse);

      await tester.tap(find.byType(OneUiSelectableIconButton));
      await _pumpSib(tester);
      expect(selected, isTrue);

      await tester.tap(find.byType(OneUiSelectableIconButton));
      await _pumpSib(tester);
      expect(selected, isFalse);
    });

    testWidgets('[fn] respects controlled selected prop', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSibApp(
          OneUiSelectableIconButton(
            icon: 'heart',
            selected: false,
            onSelectedChange: (_) => calls++,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);

      final handle = tester.ensureSemantics();
      try {
        expect(
          _sibSemanticsData(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }

      await tester.tap(find.byType(OneUiSelectableIconButton));
      await _pumpSib(tester);
      expect(calls, 1);

      final handle2 = tester.ensureSemantics();
      try {
        expect(
          _sibSemanticsData(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle2.dispose();
      }

      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            selected: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);

      final handle3 = tester.ensureSemantics();
      try {
        expect(
          _sibSemanticsData(tester, 'Like').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle3.dispose();
      }
    });

    testWidgets('[fn] calls onSelectedChange with new value', (tester) async {
      final values = <bool>[];
      await tester.pumpWidget(
        pumpSibApp(
          OneUiSelectableIconButton(
            icon: 'heart',
            onSelectedChange: values.add,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);

      await tester.tap(find.byType(OneUiSelectableIconButton));
      await _pumpSib(tester);
      expect(values, [true]);

      await tester.tap(find.byType(OneUiSelectableIconButton));
      await _pumpSib(tester);
      expect(values, [true, false]);
    });

    testWidgets('[fn] defaultSelected starts selected', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            defaultSelected: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);

      final handle = tester.ensureSemantics();
      try {
        final data = _sibSemanticsData(tester, 'Like');
        expect(data.hasFlag(SemanticsFlag.hasToggledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isToggled), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[fn] space toggles', (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpSibApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiSelectableIconButton(
                icon: 'heart',
                selected: selected,
                onSelectedChange: (v) => setState(() => selected = v),
                semanticsLabel: 'Like',
                autofocus: true,
              );
            },
          ),
        ),
      );
      await _pumpSib(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpSib(tester);
      expect(selected, isTrue);
    });

    testWidgets('[fn] enter toggles', (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpSibApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiSelectableIconButton(
                icon: 'heart',
                selected: selected,
                onSelectedChange: (v) => setState(() => selected = v),
                semanticsLabel: 'Like',
                autofocus: true,
              );
            },
          ),
        ),
      );
      await _pumpSib(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpSib(tester);
      expect(selected, isTrue);
    });

    testWidgets('[fn] loading disables toggle', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSibApp(
          OneUiSelectableIconButton(
            icon: 'heart',
            loading: true,
            onSelectedChange: (_) => calls++,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      await tester.tap(find.byType(OneUiSelectableIconButton),
          warnIfMissed: false);
      await _pumpSib(tester);
      expect(calls, 0);
    });

    testWidgets('[fn] disabled blocks toggle', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSibApp(
          OneUiSelectableIconButton(
            icon: 'heart',
            disabled: true,
            onSelectedChange: (_) => calls++,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      await tester.tap(find.byType(OneUiSelectableIconButton),
          warnIfMissed: false);
      await _pumpSib(tester);
      expect(calls, 0);
    });

    testWidgets('[fn] loading shows spinner instead of icon', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            loading: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(OneUiLoadingSpinner), findsOneWidget);
      expect(find.byType(OneUiSemanticIcon), findsNothing);
    });

    testWidgets('[fn] not loading shows icon not spinner', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(OneUiLoadingSpinner), findsNothing);
      expect(find.byType(OneUiSemanticIcon), findsOneWidget);
    });

    testWidgets('[fn] all attention levels render', (tester) async {
      for (final a in OneUiSelectableIconButtonAttention.values) {
        await tester.pumpWidget(
          pumpSibApp(
            OneUiSelectableIconButton(
              icon: 'heart',
              attention: a,
              semanticsLabel: a.name,
            ),
          ),
        );
        await _pumpSib(tester);
        expect(find.byType(OneUiSelectableIconButton), findsOneWidget);
      }
    });

    testWidgets('[fn] Figma numeric sizes render', (tester) async {
      for (final sz in [4, 6, 8, 10, 12, 14]) {
        await tester.pumpWidget(
          pumpSibApp(
            OneUiSelectableIconButton(
              icon: 'heart',
              size: sz,
              semanticsLabel: 'S$sz',
            ),
          ),
        );
        await _pumpSib(tester);
        expect(find.byType(OneUiSelectableIconButton), findsOneWidget);
      }
    });

    testWidgets('[fn] t-shirt size aliases render', (tester) async {
      for (final alias in ['2xs', 'xs', 's', 'm', 'l', 'xl']) {
        await tester.pumpWidget(
          pumpSibApp(
            OneUiSelectableIconButton(
              icon: 'heart',
              sizeAlias: alias,
              semanticsLabel: alias,
            ),
          ),
        );
        await _pumpSib(tester);
        expect(find.byType(OneUiSelectableIconButton), findsOneWidget);
      }
    });

    testWidgets('[fn] condensed and wide shape render', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            condensed: true,
            semanticsLabel: 'Condensed',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(_dataPayloadKey(tester), contains('data-condensed'));

      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            shape: OneUiSelectableIconButtonShape.wide,
            semanticsLabel: 'Wide',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(_dataPayloadKey(tester), contains('data-shape=2:3'));
    });

    testWidgets('[fn] fullWidth renders', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            fullWidth: true,
            semanticsLabel: 'Full',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(OneUiSelectableIconButton), findsOneWidget);
    });

    testWidgets('[fn] contained false renders without gap card', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            contained: false,
            semanticsLabel: 'Flat',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('[fn] contained false ignores condensed', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            contained: false,
            condensed: true,
            semanticsLabel: 'Flat',
          ),
        ),
      );
      await _pumpSib(tester);
      expect(_dataPayloadKey(tester), isNot(contains('data-condensed')));
    });

    testWidgets('[fn] contained false ignores wide shape width', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            contained: false,
            shape: OneUiSelectableIconButtonShape.wide,
            semanticsLabel: 'Flat wide',
          ),
        ),
      );
      await _pumpSib(tester);
      final boxes = tester.widgetList<SizedBox>(
        find.descendant(
          of: find.byType(OneUiSelectableIconButton),
          matching: find.byWidgetPredicate(
            (w) =>
                w is SizedBox &&
                w.width != null &&
                w.height != null &&
                w.width == w.height,
          ),
        ),
      );
      expect(boxes.length, greaterThan(0));
      expect(boxes.first.width, 20);
    });

    testWidgets('[fn] appearances resolve for configured roles', (tester) async {
      for (final role in ['primary', 'secondary', 'neutral', 'negative']) {
        await tester.pumpWidget(
          pumpSibApp(
            OneUiSelectableIconButton(
              icon: 'heart',
              appearance: role,
              semanticsLabel: role,
            ),
          ),
        );
        await _pumpSib(tester);
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(find.byType(OneUiFocusInteractive), findsOneWidget);
      }
    });

    testWidgets('[fn] renders ConvexGapCard without designSystem',
        (tester) async {
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
                body: OneUiSelectableIconButton(
                  icon: 'heart',
                  semanticsLabel: 'Broken',
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
    });

    testWidgets('[fn] enabled control wires pointer cursor', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
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

    testWidgets('[fn] disabled control wires not-allowed cursor', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            disabled: true,
            semanticsLabel: 'Off',
          ),
        ),
      );
      await _pumpSib(tester);
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

  group('OneUiSelectableIconButton semantics / a11y', () {
    testWidgets('[a11y] button role + semanticsLabel (aria-label)', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Bookmark post',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Bookmark post');
        expect(d.label, contains('Bookmark post'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] unselected exposes aria-pressed=false', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = _sibSemanticsData(tester, 'Like');
        expect(data.hasFlag(SemanticsFlag.hasToggledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isToggled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] selected exposes toggled semantics (aria-pressed=true)',
        (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            defaultSelected: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = _sibSemanticsData(tester, 'Like');
        expect(data.hasFlag(SemanticsFlag.hasToggledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isToggled), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] disabled announces not enabled (aria-disabled)',
        (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            disabled: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Like');
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] loading announces Loading hint and disables control',
        (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            loading: true,
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Like');
        expect(d.label, contains('Like'));
        expect(d.hint, contains('Loading'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] semanticsHint merges with loading hint', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            loading: true,
            semanticsLabel: 'Like',
            semanticsHint: 'Toggle favourite',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Like');
        expect(d.hint, 'Toggle favourite. Loading');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] semanticsHint without loading', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
            semanticsHint: 'Toggle favourite',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Like');
        expect(d.hint, 'Toggle favourite');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] icon glyph excluded from separate semantics (aria-hidden)',
        (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Like'), findsOneWidget);
        expect(find.bySemanticsLabel('heart'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] testId emits Semantics.identifier for AT / Appium',
        (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
            testId: 'sib-like',
          ),
        ),
      );
      await _pumpSib(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _sibSemanticsData(tester, 'Like');
        expect(d.identifier, 'sib-like');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('[a11y] is focusable via keyboard', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
          ),
        ),
      );
      await _pumpSib(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await _pumpSib(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('[a11y] autofocus requests initial focus', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Like',
            autofocus: true,
          ),
        ),
      );
      await _pumpSib(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('[a11y] forceFocusRing paints visible focus halo', (tester) async {
      await tester.pumpWidget(
        pumpSibApp(
          const OneUiSelectableIconButton(
            icon: 'heart',
            semanticsLabel: 'Focused preview',
            forceFocusRing: true,
          ),
        ),
      );
      await _pumpSib(tester);
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
