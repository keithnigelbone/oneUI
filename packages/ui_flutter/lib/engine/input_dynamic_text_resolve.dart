import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_input_types.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';
import '../theme/surface_scope.dart';

/// Layout + paint for InputDynamicText — `InputDynamicText.module.css`.
class InputDynamicTextResolvedStyle {
  const InputDynamicTextResolvedStyle({
    required this.gapPx,
    required this.contentColor,
    required this.contentMinHeightPx,
  });

  final double gapPx;
  final Color contentColor;
  final double? contentMinHeightPx;
}

InputDynamicTextResolvedStyle resolveInputDynamicTextStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiInputLabelSize size,
  required bool disabled,
}) {
  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;

  double gapPx = 6;
  final gapRaw =
      ds.rawComponentCascade(['--InputDynamicText-gap', '--Spacing-1-5']);
  if (gapRaw != null) {
    final resolved = ds.resolveCSSValue(
      gapRaw,
      platformId: plat,
      density: den,
      platformsConfig: pc,
    );
    gapPx = _parsePx(resolved) ?? gapPx;
  } else {
    gapPx = getSpacingTokenPx(
      spacingName: '1-5',
      platform: plat,
      density: den,
      platformsConfig: pc,
    );
  }

  double? minHeightPx;
  if (size == OneUiInputLabelSize.l) {
    final minRaw = ds.rawComponentCascade([
      '--InputDynamicText-contentMinHeight-l',
      '--Spacing-6',
    ]);
    if (minRaw != null) {
      final resolved = ds.resolveCSSValue(
        minRaw,
        platformId: plat,
        density: den,
        platformsConfig: pc,
      );
      minHeightPx = _parsePx(resolved);
    } else {
      minHeightPx = getSpacingTokenPx(
        spacingName: '6',
        platform: plat,
        density: den,
        platformsConfig: pc,
      );
    }
  }

  final primary = OneUiSurfaceScope.tokensForAppearance(context, 'primary');
  final fromComponent = resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: disabled
        ? [
            '--InputDynamicText-contentColorDisabled',
            '--Text-Low',
          ]
        : [
            '--InputDynamicText-contentColor',
            '--Text-Medium',
          ],
    appearance: 'primary',
  );
  final contentColor = fromComponent ??
      oneUiHexColor(
        disabled
            ? (primary.content['low'] ?? '#666666')
            : (primary.content['medium'] ??
                primary.content['high'] ??
                '#444444'),
      );

  return InputDynamicTextResolvedStyle(
    gapPx: gapPx,
    contentColor: contentColor,
    contentMinHeightPx: minHeightPx,
  );
}

double? _parsePx(String? raw) {
  if (raw == null) return null;
  final n = double.tryParse(raw.replaceAll(RegExp(r'[^0-9.]'), '').trim());
  return n;
}
