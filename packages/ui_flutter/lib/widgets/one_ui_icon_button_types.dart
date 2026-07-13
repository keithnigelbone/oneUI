/// Types and state resolution — `IconButton.shared.ts` / RN `interface.ts`.
library;

const Set<int> kOneUiIconButtonValidSizes = {4, 6, 8, 10, 12, 14};

const Map<String, int> kOneUiIconButtonSizeAliases = {
  '2xs': 4,
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  'xl': 14,
  'small': 8,
  'medium': 10,
  'large': 12,
};

/// Figma attention — maps to [OneUiIconButtonVariant].
enum OneUiIconButtonAttention { high, medium, low }

/// Web `variant` / `data-variant`.
enum OneUiIconButtonVariant { bold, subtle, ghost }

enum OneUiIconButtonLayout { square, wide }

OneUiIconButtonVariant oneUiIconButtonVariantFromAttention(
    OneUiIconButtonAttention a) {
  switch (a) {
    case OneUiIconButtonAttention.high:
      return OneUiIconButtonVariant.bold;
    case OneUiIconButtonAttention.medium:
      return OneUiIconButtonVariant.subtle;
    case OneUiIconButtonAttention.low:
      return OneUiIconButtonVariant.ghost;
  }
}

int oneUiResolveIconButtonSize({int size = 10, String? sizeAlias}) {
  var s = size;
  final a = sizeAlias?.trim().toLowerCase();
  if (a != null && a.isNotEmpty) {
    s = kOneUiIconButtonSizeAliases[a] ?? s;
  }
  if (kOneUiIconButtonValidSizes.contains(s)) return s;
  return 10;
}

/// Web `data-layout="3:2"` vs square (`1:1`).
String oneUiIconButtonLayoutDataValue(OneUiIconButtonLayout layout) {
  return layout == OneUiIconButtonLayout.wide ? '3:2' : '1:1';
}

String oneUiIconButtonVariantSuffix(OneUiIconButtonVariant v) {
  switch (v) {
    case OneUiIconButtonVariant.bold:
      return 'bold';
    case OneUiIconButtonVariant.subtle:
      return 'subtle';
    case OneUiIconButtonVariant.ghost:
      return 'ghost';
  }
}

/// Maps IconButton f-step size → [OneUiIcon] spacing index (`IconButton.module.css` icon half).
String oneUiIconButtonIconSizeIndex(int numericSize) {
  return switch (numericSize) {
    4 => '2-5',
    6 => '3',
    8 => '4',
    10 => '5',
    12 => '6',
    14 => '7',
    _ => '5',
  };
}

/// Resolved props — web `useIconButtonState`.
class OneUiIconButtonResolvedState {
  const OneUiIconButtonResolvedState({
    required this.isDisabled,
    required this.variant,
    required this.appearance,
    required this.numericSize,
    required this.dataVariant,
    required this.dataAppearance,
    required this.dataSize,
    required this.dataCondensed,
    required this.dataLayout,
    required this.dataLoading,
  });

  final bool isDisabled;
  final OneUiIconButtonVariant variant;
  final String appearance;
  final int numericSize;
  final String dataVariant;
  final String dataAppearance;
  final String dataSize;
  final bool? dataCondensed;
  final String? dataLayout;
  final bool? dataLoading;
}

OneUiIconButtonResolvedState resolveOneUiIconButtonState({
  OneUiIconButtonVariant? variant,
  OneUiIconButtonAttention? attention,
  String? appearance,
  bool disabled = false,
  bool loading = false,
  int size = 10,
  String? sizeAlias,
  bool condensed = false,
  bool contained = true,
  OneUiIconButtonLayout layout = OneUiIconButtonLayout.square,
}) {
  final isDisabled = disabled || loading;
  final resolvedVariant = variant ??
      (attention != null
          ? oneUiIconButtonVariantFromAttention(attention)
          : OneUiIconButtonVariant.bold);
  final resolvedAppearance =
      (appearance == null || appearance == 'auto' || appearance.isEmpty)
          ? 'primary'
          : appearance;
  final numericSize =
      oneUiResolveIconButtonSize(size: size, sizeAlias: sizeAlias);

  return OneUiIconButtonResolvedState(
    isDisabled: isDisabled,
    variant: resolvedVariant,
    appearance: resolvedAppearance,
    numericSize: numericSize,
    dataVariant: oneUiIconButtonVariantSuffix(resolvedVariant),
    dataAppearance: resolvedAppearance,
    dataSize: '$numericSize',
    dataCondensed: contained && condensed ? true : null,
    dataLayout: layout == OneUiIconButtonLayout.wide
        ? oneUiIconButtonLayoutDataValue(layout)
        : null,
    dataLoading: loading ? true : null,
  );
}
