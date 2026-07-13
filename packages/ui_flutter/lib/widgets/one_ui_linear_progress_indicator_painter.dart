import 'package:flutter/material.dart';

import '../engine/lpi_color_resolve.dart';
import '../engine/lpi_size_resolve.dart';

/// Paints track + indicator — Figma/web: `roundCaps` affects both track and fill.
class OneUiLinearProgressIndicatorPainter extends CustomPainter {
  OneUiLinearProgressIndicatorPainter({
    required this.colors,
    required this.layout,
    required this.isIndeterminate,
    required this.indeterminateTranslateFactor,
  });

  final LpiResolvedColors colors;
  final LpiResolvedLayout layout;
  final bool isIndeterminate;
  final double indeterminateTranslateFactor;

  @override
  void paint(Canvas canvas, Size size) {
    final height = size.height;
    if (height <= 0 || size.width <= 0) return;

    final trackRadius = layout.trackBorderRadiusPx;
    final indicatorRadius = layout.indicatorBorderRadiusPx;

    final trackRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, height),
      Radius.circular(trackRadius),
    );
    final trackPaint = Paint()
      ..color = colors.track
      ..isAntiAlias = trackRadius > 0;
    canvas.drawRRect(trackRRect, trackPaint);

    final indicatorPaint = Paint()
      ..color = colors.indicator
      ..isAntiAlias = indicatorRadius > 0;

    // Figma / web `.track { overflow: hidden }` — clip fill to the rail so
    // indeterminate translateX(-100%…250%) never bleeds outside the track.
    canvas.save();
    canvas.clipRRect(trackRRect);

    if (isIndeterminate) {
      final barWidth = size.width * layout.indeterminateWidthFraction;
      final left = indeterminateTranslateFactor * barWidth;
      final indicatorRRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(left, 0, barWidth, height),
        Radius.circular(indicatorRadius),
      );
      canvas.drawRRect(indicatorRRect, indicatorPaint);
      canvas.restore();
      return;
    }

    final fillWidth = size.width * layout.fillFraction.clamp(0.0, 1.0);
    if (fillWidth > 0) {
      final indicatorRRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, fillWidth, height),
        Radius.circular(indicatorRadius),
      );
      canvas.drawRRect(indicatorRRect, indicatorPaint);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(OneUiLinearProgressIndicatorPainter oldDelegate) {
    return oldDelegate.colors.indicator != colors.indicator ||
        oldDelegate.colors.track != colors.track ||
        oldDelegate.layout.trackBorderRadiusPx != layout.trackBorderRadiusPx ||
        oldDelegate.layout.indicatorBorderRadiusPx !=
            layout.indicatorBorderRadiusPx ||
        oldDelegate.layout.fillFraction != layout.fillFraction ||
        oldDelegate.layout.indeterminateWidthFraction !=
            layout.indeterminateWidthFraction ||
        oldDelegate.isIndeterminate != isIndeterminate ||
        oldDelegate.indeterminateTranslateFactor !=
            indeterminateTranslateFactor;
  }
}
