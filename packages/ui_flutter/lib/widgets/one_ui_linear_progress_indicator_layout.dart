import 'package:flutter/material.dart';

import '../engine/lpi_color_resolve.dart';
import '../engine/lpi_size_resolve.dart';
import 'one_ui_linear_progress_indicator_painter.dart';

/// Visual track + indicator layout for [OneUiLinearProgressIndicator].
///
/// Uses [OneUiLinearProgressIndicatorPainter] so pill vs flat caps render
/// identically on mobile, desktop, and web (DecoratedBox/ClipRRect were
/// inconsistent at small track heights).
class OneUiLinearProgressIndicatorLayout extends StatelessWidget {
  const OneUiLinearProgressIndicatorLayout({
    required this.layout,
    required this.colors,
    required this.isIndeterminate,
    required this.indeterminateTranslateFactor,
    super.key,
  });

  final LpiResolvedLayout layout;
  final LpiResolvedColors colors;
  final bool isIndeterminate;
  final double indeterminateTranslateFactor;

  @override
  Widget build(BuildContext context) {
    final height = layout.trackHeightPx;

    return SizedBox(
      height: height,
      width: double.infinity,
      child: LayoutBuilder(
        builder: (context, constraints) {
          return CustomPaint(
            size: Size(constraints.maxWidth, height),
            painter: OneUiLinearProgressIndicatorPainter(
              colors: colors,
              layout: layout,
              isIndeterminate: isIndeterminate,
              indeterminateTranslateFactor: indeterminateTranslateFactor,
            ),
          );
        },
      ),
    );
  }
}

/// Reads layout metrics from a built [OneUiLinearProgressIndicatorLayout].
class OneUiLinearProgressIndicatorLayoutMetrics {
  const OneUiLinearProgressIndicatorLayoutMetrics({
    required this.trackHeightPx,
    required this.fillFraction,
    required this.isIndeterminate,
    required this.indicatorColor,
    required this.trackColor,
  });

  final double trackHeightPx;
  final double fillFraction;
  final bool isIndeterminate;
  final Color indicatorColor;
  final Color trackColor;
}

OneUiLinearProgressIndicatorLayoutMetrics? readLpiLayoutMetrics(
  OneUiLinearProgressIndicatorLayout layout,
) {
  return OneUiLinearProgressIndicatorLayoutMetrics(
    trackHeightPx: layout.layout.trackHeightPx,
    fillFraction: layout.layout.fillFraction,
    isIndeterminate: layout.isIndeterminate,
    indicatorColor: layout.colors.indicator,
    trackColor: layout.colors.track,
  );
}
