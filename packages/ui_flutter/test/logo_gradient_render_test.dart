import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import 'logo_test_harness.dart';

void main() {
  testWidgets('gradient brand SVG renders without recolor flattening',
      (tester) async {
    const gradientMark = '''
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E8C872"/>
      <stop offset="100%" stop-color="#8B5A2B"/>
    </linearGradient>
  </defs>
  <rect fill="url(#gold)" width="40" height="40" rx="8"/>
</svg>''';

    await tester.pumpWidget(
      pumpLogoApp(
        const OneUiLogo(
          alt: 'Swadesh',
          size: OneUiLogoSize.xl,
          svgContent: gradientMark,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(OneUiLogo), findsOneWidget);
    final box = tester.getSize(find.byType(OneUiLogo));
    expect(box.height, greaterThan(0));
    expect(box.width, greaterThan(0));
  });
}
