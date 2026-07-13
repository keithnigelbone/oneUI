import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/single_text_button_size_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

/// Convex manifest keys only — `height-{sz}` + `paddingHorizontal-{sz}` per
/// `SingleTextButton.tokens.ts` (no minHeight, no condensed overrides).
NativeDesignSystemPayload _manifestOnlyDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      '--SingleTextButton-borderRadius': '9999px',
      '--SingleTextButton-height-s': 'var(--Spacing-8)',
      '--SingleTextButton-height-m': 'var(--Spacing-10)',
      '--SingleTextButton-height-l': 'var(--Spacing-12)',
      '--SingleTextButton-paddingHorizontal-s': 'var(--Spacing-0-5)',
      '--SingleTextButton-paddingHorizontal-m': 'var(--Spacing-1)',
      '--SingleTextButton-paddingHorizontal-l': 'var(--Spacing-2)',
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
        '--Spacing-4-5': '18px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
        '--Spacing-10': '40px',
        '--Spacing-12': '48px',
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
        'S': {'fontSize': 12, 'lineHeight': 17},
        'M': {'fontSize': 14, 'lineHeight': 20},
        'L': {'fontSize': 16, 'lineHeight': 22},
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

void main() {
  group('resolveSingleTextButtonSizeMetrics manifest parity', () {
    testWidgets('non-condensed uses height-{sz} from manifest', (tester) async {
      final ds = _manifestOnlyDesignSystem();
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiScope(
            platformId: 'S',
            density: 'default',
            nativeTypography: _minimalTypography(),
            designSystem: ds,
            child: Builder(
              builder: (context) {
                final metrics = resolveSingleTextButtonSizeMetrics(
                  context,
                  ds,
                  size: 'm',
                  condensed: false,
                );
                expect(metrics?.containerPx, 40);
                expect(metrics?.paddingPx, 4);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
    });

    testWidgets('condensed falls through to spacing fallback (not height-{sz})',
        (tester) async {
      final ds = _manifestOnlyDesignSystem();
      const expected = {'s': 18.0, 'm': 24.0, 'l': 32.0};
      for (final entry in expected.entries) {
        await tester.pumpWidget(
          MaterialApp(
            home: OneUiScope(
              platformId: 'S',
              density: 'default',
              nativeTypography: _minimalTypography(),
              designSystem: ds,
              child: Builder(
                builder: (context) {
                  final metrics = resolveSingleTextButtonSizeMetrics(
                    context,
                    ds,
                    size: entry.key,
                    condensed: true,
                  );
                  expect(metrics?.containerPx, entry.value);
                  expect(metrics?.paddingPx, 2);
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        );
        await tester.pumpWidget(const SizedBox.shrink());
      }
    });
  });
}
