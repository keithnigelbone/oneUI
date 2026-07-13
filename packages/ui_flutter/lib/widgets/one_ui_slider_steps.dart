import 'package:flutter/material.dart';

import '../engine/slider_size_resolve.dart';
import '../engine/slider_value_math.dart' show tickCountForSteps, valueToFraction;

class OneUiSliderSteps extends StatelessWidget {
  const OneUiSliderSteps({
    super.key,
    required this.min,
    required this.max,
    required this.step,
    required this.activeValues,
    required this.vertical,
    required this.trackLength,
    required this.layout,
    required this.knobStyle,
    required this.tickColor,
    this.stepLabels,
  });

  final double min;
  final double max;
  final double step;
  final List<double> activeValues;
  final bool vertical;
  final double trackLength;
  final SliderResolvedLayout layout;
  final String knobStyle;
  final Color tickColor;
  final List<Widget>? stepLabels;

  @override
  Widget build(BuildContext context) {
    final count = tickCountForSteps(min, max, step);
    if (count <= 1 || count > 64) return const SizedBox.shrink();

    final minActive = activeValues.length > 1
        ? activeValues.reduce((a, b) => a < b ? a : b)
        : min;
    final maxActive = activeValues.isNotEmpty ? activeValues.last : min;
    final tickSize = layout.tickSizeFor(knobStyle);

    return ExcludeSemantics(
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          for (var i = 1; i < count - 1; i++)
            Builder(
              builder: (context) {
                final value = min + i * step;
                final isActive = value >= minActive && value <= maxActive;
                final fraction = valueToFraction(value, min, max);
                final center = fraction * trackLength;
                return Positioned(
                  left: vertical ? (layout.trackHeightFor(knobStyle) - tickSize) / 2 : center - tickSize / 2,
                  top: vertical ? trackLength - center - tickSize / 2 : (layout.trackHeightFor(knobStyle) - tickSize) / 2,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: tickSize,
                        height: tickSize,
                        decoration: BoxDecoration(
                          color: isActive ? tickColor : tickColor.withValues(alpha: 0.6),
                          shape: BoxShape.circle,
                        ),
                      ),
                      if (stepLabels != null && i < stepLabels!.length)
                        stepLabels![i],
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
