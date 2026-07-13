/// Image unit + widget tests — parity with
/// `packages/ui-native/src/components/Image/ImageA11y.test.ts` and
/// `packages/ui/src/components/Image/Image.test.tsx`.
library;

import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/image_style_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_network_image_cache.dart';
import 'package:ui_flutter/widgets/one_ui_image_fallback_icon.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

const _kBrokenUrl = 'https://invalid.example/broken.jpg';

NativeDesignSystemPayload _minimalImageDesignSystem() {
  final props = <String, dynamic>{
    '--Image-borderRadius': '8px',
    '--Image-disabledOpacity': '0.5',
    '--Image-objectFit': 'cover',
    '--Image-objectPosition': 'center',
    '--Spacing-8': '32px',
    '--Spacing-10': '40px',
    '--Shape-0': '0px',
    '--Shape-3': '12px',
  };

  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Shape-0': '0px',
        '--Shape-3': '12px',
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

Widget pumpImageApp(Widget child, {bool bounded = false}) {
  final surface = buildRootSurfaceContext(
    themeConfig: _minimalThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );

  final body = bounded
      ? Center(
          child: SizedBox(width: 240, height: 160, child: child),
        )
      : Center(child: child);

  return MaterialApp(
    home: OneUiSurfaceScope(
      value: surface,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: _minimalImageDesignSystem(),
        child: Scaffold(body: body),
      ),
    ),
  );
}

