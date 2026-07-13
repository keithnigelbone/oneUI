import 'package:flutter/material.dart';

import 'one_ui_circular_progress_indicator.dart';

/// Button numeric f-step size → CPI preset (`Button.tsx` `SPINNER_SIZE_MAP`).
OneUiCircularProgressIndicatorSize oneUiButtonLoadingSpinnerSize(
    int numericSize) {
  return switch (numericSize) {
    6 => 'XS',
    8 => 'S',
    10 => 'M',
    12 => 'L',
    _ => 'M',
  };
}

/// IconButton numeric f-step size → CPI preset (`IconButton.tsx` `SPINNER_SIZE_MAP`).
OneUiCircularProgressIndicatorSize oneUiIconButtonLoadingSpinnerSize(
    int numericSize) {
  return switch (numericSize) {
    4 => '2XS',
    6 => 'XS',
    8 => 'S',
    10 => 'M',
    12 => 'L',
    14 => 'XL',
    _ => 'M',
  };
}

/// SingleTextButton S/M/L → CPI preset (`SingleTextButton.tsx` `SPINNER_SIZE_MAP`).
OneUiCircularProgressIndicatorSize oneUiSingleTextButtonLoadingSpinnerSize(
    String size) {
  return switch (size.trim().toLowerCase()) {
    's' => 'S',
    'l' => 'L',
    _ => 'M',
  };
}

/// Indeterminate CPI for button / icon-button loading — web `.spinner` overrides:
/// `--CircularProgressIndicator-indicatorColor: currentColor`,
/// `--CircularProgressIndicator-trackColor: transparent`.
class OneUiLoadingSpinner extends StatelessWidget {
  const OneUiLoadingSpinner({
    required this.appearance,
    required this.size,
    required this.strokeColor,
    super.key,
  });

  final String appearance;
  final OneUiCircularProgressIndicatorSize size;
  final Color strokeColor;

  @override
  Widget build(BuildContext context) {
    return OneUiCircularProgressIndicator(
      variant: 'indeterminate',
      size: size,
      appearance: appearance,
      content: 'none',
      indicatorColor: strokeColor,
      trackColor: Colors.transparent,
      semanticsLabel: 'Loading',
      ariaHidden: true,
    );
  }
}
