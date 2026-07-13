/// Accessibility for [OneUiTouchSlider].
library;

import 'package:flutter/foundation.dart';

import 'one_ui_touch_slider_types.dart';

class OneUiTouchSliderSemantics {
  const OneUiTouchSliderSemantics({
    required this.label,
    required this.enabled,
    required this.readOnly,
    required this.value,
    required this.min,
    required this.max,
    required this.increasedValue,
    required this.decreasedValue,
  });

  final String? label;
  final bool enabled;
  final bool readOnly;
  final double value;
  final double min;
  final double max;
  final double increasedValue;
  final double decreasedValue;
}

OneUiTouchSliderSemantics resolveOneUiTouchSliderSemantics({
  required OneUiTouchSliderState state,
  required double min,
  required double max,
  required double step,
  required double largeStep,
  String? semanticsLabel,
  String? ariaLabel,
}) {
  final label = semanticsLabel ?? ariaLabel;
  assert(
    kReleaseMode || label != null,
    'OneUiTouchSlider requires semanticsLabel or ariaLabel in debug builds.',
  );

  final stepVal = step > 0 ? step : 1.0;
  final page = largeStep > 0 ? largeStep : stepVal * 10;

  return OneUiTouchSliderSemantics(
    label: label,
    enabled: !state.isDisabled,
    readOnly: state.isReadOnly,
    value: state.value,
    min: min,
    max: max,
    increasedValue: (state.value + stepVal).clamp(min, max),
    decreasedValue: (state.value - stepVal).clamp(min, max),
  );
}

double touchSliderKeyboardStep({
  required bool page,
  required double step,
  required double largeStep,
}) {
  if (page) return largeStep > 0 ? largeStep : step * 10;
  return step > 0 ? step : 1;
}
