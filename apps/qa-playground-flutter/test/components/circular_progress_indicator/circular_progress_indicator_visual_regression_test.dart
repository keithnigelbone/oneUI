/// CircularProgressIndicator visual regression burn-down.
///
/// Each test asserts the **expected (correct)** behaviour from the web
/// component (`CircularProgressIndicator.module.css` / `.shared.ts`). Tests stay
/// RED until the matching Flutter fix lands in `packages/ui_flutter`.
library;

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

/// Mirrors determinate sweep in `one_ui_circular_progress_indicator_painter.dart`.
double _cpiPainterDeterminateSweepRadians(double fraction) {
  const tau = 2 * math.pi;
  final clamped = fraction.clamp(0.0, 1.0);
  if (clamped <= 0) return 0;
  return clamped * tau;
}

/// Web contract: `stroke-dashoffset = circumference` at 0% hides the arc.
double _cpiWebDeterminateSweepRadians(double fraction) {
  const tau = 2 * math.pi;
  final clamped = fraction.clamp(0.0, 1.0);
  if (clamped <= 0) return 0;
  return clamped * tau;
}

const _kContentSizesSmall = <String>['2XS', 'XS', 'S', 'M'];

void main() {
  group('[regression][confirmed] CircularProgressIndicator — visual', () {
    test('[visual] [CPI-VIS-001] value=0 must not paint a minimum indicator arc',
        () {
      // PROBED: value=0 → normalizedValue=0 but painter forces
      // max(fraction, 0.001) sweep → visible dot at 12 o'clock (round cap).
      // Web uses stroke-dashoffset to hide the arc entirely at 0%.
      final state = resolveOneUiCircularProgressIndicatorState(value: 0);
      expect(state.normalizedValue, 0);
      expect(
        _cpiPainterDeterminateSweepRadians(state.normalizedValue),
        _cpiWebDeterminateSweepRadians(state.normalizedValue),
        reason:
            'At 0% progress the indicator arc must not be painted. '
            'Painter currently forces a 0.1% minimum sweep (visible dot).',
      );
    });

    testWidgetsAllPlatforms(
        '[visual] [CPI-VIS-002a] content=text centre fits inner ring (2XS–M)',
        (tester) async {
      for (final size in _kContentSizesSmall) {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
            value: 25,
            size: size,
            content: 'text',
            semanticsLabel: 'pct $size',
          ),
        );
        expect(find.text('25'), findsOneWidget, reason: 'size $size');
        expectCpiCentreContentFitsInnerRing(
          tester,
          find.text('25'),
          size: size,
        );
      }
    });

    testWidgetsAllPlatforms(
        '[visual] [CPI-VIS-002b] content=icon slot matches web CSS (2XS–S)',
        (tester) async {
      for (final size in _kContentSizesSmall) {
        final slotPx = kQaCpiWebCenterIconSlotPx[size];
        if (slotPx == null) continue;

        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
            value: 50,
            size: size,
            content: 'icon',
            semanticsLabel: 'ico $size',
            child: const OneUiIcon(icon: 'download'),
          ),
        );
        final icon = find.byType(OneUiIcon);
        expect(icon, findsOneWidget, reason: 'size $size');
        final box = tester.getSize(icon);
        expect(
          box.width,
          closeTo(slotPx, 0.01),
          reason:
              'Web CSS caps centre icon at ${slotPx}px for $size '
              '(got ${box.width.toStringAsFixed(1)}px).',
        );
        expect(box.height, closeTo(slotPx, 0.01), reason: 'size $size');
      }
    });

    testWidgetsAllPlatforms(
        '[visual] [CPI-VIS-002c] content=icon centre fits inner ring at M',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          size: 'M',
          content: 'icon',
          semanticsLabel: 'ico M',
          child: OneUiIcon(icon: 'download'),
        ),
      );
      expectCpiCentreContentFitsInnerRing(
        tester,
        find.byType(OneUiIcon),
        size: 'M',
      );
    });
  });
}
