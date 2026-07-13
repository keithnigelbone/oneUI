/// InputDynamicText accessibility — RN `getInputDynamicTextAccessibilityProps`.
library;

import 'one_ui_input_dynamic_text_types.dart';

class OneUiInputDynamicTextContentA11y {
  const OneUiInputDynamicTextContentA11y({
    this.liveRegion = false,
  });

  /// Flutter `Semantics.liveRegion` — enabled for polite/assertive copy updates.
  final bool liveRegion;
}

bool resolveOneUiInputDynamicTextLiveRegion(
  OneUiInputDynamicTextAriaLive? ariaLive,
) {
  return ariaLive == OneUiInputDynamicTextAriaLive.polite ||
      ariaLive == OneUiInputDynamicTextAriaLive.assertive;
}

OneUiInputDynamicTextContentA11y resolveOneUiInputDynamicTextContentA11y({
  OneUiInputDynamicTextAriaLive? ariaLive,
}) {
  return OneUiInputDynamicTextContentA11y(
    liveRegion: resolveOneUiInputDynamicTextLiveRegion(ariaLive),
  );
}
