/// LPI painter — Figma track vs indicator cap geometry + track clip.
library;

import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/lpi_color_resolve.dart';
import 'package:ui_flutter/engine/lpi_motion_resolve.dart';
import 'package:ui_flutter/engine/lpi_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_painter.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_types.dart';

void main() {
  group('[fn] OneUiLinearProgressIndicatorPainter', () {
    test('[fn] roundCaps true — pill track and pill indicator', () {
      const layout = LpiResolvedLayout(
        trackHeightPx: 10,
        trackBorderRadiusPx: 5,
        indicatorBorderRadiusPx: 5,
        fillFraction: 0.6,
        indeterminateWidthFraction: 0.4,
      );
      final painter = OneUiLinearProgressIndicatorPainter(
        colors: const LpiResolvedColors(
          indicator: Color(0xFFFF0000),
          track: Color(0xFFCCCCCC),
        ),
        layout: layout,
        isIndeterminate: false,
        indeterminateTranslateFactor: 0,
      );
      expect(painter.layout.trackBorderRadiusPx, 5);
      expect(painter.layout.indicatorBorderRadiusPx, 5);
    });

    test('[fn] roundCaps false — square track and indicator (Figma/web)', () {
      const layout = LpiResolvedLayout(
        trackHeightPx: 10,
        trackBorderRadiusPx: 0,
        indicatorBorderRadiusPx: 0,
        fillFraction: 0.6,
        indeterminateWidthFraction: 0.4,
      );
      final painter = OneUiLinearProgressIndicatorPainter(
        colors: const LpiResolvedColors(
          indicator: Color(0xFFFF0000),
          track: Color(0xFFCCCCCC),
        ),
        layout: layout,
        isIndeterminate: false,
        indeterminateTranslateFactor: 0,
      );
      expect(painter.layout.trackBorderRadiusPx, 0);
      expect(painter.layout.indicatorBorderRadiusPx, 0);
    });

    test('[fn] indeterminate segment clipped to track (no left bleed)', () async {
      const trackWidth = 200.0;
      const trackHeight = 10.0;
      const layout = LpiResolvedLayout(
        trackHeightPx: trackHeight,
        trackBorderRadiusPx: 5,
        indicatorBorderRadiusPx: 5,
        fillFraction: 0,
        indeterminateWidthFraction: kLpiIndeterminateWidthFraction,
      );
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      // translateX(-50%) of bar width — would bleed left without clip.
      const translateFactor = -0.5;
      OneUiLinearProgressIndicatorPainter(
        colors: const LpiResolvedColors(
          indicator: Color(0xFF3900AD),
          track: Color(0xFFE7E9FF),
        ),
        layout: layout,
        isIndeterminate: true,
        indeterminateTranslateFactor: translateFactor,
      ).paint(canvas, const Size(trackWidth, trackHeight));

      final picture = recorder.endRecording();
      final image = picture.toImageSync(trackWidth.toInt(), trackHeight.toInt());
      final bytes = await image.toByteData(format: ui.ImageByteFormat.rawRgba);
      expect(bytes, isNotNull);
      final data = bytes!;

      // Leftmost column must stay track-only (no indicator purple at x=0).
      const purple = Color(0xFF3900AD);
      var leftColumnHasIndicator = false;
      for (var y = 0; y < trackHeight.toInt(); y++) {
        final offset = (y * trackWidth.toInt()) * 4;
        final r = data.getUint8(offset);
        final g = data.getUint8(offset + 1);
        final b = data.getUint8(offset + 2);
        final a = data.getUint8(offset + 3);
        if (a > 200 && Color.fromARGB(a, r, g, b).value == purple.value) {
          leftColumnHasIndicator = true;
          break;
        }
      }
      expect(leftColumnHasIndicator, isFalse);

      // Mid-track should still show indicator (segment overlaps track interior).
      var midHasIndicator = false;
      const midX = 20;
      for (var y = 0; y < trackHeight.toInt(); y++) {
        final offset = (y * trackWidth.toInt() + midX) * 4;
        final r = data.getUint8(offset);
        final g = data.getUint8(offset + 1);
        final b = data.getUint8(offset + 2);
        final a = data.getUint8(offset + 3);
        if (a > 200 && Color.fromARGB(a, r, g, b).value == purple.value) {
          midHasIndicator = true;
          break;
        }
      }
      expect(midHasIndicator, isTrue);
    });

    test('[fn] indeterminate translate uses bar width (CSS -100%)', () {
      const barFraction = kLpiIndeterminateWidthFraction;
      expect(
        LpiIndeterminateMotion.startTranslateFactor * barFraction,
        -barFraction,
      );
      expect(
        LpiIndeterminateMotion.translateFactorForProgress(1, reducedMotion: false),
        LpiIndeterminateMotion.endTranslateFactor,
      );
    });
  });
}
