import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/badge_size_resolve.dart';
import 'package:ui_flutter/engine/badge_slot_padding.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

void main() {
  testWidgets('label style uses --Badge-lineHeight token ratio (not hard-coded 1)',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-fontSize-m': '10px',
        '--Badge-lineHeight-m': '14px',
        '--Badge-height-m': '20px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'S:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiScope(
          platformId: 'S',
          density: 'default',
          designSystem: ds,
          child: Builder(
            builder: (context) {
              final layout = resolveBadgeLayout(
                context,
                ds,
                size: 'm',
                hasStart: false,
                hasEnd: false,
              );
              expect(layout.labelStyle.fontSize, 10);
              expect(layout.labelStyle.height, closeTo(1.4, 0.01));
              return const SizedBox();
            },
          ),
        ),
      ),
    );
  });

  testWidgets(
      'XL keeps symmetric horizontal padding when start slot is present',
      (tester) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-paddingHorizontal-xl': '6px',
        '--Badge-paddingHorizontal-xl-slot': '4px',
        '--Badge-paddingVertical-xl': '4px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiScope(
          platformId: 'L',
          density: 'default',
          designSystem: ds,
          child: Builder(
            builder: (context) {
              final pad = resolveBadgeContainerPadding(
                'xl',
                hasStart: true,
                hasEnd: false,
                ds: ds,
                context: context,
              );
              expect(pad.left, 6);
              expect(pad.right, 6);
              return const SizedBox();
            },
          ),
        ),
      ),
    );
  });

  testWidgets('XL keeps symmetric padding for mixed icon + CounterBadge slots',
      (
    tester,
  ) async {
    final ds = NativeDesignSystemPayload(
      componentCustomProperties: {
        '--Badge-paddingHorizontal-xl': '6px',
        '--Badge-paddingVertical-xl': '4px',
      },
      dimensionContexts: const [],
      activeDimensionKey: 'L:default',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: OneUiScope(
          platformId: 'L',
          density: 'default',
          designSystem: ds,
          child: Builder(
            builder: (context) {
              final pad = resolveBadgeContainerPadding(
                'xl',
                hasStart: true,
                hasEnd: true,
                ds: ds,
                context: context,
                slotFlags: const BadgeSlotPaddingFlags(
                  startIsBadge: false,
                  endIsBadge: true,
                ),
              );
              expect(pad.left, 6);
              expect(pad.right, 6);
              return const SizedBox();
            },
          ),
        ),
      ),
    );
  });
}
