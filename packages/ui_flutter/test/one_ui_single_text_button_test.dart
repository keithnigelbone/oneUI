/// Functional + semantics tests for [OneUiSingleTextButton].
///
/// Mirrors `packages/ui/src/components/SingleTextButton/SingleTextButton.test.tsx`
/// and Flutter parity patterns from `one_ui_button_test.dart` /
/// `one_ui_icon_button_test.dart` (RN has no SingleTextButton yet).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/single_text_button_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_loading_spinner.dart';
import 'package:ui_flutter/widgets/one_ui_single_text_button.dart';
import 'package:ui_flutter/widgets/one_ui_single_text_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

NativeDesignSystemPayload _minimalSingleTextButtonDesignSystem() {
  final props = <String, dynamic>{
    '--SingleTextButton-borderRadius': '9999px',
    '--Disabled-Opacity': '0.38',
    '--Loading-Opacity': '0.38',
    '--CircularProgressIndicator-trimDuration': '1500ms',
    '--CircularProgressIndicator-rotateDuration': '6000ms',
  };

  void addSize(String size, String px) {
    props['--SingleTextButton-minHeight-$size'] = px;
    props['--SingleTextButton-padding-$size'] = '4px';
    props['--SingleTextButton-fontSize-$size'] = '14px';
    props['--SingleTextButton-lineHeight-$size'] = '20px';
  }

  addSize('s', '32px');
  addSize('m', '40px');
  addSize('l', '48px');

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': {
        '--Spacing-0-5': '2px',
        '--Spacing-1': '4px',
        '--Spacing-2': '8px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
        '--Spacing-4-5': '18px',
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

Widget pumpSingleTextButtonApp(Widget child) {
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
        designSystem: _minimalSingleTextButtonDesignSystem(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

Future<void> _pumpLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Finder _stbSemanticsFinder() => find.byType(OneUiFocusInteractive);

SemanticsData _stbSemanticsData(WidgetTester tester) =>
    tester.getSemantics(_stbSemanticsFinder()).getSemanticsData();

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

double? _circularSide(WidgetTester tester) {
  final boxes = tester.widgetList<SizedBox>(
    find.descendant(
      of: find.byType(OneUiSingleTextButton),
      matching: find.byWidgetPredicate(
        (w) =>
            w is SizedBox &&
            w.width != null &&
            w.height != null &&
            w.width == w.height,
      ),
    ),
  );
  return boxes.isEmpty ? null : boxes.first.width;
}

BoxDecoration? _chromeDecoration(WidgetTester tester) {
  final decorated = tester.widgetList<DecoratedBox>(
    find.descendant(
      of: find.byType(OneUiSingleTextButton),
      matching: find.byType(DecoratedBox),
    ),
  );
  for (final box in decorated) {
    final deco = box.decoration;
    if (deco is BoxDecoration && deco.color != null) {
      return deco;
    }
  }
  return null;
}

void main() {
  group('SingleTextButton types / resolution', () {
    test('oneUiResolveSingleTextButtonSize defaults invalid to m', () {
      expect(oneUiResolveSingleTextButtonSize(null), 'm');
      expect(oneUiResolveSingleTextButtonSize(''), 'm');
      expect(oneUiResolveSingleTextButtonSize('xl'), 'm');
      expect(oneUiResolveSingleTextButtonSize('s'), 's');
      expect(oneUiResolveSingleTextButtonSize('l'), 'l');
    });

    test('oneUiTruncateSingleTextButtonLabel keeps short labels', () {
      expect(oneUiTruncateSingleTextButtonLabel('Ag'), 'Ag');
      expect(oneUiTruncateSingleTextButtonLabel('A'), 'A');
      expect(oneUiTruncateSingleTextButtonLabel('12'), '12');
    });

    test('oneUiTruncateSingleTextButtonLabel truncates long labels', () {
      expect(oneUiTruncateSingleTextButtonLabel('Photos'), 'Ph');
      expect(oneUiTruncateSingleTextButtonLabel('Abc'), 'Ab');
    });

    test('oneUiSingleTextButtonVariantFromAttention maps levels', () {
      expect(
        oneUiSingleTextButtonVariantFromAttention(
            OneUiSingleTextButtonAttention.high),
        OneUiSingleTextButtonVariant.bold,
      );
      expect(
        oneUiSingleTextButtonVariantFromAttention(
            OneUiSingleTextButtonAttention.medium),
        OneUiSingleTextButtonVariant.subtle,
      );
      expect(
        oneUiSingleTextButtonVariantFromAttention(
            OneUiSingleTextButtonAttention.low),
        OneUiSingleTextButtonVariant.ghost,
      );
    });

    test('oneUiSingleTextButtonAttentionKey mirrors data-attention', () {
      expect(
        oneUiSingleTextButtonAttentionKey(OneUiSingleTextButtonAttention.high),
        'high',
      );
      expect(
        oneUiSingleTextButtonAttentionKey(
            OneUiSingleTextButtonAttention.medium),
        'medium',
      );
      expect(
        oneUiSingleTextButtonAttentionKey(OneUiSingleTextButtonAttention.low),
        'low',
      );
    });

    test('oneUiSingleTextButtonLabelKey maps size to Label role', () {
      expect(oneUiSingleTextButtonLabelKey('s'), 'S');
      expect(oneUiSingleTextButtonLabelKey('m'), 'M');
      expect(oneUiSingleTextButtonLabelKey('l'), 'L');
    });

    test('oneUiSingleTextButtonLoadingSpinnerSize matches React SPINNER_SIZE_MAP',
        () {
      expect(oneUiSingleTextButtonLoadingSpinnerSize('s'), 'S');
      expect(oneUiSingleTextButtonLoadingSpinnerSize('m'), 'M');
      expect(oneUiSingleTextButtonLoadingSpinnerSize('l'), 'L');
      expect(oneUiSingleTextButtonLoadingSpinnerSize('unknown'), 'M');
    });
  });

  group('resolveOneUiSingleTextButtonAppearance', () {
    testWidgets('auto resolves to primary on page surface', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', appearance: 'auto'),
        ),
      );
      await _pumpLayout(tester);
      expect(
        resolveOneUiSingleTextButtonAppearance(
          tester.element(find.byType(OneUiSingleTextButton)),
          'auto',
        ),
        'primary',
      );
    });
  });

  group('OneUiSingleTextButton rendering', () {
    testWidgets('renders with label text', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      expect(find.text('Ag'), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('truncates children exceeding 2 characters', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Photos')),
      );
      await _pumpLayout(tester);
      expect(find.text('Ph'), findsOneWidget);
      expect(find.text('Photos'), findsNothing);
    });

    testWidgets('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', testId: 'stb-ag'),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byKey(const ValueKey('stb-ag')), findsOneWidget);
    });

    testWidgets('shows gap placeholder without design system', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: buildRootSurfaceContext(
              themeConfig: _minimalThemeConfig(),
              rootParentStep: 2500,
              darkMode: false,
            ),
            child: const Scaffold(
              body: Center(child: OneUiSingleTextButton(label: 'Ag')),
            ),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
    });

    testWidgets('circular container has equal width and height', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      expect(_circularSide(tester), 40);
    });

    testWidgets('fullWidth stretches horizontally', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const SizedBox(
            width: 320,
            child: OneUiSingleTextButton(label: 'Ag', fullWidth: true),
          ),
        ),
      );
      await _pumpLayout(tester);
      final fullWidthBox = tester.widgetList<SizedBox>(
        find.descendant(
          of: find.byType(OneUiSingleTextButton),
          matching: find.byWidgetPredicate(
            (w) => w is SizedBox && w.width == double.infinity,
          ),
        ),
      );
      expect(fullWidthBox, isNotEmpty);
    });
  });

  group('OneUiSingleTextButton click handling', () {
    testWidgets('invokes onPressed when tapped', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(label: 'Ag', onPressed: () => hits++),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton));
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onPress alias invokes callback', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(label: 'Ag', onPress: () => hits++),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton));
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onClick alias invokes callback', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(label: 'Ag', onClick: () => hits++),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton));
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onPressed takes precedence over onClick', (tester) async {
      var pressHits = 0;
      var clickHits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            onPressed: () => pressHits++,
            onClick: () => clickHits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton));
      await _pumpLayout(tester);
      expect(pressHits, 1);
      expect(clickHits, 0);
    });
  });

  group('OneUiSingleTextButton disabled state', () {
    testWidgets('does not fire onPressed when disabled', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            disabled: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton), warnIfMissed: false);
      await _pumpLayout(tester);
      expect(hits, 0);
    });

    testWidgets('disabled reduces opacity', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', disabled: true),
        ),
      );
      await _pumpLayout(tester);
      final opacity = tester.widget<Opacity>(
        find.descendant(
          of: find.byType(OneUiSingleTextButton),
          matching: find.byType(Opacity),
        ),
      );
      expect(opacity.opacity, closeTo(0.38, 0.01));
    });
  });

  group('OneUiSingleTextButton loading state', () {
    testWidgets('does not fire onPressed when loading', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            loading: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.tap(find.byType(OneUiSingleTextButton), warnIfMissed: false);
      await _pumpLayout(tester);
      expect(hits, 0);
    });

    testWidgets('loading hides label and shows spinner', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', loading: true),
        ),
      );
      await _pumpLayout(tester);
      expect(find.text('Ag'), findsNothing);
      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);
    });

    testWidgets('loading spinner size matches SPINNER_SIZE_MAP', (tester) async {
      const map = {'s': 'S', 'm': 'M', 'l': 'L'};
      for (final entry in map.entries) {
        await tester.pumpWidget(
          pumpSingleTextButtonApp(
            OneUiSingleTextButton(
              label: 'Ag',
              size: entry.key,
              loading: true,
            ),
          ),
        );
        await _pumpLayout(tester);
        final cpi = tester.widget<OneUiCircularProgressIndicator>(
          find.byType(OneUiCircularProgressIndicator),
        );
        expect(cpi.size, entry.value, reason: 'size ${entry.key}');
        expect(cpi.variant, 'indeterminate');
        expect(cpi.trackColor, Colors.transparent);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('not loading shows label not spinner', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      expect(find.text('Ag'), findsOneWidget);
      expect(find.byType(OneUiCircularProgressIndicator), findsNothing);
    });
  });

  group('OneUiSingleTextButton sizes and attention', () {
    testWidgets('size s/m/l set container dimensions', (tester) async {
      const expected = {'s': 32.0, 'm': 40.0, 'l': 48.0};
      for (final entry in expected.entries) {
        await tester.pumpWidget(
          pumpSingleTextButtonApp(
            OneUiSingleTextButton(label: 'Ag', size: entry.key),
          ),
        );
        await _pumpLayout(tester);
        expect(_circularSide(tester), entry.value);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('defaults to size m', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      expect(_circularSide(tester), 40);
    });

    testWidgets('condensed reduces container size', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', size: 'm', condensed: true),
        ),
      );
      await _pumpLayout(tester);
      expect(_circularSide(tester), 24);
    });

    testWidgets('all attention levels render', (tester) async {
      for (final a in OneUiSingleTextButtonAttention.values) {
        await tester.pumpWidget(
          pumpSingleTextButtonApp(
            OneUiSingleTextButton(label: 'Ag', attention: a),
          ),
        );
        await _pumpLayout(tester);
        expect(find.byType(OneUiSingleTextButton), findsOneWidget);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });

    testWidgets('low attention ghost uses transparent fill', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            attention: OneUiSingleTextButtonAttention.low,
          ),
        ),
      );
      await _pumpLayout(tester);
      final deco = _chromeDecoration(tester);
      expect(deco, isNotNull);
      expect(deco!.color!.alpha, 0);
    });

    testWidgets('high attention uses opaque fill', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            attention: OneUiSingleTextButtonAttention.high,
          ),
        ),
      );
      await _pumpLayout(tester);
      final deco = _chromeDecoration(tester);
      expect(deco, isNotNull);
      expect(deco!.color!.alpha, greaterThan(0));
    });
  });

  group('OneUiSingleTextButton appearances', () {
    testWidgets('appearance auto resolves without gap card', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', appearance: 'auto'),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });

    testWidgets('configured appearance roles render', (tester) async {
      for (final role in [
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ]) {
        await tester.pumpWidget(
          pumpSingleTextButtonApp(
            OneUiSingleTextButton(label: 'Ag', appearance: role),
          ),
        );
        await _pumpLayout(tester);
        expect(find.byType(ConvexGapCard), findsNothing);
        expect(find.byType(OneUiFocusInteractive), findsOneWidget);
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });
  });

  group('OneUiSingleTextButton surface context', () {
    testWidgets('auto appearance inherits inside bold surface', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSurface(
            mode: 'bold',
            child: OneUiSingleTextButton(label: 'Ag', appearance: 'auto'),
          ),
        ),
      );
      await _pumpLayout(tester);
      expect(find.byType(ConvexGapCard), findsNothing);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
    });
  });

  group('OneUiSingleTextButton semantics / a11y', () {
    testWidgets('expose button role + label via semantics', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _stbSemanticsData(tester);
        expect(d.label, contains('Ag'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsLabel overrides visible label (aria-label)',
        (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            semanticsLabel: 'Custom label',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(find.text('Ag'), findsOneWidget);
        final d = _stbSemanticsData(tester);
        expect(d.label, contains('Custom label'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('testId emits Semantics.identifier for AT / Appium',
        (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', testId: 'stb-ag'),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(_stbSemanticsData(tester).identifier, 'stb-ag');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled announces not enabled (aria-disabled)',
        (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', disabled: true),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _stbSemanticsData(tester);
        expect(d.label, contains('Ag'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('loading announces busy + Loading hint (aria-busy)',
        (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', loading: true),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _stbSemanticsData(tester);
        expect(d.label, contains('Ag'));
        expect(d.hint, contains('Loading'));
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint merges with loading hint', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            loading: true,
            semanticsHint: 'Opens panel',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final d = _stbSemanticsData(tester);
        expect(d.hint, 'Opens panel. Loading');
        expect(d.label, contains('Ag'));
      } finally {
        handle.dispose();
      }
    });

    testWidgets('semanticsHint without loading', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            semanticsHint: 'Opens panel',
          ),
        ),
      );
      await _pumpLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(_stbSemanticsData(tester).hint, 'Opens panel');
      } finally {
        handle.dispose();
      }
    });

    testWidgets('forceFocusRing paints visible focus halo', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(
            label: 'Ag',
            forceFocusRing: true,
          ),
        ),
      );
      await _pumpLayout(tester);
      final focusInteractive = tester.widget<OneUiFocusInteractive>(
        find.byWidgetPredicate(
          (w) => w is OneUiFocusInteractive && w.forceFocusRing,
        ),
      );
      expect(focusInteractive.forceFocusRing, isTrue);
      expect(focusInteractive.focusRing, isNotNull);
      expect(_countFocusHaloDecorations(tester), greaterThanOrEqualTo(1));
    });

    testWidgets('enabled control wires pointer cursor', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
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
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', disabled: true),
        ),
      );
      await _pumpLayout(tester);
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

  group('OneUiSingleTextButton keyboard / focus', () {
    testWidgets('is focusable via Tab', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(const OneUiSingleTextButton(label: 'Ag')),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await _pumpLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('autofocus requests initial focus', (tester) async {
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          const OneUiSingleTextButton(label: 'Ag', autofocus: true),
        ),
      );
      await _pumpLayout(tester);
      expect(FocusManager.instance.primaryFocus, isNotNull);
      expect(FocusManager.instance.primaryFocus!.hasFocus, isTrue);
    });

    testWidgets('Enter activates onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('Space activates onPressed', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('onClick fires on keyboard Enter', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            autofocus: true,
            onClick: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpLayout(tester);
      expect(hits, 1);
    });

    testWidgets('keyboard does not activate when disabled', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            disabled: true,
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpLayout(tester);
      expect(hits, 0);
    });

    testWidgets('keyboard does not activate when loading', (tester) async {
      var hits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          OneUiSingleTextButton(
            label: 'Ag',
            loading: true,
            autofocus: true,
            onPressed: () => hits++,
          ),
        ),
      );
      await _pumpLayout(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await _pumpLayout(tester);
      expect(hits, 0);
    });
  });

  group('OneUiSemanticButtonType on SingleTextButton', () {
    testWidgets('submit validates form before callback', (tester) async {
      var submits = 0;
      await tester.pumpWidget(
        pumpSingleTextButtonApp(
          Form(
            autovalidateMode: AutovalidateMode.disabled,
            child: Column(
              children: [
                TextFormField(
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'required' : null,
                ),
                OneUiSingleTextButton(
                  label: 'Go',
                  semanticButtonType: OneUiSemanticButtonType.submit,
                  onPressed: () => submits++,
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Go'));
      await tester.pumpAndSettle();
      expect(submits, 0);

      await tester.enterText(find.byType(TextFormField), 'ok');
      await tester.tap(find.text('Go'));
      await tester.pumpAndSettle();
      expect(submits, 1);
    });
  });

  group('resolveSingleTextButtonColors', () {
    testWidgets('high/medium/low resolve distinct foreground colours',
        (tester) async {
      final colors = <OneUiSingleTextButtonAttentionKind, Color>{};
      for (final attention in OneUiSingleTextButtonAttentionKind.values) {
        await tester.pumpWidget(
          pumpSingleTextButtonApp(
            OneUiSingleTextButton(
              label: 'Ag',
              attention: OneUiSingleTextButtonAttention.values
                  .byName(attention.name),
            ),
          ),
        );
        await _pumpLayout(tester);
        final ds = OneUiScope.designSystemOf(
          tester.element(find.byType(OneUiSingleTextButton)),
        )!;
        colors[attention] = resolveSingleTextButtonColors(
          tester.element(find.byType(OneUiSingleTextButton)),
          ds,
          attention: attention,
          appearance: 'primary',
        ).foreground;
        await tester.pumpWidget(const SizedBox.shrink());
      }
      expect(colors[OneUiSingleTextButtonAttentionKind.high],
          isNot(colors[OneUiSingleTextButtonAttentionKind.low]));
      expect(colors[OneUiSingleTextButtonAttentionKind.medium],
          isNot(colors[OneUiSingleTextButtonAttentionKind.high]));
    });
  });

  group('OneUiSingleTextButton a11y regressions', () {
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
          pumpSingleTextButtonApp(
            const OneUiSingleTextButton(label: 'Ag', loading: true),
          ),
        );
        await _pumpLayout(tester);
      });
      expect(
        prints.any((line) =>
            line.contains('OneUiCircularProgressIndicator: semanticsLabel')),
        isFalse,
      );
    });
  });
}
