/// Bottom navigation container accessibility — web `<nav aria-label>` / RN tablist.
library;

class OneUiBottomNavigationSemantics {
  const OneUiBottomNavigationSemantics({
    required this.label,
    this.hint,
  });

  final String label;
  final String? hint;
}

OneUiBottomNavigationSemantics resolveOneUiBottomNavigationSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? accessibilityLabel,
  String? semanticsHint,
  String? accessibilityHint,
}) {
  final hint = semanticsHint?.trim().isNotEmpty == true
      ? semanticsHint!.trim()
      : accessibilityHint?.trim().isNotEmpty == true
          ? accessibilityHint!.trim()
          : null;

  for (final candidate in [
    semanticsLabel,
    ariaLabel,
    accessibilityLabel,
  ]) {
    if (candidate != null && candidate.trim().isNotEmpty) {
      return OneUiBottomNavigationSemantics(
        label: candidate.trim(),
        hint: hint,
      );
    }
  }
  return OneUiBottomNavigationSemantics(
    label: 'Bottom navigation',
    hint: hint,
  );
}
