/// Widget functional + semantics tests for [OneUiChip].
///
/// Mirrors `packages/ui/src/components/Chip/Chip.test.tsx` and
/// `packages/ui-native/src/components/Chip/ChipA11y.test.ts`.
library;

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
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';

NativeDesignSystemPayload _minimalChipDesignSystem() {
  final props = <String, dynamic>{
    '--Chip-borderRadius': '9999px',
    '--Chip-fontWeight': '500',
    '--Chip-borderWidth': '1px',
    '--Disabled-Opacity': '0.5',
    '--Motion-Duration-M': '200ms',
    '--Motion-Tap-Scale-Default': '3',
    '--Motion-Easing-Transition-Moderate': 'cubic-bezier(0.5, 0, 0.3, 1)',
    '--Stroke-XL': '2px',
    '--Stroke-M': '1px',
    '--Focus-Outline-Width': '2px',
    '--Focus-Outline': '#0000aa',
    '--Surface-Halo-Gap': '#ffffff',
    '--Surface-Main': '#ffffff',
  };

  for (final sz in ['s', 'm', 'l']) {
    props['--Chip-height-$sz'] = sz == 'l' ? '32px' : '24px';
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
        '--Spacing-3': '10px',
        '--Spacing-6': '24px',
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

NativeTypographySnapshot _minimalTypography() {
  return NativeTypographySnapshot.tryParse({
    'label': {
      'sizes': {
        'XS': {'fontSize': 11, 'lineHeight': 16},
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
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
      ])
        role: buildScaleDefinition(role, grey, 600),
    },
  );
}

Widget pumpChipApp(Widget child) {
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
        designSystem: _minimalChipDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> _pumpChipLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

SemanticsData _chipSemanticsByLabel(WidgetTester tester, String label) {
  return tester
      .getSemantics(find.bySemanticsLabel(label).first)
      .getSemanticsData();
}

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

void main() {
  group('OneUiChip functional', () {
    testWidgets('renders child label text', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(OneUiChip(child: 'Filter', semanticsLabel: 'Test chip')),
      );
      await tester.pumpAndSettle();
      expect(find.text('Filter'), findsOneWidget);
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
              designSystem: null,
              child: Scaffold(
                body: OneUiChip(child: 'Broken', semanticsLabel: 'Broken'),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.text('Broken'), findsNothing);
    });

    testWidgets('toggles selected on tap (uncontrolled)', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(OneUiChip(child: 'Toggle', semanticsLabel: 'Toggle chip')),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Toggle chip')
                .hasFlag(SemanticsFlag.isSelected),
            isFalse);
      } finally {
        handle.dispose();
      }

      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();

      final handle2 = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Toggle chip')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
      } finally {
        handle2.dispose();
      }

      await tester.tap(find.text('Toggle'));
      await tester.pumpAndSettle();

      final handle3 = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Toggle chip')
                .hasFlag(SemanticsFlag.isSelected),
            isFalse);
      } finally {
        handle3.dispose();
      }
    });

    testWidgets('starts selected with defaultSelected', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Selected',
            defaultSelected: true,
            semanticsLabel: 'Default selected',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Default selected')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets(
        'controlled selected invokes onSelectedChange without local toggle',
        (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Controlled',
            selected: selected,
            semanticsLabel: 'Controlled',
            onSelectedChange: (bool next, [Object? _]) => selected = next,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Controlled'));
      await tester.pumpAndSettle();
      expect(selected, isTrue);

      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Controlled',
            selected: selected,
            semanticsLabel: 'Controlled',
            onSelectedChange: (bool next, [Object? _]) => selected = next,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Controlled')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('does not toggle when disabled', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Disabled',
            disabled: true,
            semanticsLabel: 'Disabled',
            onSelectedChange: (bool _, [Object? __]) => calls++,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Disabled'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(calls, 0);
    });

    testWidgets('sizes s m l render', (tester) async {
      for (final size in ['s', 'm', 'l']) {
        await tester.pumpWidget(
          pumpChipApp(OneUiChip(size: size, child: size, semanticsLabel: size)),
        );
        await tester.pumpAndSettle();
        expect(find.text(size), findsOneWidget);
      }
    });

    testWidgets('attention levels render', (tester) async {
      for (final attention in ['high', 'medium', 'low']) {
        await tester.pumpWidget(
          pumpChipApp(
            OneUiChip(
                attention: attention,
                child: attention,
                semanticsLabel: attention),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.text(attention), findsOneWidget);
      }
    });

    testWidgets('renders start and end slots', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Label',
            semanticsLabel: 'With slots',
            start: const Text('S', key: Key('chip-start-slot')),
            end: const Text('E', key: Key('chip-end-slot')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('chip-start-slot')), findsOneWidget);
      expect(find.byKey(const Key('chip-end-slot')), findsOneWidget);
    });

    testWidgets('forceFocusRing paints focus halo (Storybook parity)',
        (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiChip(child: 'Idle', semanticsLabel: 'Idle'),
              const SizedBox(width: 16),
              OneUiChip(
                child: 'Focus',
                semanticsLabel: 'Focus',
                forceFocusRing: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final forcedFocus = find.byWidgetPredicate(
        (w) => w is OneUiFocusInteractive && w.forceFocusRing,
      );
      expect(forcedFocus, findsOneWidget);
      final focusInteractive =
          tester.widget<OneUiFocusInteractive>(forcedFocus);
      expect(focusInteractive.focusRing, isNotNull);
      expect(_countFocusHaloDecorations(tester), greaterThanOrEqualTo(1));
    });

    testWidgets('bold selected focus inner gap uses surface halo not chip fill',
        (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          const OneUiChip(
            child: 'React',
            semanticsLabel: 'React',
            variant: 'bold',
            selected: true,
            forceFocusRing: true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final focusInteractive = tester.widget<OneUiFocusInteractive>(
        find.byWidgetPredicate(
          (w) => w is OneUiFocusInteractive && w.forceFocusRing,
        ),
      );
      final ring = focusInteractive.focusRing;
      expect(ring, isNotNull);

      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(OneUiChip),
          matching: find.byType(AnimatedContainer),
        ),
      );
      final fill =
          (container.decoration! as BoxDecoration).color ?? Colors.transparent;

      expect(ring!.innerGapShadowColor, isNot(equals(fill)),
          reason:
              'selected chip focus halo gap must follow --Surface-Halo-Gap, '
              'not the bold fill (avoids a second coloured ring).');
      expect(ring.innerGapShadowColor, const Color(0xFFFFFFFF));
    });

    testWidgets('without forceFocusRing no focus halo when unfocused',
        (tester) async {
      await tester.pumpWidget(
        pumpChipApp(OneUiChip(child: 'Idle', semanticsLabel: 'Idle')),
      );
      await _pumpChipLayout(tester);
      expect(_countFocusHaloDecorations(tester), 0);
    });

    testWidgets('chip in group uses value selection', (tester) async {
      final selected = <String>['a'];
      await tester.pumpWidget(
        pumpChipApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiChipGroup(
                value: selected,
                onValueChange: (next) => setState(() {
                  selected
                    ..clear()
                    ..addAll(next);
                }),
                children: [
                  OneUiChip(value: 'a', child: 'A', semanticsLabel: 'A'),
                  OneUiChip(value: 'b', child: 'B', semanticsLabel: 'B'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'A')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
        expect(
            _chipSemanticsByLabel(tester, 'B')
                .hasFlag(SemanticsFlag.isSelected),
            isFalse);
      } finally {
        handle.dispose();
      }

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(selected, ['b']);
    });
  });

  group('OneUiChip semantics / a11y', () {
    testWidgets('root KeyedSubtree encodes data-* payload key', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Filter',
            attention: 'high',
            appearance: 'negative',
            semanticsLabel: 'Filter chip',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>).value.startsWith('oneui-chip'),
        ),
        findsOneWidget,
      );
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>).value.contains('data-variant=bold'),
        ),
        findsOneWidget,
      );
    });

    testWidgets('semanticsLabel sets accessible name', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Category',
            semanticsLabel: 'Filter by category',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _chipSemanticsByLabel(tester, 'Filter by category');
        expect(d.label, 'Filter by category');
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('ariaLabel alias sets accessible name', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(child: 'X', ariaLabel: 'Aria filter'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Aria filter').label, 'Aria filter');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('accessibilityHint maps to semantics hint', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Chip',
            semanticsLabel: 'Chip',
            accessibilityHint: 'Double tap to toggle',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Chip').hint, 'Double tap to toggle');
      } finally {
        handle.dispose();
      }
    });

    test('getChipAccessibilityProps matches resolveOneUiChipSemantics', () {
      final a = getChipAccessibilityProps(
        semanticsLabel: 'Filter',
        child: 'Chip',
        accessibilityHint: 'Hint',
        selected: true,
        disabled: false,
      );
      final b = resolveOneUiChipSemantics(
        semanticsLabel: 'Filter',
        child: 'Chip',
        semanticsHint: 'Hint',
        selected: true,
        disabled: false,
      );
      expect(a.label, b.label);
      expect(a.hint, b.hint);
      expect(a.selected, b.selected);
      expect(a.enabled, b.enabled);
    });

    testWidgets('disabled is not enabled in semantics', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(child: 'Off', disabled: true, semanticsLabel: 'Off'),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final d = _chipSemanticsByLabel(tester, 'Off');
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('toggles via keyboard Enter', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Toggle',
            semanticsLabel: 'Keyboard',
            testId: 'chip-kb-enter',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final enterFocus = find.byWidgetPredicate(
        (w) => w is Focus && w.debugLabel == 'Keyboard',
      );
      tester.widget<Focus>(enterFocus).focusNode!.requestFocus();
      await tester.pump();

      await tester.sendKeyDownEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Keyboard')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('toggles via keyboard Space', (tester) async {
      await tester.pumpWidget(
        pumpChipApp(
          OneUiChip(
            child: 'Space',
            semanticsLabel: 'Space toggle',
            testId: 'chip-kb-space',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final spaceFocus = find.byWidgetPredicate(
        (w) => w is Focus && w.debugLabel == 'Space toggle',
      );
      tester.widget<Focus>(spaceFocus).focusNode!.requestFocus();
      await tester.pump();

      await tester.sendKeyDownEvent(LogicalKeyboardKey.space);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
            _chipSemanticsByLabel(tester, 'Space toggle')
                .hasFlag(SemanticsFlag.isSelected),
            isTrue);
      } finally {
        handle.dispose();
      }
    });
  });
}
