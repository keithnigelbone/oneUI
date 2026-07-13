/// Shared SVG ornament chrome — mirrors `OneUiButton` + web `ButtonDecoration.tsx`.
library;

import 'package:flutter/material.dart';

import 'button_color_resolve.dart';
import 'button_decoration.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';
import '../tokens/platform_foundation_config.dart';

/// Attention / variant suffix for css-decoration token cascade.
String buttonOrnamentVariantSuffix(OneUiButtonVariantKind kind) =>
    switch (kind) {
      OneUiButtonVariantKind.bold => 'bold',
      OneUiButtonVariantKind.subtle => 'subtle',
      OneUiButtonVariantKind.ghost => 'ghost',
    };

/// Map SelectableButton paint state → Button variant for ornament/css-decoration.
OneUiButtonVariantKind selectableButtonOrnamentVariantKind({
  required bool selected,
  required String attention,
}) {
  if (!selected) return OneUiButtonVariantKind.ghost;
  return switch (attention) {
    'medium' => OneUiButtonVariantKind.subtle,
    'low' => OneUiButtonVariantKind.ghost,
    _ => OneUiButtonVariantKind.bold,
  };
}

bool selectableButtonOrnamentIsGhost({
  required bool selected,
  required String attention,
}) =>
    selectableButtonOrnamentVariantKind(
      selected: selected,
      attention: attention,
    ) ==
    OneUiButtonVariantKind.ghost;

double componentOrnamentHeightScale(
  NativeDesignSystemPayload ds, {
  required String componentPrefix,
  required String platformId,
  required String density,
}) {
  final raw = ds.rawComponentCascade([
    '$componentPrefix-ornamentHeightScale',
    '--Button-ornamentHeightScale',
  ]);
  if (raw == null) return 1.0;
  final resolved =
      ds.resolveCSSValue(raw, platformId: platformId, density: density);
  return double.tryParse(resolved ?? '') ?? 1.0;
}

({double left, double right}) componentOrnamentMargins({
  required NativeDesignSystemPayload ds,
  required double minHeightPx,
  required ButtonOrnamentConfig ornament,
  required String componentPrefix,
  required String platformId,
  required String density,
}) {
  final scaleRaw = ds.rawComponentCascade([
    '$componentPrefix-ornamentHeightScale',
    '--Button-ornamentHeightScale',
  ]);
  var scale = 1.0;
  if (scaleRaw != null) {
    final resolved =
        ds.resolveCSSValue(scaleRaw, platformId: platformId, density: density);
    scale = double.tryParse(resolved ?? '') ?? 1.0;
  }
  final w = minHeightPx * ornament.aspectRatio * scale;
  return (
    left: ornament.showLeft ? w : 0,
    right: ornament.showRight ? w : 0,
  );
}

class ResolvedButtonOrnamentStroke {
  const ResolvedButtonOrnamentStroke({
    required this.strokeColor,
    required this.strokeWidthPx,
    required this.bodyFill,
  });

  final Color? strokeColor;
  final double strokeWidthPx;
  final Color bodyFill;
}

