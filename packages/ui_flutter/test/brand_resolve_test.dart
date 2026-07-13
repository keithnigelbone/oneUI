import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_design_system.dart';
import 'package:ui_flutter/brand/resolve_brand_canvas.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';

void main() {
  test('defaultUnbrandedDesignSystem includes Button border radius', () {
    final ds =
        defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default');
    expect(ds.componentCustomProperties['--Button-borderRadius'],
        'var(--Shape-Pill)');
  });

  test('defaultUnbrandedDesignSystem includes SelectableSingleTextButton sizing',
      () {
    final ds =
        defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default');
    expect(
      ds.componentCustomProperties['--SelectableSingleTextButton-borderRadius'],
      'var(--Shape-Pill)',
    );
    expect(
      ds.componentCustomProperties['--SelectableSingleTextButton-height-m'],
      'var(--Spacing-10)',
    );
    expect(
      ds.componentCustomProperties['--SelectableSingleTextButton-fontSize-m'],
      'var(--Label-M-FontSize)',
    );
  });

  test('defaultUnbrandedDesignSystem includes SelectableIconButton sizing', () {
    final ds =
        defaultUnbrandedDesignSystem(activeDimensionKey: 'S:default');
    expect(ds.componentCustomProperties['--SelectableIconButton-borderRadius'],
        'var(--Shape-Pill)');
    expect(
        ds.componentCustomProperties['--SelectableIconButton-containerSize-10'],
        'var(--Spacing-10)');
    expect(ds.componentCustomProperties['--SelectableIconButton-iconSize-10'],
        'var(--Spacing-5)');
  });

  test('mergeComponentTokenManifestFallback prefers Convex keys', () {
    final convex = NativeDesignSystemPayload(
      componentCustomProperties: {'--Badge-height-m': '20px'},
      dimensionContexts: const [],
      activeDimensionKey: 'S:default',
    );
    final merged = mergeComponentTokenManifestFallback(
      convex,
      activeDimensionKey: 'S:default',
    );
    expect(merged.componentCustomProperties['--Badge-height-m'], '20px');
    expect(
        merged.componentCustomProperties['--Button-borderRadius'], isNotNull);
  });

  test('resolveDesignSystemForBrand unbranded matches default manifest', () {
    final resolved = resolveDesignSystemForBrand(
      brandId: '',
      activeDimensionKey: 'L:compact',
      snapshot: null,
    );
    expect(resolved?.componentCustomProperties['--Button-borderRadius'],
        'var(--Shape-Pill)');
  });
}
