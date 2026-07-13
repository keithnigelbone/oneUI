import 'package:flutter/material.dart';

import '../engine/slider_active_track_geometry.dart';
import '../engine/slider_color_resolve.dart';
import '../engine/slider_size_resolve.dart';

class OneUiSliderActiveTrack extends StatelessWidget {
  const OneUiSliderActiveTrack({
    super.key,
    required this.values,
    required this.min,
    required this.max,
    required this.vertical,
    required this.isRange,
    required this.knobStyle,
    required this.trackLength,
    required this.trackThickness,
    required this.colors,
    required this.borderRadius,
  });

  final List<double> values;
  final double min;
  final double max;
  final bool vertical;
  final bool isRange;
  final String knobStyle;
  final double trackLength;
  final double trackThickness;
  final SliderResolvedColors colors;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final geom = computeSliderActiveTrackGeometry(
      values: values,
      min: min,
      max: max,
      trackLength: trackLength,
      isRange: isRange,
      knobStyle: knobStyle,
      trackThickness: trackThickness,
    );
    if (geom.isEmpty) return const SizedBox.shrink();

    final fill = DecoratedBox(
      decoration: BoxDecoration(
        color: colors.fill,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );

    if (vertical) {
      final bottom = geom.leadingPx - geom.extendLeadingPx;
      final height = geom.spanPx + geom.extendLeadingPx + geom.extendTrailingPx;
      return Positioned(
        left: 0,
        right: 0,
        bottom: bottom,
        height: height,
        child: fill,
      );
    }

    final left = geom.leadingPx - geom.extendLeadingPx;
    final width = geom.spanPx + geom.extendLeadingPx + geom.extendTrailingPx;
    return Positioned(
      left: left,
      top: 0,
      bottom: 0,
      width: width,
      child: fill,
    );
  }
}
