import 'package:flutter/material.dart';

import '../engine/icon_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_input_feedback_types.dart';
import '../widgets/one_ui_icon_types.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';
import '../theme/surface_scope.dart';

/// Layout chrome for InputFeedback — `InputFeedback.module.css` geometry.
class InputFeedbackLayout {
  const InputFeedbackLayout({
    required this.gapPx,
    required this.borderRadius,
    required this.padding,
    required this.iconSizeKey,
    required this.iconSizePx,
    required this.bodySizeKey,
  });

  final double gapPx;
  final BorderRadius borderRadius;
  final EdgeInsets padding;
  final String iconSizeKey;

  /// Resolved icon box — `FEEDBACK_TO_ICON_SIZE` / web `data-size` → `--Spacing-*`.
  final double iconSizePx;
  final String bodySizeKey;
}

/// Paint tokens — RN `paintFor` / web `--_fb-*` cascade.
class InputFeedbackPaint {
  const InputFeedbackPaint({
    required this.background,
    required this.text,
    required this.iconColor,
    required this.iconEmphasis,
  });

  final Color background;
  final Color text;

  /// Variant role glyph — RN `paint.iconColor` / web `Icon` `tintedA11y` on low & medium.
  final Color iconColor;
  final OneUiIconEmphasis iconEmphasis;
}

const _kFeedbackIconSize = {
  OneUiInputFeedbackSize.s: '3',
  OneUiInputFeedbackSize.m: '4',
  OneUiInputFeedbackSize.l: '5',
};

const _kFeedbackBodySize = {
  OneUiInputFeedbackSize.s: 'XS',
  OneUiInputFeedbackSize.m: 'XS',
  OneUiInputFeedbackSize.l: 'S',
};

InputFeedbackLayout resolveInputFeedbackLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiInputFeedbackSize size,
  required OneUiInputFeedbackAttention attention,
}) {
  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;

  double pxFor(List<String> keys, {double fallback = 0}) {
    for (final k in keys) {
      final raw = ds.rawComponentCascade([k]);
      if (raw == null) continue;
      final resolved = ds.resolveCSSValue(
        raw,
        platformId: plat,
        density: den,
        platformsConfig: pc,
      );
      final n = _parsePx(resolved);
      if (n != null) return n;
    }
    return fallback;
  }

  final gapPx = pxFor(
    ['--InputFeedback-gap', '--Spacing-1'],
    fallback: getSpacingTokenPx(
      spacingName: '1',
      platform: plat,
      density: den,
      platformsConfig: pc,
    ),
  );

  final radiusKey = switch (size) {
    OneUiInputFeedbackSize.s => '--Shape-1-5',
    OneUiInputFeedbackSize.m => '--Shape-2',
    OneUiInputFeedbackSize.l => '--Shape-2-5',
  };
  final radiusPx = pxFor(
    [
      '--InputFeedback-borderRadius-${size.wireValue}',
      radiusKey,
    ],
    fallback: getSpacingTokenPx(
      spacingName: size == OneUiInputFeedbackSize.s
          ? '1-5'
          : size == OneUiInputFeedbackSize.m
              ? '2'
              : '2-5',
      platform: plat,
      density: den,
      platformsConfig: pc,
    ),
  );

  EdgeInsets padding = EdgeInsets.zero;
  if (attention != OneUiInputFeedbackAttention.low) {
    final pad = switch (size) {
      OneUiInputFeedbackSize.s => (
          pxFor(['--Spacing-1'], fallback: 4),
          pxFor(['--Spacing-1-5'], fallback: 6),
        ),
      OneUiInputFeedbackSize.m => (
          pxFor(['--Spacing-1-5'], fallback: 6),
          pxFor(['--Spacing-2'], fallback: 8),
        ),
      OneUiInputFeedbackSize.l => (
          pxFor(['--Spacing-2'], fallback: 8),
          pxFor(['--Spacing-3'], fallback: 12),
        ),
    };
    padding = EdgeInsets.fromLTRB(pad.$1, pad.$1, pad.$2, pad.$1);
  }

  final iconSizeKey = _kFeedbackIconSize[size]!;
  return InputFeedbackLayout(
    gapPx: gapPx,
    borderRadius: BorderRadius.circular(radiusPx),
    padding: padding,
    iconSizeKey: iconSizeKey,
    iconSizePx: resolveOneUiIconSizePx(context, iconSizeKey),
    bodySizeKey: _kFeedbackBodySize[size]!,
  );
}

InputFeedbackPaint resolveInputFeedbackPaint(
  BuildContext context, {
  required OneUiInputFeedbackVariant variant,
  required OneUiInputFeedbackAttention attention,
}) {
  final role =
      OneUiSurfaceScope.tokensForAppearance(context, variant.surfaceRole);
  final page = OneUiSurfaceScope.tokensForAppearance(context, 'neutral');

  Color pick(String? hex, String fallback) => oneUiHexColor(hex ?? fallback);

  final tintedA11y = pick(role.content['tintedA11y'], '#444444');
  final pageTextHigh = pick(page.content['high'], '#111111');

  switch (attention) {
    case OneUiInputFeedbackAttention.high:
      final onBoldHigh = pick(role.onBoldContent['high'], '#ffffff');
      return InputFeedbackPaint(
        background: pick(role.surfaces[kSurfaceBold], '#aa0000'),
        text: onBoldHigh,
        iconColor: onBoldHigh,
        iconEmphasis: OneUiIconEmphasis.high,
      );
    case OneUiInputFeedbackAttention.medium:
      return InputFeedbackPaint(
        background: pick(role.surfaces[kSurfaceSubtle], '#eeeeee'),
        text: pageTextHigh,
        iconColor: tintedA11y,
        iconEmphasis: OneUiIconEmphasis.tintedA11y,
      );
    case OneUiInputFeedbackAttention.low:
      return InputFeedbackPaint(
        background: Colors.transparent,
        text: pageTextHigh,
        iconColor: tintedA11y,
        iconEmphasis: OneUiIconEmphasis.tintedA11y,
      );
  }
}

double? _parsePx(String? raw) {
  if (raw == null) return null;
  return double.tryParse(raw.replaceAll(RegExp(r'[^0-9.]'), '').trim());
}