/// Ornament stroke + cap fill — same rules as `OneUiButton.buildChrome`.
ResolvedButtonOrnamentStroke resolveButtonOrnamentStroke({
  required BuildContext context,
  required NativeDesignSystemPayload ds,
  required ButtonOrnamentConfig ornament,
  required OneUiButtonVariantKind variantKind,
  required Color fillPaint,
  required Color foreground,
  required double tokenBorderWidthPx,
  required String componentPrefix,
  required String appearance,
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
  Color? ghostStrokeColor,
}) {
  final isGhost = variantKind == OneUiButtonVariantKind.ghost;
  final suf = buttonOrnamentVariantSuffix(variantKind);

  // Web `.ghost` zeros `--Button-cssDecorationInsetStrokeWidth-active`; cap chrome
  // comes from `[data-ornament-stroke]` using border colour + width (→ `--Stroke-M`).
  if (isGhost) {
    var strokeW = tokenBorderWidthPx;
    if (strokeW < 0.25) {
      strokeW = _hairlineStrokePx(
        ds,
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      );
    }
    final strokeColor = ghostStrokeColor ?? foreground;
    final visibleStroke = strokeColor.a > (8 / 255);
    return ResolvedButtonOrnamentStroke(
      strokeColor: visibleStroke ? strokeColor : null,
      strokeWidthPx: visibleStroke ? strokeW : 0,
      bodyFill: const Color(0x00000000),
    );
  }

  final bodyFill = fillPaint;

  var insetW = ds.resolveComponentLengthPxCascade(
    [
      '$componentPrefix-cssDecorationInsetStrokeWidth-$suf',
      '$componentPrefix-cssDecorationInsetStrokeWidth',
      '--Button-cssDecorationInsetStrokeWidth-$suf',
      '--Button-cssDecorationInsetStrokeWidth',
    ],
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );

  var ornamentStrokeWidthPx = insetW ?? 0.0;
  Color? ornamentStrokeColor;

  if (ornamentStrokeWidthPx > 0.25) {
    final rawStroke = ds.rawComponentCascade([
      '$componentPrefix-cssDecorationColor-$suf',
      '$componentPrefix-cssDecorationColor',
      '--Button-cssDecorationColor-$suf',
      '--Button-cssDecorationColor',
    ]);
    if (rawStroke != null) {
      ornamentStrokeColor = resolveButtonTokenColor(
        context,
        ds,
        rawStroke,
        appearance: appearance,
      );
      final concrete = ds.resolveCSSValue(
        rawStroke,
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      );
      if (ornamentStrokeColor == null &&
          concrete != null &&
          concrete.trim().toLowerCase() == 'currentcolor') {
        ornamentStrokeColor = foreground;
      }
    }
    ornamentStrokeColor ??= foreground;
    if (ornamentStrokeColor.a <= (8 / 255)) {
      ornamentStrokeColor = null;
      ornamentStrokeWidthPx = 0;
    }
  }

  return ResolvedButtonOrnamentStroke(
    strokeColor: ornamentStrokeColor,
    strokeWidthPx: ornamentStrokeWidthPx,
    bodyFill: bodyFill,
  );
}

double _hairlineStrokePx(
  NativeDesignSystemPayload ds, {
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
}) {
  return ds.resolveComponentLengthPxCascade(
        ['--Stroke-M'],
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      ) ??
      1;
}

BorderRadius buttonOrnamentCoreBorderRadius({
  required ButtonOrnamentConfig? ornament,
  required double radius,
}) {
  final o = ornament;
  if (o == null) return BorderRadius.circular(radius);
  final cr = Radius.circular(radius);
  return BorderRadius.only(
    topLeft: o.showLeft ? Radius.zero : cr,
    bottomLeft: o.showLeft ? Radius.zero : cr,
    topRight: o.showRight ? Radius.zero : cr,
    bottomRight: o.showRight ? Radius.zero : cr,
  );
}

