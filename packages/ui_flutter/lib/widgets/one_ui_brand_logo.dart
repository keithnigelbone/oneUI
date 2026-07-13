import 'package:flutter/material.dart';

import '../brand/default_jio_brand_logo.dart';
import '../brand/one_ui_brand_scope.dart';
import '../foundations/logo_brand_bind.dart';
import 'one_ui_logo.dart';
import 'one_ui_logo_types.dart';

/// Brand-connected logo — reads [OneUiBrandLoadState.logoSvg] (Convex or bundled Jio).
///
/// Web `BrandLogo` / Storybook `OneUiBrandLogo` parity for production [OneUiBrandProvider].
class OneUiBrandLogo extends StatelessWidget {
  const OneUiBrandLogo({
    super.key,
    this.variant = OneUiLogoVariant.mark,
    this.size = OneUiLogoSize.m,
    this.customSize,
    this.interactive = false,
    this.disabled = false,
    this.onPress,
    this.onClick,
    this.alt,
  });

  final OneUiLogoVariant variant;
  final OneUiLogoSizeInput size;
  final double? customSize;
  final bool interactive;
  final bool disabled;
  final VoidCallback? onPress;
  final VoidCallback? onClick;
  final String? alt;

  @override
  Widget build(BuildContext context) {
    bindLogoBrandScope(context);
    final load = OneUiBrandLoadState.maybeOf(context);
    final svg = load?.logoSvg ?? DefaultJioBrandLogo.svg;
    if (svg == null || svg.trim().isEmpty) {
      return const SizedBox.shrink();
    }
    return OneUiLogo(
      key: ValueKey(logoBrandScopeKey(context, svgContent: svg)),
      variant: variant,
      size: size,
      customSize: customSize,
      svgContent: svg,
      alt: alt ?? load?.brandName ?? 'Jio',
      interactive: interactive,
      disabled: disabled,
      onPress: onPress,
      onClick: onClick,
    );
  }
}
