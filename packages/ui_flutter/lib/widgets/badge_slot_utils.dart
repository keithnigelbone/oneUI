import 'package:flutter/widgets.dart';

import 'one_ui_counter_badge.dart';
import 'one_ui_indicator_badge.dart';

/// RN `slotUsesBadgeInset` — root slot widget is CounterBadge or IndicatorBadge.
bool isBadgeNestedSlotWidget(Widget? slot) {
  return slot is OneUiCounterBadge || slot is OneUiIndicatorBadge;
}

/// Web `SURFACE_IMMUNE_DISPLAY_NAMES` — sub-badges keep their own role colours
/// on bold Badge fills (shielded from `[data-surface]` remapping).
bool isSurfaceImmuneSlotWidget(Widget? slot) => isBadgeNestedSlotWidget(slot);
