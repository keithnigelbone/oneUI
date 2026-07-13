import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/divider_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import 'divider_test_harness.dart';

void main() {
  testWidgets('S/M/L stroke widths match web CSS logical px at 1x DPR',
      (tester) async {
    final ds = dividerTestDesignSystem();
    late double strokeS;
    late double strokeM;
    late double strokeL;

    await tester.pumpWidget(
      pumpDividerApp(
        MediaQuery(
          data: const MediaQueryData(devicePixelRatio: 1),
          child: Builder(
            builder: (context) {
              strokeS = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeS,
                roundCaps: false,
              ).strokePx;
              strokeM = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeM,
                roundCaps: false,
              ).strokePx;
              strokeL = resolveDividerLayout(
                context,
                ds,
                size: kOneUiDividerSizeL,
                roundCaps: false,
              ).strokePx;
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(strokeS, closeTo(0.5, 0.01));
    expect(strokeM, 1);
    expect(strokeL, 1.5);
    expect(strokeS, lessThan(strokeM));
    expect(strokeM, lessThan(strokeL));
  });

  testWidgets(
      'brand --Stroke-* overrides produce distinct S/M/L (Swadesh-style)', (
    tester,
  ) async {
    final ds = NativeDesignSystemPayload.tryParse({
      'componentCustomProperties': <String, dynamic>{
        '--Stroke-S': '1px',
        '--Stroke-M': '4px',
        '--Stroke-L': '8px',
      },
      'dimensionContexts': <dynamic>[],
      'activeDimensionKey': 'L:default',
    })!;
    late double strokeS;
    late double strokeM;
    late double strokeL;

    await tester.pumpWidget(
      pumpDividerApp(
        Builder(
          builder: (context) {
            strokeS = resolveDividerLayout(
              context,
              ds,
              size: kOneUiDividerSizeS,
              roundCaps: false,
            ).strokePx;
            strokeM = resolveDividerLayout(
              context,
              ds,
              size: kOneUiDividerSizeM,
              roundCaps: false,
            ).strokePx;
            strokeL = resolveDividerLayout(
              context,
              ds,
              size: kOneUiDividerSizeL,
              roundCaps: false,
            ).strokePx;
            return const SizedBox.shrink();
          },
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(strokeS, 1);
    expect(strokeM, 4);
    expect(strokeL, 8);
  });

  testWidgets('horizontal content divider spans parent width', (tester) async {
    await tester.pumpWidget(
      pumpDividerApp(
        const SizedBox(
          width: 320,
          child: OneUiDivider(
            content: kOneUiDividerContentText,
            contentAlign: kOneUiDividerAlignCenter,
            child: 'Section',
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final box = tester.getSize(find.byType(OneUiDivider));
    expect(box.width, 320);
  });
}
