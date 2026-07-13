import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/logo_figma_svg_normalize.dart';
import 'package:ui_flutter/engine/logo_svg_recolor.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import 'logo_test_harness.dart';

void main() {
  late String swadeshRaw;

  setUpAll(() {
    swadeshRaw = File('test/fixtures/swadesh_logo.svg').readAsStringSync();
  });

  test('logoSvgNeedsFigmaNormalization detects Swadesh export', () {
    expect(logoSvgNeedsFigmaNormalization(swadeshRaw), isTrue);
  });

  test('normalizeFigmaLogoSvg produces flutter_svg-compatible gradient path',
      () {
    final out = normalizeFigmaLogoSvg(swadeshRaw);
    expect(out, isNot(contains('foreignObject')));
    expect(out, contains('linearGradient'));
    expect(out, contains('fill="url(#oneui-figma-logo-'));
    expect(out, contains('<path d="M101.958'));
  });

  test('prepareLogoSvgForRender preserves gradient after Figma normalization',
      () {
    final prepared = prepareLogoSvgForRender(swadeshRaw);
    expect(prepared.applyCurrentColorTheme, isFalse);
    expect(prepared.svg, contains('linearGradient'));
    expect(logoSvgHasGradientPaints(prepared.svg), isTrue);
  });

  testWidgets('real Swadesh Figma SVG renders visible logo', (tester) async {
    await tester.pumpWidget(
      pumpLogoApp(
        OneUiLogo(
          alt: 'Swadesh',
          size: OneUiLogoSize.xl,
          svgContent: swadeshRaw,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(SvgPicture), findsOneWidget);
    final box = tester.getSize(find.byType(OneUiLogo));
    expect(box.height, greaterThan(0));
    expect(box.width, greaterThan(0));
  });
}
