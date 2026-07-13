import 'package:flutter/material.dart';
import 'package:ui_flutter/foundations/dimensions_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

/// Resolves spacing / f-step px from the active [OneUiScope] (brand-aware).
class QaCatalogTokens {
  const QaCatalogTokens._(this._scope);

  factory QaCatalogTokens.of(BuildContext context) =>
      QaCatalogTokens._(OneUiScope.of(context));

  final OneUiScope _scope;

  double spacing(String name) => resolveSpacingPx(
        designSystem: _scope.designSystem,
        platformsConfig: _scope.platformsFoundationConfig,
        platformId: _scope.platformId,
        density: _scope.density,
        spacingName: name,
      );

  double f(String step) => resolveFStepPx(
        designSystem: _scope.designSystem,
        platformsConfig: _scope.platformsFoundationConfig,
        platformId: _scope.platformId,
        density: _scope.density,
        step: step,
      );

  EdgeInsets edgeInsets({
    double? all,
    double? horizontal,
    double? vertical,
    double? left,
    double? top,
    double? right,
    double? bottom,
  }) {
    return EdgeInsets.only(
      left: left ?? horizontal ?? all ?? 0,
      top: top ?? vertical ?? all ?? 0,
      right: right ?? horizontal ?? all ?? 0,
      bottom: bottom ?? vertical ?? all ?? 0,
    );
  }
}
