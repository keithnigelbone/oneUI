/// Functional + accessibility tests for [OneUiSelectableSingleTextButton].
///
/// Mirrors `SelectableSingleTextButton.test.tsx` and Flutter IconButton/Button
/// SSTB coverage patterns.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_design_system.dart';
import 'package:ui_flutter/brand/resolve_brand_canvas.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/selectable_single_text_button_color_resolve.dart';
import 'package:ui_flutter/engine/selectable_single_text_button_size_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_loading_spinner.dart';
import 'package:ui_flutter/widgets/one_ui_selectable_single_text_button.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload _minimalSstbDesignSystem() {
  final props = <String, dynamic>{
    '--SelectableSingleTextButton-borderRadius': '9999px',
    '--Disabled-Opacity': '0.38',
    '--Loading-Opacity': '0.38',
    '--Stroke-M': '1px',
  };

  for (final sz in ['s', 'm', 'l']) {
    props['--SelectableSingleTextButton-minHeight-$sz'] = '40px';
    props['--SelectableSingleTextButton-height-$sz'] = '40px';
    props['--SelectableSingleTextButton-minHeight-$sz-condensed'] = '36px';
    props['--SelectableSingleTextButton-padding-$sz'] = '4px';
    props['--SelectableSingleTextButton-padding-$sz-condensed'] = '2px';
    props['--SelectableSingleTextButton-fontSize-$sz'] = '14px';
    props['--SelectableSingleTextButton-lineHeight-$sz'] = '20px';
  }
  props['--SelectableSingleTextButton-fontWeight'] = '700';

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

/// Manifest keys only — mirrors live Convex `buildAllComponentCustomPropertiesFlat`
/// output (no Flutter supplemental `padding-{sz}` / condensed keys).
NativeDesignSystemPayload _manifestOnlySstbDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      '--SelectableSingleTextButton-borderRadius': '9999px',
      '--SelectableSingleTextButton-height-s': 'var(--Spacing-8)',
      '--SelectableSingleTextButton-height-m': 'var(--Spacing-10)',
      '--SelectableSingleTextButton-height-l': 'var(--Spacing-12)',
      '--SelectableSingleTextButton-paddingHorizontal-s': 'var(--Spacing-4)',
      '--SelectableSingleTextButton-paddingHorizontal-m': 'var(--Spacing-5)',
      '--SelectableSingleTextButton-paddingHorizontal-l': 'var(--Spacing-6)',
      '--SelectableSingleTextButton-fontSize-s': '14px',
      '--SelectableSingleTextButton-fontSize-m': '14px',
      '--SelectableSingleTextButton-fontSize-l': '16px',
      '--SelectableSingleTextButton-lineHeight-s': '20px',
      '--SelectableSingleTextButton-lineHeight-m': '20px',
      '--SelectableSingleTextButton-lineHeight-l': '22px',
      '--SelectableSingleTextButton-fontWeight': '700',
      '--Disabled-Opacity': '0.5',
      '--Loading-Opacity': '0.5',
      '--Stroke-M': '1px',
    },
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': {
        '--Spacing-0-5': '2px',
        '--Spacing-1': '4px',
        '--Spacing-2': '8px',
        '--Spacing-4': '16px',
        '--Spacing-4-5': '18px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
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

