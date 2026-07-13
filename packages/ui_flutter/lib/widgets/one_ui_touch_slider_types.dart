/// TouchSlider types — `TouchSlider.shared.ts` / native `interface.ts`.
library;

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

typedef OneUiTouchSliderAppearance = String;
typedef OneUiTouchSliderOrientation = String;
typedef OneUiTouchSliderProgressStyle = String;

/// Figma API table roles (excludes `auto`).
const List<String> kOneUiTouchSliderFigmaAppearanceRoles = [
  'neutral',
  'primary',
  'secondary',
  'negative',
  'positive',
  'informative',
  'warning',
];

const List<OneUiTouchSliderAppearance> kOneUiTouchSliderAppearances = [
  'auto',
  ...kOneUiTouchSliderFigmaAppearanceRoles,
];

const List<OneUiTouchSliderOrientation> kOneUiTouchSliderOrientations = [
  'horizontal',
  'vertical',
];

const List<OneUiTouchSliderProgressStyle> kOneUiTouchSliderProgressStyles = [
  'rounded',
  'sharp',
];

class OneUiTouchSliderState {
  const OneUiTouchSliderState({
    required this.resolvedAppearance,
    required this.isDisabled,
    required this.isReadOnly,
    required this.isVertical,
    required this.progressStyle,
    required this.value,
    required this.fillRatio,
  });

  final String resolvedAppearance;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isVertical;
  final String progressStyle;
  final double value;
  final double fillRatio;
}

OneUiTouchSliderState resolveOneUiTouchSliderState({
  required double value,
  required double min,
  required double max,
  required String appearance,
  required String orientation,
  required String progressStyle,
  required bool disabled,
  required bool readOnly,
  SurfaceContextValue? surface,
}) {
  final effectiveAppearance = appearance == 'auto' || appearance.isEmpty
      ? OneUiSurfaceScope.resolveComponentAutoAppearance(surface)
      : normalizeAppearanceRoleKey(appearance);

  final isVertical = orientation == 'vertical';
  final clamped = max <= min ? min : value.clamp(min, max);
  final fillRatio =
      max <= min ? 0.0 : ((clamped - min) / (max - min)).clamp(0.0, 1.0);

  return OneUiTouchSliderState(
    resolvedAppearance: effectiveAppearance,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isVertical: isVertical,
    progressStyle:
        kOneUiTouchSliderProgressStyles.contains(progressStyle)
            ? progressStyle
            : 'rounded',
    value: clamped,
    fillRatio: fillRatio,
  );
}
