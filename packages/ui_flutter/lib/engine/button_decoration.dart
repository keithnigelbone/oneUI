/// Button SVG ornament from Convex `decorations` + layout vars in `designSystem`.
library;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/one_ui_scope.dart';
import 'native_design_system_payload.dart';
import 'ornament_svg.dart';

class ButtonOrnamentConfig {
  const ButtonOrnamentConfig({
    required this.svgContent,
    required this.aspectRatio,
    required this.mirror,
    required this.placement,
  });

  final String svgContent;
  final double aspectRatio;
  final bool mirror;
  final String placement; // edges | left | right

  static ButtonOrnamentConfig? fromJson(Map<String, dynamic> json) {
    final svg = json['svgContent'] as String?;
    if (svg == null || svg.isEmpty) return null;
    return ButtonOrnamentConfig(
      svgContent: svg,
      aspectRatio: (json['aspectRatio'] as num?)?.toDouble() ?? 1,
      mirror: json['mirror'] as bool? ?? false,
      placement: json['placement'] as String? ?? 'edges',
    );
  }

  bool get showLeft => placement == 'edges' || placement == 'left';
  bool get showRight => placement == 'edges' || placement == 'right';
}

/// Ornament margin widths — same formula as TS `generateOrnamentCSSProperties`.
({double left, double right}) buttonOrnamentMargins({
  required NativeDesignSystemPayload ds,
  required double minHeightPx,
  required ButtonOrnamentConfig ornament,
  required String platformId,
  required String density,
}) {
  final scaleRaw = ds.rawComponentCascade(['--Button-ornamentHeightScale']);
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

double buttonOrnamentHeightScale(NativeDesignSystemPayload ds,
    {required String platformId, required String density}) {
  final scaleRaw = ds.rawComponentCascade(['--Button-ornamentHeightScale']);
  if (scaleRaw == null) return 1.0;
  final resolved =
      ds.resolveCSSValue(scaleRaw, platformId: platformId, density: density);
  return double.tryParse(resolved ?? '') ?? 1.0;
}

/// Native / web `ButtonDecoration`: open-path fill with body colour; optional stroke silhouette
/// from `--Button-cssDecorationInsetStrokeWidth-*` (mirrors TSX `[data-ornament-stroke]`).
class ResolvedOrnamentSideSvgs {
  const ResolvedOrnamentSideSvgs({required this.fillXml, this.strokeXml});

  final String fillXml;
  final String? strokeXml;
}

ResolvedOrnamentSideSvgs? _buildOrnamentSideSvg({
  required String viewBox,
  required String pathD,
  required Color bodyFill,
  required bool mirror,
  required OrnamentViewBox parsedViewBox,
  Color? ornamentStrokeColor,
  required double ornamentStrokeWidthPx,
}) {
  if (pathD.isEmpty) return null;
  final fillHex = svgCssColorHex(bodyFill);

  final pathFill = '<path d="$pathD" fill="$fillHex" stroke="none"/>';
  final gOpen = mirror
      ? '<g transform="translate(${parsedViewBox.width},0) scale(-1,1)">'
      : '';
  final gClose = mirror ? '</g>' : '';
  final fillXml =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$viewBox" preserveAspectRatio="none">'
      '$gOpen$pathFill$gClose'
      '</svg>';

  /// Flutter scales stroke-width with viewport; web uses `vector-effect: non-scaling-stroke`.
  String? strokeXml;
  final sc = ornamentStrokeColor;
  if (sc != null && sc.opacity > (8 / 255) && ornamentStrokeWidthPx > 0.2) {
    final strokeHex = svgCssColorHex(sc);
    final pathStroke =
        '<path d="$pathD" fill="none" stroke="$strokeHex" stroke-width="$ornamentStrokeWidthPx" '
        'stroke-linecap="square" stroke-linejoin="round"/>';
    strokeXml =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$viewBox" preserveAspectRatio="none">'
        '$gOpen$pathStroke$gClose'
        '</svg>';
  }

  return ResolvedOrnamentSideSvgs(fillXml: fillXml, strokeXml: strokeXml);
}

/// RN `buildOrnamentFillXml` fallback when open path extraction fails.
String _buildInnerMarkupFillSvg(
    String viewBox, String innerMarkup, Color bodyFill) {
  final fillHex = svgCssColorHex(bodyFill);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$viewBox" preserveAspectRatio="none" fill="$fillHex">'
      '$innerMarkup'
      '</svg>';
}

({ResolvedOrnamentSideSvgs? left, ResolvedOrnamentSideSvgs? right})
    resolveButtonOrnamentLayers({
  required ButtonOrnamentConfig ornament,
  required Color bodyFill,
  Color? ornamentStrokeColor,
  double ornamentStrokeWidthPx = 0,
}) {
  final svg = ornament.svgContent;
  final vbModel = extractOrnamentViewBox(svg);
  if (vbModel == null) {
    return (left: null, right: null);
  }
  final vb = vbModel.cssString;

  final openOriginal = getOrnamentOpenStrokePath(svg);
  ResolvedOrnamentSideSvgs? right;
  ResolvedOrnamentSideSvgs? left;

  if (openOriginal != null && openOriginal.isNotEmpty) {
    if (ornament.showRight) {
      right = _buildOrnamentSideSvg(
        viewBox: vb,
        pathD: openOriginal,
        bodyFill: bodyFill,
        mirror: false,
        parsedViewBox: vbModel,
        ornamentStrokeColor: ornamentStrokeColor,
        ornamentStrokeWidthPx: ornamentStrokeWidthPx,
      );
    }
    if (ornament.showLeft) {
      // Web `ButtonDecoration.tsx`: left uses the same open path but
      // `translate(viewBox.width, 0) scale(-1, 1)` when `decoration.mirror`.
      //
      // Do NOT infer mirroring from `mirrorOrnamentSvg` + `getOrnamentOpenStrokePath`:
      // mirroring wraps a `<g>` around markup; extracted `path d` stays identical to the
      // right edge, which incorrectly routed us to `mirror: false` so both sides matched.
      left = _buildOrnamentSideSvg(
        viewBox: vb,
        pathD: openOriginal,
        bodyFill: bodyFill,
        mirror: ornament.mirror,
        parsedViewBox: vbModel,
        ornamentStrokeColor: ornamentStrokeColor,
        ornamentStrokeWidthPx: ornamentStrokeWidthPx,
      );
    }
  } else {
    // Outline-only uploads: inherit fill on root `<svg>` like RN.
    final base = extractOrnamentSvgContent(svg);
    if (base != null && ornament.showRight) {
      right = ResolvedOrnamentSideSvgs(
          fillXml: _buildInnerMarkupFillSvg(
              base.viewBox, base.innerMarkup, bodyFill));
    }
    if (base != null && ornament.showLeft) {
      final src = ornament.mirror ? mirrorOrnamentSvg(svg) : svg;
      final ex = extractOrnamentSvgContent(src);
      if (ex != null) {
        left = ResolvedOrnamentSideSvgs(
            fillXml:
                _buildInnerMarkupFillSvg(ex.viewBox, ex.innerMarkup, bodyFill));
      }
    }
  }

  return (left: left, right: right);
}

Widget buttonOrnamentSideRendered({
  required ResolvedOrnamentSideSvgs data,
  required double width,
  required double height,
}) {
  return SizedBox(
    width: width,
    height: height,
    child: Stack(
      fit: StackFit.expand,
      clipBehavior: Clip.none,
      children: [
        SvgPicture.string(
          data.fillXml,
          fit: BoxFit.fill,
          clipBehavior: Clip.hardEdge,
          placeholderBuilder: (_) => const SizedBox.shrink(),
        ),
        if (data.strokeXml != null)
          SvgPicture.string(
            data.strokeXml!,
            fit: BoxFit.fill,
            clipBehavior: Clip.hardEdge,
            placeholderBuilder: (_) => const SizedBox.shrink(),
          ),
      ],
    ),
  );
}

ButtonOrnamentConfig? buttonOrnamentFromScope(BuildContext context) {
  return OneUiScope.maybeOf(context)?.buttonOrnament;
}
