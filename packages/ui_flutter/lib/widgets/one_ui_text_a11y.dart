/// Accessibility for [OneUiText] — web `aria-*` / RN `getTextAccessibilityProps`.
library;

import 'one_ui_text_types.dart';

class OneUiTextSemanticsConfig {
  const OneUiTextSemanticsConfig({
    required this.exposed,
    this.label,
    this.hint,
    required this.isHeader,
    required this.isLink,
    required this.hidden,
  });

  final bool exposed;
  final String? label;
  final String? hint;
  final bool isHeader;
  final bool isLink;
  final bool hidden;
}

/// Resolves accessible name — `resolveTextAccessibilityLabel` on RN.
String? resolveOneUiTextAccessibilityLabel({
  String? semanticsLabel,
  String? text,
  String? childString,
}) {
  final explicit = semanticsLabel?.trim();
  if (explicit != null && explicit.isNotEmpty) return explicit;
  if (childString != null && childString.isNotEmpty) return childString;
  final t = text?.trim();
  if (t != null && t.isNotEmpty) return t;
  return null;
}

OneUiTextSemanticsConfig resolveOneUiTextSemantics({
  String? semanticsLabel,
  String? semanticsHint,
  bool excludeFromSemantics = false,
  bool ariaHidden = false,
  required String visibleText,
  required OneUiTextVariant variant,
  required bool isInteractive,
}) {
  if (excludeFromSemantics || ariaHidden) {
    return const OneUiTextSemanticsConfig(
      exposed: false,
      isHeader: false,
      isLink: false,
      hidden: true,
    );
  }

  final explicitLabel = semanticsLabel?.trim();
  final isLink = isInteractive;
  final isHeader = !isLink &&
      (variant == OneUiTextVariant.headline ||
          variant == OneUiTextVariant.display);
  final trimmedHint = semanticsHint?.trim();
  final hasHint = trimmedHint != null && trimmedHint.isNotEmpty;

  // Plain copy uses Flutter [Text] semantics; wrap only for header/link/explicit
  // label or hint (RN `getTextAccessibilityProps` / web `aria-label`).
  final needsWrapper = isHeader || isLink || explicitLabel != null || hasHint;
  if (!needsWrapper) {
    return const OneUiTextSemanticsConfig(
      exposed: false,
      isHeader: false,
      isLink: false,
      hidden: false,
    );
  }

  final label = explicitLabel?.isNotEmpty == true
      ? explicitLabel
      : (visibleText.trim().isNotEmpty ? visibleText.trim() : null);

  return OneUiTextSemanticsConfig(
    exposed: true,
    label: label,
    hint: hasHint ? trimmedHint : null,
    isHeader: isHeader,
    isLink: isLink,
    hidden: false,
  );
}
