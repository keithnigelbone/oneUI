import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_appearance_validate.dart';
import '../widgets/one_ui_counter_badge_types.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

class CounterBadgeResolvedColors {
  const CounterBadgeResolvedColors({
    required this.background,
    required this.foreground,
    this.borderColor,
    this.borderWidth,
  });

  final Color background;
  final Color foreground;
  final Color? borderColor;
  final double? borderWidth;
}

CounterBadgeResolvedColors resolveCounterBadgeColors(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiCounterBadgeVariant variant,
  required String appearance,
}) {
  final paintAppearance = oneUiResolvePaintAppearanceOnBrand(
    context,
    appearance,
    componentName: 'OneUiCounterBadge',
  );
  final role = OneUiSurfaceScope.tokensForAppearance(context, paintAppearance);

  Color? fromComponent(List<String> keys) =>
      resolveColorFromComponentPropertyKeys(
        context,
        ds,
        keys: keys,
        appearance: paintAppearance,
      );

  // Web parity: CounterBadge.module.css reads `--CounterBadge-backgroundColor-*`
  // before role intermediates for every appearance — not gated on primary.
  switch (variant) {
    case 'subtle':
      return CounterBadgeResolvedColors(
        background: fromComponent(['--CounterBadge-backgroundColor-subtle']) ??
            oneUiHexColor(role.surfaces[kSurfaceSubtle]!),
        foreground: fromComponent(['--CounterBadge-textColor-subtle']) ??
            oneUiHexColor(role.content['tintedA11y']!),
      );
    case 'ghost':
      final borderW = ds.resolveComponentLengthPxCascade(
        ['--CounterBadge-borderWidth-ghost', '--Stroke-M'],
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
      );
      return CounterBadgeResolvedColors(
        background: fromComponent(['--CounterBadge-backgroundColor-ghost']) ??
            const Color(0x00000000),
        foreground: fromComponent(['--CounterBadge-textColor-ghost']) ??
            oneUiHexColor(role.content['tintedA11y']!),
        borderColor: fromComponent(['--CounterBadge-borderColor-ghost']) ??
            oneUiHexColor(role.content['strokeLow']!),
        borderWidth: borderW,
      );
    case 'bold':
    default:
      return CounterBadgeResolvedColors(
        background: fromComponent(['--CounterBadge-backgroundColor-bold']) ??
            oneUiHexColor(role.surfaces[kSurfaceBold]!),
        foreground: fromComponent(['--CounterBadge-textColor-bold']) ??
            oneUiHexColor(
              role.onBoldContent['high'] ?? role.onBoldContent['tintedA11y']!,
            ),
      );
  }
}
