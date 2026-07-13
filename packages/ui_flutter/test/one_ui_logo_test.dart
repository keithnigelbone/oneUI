import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/logo_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import 'logo_test_harness.dart';

void main() {
  group('resolveOneUiLogoSize — Figma API', () {
    test('canonicalises Figma aliases', () {
      expect(resolveOneUiLogoSize('XS'), OneUiLogoSize.xs);
      expect(resolveOneUiLogoSize('XL'), OneUiLogoSize.xl);
      expect(resolveOneUiLogoSize('CUSTOM'), OneUiLogoSize.custom);
      expect(resolveOneUiLogoSize('m'), OneUiLogoSize.m);
    });

    test('defaults to m', () {
      expect(resolveOneUiLogoSize(null), OneUiLogoSize.m);
      expect(resolveOneUiLogoSize('XXL'), OneUiLogoSize.m);
    });

    test('lists all Figma size tokens', () {
      expect(kOneUiLogoFigmaSizes, contains('m'));
      expect(kOneUiLogoFigmaSizes, contains('custom'));
      expect(kOneUiLogoFigmaSizes.length, 6);
    });
  });

  group('resolveOneUiLogoState — Figma defaults + data attrs', () {
    test('defaults size m and interactive false', () {
      final state = resolveOneUiLogoState(alt: 'Jio', svgContent: kLogoTestSvg);
      expect(state.resolvedSize, OneUiLogoSize.m);
      expect(state.isInteractive, isFalse);
      expect(state.dataAttrs['data-size'], 'm');
      expect(state.dataAttrs.containsKey('data-interactive'), isFalse);
    });

    test('emits data-interactive when interactive and not disabled', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        interactive: true,
        onPress: () {},
      );
      expect(state.dataAttrs['data-interactive'], 'true');
      expect(state.dataPayloadKey, contains('data-interactive=true'));
    });

    test('dataPayloadKey encodes variant and size', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        variant: OneUiLogoVariant.full,
        size: 'L',
      );
      expect(state.dataAttrs, {
        'data-variant': 'full',
        'data-size': 'l',
      });
      expect(state.dataPayloadKey, contains('oneui-logo'));
      expect(state.dataPayloadKey, contains('data-variant=full'));
      expect(state.dataPayloadKey, contains('data-size=l'));
    });

    test('includes data-material when set', () {
      final state = resolveOneUiLogoState(
        alt: 'Jio',
        svgContent: kLogoTestSvg,
        material: 'gold',
      );
      expect(state.dataAttrs['data-material'], 'gold');
    });
  });

  group('oneUiLogoSvgAspectRatio', () {
    test('parses viewBox ratio', () {
      expect(oneUiLogoSvgAspectRatio('<svg viewBox="0 0 200 100"></svg>'), 2);
    });
  });

  group('OneUiLogo widget', () {
    testWidgetsAllPlatforms('root KeyedSubtree encodes data-* payload key',
        (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(
            alt: 'Jio',
            size: OneUiLogoSize.l,
            svgContent: kLogoTestSvg,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>).value.startsWith('oneui-logo'),
        ),
        findsOneWidget,
      );
      expect(
        find.byWidgetPredicate(
          (w) =>
              w is KeyedSubtree &&
              w.key is ValueKey<String> &&
              (w.key! as ValueKey<String>).value.contains('data-size=l'),
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('renders svgContent', (tester) async {
      await tester.pumpWidget(
        pumpLogoApp(
          const OneUiLogo(alt: 'Jio', svgContent: kLogoTestSvg),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(OneUiLogo), findsOneWidget);
    });

    testWidgetsAllPlatforms('custom size resolves via token helper',
        (tester) async {
      late double resolved;
      await tester.pumpWidget(
        pumpLogoApp(
          Builder(
            builder: (context) {
              resolved = resolveOneUiLogoSizePx(
                context,
                OneUiLogoSize.custom,
                customSize: 48,
              );
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(resolved, 48);
    });
  });
}
