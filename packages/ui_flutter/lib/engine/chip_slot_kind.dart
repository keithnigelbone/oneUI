import 'package:flutter/widgets.dart';

import '../widgets/badge_slot_utils.dart';

/// Chip slot padding matrix — RN `chipLayoutMatrix.ts` / CSS `:has(.start)`.
typedef ChipSlotKind = String;

const String kChipSlotNone = 'none';
const String kChipSlotAffordance = 'affordance';
const String kChipSlotBadge = 'badge';

ChipSlotKind classifyChipSlot(Widget? slot) {
  if (slot == null) return kChipSlotNone;
  if (isBadgeNestedSlotWidget(slot)) return kChipSlotBadge;
  return kChipSlotAffordance;
}
