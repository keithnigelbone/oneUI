import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';

void main() {
  test('NativeTypographySnapshot emphasisStyle applies weights.high', () {
    final snap = NativeTypographySnapshot.tryParse({
      'label': {
        'sizes': {
          'M': {
            'fontSize': 14,
            'lineHeight': 20,
            'fontWeight': 500,
            'fontFamily': 'TestFont',
          },
        },
        'weights': {'high': 700, 'medium': 500, 'low': 400},
      },
    });
    expect(snap, isNotNull);
    final high = snap!.emphasisStyle('label', 'M', emphasis: 'high');
    expect(high!.fontWeight, FontWeight.w700);
    expect(high.fontSize, 14);
    expect(high.height, closeTo(20 / 14, 0.01));
  });

  test('resolveV2LabelCssCustomProperty maps Convex label tokens', () {
    final snap = NativeTypographySnapshot.tryParse({
      'label': {
        'sizes': {
          'XS': {'fontSize': 11, 'lineHeight': 16},
          'M': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 500},
        },
        'weights': {'high': 700, 'medium': 500, 'low': 400},
      },
    });
    expect(snap, isNotNull);
    expect(
        snap!.resolveV2LabelCssCustomProperty('--Label-XS-FontSize'), '11px');
    expect(
        snap!.resolveV2LabelCssCustomProperty('--Label-XS-LineHeight'), '16px');
    expect(snap!.resolveV2LabelCssCustomProperty('--Label-FontWeight-High'),
        '700');
    expect(snap!.resolveV2LabelCssCustomProperty('--Label-FontWeight-Medium'),
        '500');
  });

  test('scriptVariantOverlay reads Convex scriptVariants tree', () {
    final snap = NativeTypographySnapshot.tryParse({
      'body': {
        'sizes': {
          'M': {'fontSize': 14, 'lineHeight': 20, 'fontWeight': 500},
        },
        'weights': {'high': 700, 'medium': 500, 'low': 400},
      },
      'fontFamilies': {
        'primary': 'JioType',
        'script': 'Noto Sans',
      },
      'scriptVariants': {
        'devanagari': {
          'ui': {
            'body': {
              'M': {
                'fontFamily': 'Noto Sans Devanagari UI',
                'fontSize': 14,
                'lineHeight': 22,
              },
            },
          },
        },
      },
    });
    expect(snap, isNotNull);
    final overlay = snap!.scriptVariantOverlay(
      scriptId: 'devanagari',
      scriptMode: 'ui',
      role: 'body',
      size: 'M',
    );
    expect(overlay?.fontFamily, 'Noto Sans Devanagari UI');
    expect(overlay?.height, closeTo(22 / 14, 0.01));
    expect(snap.fontFamilyScript, 'Noto Sans');
  });
}
