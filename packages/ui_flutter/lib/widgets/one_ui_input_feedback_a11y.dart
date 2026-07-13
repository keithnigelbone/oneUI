/// InputFeedback accessibility — RN `getInputFeedbackAccessibilityProps`.
library;

import 'one_ui_input_feedback_types.dart';

class OneUiInputFeedbackSemantics {
  const OneUiInputFeedbackSemantics({
    required this.container,
    required this.label,
    this.liveRegion = false,
    required this.excludeMessageFromTree,
    required this.excludeIconFromTree,
  });

  final bool container;
  final String? label;
  final bool liveRegion;
  final bool excludeMessageFromTree;
  final bool excludeIconFromTree;
}

bool _semanticsLiveRegion(OneUiInputFeedbackLiveRegion live) {
  return live == OneUiInputFeedbackLiveRegion.assertive ||
      live == OneUiInputFeedbackLiveRegion.polite;
}

OneUiInputFeedbackSemantics resolveOneUiInputFeedbackSemantics({
  required OneUiInputFeedbackState state,
  String? ariaLabel,
  bool ariaHidden = false,
}) {
  if (ariaHidden) {
    return const OneUiInputFeedbackSemantics(
      container: false,
      label: null,
      excludeMessageFromTree: true,
      excludeIconFromTree: true,
    );
  }

  return OneUiInputFeedbackSemantics(
    container: true,
    label: ariaLabel ?? state.message,
    liveRegion: _semanticsLiveRegion(state.liveRegion),
    excludeMessageFromTree: true,
    excludeIconFromTree: true,
  );
}
