import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_badge_types.dart';
import 'native_design_system_payload.dart';

/// RN `BadgeSlotPaddingFlags` — which slot roots are nested badge chips.
class BadgeSlotPaddingFlags {
  const BadgeSlotPaddingFlags({
    this.startIsBadge = false,
    this.endIsBadge = false,
  });

  const BadgeSlotPaddingFlags.empty()
      : startIsBadge = false,
        endIsBadge = false;

  final bool startIsBadge;
  final bool endIsBadge;
}

double _spacing(BuildContext context, String name) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: name,
  );
}

/// Outer badge padding — mirrors RN `resolveBadgeContainerPadding`.
EdgeInsets resolveBadgeContainerPaddingWithFlags(
  BuildContext context,
  OneUiBadgeSize size, {
  required bool hasStart,
  required bool hasEnd,
  BadgeSlotPaddingFlags flags = const BadgeSlotPaddingFlags.empty(),
  NativeDesignSystemPayload? ds,
  List<String> gaps = const [],
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final designSystem = ds ?? scope.designSystem!;

  double? px(Iterable<String> keys) =>
      designSystem.resolveComponentLengthPxCascade(
        keys,
        gaps: gaps,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      );

  final padH =
      px(['--Badge-paddingHorizontal-$size', '--Badge-paddingHorizontal']) ??
          _defaultPadH(size, context);
  final padV = _badgePadV(size, px, context);

  // Web: XL keeps symmetric horizontal padding even with slots (Figma 409:10118).
  if (size == 'xl') {
    return EdgeInsets.symmetric(horizontal: padH, vertical: padV);
  }

  if (!hasStart && !hasEnd) {
    return EdgeInsets.symmetric(horizontal: padH, vertical: padV);
  }

  final slotV = _spacing(context, '0-5');
  final startBadge = hasStart && flags.startIsBadge;
  final endBadge = hasEnd && flags.endIsBadge;

  if (hasStart && hasEnd && !startBadge && endBadge) {
    return _mixedIconStartBadgeEnd(context, size, slotV);
  }
  if (hasStart && hasEnd && startBadge && !endBadge) {
    return _mixedBadgeStartIconEnd(context, size, slotV);
  }
  // Web `Badge.module.css` slot padding uses `:has(.start)` / `:has(.end)` only —
  // CounterBadge / IndicatorBadge roots trigger the same side reduction as icons.
  if (startBadge || endBadge) {
    if (hasStart && hasEnd) {
      return _iconBoth(context, size, slotV);
    }
    if (hasStart) {
      return _iconStart(context, size, slotV);
    }
    return _iconEnd(context, size, slotV);
  }
  if (hasStart && hasEnd) {
    return _iconBoth(context, size, slotV);
  }
  if (hasStart) {
    return _iconStart(context, size, slotV);
  }
  return _iconEnd(context, size, slotV);
}

double _defaultPadH(OneUiBadgeSize size, BuildContext context) {
  return switch (size) {
    'xs' || 's' => _spacing(context, '1'),
    'm' => _spacing(context, '1-5'),
    'l' => _spacing(context, '2'),
    'xl' => _spacing(context, '1-5'),
    _ => _spacing(context, '1-5'),
  };
}

double _badgePadV(
  OneUiBadgeSize size,
  double? Function(Iterable<String>) px,
  BuildContext context,
) {
  if (size == 'xl') {
    return px(['--Badge-paddingVertical-xl', '--Badge-paddingVertical']) ??
        _spacing(context, '1');
  }
  return px(['--Badge-paddingVertical']) ?? _spacing(context, '0-5');
}

EdgeInsets _mixedIconStartBadgeEnd(
    BuildContext context, OneUiBadgeSize size, double slotV) {
  return switch (size) {
    'xs' || 's' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '0-5'),
        vertical: slotV,
      ),
    'm' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1'),
        vertical: slotV,
      ),
    'l' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1'),
        vertical: slotV,
      ),
    'xl' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '2-5'),
        vertical: _spacing(context, '1'),
      ),
    _ =>
      EdgeInsets.symmetric(horizontal: _spacing(context, '1'), vertical: slotV),
  };
}

EdgeInsets _mixedBadgeStartIconEnd(
    BuildContext context, OneUiBadgeSize size, double slotV) {
  return switch (size) {
    'xs' || 's' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '0-5'),
        vertical: slotV,
      ),
    'm' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1'),
        vertical: slotV,
      ),
    'l' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1'),
        vertical: slotV,
      ),
    'xl' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '2-5'),
        vertical: _spacing(context, '1'),
      ),
    _ =>
      EdgeInsets.symmetric(horizontal: _spacing(context, '1'), vertical: slotV),
  };
}

EdgeInsets _iconBoth(BuildContext context, OneUiBadgeSize size, double slotV) {
  return switch (size) {
    'xs' || 's' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '0-5'),
        vertical: slotV,
      ),
    'm' || 'l' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1'),
        vertical: slotV,
      ),
    'xl' => EdgeInsets.symmetric(
        horizontal: _spacing(context, '1-5'),
        vertical: _spacing(context, '1'),
      ),
    _ =>
      EdgeInsets.symmetric(horizontal: _spacing(context, '1'), vertical: slotV),
  };
}

EdgeInsets _iconStart(BuildContext context, OneUiBadgeSize size, double slotV) {
  return switch (size) {
    'xs' || 's' => EdgeInsets.fromLTRB(
        _spacing(context, '0-5'),
        slotV,
        _spacing(context, '1'),
        slotV,
      ),
    'm' => EdgeInsets.fromLTRB(
        _spacing(context, '1'),
        slotV,
        _spacing(context, '1-5'),
        slotV,
      ),
    'l' => EdgeInsets.fromLTRB(
        _spacing(context, '1'),
        slotV,
        _spacing(context, '2'),
        slotV,
      ),
    'xl' => EdgeInsets.fromLTRB(
        _spacing(context, '1-5'),
        _spacing(context, '1'),
        _spacing(context, '2-5'),
        _spacing(context, '1'),
      ),
    _ => EdgeInsets.fromLTRB(
        _spacing(context, '1'),
        slotV,
        _spacing(context, '1-5'),
        slotV,
      ),
  };
}

EdgeInsets _iconEnd(BuildContext context, OneUiBadgeSize size, double slotV) {
  return switch (size) {
    'xs' || 's' => EdgeInsets.fromLTRB(
        _spacing(context, '1'),
        slotV,
        _spacing(context, '0-5'),
        slotV,
      ),
    'm' => EdgeInsets.fromLTRB(
        _spacing(context, '1-5'),
        slotV,
        _spacing(context, '1'),
        slotV,
      ),
    'l' => EdgeInsets.fromLTRB(
        _spacing(context, '2'),
        slotV,
        _spacing(context, '1'),
        slotV,
      ),
    'xl' => EdgeInsets.fromLTRB(
        _spacing(context, '2-5'),
        _spacing(context, '1'),
        _spacing(context, '1-5'),
        _spacing(context, '1'),
      ),
    _ => EdgeInsets.fromLTRB(
        _spacing(context, '1-5'),
        slotV,
        _spacing(context, '1'),
        slotV,
      ),
  };
}
