import 'package:flutter/material.dart';

import '../engine/color_math.dart';
import '../engine/surface_engine.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';

/// OneUI surface container — RN parity with `packages/ui-native/.../Surface.tsx`.
///
/// 1. Reads parent [SurfaceContextValue] + [ThemeConfig.appearances]\[[appearance]].
/// 2. [resolveSurfaceStep] → container step (`data-surface-step` parity).
/// 3. Paints palette hex (ghost: transparent when same effective appearance as
///    parent; cross-role ghost paints that role at parent step — web `--Surface-Self-Color`).
/// 4. Pushes [OneUiSurfaceScope] with [resolveRolesInsideSurface] — all roles at
///    that step (web `renderStepDecls` / `[data-surface-step]` lookup).
class OneUiSurface extends StatelessWidget {
  const OneUiSurface({
    required this.mode,
    required this.child,
    super.key,
    this.appearance = 'auto',
    this.borderRadius,
    this.padding,
    this.clipBehavior = Clip.antiAlias,

    /// When true, skip painting a fill so the page shows through (Storybook
    /// `InputFieldSurfaceContext` default row — React `backgroundColor: transparent`).
    this.transparentBackground = false,
  });

  final String mode;
  final String appearance;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? padding;
  final Clip clipBehavior;
  final bool transparentBackground;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final parent = OneUiSurfaceScope.of(context);
    final effectiveAppearance =
        OneUiSurfaceScope.effectiveSurfaceAppearance(parent, appearance);
    final scale = parent.themeConfig.appearances[effectiveAppearance] ??
        parent.themeConfig.appearances['primary'] ??
        parent.themeConfig.appearances['neutral']!;

    final isCrossRoleBoldOnBold = mode == kSurfaceBold &&
        parent.parentMode == kSurfaceBold &&
        parent.parentAppearance != effectiveAppearance;
    final isRoot = parent.surfaceDepth == 0 || isCrossRoleBoldOnBold;
    final rootStep = parent.darkMode ? 100 : 2500;
    final parentStep = isRoot ? rootStep : parent.parentStep;

    final containerStep = resolveSurfaceStep(
      scale,
      parentStep,
      mode,
      parent.darkMode,
      isRoot: isRoot,
    );

    final childContext = SurfaceContextValue(
      parentStep: containerStep,
      darkMode: parent.darkMode,
      themeConfig: parent.themeConfig,
      resolvedRoles: resolveRolesInsideSurface(
        parent.themeConfig,
        mode,
        parentStep,
        parent.darkMode,
        surfaceAppearance: effectiveAppearance,
        isRoot: isRoot,
      ),
      surfaceDepth: parent.surfaceDepth + 1,
      parentMode: mode,
      parentAppearance: effectiveAppearance,
    );

    final Color? bgColor = _surfaceBackgroundColor(
      transparentBackground: transparentBackground,
      mode: mode,
      effectiveAppearance: effectiveAppearance,
      parentEffectiveAppearance: parent.parentAppearance,
      scale: scale,
      parentStep: parentStep,
      containerStep: containerStep,
    );

    Widget content = child;
    if (padding != null) {
      content = Padding(padding: padding!, child: content);
    }

    final decoration = BoxDecoration(
      color: bgColor,
      borderRadius: borderRadius,
    );

    if (borderRadius != null) {
      content = ClipRRect(
        borderRadius: borderRadius!,
        clipBehavior: clipBehavior,
        child: DecoratedBox(
          decoration: decoration,
          child: content,
        ),
      );
    } else {
      content = DecoratedBox(
        decoration: decoration,
        child: content,
      );
    }

    return OneUiSurfaceScope(
      value: childContext,
      child: content,
    );
  }
}

/// Web `Surface.module.css` ghost rule: same effective appearance → transparent;
/// different appearance → that role's colour at the parent step.
Color? _surfaceBackgroundColor({
  required bool transparentBackground,
  required String mode,
  required String effectiveAppearance,
  required String parentEffectiveAppearance,
  required ScaleDefinition scale,
  required int parentStep,
  required int containerStep,
}) {
  if (transparentBackground) return null;

  if (mode == kSurfaceGhost) {
    if (effectiveAppearance == parentEffectiveAppearance) {
      return null;
    }
    return oneUiHexColor(scale.palette[parentStep] ?? '#808080');
  }

  return oneUiHexColor(scale.palette[containerStep] ?? '#808080');
}