Future<void> _pumpImageLayout(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

Future<void> _pumpUntilImageSettled(WidgetTester tester) async {
  await _pumpImageLayout(tester);
  for (var i = 0; i < 12; i++) {
    await tester.pump(const Duration(milliseconds: 50));
  }
}

Finder _imageSemanticsFinder() {
  return find.byWidgetPredicate(
    (w) =>
        w is Semantics &&
        (w.properties.image ?? false) &&
        w.properties.label != null,
  );
}

SemanticsData _rootImageSemantics(WidgetTester tester) {
  return tester.getSemantics(_imageSemanticsFinder().first).getSemanticsData();
}

void main() {
  group('OneUiImageAspectRatio — wire + numeric parity', () {
    test('auto has null numeric and wire auto', () {
      expect(OneUiImageAspectRatio.auto.numeric, isNull);
      expect(OneUiImageAspectRatio.auto.wireValue, 'auto');
    });

    test('16:9 numeric matches web CSS', () {
      expect(OneUiImageAspectRatio.r16x9.numeric, closeTo(16 / 9, 0.001));
      expect(OneUiImageAspectRatio.r16x9.wireValue, '16:9');
    });

    test('fromWire maps known presets', () {
      expect(
          OneUiImageAspectRatioX.fromWire('1:1'), OneUiImageAspectRatio.r1x1);
      expect(
          OneUiImageAspectRatioX.fromWire('9:21'), OneUiImageAspectRatio.r9x21);
      expect(
          OneUiImageAspectRatioX.fromWire('21:9'), OneUiImageAspectRatio.r21x9);
    });

    test('fromWire unknown defaults to auto', () {
      expect(OneUiImageAspectRatioX.fromWire(null), OneUiImageAspectRatio.auto);
      expect(
          OneUiImageAspectRatioX.fromWire('bogus'), OneUiImageAspectRatio.auto);
    });

    test('all non-auto ratios have positive numeric', () {
      for (final ratio in OneUiImageAspectRatio.values) {
        if (ratio == OneUiImageAspectRatio.auto) continue;
        expect(ratio.numeric, isNotNull);
        expect(ratio.numeric!, greaterThan(0));
        expect(ratio.wireValue, isNot('auto'));
      }
    });
  });

  group('OneUiImageObjectFit — resolve + fromWire', () {
    test('fit wins over objectFit', () {
      expect(
        OneUiImageObjectFitX.resolve(
          fit: OneUiImageObjectFit.contain,
          objectFit: OneUiImageObjectFit.cover,
        ),
        OneUiImageObjectFit.contain,
      );
    });

    test('defaults to cover when both null', () {
      expect(OneUiImageObjectFitX.resolve(), OneUiImageObjectFit.cover);
    });

    test('fromWire maps canonical keywords', () {
      expect(OneUiImageObjectFitX.fromWire('contain'),
          OneUiImageObjectFit.contain);
      expect(OneUiImageObjectFitX.fromWire('container'),
          OneUiImageObjectFit.contain);
      expect(OneUiImageObjectFitX.fromWire('scale-down'),
          OneUiImageObjectFit.scaleDown);
      expect(OneUiImageObjectFitX.fromWire('cover'), OneUiImageObjectFit.cover);
      expect(OneUiImageObjectFitX.fromWire(null), OneUiImageObjectFit.cover);
    });

    test('fromWire maps extended CSS keywords to cover', () {
      for (final kw in [
        'inherit',
        'initial',
        'revert',
        'revert-layer',
        'unset'
      ]) {
        expect(OneUiImageObjectFitX.fromWire(kw), OneUiImageObjectFit.cover);
      }
    });

    test('boxFitForImageObjectFit maps to Flutter BoxFit', () {
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.cover), BoxFit.cover);
      expect(boxFitForImageObjectFit(OneUiImageObjectFit.scaleDown),
          BoxFit.scaleDown);
    });
  });

  group('OneUiImageLoadingStrategy', () {
    test('fromWire maps Figma and HTML values', () {
      expect(
        OneUiImageLoadingStrategyX.fromWire('lazy'),
        OneUiImageLoadingStrategy.lazy,
      );
      expect(
        OneUiImageLoadingStrategyX.fromWire('eager'),
        OneUiImageLoadingStrategy.eager,
      );
      expect(
        OneUiImageLoadingStrategyX.fromWire('error'),
        OneUiImageLoadingStrategy.auto,
      );
      expect(
        OneUiImageLoadingStrategyX.fromWire('empty'),
        OneUiImageLoadingStrategy.auto,
      );
    });
  });

  group('resolveOneUiImageState', () {
    test('actionable only when interactive with handler', () {
      final withHandler = resolveOneUiImageState(
        interactive: true,
        onPress: () {},
      );
      expect(withHandler.isActionable, isTrue);

      final noHandler = resolveOneUiImageState(interactive: true);
      expect(noHandler.isActionable, isFalse);
      expect(noHandler.isInteractive, isTrue);
    });

    test('emits data-aspect-ratio when not auto', () {
      final s =
          resolveOneUiImageState(aspectRatio: OneUiImageAspectRatio.r16x9);
      expect(s.dataAttributes['data-aspect-ratio'], '16:9');
    });

    test('omits data-aspect-ratio when auto', () {
      expect(resolveOneUiImageState().dataAttributes, isEmpty);
    });
  });

  group('resolveOneUiImageA11y — RN ImageA11y.test.ts parity', () {
    test('uses alt as default label', () {
      final a11y = resolveOneUiImageA11y(
        alt: 'Product photo',
        interactive: false,
        disabled: false,
      );
      expect(a11y.label, 'Product photo');
      expect(a11y.isInteractive, isFalse);
      expect(a11y.excludeInnerFromSemantics, isTrue);
    });

    test('aria-label overrides alt', () {
      final a11y = resolveOneUiImageA11y(
        alt: 'alt text',
        ariaLabel: 'Hero image',
        interactive: true,
        disabled: false,
      );
      expect(a11y.label, 'Hero image');
      expect(a11y.isInteractive, isTrue);
    });

    test('disabled blocks interactive role', () {
      final a11y = resolveOneUiImageA11y(
        alt: 'x',
        interactive: true,
        disabled: true,
      );
      expect(a11y.isInteractive, isFalse);
    });

    test('trims whitespace from label', () {
      final a11y = resolveOneUiImageA11y(
        alt: '  spaced  ',
        ariaLabel: '  custom  ',
        interactive: false,
        disabled: false,
      );
      expect(a11y.label, 'custom');
    });
  });

  group('parseImageLayoutLength', () {
    test('parses numeric and px strings', () {
      expect(parseImageLayoutLength(200), 200);
      expect(parseImageLayoutLength('120px'), 120);
    });

    test('returns null for percent strings', () {
      expect(parseImageLayoutLength('50%'), isNull);
    });
  });

  group('resolveImageStyle', () {
    testWidgets('reads border radius from design system', (tester) async {
      late ImageResolvedStyle style;
      await tester.pumpWidget(
        pumpImageApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              style = resolveImageStyle(context, ds);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(style.borderRadius.topLeft.x, 8);
      expect(style.objectFit, OneUiImageObjectFit.cover);
      expect(style.disabledOpacity, 0.5);
    });

    testWidgets('fit prop overrides token objectFit', (tester) async {
      late ImageResolvedStyle style;
      await tester.pumpWidget(
        pumpImageApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              style = resolveImageStyle(
                context,
                ds,
                fit: OneUiImageObjectFit.contain,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(style.objectFit, OneUiImageObjectFit.contain);
    });

    testWidgets('borderRadiusToken override resolves shape token',
        (tester) async {
      late ImageResolvedStyle style;
      await tester.pumpWidget(
        pumpImageApp(
          Builder(
            builder: (context) {
              final ds = OneUiScope.designSystemOf(context)!;
              style = resolveImageStyle(
                context,
                ds,
                borderRadiusToken: '--Shape-3',
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(style.borderRadius.topLeft.x, 12);
    });
  });

  group('OneUiImage widget', () {
    testWidgets('shows gap card when OneUiScope missing', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: OneUiImage(src: _kBrokenUrl, alt: 'Photo'),
        ),
      );
      expect(find.byType(ConvexGapCard), findsOneWidget);
    });

    testWidgets('testId exposes ValueKey and Semantics.identifier',
        (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Hero',
            testId: 'hero-image',
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byKey(const ValueKey('hero-image')), findsOneWidget);
      final semantics = tester.getSemantics(
        find.byWidgetPredicate(
          (w) => w is Semantics && w.properties.identifier == 'hero-image',
        ),
      );
      expect(semantics.getSemanticsData().identifier, 'hero-image');
    });

    testWidgets('aspect ratio auto omits AspectRatio', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Auto',
            aspectRatio: OneUiImageAspectRatio.auto,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(AspectRatio), findsNothing);
    });

    testWidgets('aspect ratio 16:9 wraps AspectRatio', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Wide',
            aspectRatio: OneUiImageAspectRatio.r16x9,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      final aspect = tester.widget<AspectRatio>(find.byType(AspectRatio));
      expect(aspect.aspectRatio, closeTo(16 / 9, 0.001));
    });

    testWidgets('width and height apply SizedBox', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Sized',
            width: 200,
            height: 120,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      final sized = find.descendant(
        of: find.byType(OneUiImage),
        matching: find.byWidgetPredicate(
          (w) => w is SizedBox && w.width == 200 && w.height == 120,
        ),
      );
      expect(sized, findsOneWidget);
    });

    testWidgets('width and height accept px strings', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Sized',
            width: '180px',
            height: '90px',
          ),
        ),
      );
      await _pumpImageLayout(tester);
      final sized = find.descendant(
        of: find.byType(OneUiImage),
        matching: find.byWidgetPredicate(
          (w) => w is SizedBox && w.width == 180 && w.height == 90,
        ),
      );
      expect(sized, findsOneWidget);
    });

    testWidgets('data-aspect-ratio encoded on subtree key', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Wide',
            aspectRatio: OneUiImageAspectRatio.r16x9,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(
        find.byKey(
            const ValueKey<String>('oneui-image|data-aspect-ratio=16:9')),
        findsOneWidget,
      );
    });

    testWidgets('accepts loading prop without crashing', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Lazy',
            loading: OneUiImageLoadingStrategy.lazy,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(OneUiImage), findsOneWidget);
    });

    testWidgets('shows default fallback icon when load fails', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(src: _kBrokenUrl, alt: 'Broken'),
          bounded: true,
        ),
      );
      await _pumpImageLayout(tester);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(find.byType(OneUiImageFallbackIcon), findsOneWidget);
    });

    testWidgets('shows custom fallback when load fails', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Broken',
            fallback: Text('No image', key: Key('custom-fallback')),
          ),
          bounded: true,
        ),
      );
      await _pumpImageLayout(tester);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(find.text('No image'), findsOneWidget);
      expect(find.byType(OneUiImageFallbackIcon), findsNothing);
    });

    testWidgets('calls onError after failed load', (tester) async {
      var errors = 0;
      await tester.pumpWidget(
        pumpImageApp(
          OneUiImage(
            src: _kBrokenUrl,
            alt: 'Broken',
            onError: () => errors++,
          ),
          bounded: true,
        ),
      );
      await _pumpImageLayout(tester);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(errors, 1);
    });

    testWidgets('disabled wraps Opacity', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(src: _kBrokenUrl, alt: 'Disabled', disabled: true),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(Opacity), findsWidgets);
    });
  });

  group('OneUiImage accessibility — web + RN parity', () {
    testWidgets('non-interactive exposes image semantics with alt label',
        (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(src: _kBrokenUrl, alt: 'Product photo'),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
      final data = _rootImageSemantics(tester);
      expect(data.hasFlag(SemanticsFlag.isImage), isTrue);
      expect(data.label, 'Product photo');
    });

    testWidgets('aria-label overrides alt in semantics', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'Photo',
            ariaLabel: 'Open gallery',
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(_rootImageSemantics(tester).label, 'Open gallery');
    });

    testWidgets('interactive with onPress uses button semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          OneUiImage(
            src: _kBrokenUrl,
            alt: 'Clickable',
            interactive: true,
            onPress: () {},
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(OneUiFocusInteractive), findsOneWidget);
      final data = tester
          .getSemantics(find.byType(OneUiFocusInteractive))
          .getSemanticsData();
      expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      expect(data.label, 'Clickable');
    });

    testWidgets('onClick alias triggers press handler', (tester) async {
      var clicks = 0;
      await tester.pumpWidget(
        pumpImageApp(
          OneUiImage(
            src: _kBrokenUrl,
            alt: 'Clickable',
            interactive: true,
            onClick: () => clicks++,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      await tester.tap(find.byType(OneUiFocusInteractive));
      await _pumpImageLayout(tester);
      expect(clicks, 1);
    });

    testWidgets('interactive + disabled renders image role not button',
        (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          OneUiImage(
            src: _kBrokenUrl,
            alt: 'Disabled',
            interactive: true,
            disabled: true,
            onPress: () {},
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
      final data = _rootImageSemantics(tester);
      expect(data.hasFlag(SemanticsFlag.isImage), isTrue);
      expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
    });

    testWidgets('interactive without handler stays image role', (tester) async {
      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(
            src: _kBrokenUrl,
            alt: 'No handler',
            interactive: true,
          ),
        ),
      );
      await _pumpImageLayout(tester);
      expect(find.byType(OneUiFocusInteractive), findsNothing);
      expect(
          _rootImageSemantics(tester).hasFlag(SemanticsFlag.isImage), isTrue);
    });

    testWidgets('inner remote image is excluded from semantics when loaded',
        (tester) async {
      const okUrl = 'https://example.com/photo.jpg';
      kOneUiAvatarNetworkImageCache[okUrl] = base64Decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAD0lEQVQ42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      );
      addTearDown(() => kOneUiAvatarNetworkImageCache.remove(okUrl));

      await tester.pumpWidget(
        pumpImageApp(
          const OneUiImage(src: okUrl, alt: 'Decorative inner'),
        ),
      );
      await _pumpUntilImageSettled(tester);
      final images = tester.widgetList<Image>(find.byType(Image));
      expect(images, isNotEmpty);
      for (final img in images) {
        expect(img.excludeFromSemantics, isTrue);
      }
    });
  });
}
