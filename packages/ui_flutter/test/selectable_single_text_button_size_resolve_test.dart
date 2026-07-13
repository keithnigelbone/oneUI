import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/selectable_single_text_button_size_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

/// Convex manifest keys only — `height-{sz}` + `paddingHorizontal-{sz}` per
/// `SelectableSingleTextButton.tokens.ts` (no `padding-{sz}`, no condensed keys).
NativeDesignSystemPayload _manifestOnlyDesignSystem() {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': {
      '--SelectableSingleTextButton-borderRadius': '9999px',
      '--SelectableSingleTextButton-height-s': 'var(--Spacing-8)',
      '--SelectableSingleTextButton-height-m': 'var(--Spacing-10)',
      '--SelectableSingleTextButton-height-l': 'var(--Spacing-12)',
      '--SelectableSingleTextButton-paddingHorizontal-s': 'var(--Spacing-4)',
      '--SelectableSingleTextButton-paddingHorizontal-m': 'var(--Spacing-5)',
      '--SelectableSingleTextButton-paddingHorizontal-l': 'var(--Spacing-6)',
      '--SelectableSingleTextButton-fontSize-s': 'var(--Label-S-FontSize)',
      '--SelectableSingleTextButton-fontSize-m': 'var(--Label-M-FontSize)',
      '--SelectableSingleTextButton-fontSize-l': 'var(--Label-L-FontSize)',
      '--SelectableSingleTextButton-lineHeight-s': 'var(--Label-S-LineHeight)',
      '--SelectableSingleTextButton-lineHeight-m': 'var(--Label-M-LineHeight)',
      '--SelectableSingleTextButton-lineHeight-l': 'var(--Label-L-LineHeight)',
      '--SelectableSingleTextButton-fontWeight': 'var(--Label-FontWeight-High)',
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
        '--Label-S-FontSize': '12px',
        '--Label-M-FontSize': '14px',
        '--Label-L-FontSize': '16px',
        '--Label-S-LineHeight': '17px',
        '--Label-M-LineHeight': '20px',
        '--Label-L-LineHeight': '22px',
        '--Label-FontWeight-High': '700',
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
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'fontFamilies': {'primary': 'Roboto'},
  })!;
}

void main() {
  group('resolveSelectableSingleTextButtonSizeMetrics manifest parity', () {
    testWidgets('non-condensed uses height-{sz} and tight padding fallback',
        (tester) async {
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
                final metrics = resolveSelectableSingleTextButtonSizeMetrics(
                  ds,
                  size: 'm',
                  condensed: false,
                  platformId: 'S',
                  density: 'default',
                  platformsConfig: null,
                  nativeTypography: _minimalTypography(),
                );
                expect(metrics?.minSizePx, 40);
                expect(metrics?.paddingPx, 4);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
    });

    testWidgets(
        'condensed falls through to spacing fallback (not height-{sz})',
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
                  final metrics = resolveSelectableSingleTextButtonSizeMetrics(
                    ds,
                    size: entry.key,
                    condensed: true,
                    platformId: 'S',
                    density: 'default',
                    platformsConfig: null,
                    nativeTypography: _minimalTypography(),
                  );
                  expect(metrics?.minSizePx, entry.value);
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

    testWidgets('manifest paddingHorizontal does not inflate all-sides padding',
        (tester) async {
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
                final metrics = resolveSelectableSingleTextButtonSizeMetrics(
                  ds,
                  size: 'm',
                  condensed: false,
                  platformId: 'S',
                  density: 'default',
                  platformsConfig: null,
                  nativeTypography: _minimalTypography(),
                );
                expect(metrics?.paddingPx, isNot(20));
                expect(metrics!.minSizePx - (metrics.paddingPx * 2), greaterThan(0));
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );
    });
  });
}
