import 'dart:math' as math;

import 'package:flutter/material.dart';

/// SVG-equivalent ring painter — web `pathLength=100` dash trim + `.svg` rotation.
///
/// Indeterminate: `stroke-dasharray: (head−tail) (100−(head−tail))`,
/// `stroke-dashoffset: −tail` on a circle starting at 12 o'clock; the whole ring
/// group rotates 0→1080° (see `CircularProgressIndicator.module.css`).
class OneUiCircularProgressIndicatorPainter extends CustomPainter {
  OneUiCircularProgressIndicatorPainter({
    required this.trackColor,
    required this.indicatorColor,
    required this.strokeWidthViewBox,
    required this.radiusViewBox,
    required this.isIndeterminate,
    required this.determinateSweepFraction,
    required this.indeterminateHead,
    required this.indeterminateTail,
    required this.strokeScale,
    this.rotationDegrees = 0,
  });

  final Color trackColor;
  final Color indicatorColor;
  final double strokeWidthViewBox;
  final double radiusViewBox;
  final bool isIndeterminate;

  /// Determinate fill fraction 0–1.
  final double determinateSweepFraction;

  /// Web `--cpi-indeterminate-head` (2 → 100 → 102).
  final double indeterminateHead;

  /// Web `--cpi-indeterminate-tail` (0 → 100).
  final double indeterminateTail;
  final double strokeScale;
  final double rotationDegrees;

  static const _tau = 2 * math.pi;
  static const _topAngle = -math.pi / 2;
  static const _pathLength = 100.0;

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.shortestSide / 100;
    final strokePx = strokeWidthViewBox * scale * strokeScale;
    if (strokePx <= 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = radiusViewBox * scale;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokePx
      ..strokeCap = StrokeCap.round;

    final indicatorPaint = Paint()
      ..color = indicatorColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokePx
      ..strokeCap = StrokeCap.round;

    if (isIndeterminate) {
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(rotationDegrees * math.pi / 180);
      canvas.translate(-center.dx, -center.dy);
      canvas.drawArc(rect, 0, _tau, false, trackPaint);
      _paintIndeterminateArc(canvas, rect, indicatorPaint);
      canvas.restore();
    } else {
      canvas.drawArc(rect, 0, _tau, false, trackPaint);
      final fraction = determinateSweepFraction.clamp(0.0, 1.0);
      if (fraction > 0) {
        canvas.drawArc(rect, _topAngle, fraction * _tau, false, indicatorPaint);
      }
    }
  }

  /// pathLength=100 trim — same numbers as CSS `stroke-dasharray` / `stroke-dashoffset`.
  void _paintIndeterminateArc(Canvas canvas, Rect rect, Paint paint) {
    final visible = math.max(
      math.min(indeterminateHead - indeterminateTail, _pathLength),
      2.0,
    );
    final tailNorm = indeterminateTail % _pathLength;
    final startAngle = _topAngle + (tailNorm / _pathLength) * _tau;
    final sweepAngle = (visible / _pathLength) * _tau;
    canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
  }

  @override
  bool shouldRepaint(OneUiCircularProgressIndicatorPainter oldDelegate) {
    return trackColor != oldDelegate.trackColor ||
        indicatorColor != oldDelegate.indicatorColor ||
        strokeWidthViewBox != oldDelegate.strokeWidthViewBox ||
        radiusViewBox != oldDelegate.radiusViewBox ||
        isIndeterminate != oldDelegate.isIndeterminate ||
        determinateSweepFraction != oldDelegate.determinateSweepFraction ||
        indeterminateHead != oldDelegate.indeterminateHead ||
        indeterminateTail != oldDelegate.indeterminateTail ||
        strokeScale != oldDelegate.strokeScale ||
        rotationDegrees != oldDelegate.rotationDegrees;
  }
}