/// Inset border on core when no SVG ornaments — mirrors `OneUiButton` bold inset path.
Border? resolveButtonCoreInsetBorder({
  required BuildContext context,
  required NativeDesignSystemPayload ds,
  required OneUiButtonVariantKind variantKind,
  required Border? existingBorder,
  required Color foreground,
  required String componentPrefix,
  required String appearance,
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
}) {
  if (existingBorder != null) return existingBorder;

  if (variantKind != OneUiButtonVariantKind.bold) return null;

  final suf = buttonOrnamentVariantSuffix(variantKind);
  final insetW = ds.resolveComponentLengthPxCascade(
    [
      '$componentPrefix-cssDecorationInsetStrokeWidth-$suf',
      '$componentPrefix-cssDecorationInsetStrokeWidth',
      '--Button-cssDecorationInsetStrokeWidth-$suf',
      '--Button-cssDecorationInsetStrokeWidth',
    ],
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
  if (insetW == null || insetW <= 0) return null;

  final rawDecoColor = ds.rawComponentCascade([
    '$componentPrefix-cssDecorationColor-$suf',
    '$componentPrefix-cssDecorationColor',
    '--Button-cssDecorationColor-$suf',
    '--Button-cssDecorationColor',
  ]);
  Color? strokeColor;
  if (rawDecoColor != null) {
    strokeColor = resolveButtonTokenColor(
      context,
      ds,
      rawDecoColor,
      appearance: appearance,
    );
    final concrete = ds.resolveCSSValue(
      rawDecoColor,
      platformId: platformId,
      density: density,
      platformsConfig: platformsConfig,
      nativeTypography: nativeTypography,
    );
    if (strokeColor == null &&
        concrete != null &&
        concrete.trim().toLowerCase() == 'currentcolor') {
      strokeColor = foreground;
    }
  }
  strokeColor ??= foreground;
  if (strokeColor.a <= (8 / 255)) return null;
  return Border.all(width: insetW, color: strokeColor);
}

class ButtonOrnamentChromeParams {
  const ButtonOrnamentChromeParams({
    required this.ornament,
    required this.layers,
    required this.leftBarW,
    required this.rightBarW,
    required this.strokeAlignPx,
    required this.ornamentHeightScale,
    required this.borderWidthPx,
    required this.minHeightPx,
    required this.borderRadius,
  });

  final ButtonOrnamentConfig ornament;
  final ({ResolvedOrnamentSideSvgs? left, ResolvedOrnamentSideSvgs? right})
      layers;
  final double leftBarW;
  final double rightBarW;
  final double strokeAlignPx;
  final double ornamentHeightScale;
  final double borderWidthPx;
  final double minHeightPx;
  final BorderRadius borderRadius;
}

/// Wrap [coreButton] with ornament margins + positioned cap SVGs.
Widget buildButtonOrnamentChrome({
  required ButtonOrnamentChromeParams params,
  required Widget coreButton,
  required bool fullWidth,
}) {
  if (params.leftBarW <= 0 && params.rightBarW <= 0) {
    return fullWidth
        ? SizedBox(width: double.infinity, child: coreButton)
        : coreButton;
  }

  final stackChildren = <Widget>[
    if (params.layers.left != null && params.leftBarW > 0)
      Positioned(
        left: -params.leftBarW + params.strokeAlignPx,
        top: 0,
        bottom: 0,
        width: params.leftBarW,
        child: LayoutBuilder(
          builder: (context, c) {
            final stackH =
                c.maxHeight.isFinite && c.maxHeight > 0 ? c.maxHeight : params.minHeightPx;
            final ornamentH =
                (stackH + 2 * params.borderWidthPx) * params.ornamentHeightScale;
            return Align(
              alignment: Alignment.center,
              child: SizedBox(
                width: params.leftBarW,
                height: ornamentH,
                child: buttonOrnamentSideRendered(
                  data: params.layers.left!,
                  width: params.leftBarW,
                  height: ornamentH,
                ),
              ),
            );
          },
        ),
      ),
    if (params.layers.right != null && params.rightBarW > 0)
      Positioned(
        right: params.strokeAlignPx - params.rightBarW,
        top: 0,
        bottom: 0,
        width: params.rightBarW,
        child: LayoutBuilder(
          builder: (context, c) {
            final stackH =
                c.maxHeight.isFinite && c.maxHeight > 0 ? c.maxHeight : params.minHeightPx;
            final ornamentH =
                (stackH + 2 * params.borderWidthPx) * params.ornamentHeightScale;
            return Align(
              alignment: Alignment.center,
              child: SizedBox(
                width: params.rightBarW,
                height: ornamentH,
                child: buttonOrnamentSideRendered(
                  data: params.layers.right!,
                  width: params.rightBarW,
                  height: ornamentH,
                ),
              ),
            );
          },
        ),
      ),
    fullWidth ? SizedBox(width: double.infinity, child: coreButton) : coreButton,
  ];

  final stack = Stack(
    clipBehavior: Clip.none,
    children: stackChildren,
  );

  return Padding(
    padding: EdgeInsets.only(
      left: params.leftBarW,
      right: params.rightBarW,
    ),
    child: fullWidth ? SizedBox(width: double.infinity, child: stack) : stack,
  );
}
