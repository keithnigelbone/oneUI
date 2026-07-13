/// Active-track layout — mirrors Base UI `Slider.Indicator` + inside `::before`.
library;

import 'slider_value_math.dart';

class SliderActiveTrackGeometry {
  const SliderActiveTrackGeometry({
    required this.leadingPx,
    required this.spanPx,
    required this.extendLeadingPx,
    required this.extendTrailingPx,
  });

  /// Distance from the track's leading edge (left / bottom) to fill start.
  final double leadingPx;

  /// Fill extent along the track axis (before inside extensions).
  final double spanPx;

  /// Inside knob: extend fill toward leading cap by track radius.
  final double extendLeadingPx;

  /// Inside knob: extend fill toward trailing cap by track radius.
  final double extendTrailingPx;

  bool get isEmpty => spanPx <= 0;
}

SliderActiveTrackGeometry computeSliderActiveTrackGeometry({
  required List<double> values,
  required double min,
  required double max,
  required double trackLength,
  required bool isRange,
  required String knobStyle,
  required double trackThickness,
}) {
  if (values.isEmpty || max <= min || trackLength <= 0) {
    return const SliderActiveTrackGeometry(
      leadingPx: 0,
      spanPx: 0,
      extendLeadingPx: 0,
      extendTrailingPx: 0,
    );
  }

  final sorted = List<double>.from(values)..sort();
  final startFrac =
      isRange ? valueToFraction(sorted.first, min, max) : 0.0;
  final endFrac = valueToFraction(sorted.last, min, max);
  final spanFrac = (endFrac - startFrac).clamp(0.0, 1.0);

  final radius = trackThickness / 2;
  final isInside = knobStyle == 'inside';
  var extendLeading = 0.0;
  var extendTrailing = 0.0;
  if (isInside && spanFrac > 0) {
    if (isRange) {
      extendLeading = radius;
      extendTrailing = radius;
    } else {
      extendTrailing = radius;
    }
  }

  return SliderActiveTrackGeometry(
    leadingPx: startFrac * trackLength,
    spanPx: spanFrac * trackLength,
    extendLeadingPx: extendLeading,
    extendTrailingPx: extendTrailing,
  );
}
