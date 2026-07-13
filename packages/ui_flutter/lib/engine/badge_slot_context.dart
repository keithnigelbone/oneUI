import 'package:flutter/widgets.dart';

import '../widgets/one_ui_badge_types.dart';

/// Slot auto-sizing — RN `BadgeSlotContext.tsx` / web `--_slot-*` cascade.
class BadgeSlotSizes {
  const BadgeSlotSizes({
    required this.avatarSize,
    required this.counterBadgeSize,
    required this.indicatorBadgeSize,
    required this.iconPx,
    required this.counterSpacing,
    required this.indicatorSpacing,
  });

  final String avatarSize;
  final String counterBadgeSize;
  final String indicatorBadgeSize;
  final double iconPx;

  /// `--_slot-counter-size` from web `Badge.module.css` (Spacing token name).
  final String counterSpacing;

  /// `--_slot-indicator-size` from web `Badge.module.css` (Badge slot geometry —
  /// distinct from standalone [kIndicatorBadgeSizeSpacingFallback]).
  final String indicatorSpacing;
}

/// T-shirt sizes + Figma slot pixel overrides — web `--_slot-*` / RN `BADGE_SLOT_SIZES`.
const Map<OneUiBadgeSize, BadgeSlotSizes> kBadgeSlotSizes = {
  'xs': BadgeSlotSizes(
    avatarSize: '2xs',
    counterBadgeSize: 'xs',
    indicatorBadgeSize: 'xs',
    iconPx: 8,
    counterSpacing: '3',
    indicatorSpacing: '1',
  ),
  's': BadgeSlotSizes(
    avatarSize: 'xs',
    counterBadgeSize: 'xs',
    indicatorBadgeSize: 'xs',
    iconPx: 12,
    counterSpacing: '3',
    indicatorSpacing: '1-5',
  ),
  'm': BadgeSlotSizes(
    avatarSize: 'xs',
    counterBadgeSize: 'xs',
    indicatorBadgeSize: 's',
    iconPx: 12,
    counterSpacing: '3',
    indicatorSpacing: '2',
  ),
  'l': BadgeSlotSizes(
    avatarSize: 's',
    counterBadgeSize: 'm',
    indicatorBadgeSize: 's',
    iconPx: 16,
    counterSpacing: '4',
    indicatorSpacing: '2',
  ),
  'xl': BadgeSlotSizes(
    avatarSize: 'm',
    counterBadgeSize: 'l',
    indicatorBadgeSize: 'l',
    iconPx: 20,
    counterSpacing: '5',
    indicatorSpacing: '3',
  ),
};

class BadgeSlotSizeScope extends InheritedWidget {
  const BadgeSlotSizeScope({
    required this.sizes,
    required super.child,
    super.key,
  });

  final BadgeSlotSizes sizes;

  static BadgeSlotSizes? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<BadgeSlotSizeScope>()
        ?.sizes;
  }

  @override
  bool updateShouldNotify(BadgeSlotSizeScope oldWidget) =>
      sizes != oldWidget.sizes;
}

/// Slot icon tint — web `.bold .start { --Primary-High: var(--_bg-icon-on-bold) }`.
class BadgeSlotIconColorScope extends InheritedWidget {
  const BadgeSlotIconColorScope({
    required this.color,
    required super.child,
    super.key,
  });

  final Color color;

  static Color? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<BadgeSlotIconColorScope>()
        ?.color;
  }

  @override
  bool updateShouldNotify(BadgeSlotIconColorScope oldWidget) =>
      color != oldWidget.color;
}
