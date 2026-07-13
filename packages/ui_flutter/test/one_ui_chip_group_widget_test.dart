/// Widget tests for [OneUiChipGroup] — mirrors ChipGroup.test.tsx selection behavior.
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_a11y.dart';

NativeDesignSystemPayload _minimalDesignSystem() {
  final props = <String, dynamic>{
    '--Chip-borderRadius': '9999px',
    '--Chip-fontWeight': '500',
    '--Chip-borderWidth': '1px',
    '--Disabled-Opacity': '0.5',
    '--Motion-Duration-M': '200ms',
    '--Motion-Tap-Scale-Default': '3',
    '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.5, 0, 0.3, 1)',
  };
  for (final sz in ['s', 'm', 'l']) {
    props['--Chip-height-$sz'] = '24px';
    props['--Chip-paddingHorizontal-$sz'] = '10px';
    props['--Chip-paddingHorizontal-$sz-slot'] = '4px';
    props['--Chip-gap-$sz'] = '4px';
    props['--Chip-fontSize-$sz'] = '14px';
    props['--Chip-lineHeight-$sz'] = '20px';
  }
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-1': '4px',
        '--Spacing-2': '8px',
        '--Spacing-3': '10px',
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

NativeTypographySnapshot _minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
      },
      'weights': {'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

ThemeConfig _minimalThemeConfig() {
  final grey = buildGreyscalePalette();
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition('primary', grey, 600),
      'secondary': buildScaleDefinition('secondary', grey, 600),
      'neutral': buildScaleDefinition('neutral', grey, 600),
    },
  );
}

Widget pumpGroupApp(Widget child) {
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
        designSystem: _minimalDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

SemanticsData _chipSemantics(WidgetTester tester, String label) {
  return tester
      .getSemantics(find.bySemanticsLabel(label).first)
      .getSemanticsData();
}

void main() {
  group('OneUiChipGroup functional', () {
    testWidgets('single select replaces selection', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            defaultValue: const ['a'],
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(_chipSemantics(tester, 'A').hasFlag(SemanticsFlag.isSelected),
          isTrue);

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(_chipSemantics(tester, 'A').hasFlag(SemanticsFlag.isSelected),
          isFalse);
      expect(_chipSemantics(tester, 'B').hasFlag(SemanticsFlag.isSelected),
          isTrue);
    });

    testWidgets('required blocks deselect of last chip', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            required: true,
            defaultValue: const ['a'],
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(_chipSemantics(tester, 'A').hasFlag(SemanticsFlag.isSelected),
          isTrue);
    });

    testWidgets('maxSelections blocks third chip in multi mode',
        (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            multiple: true,
            maxSelections: 2,
            defaultValue: const ['a'],
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
              OneUiChip(value: 'c', child: 'C', semanticsLabel: 'C'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(_chipSemantics(tester, 'B').hasFlag(SemanticsFlag.isSelected),
          isTrue);

      await tester.tap(find.text('C'));
      await tester.pumpAndSettle();
      expect(_chipSemantics(tester, 'C').hasFlag(SemanticsFlag.isSelected),
          isFalse);
    });

    testWidgets('disabled group disables chip interaction', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            disabled: true,
            onValueChange: (_) => calls++,
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('A'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(calls, 0);
    });

    testWidgets('containerType wrap uses Wrap layout', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            containerType: 'wrap',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(Wrap), findsOneWidget);
      expect(find.byType(SingleChildScrollView), findsNothing);
    });

    testWidgets('containerType inline uses horizontal scroll row',
        (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            containerType: 'inline',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SingleChildScrollView), findsOneWidget);
      expect(find.byType(Wrap), findsNothing);
    });

    testWidgets('size propagates to child chips', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            size: 'l',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>).value.startsWith('oneui-chip|') &&
              (w.key! as ValueKey<String>).value.contains('data-size=l'),
        ),
        findsNWidgets(2),
      );
    });

    testWidgets('root KeyedSubtree encodes data-* payload key', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            size: 'm',
            containerType: 'wrap',
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>)
                  .value
                  .startsWith('oneui-chip-group') &&
              (w.key! as ValueKey<String>)
                  .value
                  .contains('data-container-type=wrap'),
        ),
        findsOneWidget,
      );
    });
  });

  group('OneUiChipGroup keyboard / loopFocus', () {
    Future<void> _focusChip(WidgetTester tester, String label) async {
      final focus = find.byWidgetPredicate(
        (w) => w is Focus && w.debugLabel == label,
      );
      tester.widget<Focus>(focus).focusNode!.requestFocus();
      await tester.pump();
    }

    testWidgets('arrow right moves focus to next chip (horizontal)',
        (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
              OneUiChip(value: 'c', child: 'C', semanticsLabel: 'C'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await _focusChip(tester, 'A');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'B');
    });

    testWidgets('loopFocus wraps from last to first', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            loopFocus: true,
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await _focusChip(tester, 'B');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'A');
    });

    testWidgets('loopFocus false clamps at last chip', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            loopFocus: false,
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await _focusChip(tester, 'B');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'B');
    });

    testWidgets('arrow down moves focus on vertical orientation',
        (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            orientation: 'vertical',
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await _focusChip(tester, 'A');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'B');
    });

    testWidgets('skips disabled chip in roving order', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            semanticsLabel: 'Categories',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
              OneUiChip(
                  value: 'b', child: 'B', semanticsLabel: 'B', disabled: true),
              OneUiChip(value: 'c', child: 'C', semanticsLabel: 'C'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await _focusChip(tester, 'A');

      await tester.sendKeyDownEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(FocusManager.instance.primaryFocus?.debugLabel, 'C');
    });
  });

  group('OneUiChipGroup a11y', () {
    test('getChipGroupAccessibilityProps exposes group when labelled', () {
      final p =
          getChipGroupAccessibilityProps(semanticsLabel: 'Category filter');
      expect(p.exposeGroup, isTrue);
      expect(p.label, 'Category filter');
    });

    test('group without name does not expose container semantics', () {
      final p = getChipGroupAccessibilityProps();
      expect(p.exposeGroup, isFalse);
    });

    testWidgets('group semantics label on container', (tester) async {
      await tester.pumpWidget(
        pumpGroupApp(
          OneUiChipGroup(
            semanticsLabel: 'Filters',
            children: [
              OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Filters'), findsWidgets);
      } finally {
        handle.dispose();
      }
    });
  });
}
