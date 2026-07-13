/// Image accessibility — mirrors `getImageAccessibilityProps` in RN `interface.ts`.
class OneUiImageA11y {
  const OneUiImageA11y({
    required this.label,
    required this.isInteractive,
    required this.excludeInnerFromSemantics,
  });

  final String label;
  final bool isInteractive;
  final bool excludeInnerFromSemantics;
}

OneUiImageA11y resolveOneUiImageA11y({
  required String alt,
  String? ariaLabel,
  required bool interactive,
  required bool disabled,
}) {
  final label = (ariaLabel ?? alt).trim();
  final isInteractive = interactive && !disabled;
  return OneUiImageA11y(
    label: label,
    isInteractive: isInteractive,
    excludeInnerFromSemantics: true,
  );
}
