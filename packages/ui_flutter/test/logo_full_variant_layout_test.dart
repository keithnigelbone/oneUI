import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import 'logo_test_harness.dart';

void main() {
  testWidgets('full variant uses viewBox aspect width, not infinite expand',
      (tester) async {
    const wideWordmark = '''
<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
  <rect fill="currentColor" width="200" height="40"/>
</svg>''';

    await tester.pumpWidget(
      pumpLogoApp(
        const SizedBox(
          width: 300,
          child: Center(
            child: OneUiLogo(
              alt: 'Wordmark',
              variant: OneUiLogoVariant.full,
              size: OneUiLogoSize.xl,
              svgContent: wideWordmark,
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final box = tester.getSize(find.byType(OneUiLogo));
    expect(box.height, greaterThan(0));
    expect(box.width, lessThanOrEqualTo(300));
    expect(box.width, greaterThan(0));
  });
}
