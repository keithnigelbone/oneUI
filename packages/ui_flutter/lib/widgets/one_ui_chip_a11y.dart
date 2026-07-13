/// Chip accessibility — native `getChipAccessibilityProps` / web Toggle `aria-pressed`.
library;

class OneUiChipSemantics {
  const OneUiChipSemantics({
    required this.label,
    this.hint,
    required this.selected,
    required this.enabled,
  });

  final String label;
  final String? hint;
  final bool selected;
  final bool enabled;
}

String? resolveChipAccessibilityLabel({
  String? semanticsLabel,
  String? ariaLabel,
  Object? child,
}) {
  final explicit = semanticsLabel ?? ariaLabel;
  if (explicit != null && explicit.trim().isNotEmpty) return explicit.trim();
  if (child is String && child.trim().isNotEmpty) return child.trim();
  if (child is num) return child.toString();
  return null;
}

OneUiChipSemantics resolveOneUiChipSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  Object? child,
  String? semanticsHint,
  required bool selected,
  required bool disabled,
}) {
  final label = resolveChipAccessibilityLabel(
        semanticsLabel: semanticsLabel,
        ariaLabel: ariaLabel,
        child: child,
      ) ??
      'Chip';

  return OneUiChipSemantics(
    label: label,
    hint: semanticsHint,
    selected: selected,
    enabled: !disabled,
  );
}

/// RN `getChipAccessibilityProps` — same contract as `interface.ts`.
OneUiChipSemantics getChipAccessibilityProps({
  String? semanticsLabel,
  String? ariaLabel,
  Object? child,
  String? semanticsHint,
  String? accessibilityHint,
  required bool selected,
  required bool disabled,
}) {
  return resolveOneUiChipSemantics(
    semanticsLabel: semanticsLabel,
    ariaLabel: ariaLabel,
    child: child,
    semanticsHint: semanticsHint ?? accessibilityHint,
    selected: selected,
    disabled: disabled,
  );
}
