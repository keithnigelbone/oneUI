import 'one_ui_logo_types.dart';

/// Logo accessibility — mirrors RN `getLogoAccessibilityProps` / web `role="img"`.
class OneUiLogoA11y {
  const OneUiLogoA11y({
    required this.label,
    required this.isDecorative,
    required this.isPressable,
    this.hint,
  });

  final String? label;
  final bool isDecorative;
  final bool isPressable;
  final String? hint;
}

OneUiLogoA11y resolveOneUiLogoA11y({
  required String alt,
  String? accessibilityHint,
  required OneUiLogoResolvedState state,
}) {
  if (oneUiLogoIsDecorative(alt)) {
    return const OneUiLogoA11y(
      label: null,
      isDecorative: true,
      isPressable: false,
    );
  }
  return OneUiLogoA11y(
    label: alt.trim(),
    isDecorative: false,
    isPressable: state.isPressable,
    hint: accessibilityHint,
  );
}
