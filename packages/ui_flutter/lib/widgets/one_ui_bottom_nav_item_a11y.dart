/// Bottom nav item accessibility — RN `interface.ts` / web `aria-current`.
library;

/// @deprecated No longer emitted — icon-only tabs without a name resolve to ''.
const String kOneUiBottomNavIconOnlyFallbackLabel = 'Tab';

/// `my-saved-items` → `My Saved Items` for icon-only tabs.
String humanizeOneUiBottomNavigationValue(String value) {
  final words = value.split(RegExp(r'[-_/]+')).where((w) => w.isNotEmpty);
  if (words.isEmpty) return value;
  return words
      .map(
        (word) =>
            '${word[0].toUpperCase()}${word.length > 1 ? word.substring(1).toLowerCase() : ''}',
      )
      .join(' ');
}

String resolveOneUiBottomNavItemAccessibilityLabel({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  String? value,
}) {
  for (final candidate in [
    semanticsLabel,
    ariaLabel,
    accessibilityLabel,
    label,
  ]) {
    if (candidate != null && candidate.trim().isNotEmpty) {
      return candidate.trim();
    }
  }
  final itemValue = value?.trim();
  if (itemValue != null && itemValue.isNotEmpty) {
    return humanizeOneUiBottomNavigationValue(itemValue);
  }
  return '';
}

class OneUiBottomNavItemSemantics {
  const OneUiBottomNavItemSemantics({
    required this.label,
    this.hint,
    required this.selected,
    required this.disabled,
    this.linkUrl,
  });

  final String label;
  final String? hint;
  final bool selected;
  final bool disabled;
  final Uri? linkUrl;
}

OneUiBottomNavItemSemantics resolveOneUiBottomNavItemSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? label,
  String? value,
  String? semanticsHint,
  String? accessibilityHint,
  String? href,
  required bool isActive,
  required bool disabled,
}) {
  final resolvedLabel = resolveOneUiBottomNavItemAccessibilityLabel(
    semanticsLabel: semanticsLabel,
    ariaLabel: ariaLabel,
    accessibilityLabel: accessibilityLabel,
    label: label,
    value: value,
  );
  Uri? linkUrl;
  if (href != null && href.trim().isNotEmpty && !disabled) {
    linkUrl = Uri.tryParse(href.trim());
  }
  final rawHint = semanticsHint ?? accessibilityHint;
  final hint = rawHint?.trim();
  return OneUiBottomNavItemSemantics(
    label: resolvedLabel,
    hint: hint != null && hint.isNotEmpty ? hint : null,
    selected: isActive,
    disabled: disabled,
    linkUrl: linkUrl,
  );
}