Widget _wrapSstbScope({
  required Widget child,
  NativeDesignSystemPayload? designSystem,
  ThemeConfig? themeConfig,
  String brandId = 'test-brand',
}) {
  const platformId = 'S';
  const density = 'default';
  final ds = designSystem ?? _minimalSstbDesignSystem();
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig ?? _minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  final nativeTypography = resolveNativeTypographyForBrand(
    brandId: brandId,
    platformId: platformId,
    density: density,
    designSystem: ds,
    snapshot: null,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        designSystem: ds,
        nativeTypography: nativeTypography,
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Widget pumpSstbApp(Widget child) => _wrapSstbScope(child: child);

Widget pumpSstbAppManifestOnly(Widget child) =>
    _wrapSstbScope(child: child, designSystem: _manifestOnlySstbDesignSystem());

Widget pumpSstbAppUnbranded(Widget child) {
  const platformId = 'S';
  const density = 'default';
  final ds =
      defaultUnbrandedDesignSystem(activeDimensionKey: '$platformId:$density');
  return _wrapSstbScope(
    child: child,
    designSystem: ds,
    themeConfig: buildStorybookDemoThemeConfig(),
    brandId: '',
  );
}

Future<void> _pumpSstb(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

SemanticsData _semanticsForLabel(WidgetTester tester, String label) =>
    tester.getSemantics(find.bySemanticsLabel(label)).getSemanticsData();

void main() {
  group('oneUiSelectableSingleTextButtonLabel', () {
    test('passes through 1–2 characters', () {
      expect(oneUiSelectableSingleTextButtonLabel('Ag'), 'Ag');
      expect(oneUiSelectableSingleTextButtonLabel('A'), 'A');
    });

    test('truncates longer strings to 2 characters', () {
      expect(oneUiSelectableSingleTextButtonLabel('Photos'), 'Ph');
      expect(oneUiSelectableSingleTextButtonLabel('English'), 'En');
    });
  });

  group('oneUiNormalizeSelectableSingleTextButtonSize', () {
    test('accepts s / m / l', () {
      expect(oneUiNormalizeSelectableSingleTextButtonSize('s'), 's');
      expect(oneUiNormalizeSelectableSingleTextButtonSize('M'), 'm');
      expect(oneUiNormalizeSelectableSingleTextButtonSize('l'), 'l');
    });

    test('coerces invalid size to m', () {
      expect(oneUiNormalizeSelectableSingleTextButtonSize('xl'), 'm');
      expect(oneUiNormalizeSelectableSingleTextButtonSize(''), 'm');
    });
  });

  group('oneUiSelectableSingleTextButtonLoadingSpinnerSize', () {
    test('maps button size to spinner size', () {
      expect(oneUiSelectableSingleTextButtonLoadingSpinnerSize('s'), 'S');
      expect(oneUiSelectableSingleTextButtonLoadingSpinnerSize('m'), 'M');
      expect(oneUiSelectableSingleTextButtonLoadingSpinnerSize('l'), 'L');
      expect(oneUiSelectableSingleTextButtonLoadingSpinnerSize('unknown'), 'M');
    });
  });

  group('oneUiSelectableSingleTextButtonDataAttrs', () {
    test('defaults data-size m and data-attention high', () {
      final attrs = oneUiSelectableSingleTextButtonDataAttrs(
        size: 'm',
        attention: OneUiSelectableSingleTextButtonAttention.high,
        condensed: false,
        loading: false,
        selected: false,
      );
      expect(attrs['data-oneui-component'], 'SelectableSingleTextButton');
      expect(attrs['data-size'], 'm');
      expect(attrs['data-attention'], 'high');
      expect(attrs.containsKey('data-condensed'), isFalse);
      expect(attrs.containsKey('data-loading'), isFalse);
      expect(attrs.containsKey('data-pressed'), isFalse);
    });

    test('sets data-pressed when selected', () {
      final attrs = oneUiSelectableSingleTextButtonDataAttrs(
        size: 'm',
        attention: OneUiSelectableSingleTextButtonAttention.high,
        condensed: false,
        loading: false,
        selected: true,
      );
      expect(attrs['data-pressed'], '');
    });

    test('sets data-condensed when condensed', () {
      final attrs = oneUiSelectableSingleTextButtonDataAttrs(
        size: 'm',
        attention: OneUiSelectableSingleTextButtonAttention.high,
        condensed: true,
        loading: false,
        selected: true,
      );
      expect(attrs['data-condensed'], '');
    });

    test('sets data-loading when loading', () {
      final attrs = oneUiSelectableSingleTextButtonDataAttrs(
        size: 'm',
        attention: OneUiSelectableSingleTextButtonAttention.high,
        condensed: false,
        loading: true,
        selected: false,
      );
      expect(attrs['data-loading'], '');
    });

    for (final attention in OneUiSelectableSingleTextButtonAttention.values) {
      test('data-attention ${attention.name}', () {
        final attrs = oneUiSelectableSingleTextButtonDataAttrs(
          size: 'm',
          attention: attention,
          condensed: false,
          loading: false,
          selected: false,
        );
        expect(attrs['data-attention'], attention.name);
      });
    }

    for (final sz in kOneUiSelectableSingleTextButtonSizes) {
      test('data-size $sz', () {
        final attrs = oneUiSelectableSingleTextButtonDataAttrs(
          size: sz,
          attention: OneUiSelectableSingleTextButtonAttention.high,
          condensed: false,
          loading: false,
          selected: false,
        );
        expect(attrs['data-size'], sz);
      });
    }
  });

  group('oneUiSelectableSingleTextButtonDataPayloadKey', () {
    test('encodes stable payload key', () {
      final attrs = oneUiSelectableSingleTextButtonDataAttrs(
        size: 'm',
        attention: OneUiSelectableSingleTextButtonAttention.high,
        condensed: true,
        loading: false,
        selected: true,
      );
      final key = oneUiSelectableSingleTextButtonDataPayloadKey(attrs);
      expect(key, contains('data-size=m'));
      expect(key, contains('data-attention=high'));
      expect(key, contains('data-condensed'));
      expect(key, contains('data-pressed'));
    });
  });

  group('resolveOneUiSelectableSingleTextButtonState', () {
    testWidgets('isDisabled when disabled or loading', (tester) async {
      late OneUiSelectableSingleTextButtonResolvedState disabledState;
      late OneUiSelectableSingleTextButtonResolvedState loadingState;
      late OneUiSelectableSingleTextButtonResolvedState enabledState;
      await tester.pumpWidget(
        pumpSstbApp(
          Builder(
            builder: (ctx) {
              disabledState = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
                disabled: true,
              );
              loadingState = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
                loading: true,
              );
              enabledState = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(disabledState.isDisabled, isTrue);
      expect(loadingState.isDisabled, isTrue);
      expect(enabledState.isDisabled, isFalse);
    });

    testWidgets('preserves condensed and fullWidth flags', (tester) async {
      late OneUiSelectableSingleTextButtonResolvedState state;
      await tester.pumpWidget(
        pumpSstbApp(
          Builder(
            builder: (ctx) {
              state = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
                condensed: true,
                fullWidth: true,
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(state.effectiveCondensed, isTrue);
      expect(state.effectiveFullWidth, isTrue);
    });
  });

  group('resolveOneUiSelectableSingleTextButtonState (widget context)', () {
    testWidgets('auto appearance resolves to primary on page surface',
        (tester) async {
      late OneUiSelectableSingleTextButtonResolvedState state;
      await tester.pumpWidget(
        pumpSstbApp(
          Builder(
            builder: (ctx) {
              state = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
                appearance: 'auto',
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(state.appearance, 'primary');
    });

    testWidgets('negative appearance resolves', (tester) async {
      late OneUiSelectableSingleTextButtonResolvedState state;
      await tester.pumpWidget(
        pumpSstbApp(
          Builder(
            builder: (ctx) {
              state = resolveOneUiSelectableSingleTextButtonState(
                context: ctx,
                appearance: 'negative',
              );
              return const SizedBox();
            },
          ),
        ),
      );
      expect(state.appearance, 'negative');
    });
  });

  group('OneUiSelectableSingleTextButton functional', () {
    testWidgets('renders label', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(const OneUiSelectableSingleTextButton(label: 'Ag')),
      );
      await _pumpSstb(tester);
      expect(find.text('Ag'), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('truncates visible label to two characters', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(const OneUiSelectableSingleTextButton(label: 'Photos')),
      );
      await _pumpSstb(tester);
      expect(find.text('Ph'), findsOneWidget);
      expect(find.text('Photos'), findsNothing);
    });

    testWidgets('defaultSelected starts selected', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            defaultSelected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('controlled selected prop updates', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            selected: false,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }

      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            selected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle2 = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle2.dispose();
      }
    });

    testWidgets('value prop renders without error', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'En',
            value: 'en',
          ),
        ),
      );
      await _pumpSstb(tester);
      expect(find.text('En'), findsOneWidget);
    });

    testWidgets('unbranded designSystem renders without gap card',
        (tester) async {
      await tester.pumpWidget(
        pumpSstbAppUnbranded(
          const OneUiSelectableSingleTextButton(label: 'Ag'),
        ),
      );
      await _pumpSstb(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
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
              child: OneUiSelectableSingleTextButton(label: 'Ag'),
            ),
          ),
        ),
      );
      await _pumpSstb(tester);
      if (kDebugMode) {
        expect(find.byType(ConvexGapCard), findsOneWidget);
      } else {
        expect(find.byType(ConvexGapCard), findsNothing);
      }
    });

    testWidgets('toggles on tap (uncontrolled)', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(label: 'Ag'),
        ),
      );
      await _pumpSstb(tester);

      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }

      await tester.tap(find.byType(OneUiSelectableSingleTextButton));
      await _pumpSstb(tester);

      final handle2 = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle2.dispose();
      }

      await tester.tap(find.byType(OneUiSelectableSingleTextButton));
      await _pumpSstb(tester);

      final handle3 = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle3.dispose();
      }
    });

    testWidgets('onSelectedChange receives new value', (tester) async {
      bool? last;
      await tester.pumpWidget(
        pumpSstbApp(
          OneUiSelectableSingleTextButton(
            label: 'Ag',
            onSelectedChange: (v) => last = v,
          ),
        ),
      );
      await _pumpSstb(tester);
      await tester.tap(find.byType(OneUiSelectableSingleTextButton));
      await _pumpSstb(tester);
      expect(last, isTrue);
    });

    testWidgets('space and enter toggle', (tester) async {
      var selected = false;
      await tester.pumpWidget(
        pumpSstbApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiSelectableSingleTextButton(
                label: 'Ag',
                selected: selected,
                onSelectedChange: (v) => setState(() => selected = v),
                autofocus: true,
              );
            },
          ),
        ),
      );
      await _pumpSstb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpSstb(tester);
      expect(selected, isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpSstb(tester);
      expect(selected, isFalse);
    });

    testWidgets('loading shows spinner and hides label', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(label: 'Ag', loading: true),
        ),
      );
      await _pumpSstb(tester);
      expect(find.byType(OneUiLoadingSpinner), findsOneWidget);
      expect(find.text('Ag'), findsNothing);
    });

    testWidgets('loading blocks toggle', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSstbApp(
          OneUiSelectableSingleTextButton(
            label: 'Ag',
            loading: true,
            onSelectedChange: (_) => calls++,
          ),
        ),
      );
      await _pumpSstb(tester);
      await tester.tap(find.byType(OneUiSelectableSingleTextButton),
          warnIfMissed: false);
      await _pumpSstb(tester);
      expect(calls, 0);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled blocks toggle', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSstbApp(
          OneUiSelectableSingleTextButton(
            label: 'Ag',
            disabled: true,
            onSelectedChange: (_) => calls++,
          ),
        ),
      );
      await _pumpSstb(tester);
      await tester.tap(find.byType(OneUiSelectableSingleTextButton),
          warnIfMissed: false);
      await _pumpSstb(tester);
      expect(calls, 0);
    });

    testWidgets('disabled selected stays toggled', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            disabled: true,
            defaultSelected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = _semanticsForLabel(tester, 'Ag');
        expect(data.hasFlag(SemanticsFlag.isToggled), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            testId: 'sstb-qa-root',
          ),
        ),
      );
      await _pumpSstb(tester);
      expect(find.byKey(const ValueKey('sstb-qa-root')), findsOneWidget);
    });

    testWidgets('testId emits Semantics.identifier', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            testId: 'sstb-qa-root',
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(_semanticsForLabel(tester, 'Ag').identifier, 'sstb-qa-root');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('data payload key encodes size and attention', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            size: 's',
            attention: OneUiSelectableSingleTextButtonAttention.medium,
            condensed: true,
            defaultSelected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-sstb|data-oneui-component=SelectableSingleTextButton'
            '|data-size=s|data-attention=medium|data-condensed|data-pressed',
          ),
        ),
        findsOneWidget,
      );
    });

    for (final sz in kOneUiSelectableSingleTextButtonSizes) {
      testWidgets('size $sz renders', (tester) async {
        await tester.pumpWidget(
          pumpSstbApp(OneUiSelectableSingleTextButton(label: 'Ag', size: sz)),
        );
        await _pumpSstb(tester);
        expect(find.byType(OneUiSelectableSingleTextButton), findsOneWidget);
      });
    }

    for (final attention in OneUiSelectableSingleTextButtonAttention.values) {
      testWidgets('attention ${attention.name} renders selected', (
        tester,
      ) async {
        await tester.pumpWidget(
          pumpSstbApp(
            OneUiSelectableSingleTextButton(
              label: 'Ag',
              attention: attention,
              defaultSelected: true,
            ),
          ),
        );
        await _pumpSstb(tester);
        expect(find.text('Ag'), findsOneWidget);
      });
    }

    testWidgets('condensed renders all sizes', (tester) async {
      for (final sz in kOneUiSelectableSingleTextButtonSizes) {
        await tester.pumpWidget(
          pumpSstbApp(
            OneUiSelectableSingleTextButton(
              label: 'Ag',
              size: sz,
              condensed: true,
              defaultSelected: true,
            ),
          ),
        );
        await _pumpSstb(tester);
        expect(find.text('Ag'), findsOneWidget);
      }
    });

    testWidgets('fullWidth expands horizontally', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const SizedBox(
            width: 200,
            child: OneUiSelectableSingleTextButton(
              label: 'Ag',
              fullWidth: true,
            ),
          ),
        ),
      );
      await _pumpSstb(tester);
      final size = tester.getSize(find.byType(OneUiFocusInteractive));
      expect(size.width, greaterThan(100));
    });

    testWidgets('appearance negative renders without gap card', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            appearance: 'negative',
            defaultSelected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.text('Ag'), findsOneWidget);
    });

    testWidgets('manifest-only design system keeps glyph visible at M size',
        (tester) async {
      await tester.pumpWidget(
        pumpSstbAppManifestOnly(
          const OneUiSelectableSingleTextButton(label: 'Ag', size: 'm'),
        ),
      );
      await _pumpSstb(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.text('Ag'), findsOneWidget);
    });

    testWidgets('manifest-only condensed resolves smaller height than default',
        (tester) async {
      final ds = _manifestOnlySstbDesignSystem();
      SelectableSingleTextButtonSizeMetrics? normal;
      SelectableSingleTextButtonSizeMetrics? condensed;
      await tester.pumpWidget(
        _wrapSstbScope(
          designSystem: ds,
          child: Builder(
            builder: (context) {
              final typo = OneUiScope.nativeTypographyOf(context)!;
              normal = resolveSelectableSingleTextButtonSizeMetrics(
                ds,
                size: 'm',
                condensed: false,
                platformId: 'S',
                density: 'default',
                platformsConfig: null,
                nativeTypography: typo,
              );
              condensed = resolveSelectableSingleTextButtonSizeMetrics(
                ds,
                size: 'm',
                condensed: true,
                platformId: 'S',
                density: 'default',
                platformsConfig: null,
                nativeTypography: typo,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(normal?.minSizePx, 40);
      expect(condensed?.minSizePx, 24);
      expect(condensed!.minSizePx, lessThan(normal!.minSizePx));
    });

    testWidgets('condensed label fits two characters in tight circle',
        (tester) async {
      final base = _minimalSstbDesignSystem();
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          ...base.componentCustomProperties,
          '--SelectableSingleTextButton-minHeight-s-condensed': '18px',
          '--SelectableSingleTextButton-height-s-condensed': '18px',
          '--SelectableSingleTextButton-padding-s-condensed': '2px',
          '--SelectableSingleTextButton-fontSize-s': '16px',
          '--SelectableSingleTextButton-lineHeight-s': '20px',
        },
        'dimensionContexts': base.dimensionContexts,
        'activeDimensionKey': base.activeDimensionKey,
        'activeDimensionContext': base.activeDimensionContext,
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
              designSystem: ds,
              child: const Center(
                child: OneUiSelectableSingleTextButton(
                  label: 'Ag',
                  size: 's',
                  condensed: true,
                  defaultSelected: true,
                ),
              ),
            ),
          ),
        ),
      );
      await _pumpSstb(tester);

      expect(find.text('Ag'), findsOneWidget);
      final text = tester.renderObject<RenderParagraph>(find.text('Ag'));
      expect(text.text.toPlainText(), 'Ag');
    });

    testWidgets('medium selected label contrasts with fill on nested surface',
        (tester) async {
      final base = _minimalSstbDesignSystem();
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          ...base.componentCustomProperties,
          '--SelectableSingleTextButton-backgroundColor-selected-medium':
              'var(--Primary-Subtle)',
          '--SelectableSingleTextButton-textColor-selected-medium':
              'var(--Primary-TintedA11y)',
        },
        'dimensionContexts': base.dimensionContexts,
        'activeDimensionKey': base.activeDimensionKey,
        'activeDimensionContext': base.activeDimensionContext,
      })!;

      late SelectableSingleTextButtonResolvedPaint paint;
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
              designSystem: ds,
              child: OneUiSurface(
                mode: kSurfaceBold,
                appearance: 'secondary',
                child: Builder(
                  builder: (ctx) {
                    paint = resolveSelectableSingleTextButtonPaint(
                      ctx,
                      ds,
                      selected: true,
                      attention:
                          OneUiSelectableSingleTextButtonAttention.medium,
                      appearance: 'secondary',
                    );
                    return const OneUiSelectableSingleTextButton(
                      label: 'Ag',
                      defaultSelected: true,
                      attention:
                          OneUiSelectableSingleTextButtonAttention.medium,
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await _pumpSstb(tester);

      expect(find.byType(ConvexGapCard), findsNothing);
      expect(paint.foreground, isNot(equals(paint.background)));
      expect(paint.foreground.alpha, greaterThan(0));
      expect(find.text('Ag'), findsOneWidget);
    });
  });

  group('OneUiSelectableSingleTextButton semantics / a11y', () {
    testWidgets('exposes button role with toggled state support', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpSstbApp(const OneUiSelectableSingleTextButton(label: 'Ag')),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = _semanticsForLabel(tester, 'Ag');
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.hasFlag(SemanticsFlag.hasToggledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isToggled), isFalse);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('selected sets isToggled', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            defaultSelected: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('tap toggles semantics isToggled', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(const OneUiSelectableSingleTextButton(label: 'Ag')),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }

      await tester.tap(find.byType(OneUiSelectableSingleTextButton));
      await _pumpSstb(tester);

      final handle2 = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isToggled),
          isTrue,
        );
      } finally {
        handle2.dispose();
      }
    });

    testWidgets('semanticsLabel overrides visible text', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            semanticsLabel: 'Silver language',
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Silver language'), findsOneWidget);
        expect(find.bySemanticsLabel('Ag'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('custom semanticsHint is exposed', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            semanticsHint: 'Choose language',
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hint,
          contains('Choose language'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('loading merges Loading hint and disables', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            loading: true,
            semanticsHint: 'Choose language',
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = _semanticsForLabel(tester, 'Ag');
        expect(data.hint, contains('Choose language'));
        expect(data.hint, contains('Loading'));
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled sets isEnabled false', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            disabled: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          _semanticsForLabel(tester, 'Ag').hasFlag(SemanticsFlag.isEnabled),
          isFalse,
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('autofocus requests initial focus', (tester) async {
      await tester.pumpWidget(
        pumpSstbApp(
          const OneUiSelectableSingleTextButton(
            label: 'Ag',
            autofocus: true,
          ),
        ),
      );
      await _pumpSstb(tester);
      expect(FocusManager.instance.primaryFocus?.hasFocus, isTrue);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('keyboard does not toggle when disabled', (tester) async {
      var calls = 0;
      await tester.pumpWidget(
        pumpSstbApp(
          OneUiSelectableSingleTextButton(
            label: 'Ag',
            disabled: true,
            autofocus: true,
            onSelectedChange: (_) => calls++,
          ),
        ),
      );
      await _pumpSstb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpSstb(tester);
      expect(calls, 0);
    });
  });
}
