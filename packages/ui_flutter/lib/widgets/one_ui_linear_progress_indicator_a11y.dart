/// Accessibility for [OneUiLinearProgressIndicator] — parity with React LPI /
/// Base UI `role="progressbar"`.
library;

import 'one_ui_linear_progress_indicator_types.dart';

class OneUiLinearProgressIndicatorSemantics {
  const OneUiLinearProgressIndicatorSemantics({
    required this.excludeSemantics,
    required this.label,
    this.hint,
    required this.isBusy,
    this.valueMin,
    this.valueMax,
    this.valueNow,
    this.liveRegion = false,
    this.labelledBy,
    this.describedBy,
  });

  final bool excludeSemantics;
  final String? label;
  final String? hint;
  final bool isBusy;
  final double? valueMin;
  final double? valueMax;
  final double? valueNow;
  final bool liveRegion;
  final String? labelledBy;
  final String? describedBy;
}

bool resolveLpiSemanticsLiveRegion(String? ariaLive) {
  return ariaLive == 'polite' || ariaLive == 'assertive';
}

OneUiLinearProgressIndicatorSemantics
    resolveOneUiLinearProgressIndicatorSemantics({
  required OneUiLinearProgressIndicatorState state,
  String? semanticsLabel,
  String? semanticsLabelledBy,
  String? semanticsDescribedBy,
  String? ariaLive,
  bool ariaHidden = false,
  String? semanticsHint,
  double min = 0,
  double max = 100,
}) {
  final labelledBy = semanticsLabelledBy?.trim();
  final describedBy = semanticsDescribedBy?.trim();

  return OneUiLinearProgressIndicatorSemantics(
    excludeSemantics: ariaHidden,
    label: semanticsLabel,
    hint: semanticsHint,
    isBusy: state.isIndeterminate,
    valueMin: state.isIndeterminate ? null : min,
    valueMax: state.isIndeterminate ? null : max,
    valueNow: state.isIndeterminate ? null : state.percentage.toDouble(),
    liveRegion: resolveLpiSemanticsLiveRegion(ariaLive),
    labelledBy: labelledBy != null && labelledBy.isNotEmpty ? labelledBy : null,
    describedBy:
        describedBy != null && describedBy.isNotEmpty ? describedBy : null,
  );
}
