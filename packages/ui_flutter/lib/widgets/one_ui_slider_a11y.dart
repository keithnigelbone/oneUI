/// Accessibility for [OneUiSlider].
library;

import 'package:flutter/foundation.dart';

import 'one_ui_slider_types.dart';

class OneUiSliderThumbSemantics {
  const OneUiSliderThumbSemantics({
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

OneUiSliderThumbSemantics resolveOneUiSliderThumbSemantics({
  required OneUiSliderState state,
  required int thumbIndex,
  required double thumbValue,
  required double min,
  required double max,
  required double step,
  required double largeStep,
  String? semanticsLabel,
  String? ariaLabel,
  List<String>? semanticsLabels,
  List<String>? ariaLabels,
}) {
  String? label;
  if (semanticsLabels != null && thumbIndex < semanticsLabels.length) {
    label = semanticsLabels[thumbIndex];
  } else if (ariaLabels != null && thumbIndex < ariaLabels.length) {
    label = ariaLabels[thumbIndex];
  } else {
    label = semanticsLabel ?? ariaLabel;
  }

  assert(
    kReleaseMode || label != null,
    'OneUiSlider requires semanticsLabel/semanticsLabels in debug builds.',
  );

  final stepVal = step > 0 ? step : 1.0;

  return OneUiSliderThumbSemantics(
    label: label,
    enabled: !state.isDisabled,
    readOnly: state.isReadOnly,
    value: thumbValue,
    min: min,
    max: max,
    increasedValue: (thumbValue + stepVal).clamp(min, max),
    decreasedValue: (thumbValue - stepVal).clamp(min, max),
  );
}
