/// TouchSlider cap-ratio math — port of `TouchSlider.shared.ts`.
library;

/// Normalized slider value in 0–1.
double normalizeTouchSliderValue(double value, double min, double max) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)).clamp(0.0, 1.0);
}

/// Pill cap radius as a fraction of track length: r / L where r = thickness / 2.
double computeTouchSliderCapRatio(double trackLength, double thickness) {
  if (trackLength <= 0 || thickness <= 0) return 0;
  return (thickness / 2) / trackLength;
}

/// Leading slot (sharp only): grey until fill reaches the cap centre (fill < r/L).
bool isTouchSliderStartSlotOnRail(
  double fillRatio,
  double capRatio,
  String progressStyle,
) {
  if (progressStyle == 'rounded') return false;
  return fillRatio < capRatio;
}

/// Horizontal indicator translate fraction (of track length).
double touchSliderHorizontalTranslateFraction({
  required double fillRatio,
  required double thickness,
  required double trackLength,
  required String progressStyle,
  required bool hasStartSlot,
}) {
  final floor = (progressStyle == 'rounded' && hasStartSlot && trackLength > 0)
      ? (thickness / trackLength - 1.0)
      : -1.0;
  return floor > (fillRatio - 1.0) ? floor : (fillRatio - 1.0);
}

/// Trailing edge of the fill along the track axis (Figma / RN width model).
///
/// The active indicator grows from the leading cap with
/// [touchSliderFillExtentPx]. Rounded mode carries a pill cap on the value
/// boundary; sharp mode uses a flat edge at the same coordinate.
double touchSliderIndicatorTrailingPx({
  required double fillRatio,
  required double thickness,
  required double trackLength,
  required String progressStyle,
  required bool hasStartSlot,
  required bool isVertical,
}) {
  return touchSliderFillExtentPx(
    fillRatio: fillRatio,
    thickness: thickness,
    trackLength: trackLength,
    progressStyle: progressStyle,
    hasStartSlot: hasStartSlot,
  );
}

/// Visible fill length along the track axis (RN percentage-width model).
///
/// Leading edge is anchored at the start (left / bottom). At 50% the painted
/// fill spans exactly half the track — rounded trailing cap sits on the value
/// boundary instead of a full-track pill sliding off-screen.
double touchSliderFillExtentPx({
  required double fillRatio,
  required double thickness,
  required double trackLength,
  required String progressStyle,
  required bool hasStartSlot,
}) {
  if (trackLength <= 0) return 0;
  final raw = fillRatio.clamp(0.0, 1.0) * trackLength;
  if (progressStyle == 'rounded' && hasStartSlot) {
    if (fillRatio <= 0) return thickness;
    return raw < thickness ? thickness : raw;
  }
  return raw;
}

/// Vertical indicator translate fraction (of track length).
double touchSliderVerticalTranslateFraction({
  required double fillRatio,
  required double thickness,
  required double trackLength,
  required String progressStyle,
  required bool hasStartSlot,
}) {
  final ceiling = (progressStyle == 'rounded' && hasStartSlot && trackLength > 0)
      ? (1.0 - thickness / trackLength)
      : 1.0;
  final raw = 1.0 - fillRatio;
  return raw < ceiling ? raw : ceiling;
}
