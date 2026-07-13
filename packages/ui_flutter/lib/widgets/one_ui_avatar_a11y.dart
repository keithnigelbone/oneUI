/// Accessibility for [OneUiAvatar] — web `role="img"` + `aria-label`, RN
/// `accessibilityRole: 'image'` + `accessibilityLabel` / `accessibilityHint`.
library;

import 'package:flutter/foundation.dart';

/// Resolved semantics for the avatar root (non-interactive image).
class OneUiAvatarSemanticsConfig {
  const OneUiAvatarSemanticsConfig({
    required this.label,
    this.hint,
    required this.enabled,
    required this.exposed,
  });

  final String label;
  final String? hint;
  final bool enabled;

  /// `false` when [excludeFromSemantics] or empty [alt] — subtree hidden from AT.
  final bool exposed;
}

/// Non-empty trimmed [alt] — decorative when absent (web `aria-label` absent).
String? oneUiAvatarEffectiveLabel({required String alt}) {
  final trimmed = alt.trim();
  return trimmed.isEmpty ? null : trimmed;
}

/// Mirrors RN `getAvatarAccessibilityProps` / web labelled `role="img"`.
OneUiAvatarSemanticsConfig resolveOneUiAvatarSemantics({
  required String alt,
  String? semanticsHint,
  required bool isDisabled,
  bool excludeFromSemantics = false,
}) {
  if (excludeFromSemantics) {
    return const OneUiAvatarSemanticsConfig(
      label: '',
      enabled: true,
      exposed: false,
    );
  }

  final trimmedHint = semanticsHint?.trim();
  final label = oneUiAvatarEffectiveLabel(alt: alt);

  if (label == null) {
    if (trimmedHint != null && trimmedHint.isNotEmpty) {
      assert(() {
        FlutterError.reportError(
          FlutterErrorDetails(
            exception: FlutterError(
              'OneUiAvatar: semanticsHint without a non-empty alt is ignored. '
              'Provide alt when using semanticsHint.',
            ),
            library: 'ui_flutter',
            context: ErrorDescription('while resolving OneUiAvatar semantics'),
          ),
        );
        return true;
      }());
    }
    return const OneUiAvatarSemanticsConfig(
      label: '',
      enabled: true,
      exposed: false,
    );
  }

  // `Semantics(image: true)` ignores `enabled: false` on iOS/Android — suffix
  // the label so disabled state is audible (RN `accessibilityState.disabled`).
  final announcedLabel = isDisabled && !label.toLowerCase().endsWith(', disabled')
      ? '$label, disabled'
      : label;

  return OneUiAvatarSemanticsConfig(
    label: announcedLabel,
    hint: trimmedHint != null && trimmedHint.isNotEmpty ? trimmedHint : null,
    enabled: !isDisabled,
    exposed: true,
  );
}
