/// Slider types — `Slider.shared.ts` / native `interface.ts`.
library;

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

typedef OneUiSliderAppearance = String;
typedef OneUiSliderOrientation = String;
typedef OneUiSliderKnobStyle = String;
typedef OneUiSliderTooltipMode = String;
typedef OneUiSliderSize = String;

/// Figma API table roles (excludes `auto`).
const List<String> kOneUiSliderFigmaAppearanceRoles = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

const List<OneUiSliderAppearance> kOneUiSliderAppearances = [
  'auto',
  ...kOneUiSliderFigmaAppearanceRoles,
];

const List<OneUiSliderOrientation> kOneUiSliderOrientations = [
  'horizontal',
  'vertical',
];

const List<OneUiSliderKnobStyle> kOneUiSliderKnobStyles = ['inside', 'outside'];

/// Figma API + RN `SliderSize`.
const List<OneUiSliderSize> kOneUiSliderSizes = ['s', 'm', 'l'];
const List<String> kOneUiSliderFigmaApiSizes = kOneUiSliderSizes;

class OneUiSliderState {
  const OneUiSliderState({
    required this.resolvedAppearance,
    required this.isDisabled,
    required this.isReadOnly,
    required this.isVertical,
    required this.isRange,
    required this.size,
    required this.knobStyle,
    required this.tooltipMode,
    required this.snapToSteps,
    required this.values,
  });

  final String resolvedAppearance;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isVertical;
  final bool isRange;
  final String size;
  final String knobStyle;
  final String tooltipMode;
  final bool snapToSteps;
  final List<double> values;
}

OneUiSliderState resolveOneUiSliderState({
  required List<double> values,
  required String appearance,
  required String orientation,
  required String size,
  required String knobStyle,
  required String showTooltip,
  required bool snapToSteps,
  required bool disabled,
  required bool readOnly,
  SurfaceContextValue? surface,
}) {
  final effectiveAppearance = appearance == 'auto' || appearance.isEmpty
      ? OneUiSurfaceScope.resolveComponentAutoAppearance(surface)
      : normalizeAppearanceRoleKey(appearance);

  return OneUiSliderState(
    resolvedAppearance: effectiveAppearance,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isVertical: orientation == 'vertical',
    isRange: values.length > 1,
    size: kOneUiSliderSizes.contains(size) ? size : 'm',
    knobStyle:
        kOneUiSliderKnobStyles.contains(knobStyle) ? knobStyle : 'outside',
    tooltipMode: showTooltip == 'always' || showTooltip == 'false'
        ? showTooltip
        : 'auto',
    snapToSteps: snapToSteps,
    values: values,
  );
}
