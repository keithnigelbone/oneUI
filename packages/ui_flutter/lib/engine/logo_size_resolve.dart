import 'package:flutter/widgets.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_logo_types.dart';
import 'native_design_system_payload.dart';

/// Default spacing tails — `Logo.module.css` / `Logo.styles.native.ts`.
const Map<OneUiLogoSize, String> kLogoDefaultSizeSpacing = {
  OneUiLogoSize.xs: '3',
  OneUiLogoSize.s: '4',
  OneUiLogoSize.m: '5',
  OneUiLogoSize.l: '6',
  OneUiLogoSize.xl: '8',
};

double _spacingPx(BuildContext context, String tail) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: tail,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

double? _parseCssLengthPx(String raw) {
  final t = raw.trim().toLowerCase();
  if (t.endsWith('px')) {
    return double.tryParse(t.substring(0, t.length - 2));
  }
  return double.tryParse(t);
}

double? _resolveLogoSizePxFromDs(
  BuildContext context,
  NativeDesignSystemPayload ds,
  OneUiLogoSize size,
) {
  if (size == OneUiLogoSize.custom) return null;
  final wire = oneUiLogoSizeWire(size);
  final scope = OneUiScope.of(context);
  final keys = ['--Logo-size-$wire', '--Logo-size'];
  for (final key in keys) {
    final raw = ds.rawComponentCascade([key]);
    if (raw == null) continue;
    final resolved = ds.resolveCSSValue(
      raw,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
    );
    if (resolved == null) continue;
    final peeled = NativeDesignSystemPayload.peelLeadingVar(resolved.trim());
    if (peeled != null && peeled.startsWith('--Spacing-')) {
      return _spacingPx(context, peeled.substring('--Spacing-'.length));
    }
    final px = _parseCssLengthPx(resolved);
    if (px != null) return px;
  }
  return null;
}

bool _isValidLogoCustomSize(double? customSize) {
  return customSize != null && customSize.isFinite && customSize > 0;
}

/// Resolves the logo box side length in density-aware px.
double resolveOneUiLogoSizePx(
  BuildContext context,
  OneUiLogoSize size, {
  double? customSize,
}) {
  if (size == OneUiLogoSize.custom) {
    if (_isValidLogoCustomSize(customSize)) return customSize!;
    assert(() {
      if (customSize == null) {
        // ignore: avoid_print
        print(
          '[OneUiLogo] size="custom" requires a positive customSize (pixels). Falling back to m.',
        );
      } else {
        // ignore: avoid_print
        print(
          '[OneUiLogo] customSize must be a positive finite number. Received $customSize. Falling back to m.',
        );
      }
      return true;
    }());
    return resolveOneUiLogoSizePx(context, OneUiLogoSize.m);
  }

  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final fromDs = _resolveLogoSizePxFromDs(context, ds, size);
    if (fromDs != null) return fromDs;
  }

  final tail = kLogoDefaultSizeSpacing[size] ??
      kLogoDefaultSizeSpacing[OneUiLogoSize.m]!;
  return _spacingPx(context, tail);
}

/// Parse `viewBox` width/height ratio for full-variant wordmark width.
double? oneUiLogoSvgAspectRatio(String xml) {
  final match = RegExp(
    r'''viewBox\s*=\s*(["'])([^"']+)\1''',
    caseSensitive: false,
  ).firstMatch(xml);
  if (match == null) return null;
  final parts = match
      .group(2)!
      .trim()
      .split(RegExp(r'[\s,]+'))
      .map(double.tryParse)
      .toList();
  if (parts.length != 4) return null;
  final w = parts[2];
  final h = parts[3];
  if (w == null || h == null || h == 0) return null;
  return w / h;
}
