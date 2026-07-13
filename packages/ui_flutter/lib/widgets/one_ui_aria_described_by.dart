/// Shared `aria-describedby` helpers for OneUI form controls.
library;

/// Space-separated `aria-describedby` token list → [Semantics.controlsNodes].
///
/// Flutter 3.32 maps [Semantics.controlsNodes] to web `aria-controls` (not
/// `aria-describedby`). Targets must expose matching [Semantics.identifier]
/// values. [OneUiWebAriaDescribedByBinder] patches true `aria-describedby` on
/// Flutter web until `Semantics.describedBy` ships (flutter#180496).
Set<String>? oneUiParseAriaDescribedByNodeIds(String? ariaDescribedBy) {
  if (ariaDescribedBy == null) return null;
  final trimmed = ariaDescribedBy.trim();
  if (trimmed.isEmpty) return null;
  final ids = trimmed.split(RegExp(r'\s+')).where((s) => s.isNotEmpty).toSet();
  return ids.isEmpty ? null : ids;
}

/// Merges caller + auto-linked semantics ids (caller tokens first, stable order).
String? composeOneUiAriaDescribedBy({
  String? callerAriaDescribedBy,
  Iterable<String?> autoLinkedIds = const [],
}) {
  final ordered = <String>[];
  final seen = <String>{};

  void addTokens(String? wire) {
    if (wire == null) return;
    final trimmed = wire.trim();
    if (trimmed.isEmpty) return;
    for (final id in trimmed.split(RegExp(r'\s+'))) {
      if (id.isEmpty || seen.contains(id)) continue;
      seen.add(id);
      ordered.add(id);
    }
  }

  addTokens(callerAriaDescribedBy);
  for (final id in autoLinkedIds) {
    final trimmed = id?.trim();
    if (trimmed == null || trimmed.isEmpty || seen.contains(trimmed)) continue;
    seen.add(trimmed);
    ordered.add(trimmed);
  }

  return ordered.isEmpty ? null : ordered.join(' ');
}

/// Stable `{fieldId}-description` for header copy (web `Field.Description` parity).
String? oneUiInputFieldDescriptionSemanticsId(String? fieldId,
    {required bool hasDescription}) {
  if (!hasDescription) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return null;
  return '$id-description';
}

/// Stable `{fieldId}-feedback` for error / [OneUiInputFeedback] rows.
String? oneUiInputFieldFeedbackSemanticsId(String? fieldId,
    {required bool hasFeedback}) {
  if (!hasFeedback) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return null;
  return '$id-feedback';
}

/// Stable `{fieldId}-dynamic` for [OneUiInputDynamicText] helper row.
String? oneUiInputFieldDynamicTextSemanticsId(String? fieldId,
    {required bool hasDynamicRow}) {
  if (!hasDynamicRow) return null;
  final id = fieldId?.trim();
  if (id == null || id.isEmpty) return null;
  return '$id-dynamic';
}
