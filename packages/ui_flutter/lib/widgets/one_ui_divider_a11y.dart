/// Divider accessibility — web `role="separator"` / RN `getDividerAccessibilityProps`.
library;

import 'one_ui_divider_types.dart';

class OneUiDividerSemantics {
  const OneUiDividerSemantics({
    required this.orientation,
    this.hint,
  });

  final OneUiDividerOrientation orientation;
  final String? hint;
}

OneUiDividerSemantics resolveOneUiDividerSemantics({
  required OneUiDividerOrientation orientation,
  String? semanticsHint,
  String? accessibilityHint,
}) {
  final hint = semanticsHint?.trim().isNotEmpty == true
      ? semanticsHint!.trim()
      : accessibilityHint?.trim().isNotEmpty == true
          ? accessibilityHint!.trim()
          : null;
  return OneUiDividerSemantics(orientation: orientation, hint: hint);
}

/// Decorative line segments — web `aria-hidden` / RN `DIVIDER_LINE_A11Y`.
const bool kOneUiDividerLineExcludeFromSemantics = true;
