import 'package:flutter/widgets.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'badge_slot_context.dart';
import 'native_design_system_payload.dart';

/// Maps design Icon size index (`2.5`) → spacing token tail (`2-5`).
String oneUiIconSizeToSpacingTail(String size) => size.replaceAll('.', '-');

/// Default platform/density when [OneUiScope] is absent — matches storybook mobile baseline.
const String kOneUiIconFallbackPlatformId = 'S';
const String kOneUiIconFallbackDensity = 'default';

/// Box dimension in logical px — mirrors `Icon.module.css` `data-size` → `--Spacing-*`
/// and RN `designIconSizePx`.
double resolveOneUiIconSizePx(BuildContext context, String size) {
  // Web `Badge.module.css`: only the default Icon size (`5` → `--Icon-size-5`)
  // is remapped to `--_slot-icon-size`. Explicit sizes win (RN parity).
  final badgeSlot = BadgeSlotSizeScope.maybeOf(context);
  if (badgeSlot != null && size == '5') {
    return badgeSlot.iconPx;
  }

  final scope = OneUiScope.maybeOf(context);
  final platformId = scope?.platformId ?? kOneUiIconFallbackPlatformId;
  final density = scope?.density ?? kOneUiIconFallbackDensity;
  final platformsConfig = scope?.platformsFoundationConfig;
  final ds = scope?.designSystem;

  if (ds != null) {
    final tail = oneUiIconSizeToSpacingTail(size);
    final keys = [
      '--Icon-size-$tail',
      '--Icon-size-$size',
    ];
    for (final key in keys) {
      final raw = ds.rawComponentCascade([key]);
      if (raw == null) continue;
      final resolved = ds.resolveCSSValue(
        raw,
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
      );
      if (resolved == null) continue;
      final peeled = NativeDesignSystemPayload.peelLeadingVar(resolved.trim());
      if (peeled != null && peeled.startsWith('--Spacing-')) {
        final spacingTail = peeled.substring('--Spacing-'.length);
        return getSpacingTokenPx(
          spacingName: spacingTail,
          platform: platformId,
          density: density,
          platformsConfig: platformsConfig,
        );
      }
      final px = _parseCssLengthPx(resolved);
      if (px != null) return px;
    }
  }

  return getSpacingTokenPx(
    spacingName: oneUiIconSizeToSpacingTail(size),
    platform: platformId,
    density: density,
    platformsConfig: platformsConfig,
  );
}

double? _parseCssLengthPx(String raw) {
  final t = raw.trim().toLowerCase();
  if (t.endsWith('px')) {
    return double.tryParse(t.substring(0, t.length - 2));
  }
  return double.tryParse(t);
}
