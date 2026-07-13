/// Accessibility for [OneUiCircularProgressIndicator] — parity with
/// `getCircularProgressIndicatorAccessibilityProps` in native `interface.ts`.
library;

import 'one_ui_circular_progress_indicator_types.dart';

class OneUiCircularProgressIndicatorSemantics {
  const OneUiCircularProgressIndicatorSemantics({
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

  /// Flutter `Semantics.liveRegion` when polite/assertive.
  final bool liveRegion;

  /// RN `accessibilityLabelledBy` — web `aria-labelledby` id.
  final String? labelledBy;

  /// Web `aria-describedby` id(s) — mapped to [Semantics.controlsNodes].
  final String? describedBy;
}

/// Maps `aria-live` to Flutter `Semantics.liveRegion` (RN `accessibilityLiveRegion`).
bool resolveCpiSemanticsLiveRegion(String? ariaLive) {
  return ariaLive == 'polite' || ariaLive == 'assertive';
}

OneUiCircularProgressIndicatorSemantics
    resolveOneUiCircularProgressIndicatorSemantics({
  required OneUiCircularProgressIndicatorState state,
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

  return OneUiCircularProgressIndicatorSemantics(
    excludeSemantics: ariaHidden,
    label: semanticsLabel,
    hint: semanticsHint,
    isBusy: state.isIndeterminate,
    valueMin: state.isIndeterminate ? null : min,
    valueMax: state.isIndeterminate ? null : max,
    valueNow: state.isIndeterminate ? null : state.percentage.toDouble(),
    liveRegion: resolveCpiSemanticsLiveRegion(ariaLive),
    labelledBy: labelledBy != null && labelledBy.isNotEmpty ? labelledBy : null,
    describedBy:
        describedBy != null && describedBy.isNotEmpty ? describedBy : null,
  );
}
