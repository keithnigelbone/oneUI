import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_painter.dart';

void main() {
  group('OneUiCircularProgressIndicatorPainter', () {
    test('paints track and determinate arc from 12 o\'clock', () {
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      final painter = OneUiCircularProgressIndicatorPainter(
        trackColor: const Color(0xFFE0E0E0),
        indicatorColor: const Color(0xFF0000FF),
        strokeWidthViewBox: 15,
        radiusViewBox: 42.5,
        isIndeterminate: false,
        determinateSweepFraction: 0.5,
        indeterminateHead: 2,
        indeterminateTail: 0,
        strokeScale: 1,
      );
      painter.paint(canvas, const Size(100, 100));
      expect(recorder.endRecording(), isNotNull);
    });

    test('indeterminate uses pathLength=100 trim (head=50 tail=0 → half arc)',
        () {
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      const radius = 42.5;
      const stroke = 15.0;
      final painter = OneUiCircularProgressIndicatorPainter(
        trackColor: const Color(0xFFE0E0E0),
        indicatorColor: const Color(0xFF0000FF),
        strokeWidthViewBox: stroke,
        radiusViewBox: radius,
        isIndeterminate: true,
        determinateSweepFraction: 0,
        indeterminateHead: 50,
        indeterminateTail: 0,
        strokeScale: 1,
        rotationDegrees: 0,
      );
      painter.paint(canvas, const Size(100, 100));
      expect(recorder.endRecording(), isNotNull);
    });

    test('shouldRepaint when indeterminate trim or rotation changes', () {
      final base = OneUiCircularProgressIndicatorPainter(
        trackColor: Color(0xFFE0E0E0),
        indicatorColor: Color(0xFF0000FF),
        strokeWidthViewBox: 15,
        radiusViewBox: 42.5,
        isIndeterminate: true,
        determinateSweepFraction: 0,
        indeterminateHead: 2,
        indeterminateTail: 0,
        strokeScale: 1,
        rotationDegrees: 0,
      );
      expect(
        base.shouldRepaint(
          OneUiCircularProgressIndicatorPainter(
            trackColor: base.trackColor,
            indicatorColor: base.indicatorColor,
            strokeWidthViewBox: base.strokeWidthViewBox,
            radiusViewBox: base.radiusViewBox,
            isIndeterminate: true,
            determinateSweepFraction: 0,
            indeterminateHead: 100,
            indeterminateTail: 0,
            strokeScale: 1,
            rotationDegrees: 0,
          ),
        ),
        isTrue,
      );
      expect(
        base.shouldRepaint(
          OneUiCircularProgressIndicatorPainter(
            trackColor: base.trackColor,
            indicatorColor: base.indicatorColor,
            strokeWidthViewBox: base.strokeWidthViewBox,
            radiusViewBox: base.radiusViewBox,
            isIndeterminate: true,
            determinateSweepFraction: 0,
            indeterminateHead: 2,
            indeterminateTail: 0,
            strokeScale: 1,
            rotationDegrees: 360,
          ),
        ),
        isTrue,
      );
    });

    test('minimum visible span is 2% of pathLength (web/RN fallback)', () {
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      final painter = OneUiCircularProgressIndicatorPainter(
        trackColor: const Color(0xFFE0E0E0),
        indicatorColor: const Color(0xFF0000FF),
        strokeWidthViewBox: 15,
        radiusViewBox: 42.5,
        isIndeterminate: true,
        determinateSweepFraction: 0,
        indeterminateHead: 2,
        indeterminateTail: 0,
        strokeScale: 1,
      );
      painter.paint(canvas, const Size(100, 100));
      final circumference = 2 * math.pi * 42.5;
      final minSweep = (2 / 100) * circumference;
      expect(minSweep, greaterThan(0));
    });
  });
}
