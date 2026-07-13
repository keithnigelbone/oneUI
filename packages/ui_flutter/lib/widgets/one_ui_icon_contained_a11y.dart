/// Accessibility for [OneUiIconContained] — web `role="img"` + `aria-label`,
/// RN `accessibilityRole: 'image'` + `accessibilityHint` / `accessibilityState`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Resolved semantics for the contained icon shell.
class OneUiIconContainedSemanticsConfig {
  const OneUiIconContainedSemanticsConfig({
    required this.exposed,
    this.label,
    this.hint,
  });

  final bool exposed;
  final String? label;
  final String? hint;
}

/// Web `aria-label` / RN `accessibilityLabel` — explicit only.
///
/// IconContained is decorative by default (`aria-hidden` / `accessible: false`).
/// Do not auto-derive from icon IDs (unlike standalone [OneUiIcon]).
String? oneUiIconContainedEffectiveLabel({
  String? semanticsLabel,
}) {
  final explicit = semanticsLabel?.trim();
  if (explicit != null && explicit.isNotEmpty) return explicit;
  return null;
}

void _warnIconContainedHintWithoutLabel() {
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiIconContained: semanticsHint requires an explicit '
          'semanticsLabel — hints are not exposed without a meaningful label.',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiIconContained a11y'),
      ),
    );
    return true;
  }());
}

/// Mirrors RN `getIconContainedAccessibilityProps`.
OneUiIconContainedSemanticsConfig resolveOneUiIconContainedSemantics({
  String? semanticsLabel,
  String? semanticsHint,
  bool? excludeFromSemantics,
  required bool isDisabled,
}) {
  if (excludeFromSemantics == true) {
    return const OneUiIconContainedSemanticsConfig(exposed: false);
  }

  final trimmedHint = semanticsHint?.trim();
  final hasHint = trimmedHint != null && trimmedHint.isNotEmpty;

  final label =
      oneUiIconContainedEffectiveLabel(semanticsLabel: semanticsLabel);

  if (label == null || label.isEmpty) {
    if (hasHint) {
      _warnIconContainedHintWithoutLabel();
    }
    return const OneUiIconContainedSemanticsConfig(exposed: false);
  }

  // Flutter `Semantics(image: true)` ignores `enabled: false` on iOS/Android.
  // Append disabled state to the label so AT announces it (RN uses
  // `accessibilityState.disabled` which platforms honour on image nodes).
  final effectiveLabel = isDisabled ? '$label, disabled' : label;

  return OneUiIconContainedSemanticsConfig(
    exposed: true,
    label: effectiveLabel,
    hint: hasHint ? trimmedHint : null,
  );
}
