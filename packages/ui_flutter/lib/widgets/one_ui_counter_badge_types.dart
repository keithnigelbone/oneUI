import 'package:flutter/widgets.dart';

import '../engine/badge_slot_context.dart';
import '../widgets/one_ui_appearance_validate.dart';
import '../widgets/one_ui_slot_parent_appearance.dart';

/// CounterBadge sizes — Figma API: xs–xl.
typedef OneUiCounterBadgeSize = String;

const List<OneUiCounterBadgeSize> kOneUiCounterBadgeSizes = [
  'xs',
  's',
  'm',
  'l',
  'xl',
];

/// Figma API appearance roles (+ `auto`). Code also supports `brand-bg`.
const List<String> kOneUiCounterBadgeFigmaAppearances = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

typedef OneUiCounterBadgeAttention = String; // high | medium | low

typedef OneUiCounterBadgeVariant = String; // bold | subtle | ghost

const Map<OneUiCounterBadgeAttention, OneUiCounterBadgeVariant>
    kCounterBadgeAttentionToVariant = {
  'high': 'bold',
  'medium': 'subtle',
  'low': 'ghost',
};

const Map<OneUiCounterBadgeVariant, OneUiCounterBadgeAttention>
    kCounterBadgeVariantToAttention = {
  'bold': 'high',
  'subtle': 'medium',
  'ghost': 'low',
};

const int kOneUiCounterBadgeDefaultMax = 99;

/// Validates t-shirt size; unknown values fall back to `'m'`.
String oneUiResolveCounterBadgeSize(String size) {
  final t = size.trim().toLowerCase();
  if (kOneUiCounterBadgeSizes.contains(t)) return t;
  return 'm';
}

int oneUiResolveCounterBadgeMax(int? max) {
  if (max == null || max < 0) return kOneUiCounterBadgeDefaultMax;
  return max;
}

/// RN `isCounterBadgeHidden` — zero (unless showZero) and negative values hide.
bool oneUiCounterBadgeIsHidden(int value, {bool showZero = false}) {
  if (value < 0) return true;
  return value == 0 && !showZero;
}

class OneUiCounterBadgeState {
  const OneUiCounterBadgeState({
    required this.size,
    required this.resolvedVariant,
    required this.resolvedAttention,
    required this.resolvedAppearance,
    required this.displayValue,
    required this.visualDisplayValue,
    required this.isDotMode,
    required this.isHidden,
    required this.dataSize,
    required this.dataVariant,
    required this.dataAttention,
    required this.dataAppearance,
  });

  final OneUiCounterBadgeSize size;
  final OneUiCounterBadgeVariant resolvedVariant;
  final OneUiCounterBadgeAttention resolvedAttention;
  final String resolvedAppearance;
  final String displayValue;
  final String visualDisplayValue;
  final bool isDotMode;
  final bool isHidden;
  final String dataSize;
  final String dataVariant;
  final String dataAttention;
  final String dataAppearance;
}

OneUiCounterBadgeState resolveOneUiCounterBadgeState({
  required BuildContext context,
  required int value,
  int max = kOneUiCounterBadgeDefaultMax,
  bool showZero = false,
  OneUiCounterBadgeSize? size,
  OneUiCounterBadgeVariant? variant,
  OneUiCounterBadgeAttention? attention,
  String appearance = 'auto',
}) {
  final slot = BadgeSlotSizeScope.maybeOf(context);
  final isInBadgeSlot = slot != null;
  final resolvedSize = oneUiResolveCounterBadgeSize(
    size ?? slot?.counterBadgeSize ?? 'm',
  );

  final resolvedVariant = variant ??
      (attention != null
          ? kCounterBadgeAttentionToVariant[attention]!
          : 'bold');

  // Web/RN: no `data-attention` attr. When [variant] is explicit it wins over a
  // conflicting [attention] alias for telemetry; otherwise preserve [attention].
  final dataAttention = variant != null
      ? (kCounterBadgeVariantToAttention[resolvedVariant] ?? 'high')
      : (attention ??
          kCounterBadgeVariantToAttention[resolvedVariant] ??
          'high');
  final resolvedAttention = dataAttention;

  final slotParent = OneUiSlotParentAppearanceScope.maybeOf(context);
  final resolvedAppearance = appearance != 'auto'
      ? oneUiResolveExplicitAppearanceRole(
          context,
          appearance,
          componentName: 'OneUiCounterBadge',
        )
      : (slotParent ?? 'primary');

  final effectiveMax = oneUiResolveCounterBadgeMax(max);
  final isHidden = oneUiCounterBadgeIsHidden(value, showZero: showZero);
  final displayValue =
      isHidden ? '' : (value > effectiveMax ? '$effectiveMax+' : '$value');

  // Standalone xs + high renders as a dot. When Badge supplies xs via slot
  // geometry, keep the counter numeral visible to match web/RN Badge slots.
  final isDotMode =
      !isInBadgeSlot && resolvedSize == 'xs' && resolvedAttention == 'high';
  final visualDisplayValue = isDotMode ? '' : displayValue;

  return OneUiCounterBadgeState(
    size: resolvedSize,
    resolvedVariant: resolvedVariant,
    resolvedAppearance: resolvedAppearance,
    resolvedAttention: resolvedAttention,
    displayValue: displayValue,
    visualDisplayValue: visualDisplayValue,
    isDotMode: isDotMode,
    isHidden: isHidden,
    dataSize: resolvedSize,
    dataVariant: resolvedVariant,
    dataAttention: resolvedAttention,
    dataAppearance: resolvedAppearance,
  );
}
