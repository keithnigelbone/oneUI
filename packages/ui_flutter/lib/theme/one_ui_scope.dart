import 'package:flutter/material.dart';

import '../engine/button_decoration.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/native_typography_snapshot.dart';
import '../tokens/platform_foundation_config.dart';

/// Inherited scope — platform & density for dimension / typography resolution.
/// Optional [platformsFoundationConfig] mirrors brand `generateDimensionCSS` on web.
///
/// [designSystem] is the Convex `nativeTheme` v2 block: component `--*` custom
/// properties + structured dimension contexts (same merge as web
/// `buildAllComponentCSS`).
///
/// [nativeTypography] is the resolved `typography` object from the same snapshot
/// (`buildNativeTypography` output — use for [TextStyle] parity with RN).
class OneUiScope extends InheritedWidget {
  const OneUiScope({
    required this.platformId,
    required this.density,
    required super.child,
    super.key,
    this.platformsFoundationConfig,
    this.foundationAccentColor,
    this.typographyConfig,
    this.customFonts,
    this.designSystem,
    this.nativeTypography,
    this.buttonOrnament,
  });

  /// e.g. `S`, `L` — parity with `PlatformId` in `@oneui/shared`.
  final String platformId;

  /// `compact` | `default` | `open`
  final String density;

  /// From Convex `getBrandOverviewData.platforms.config` when a brand is selected.
  final PlatformsFoundationConfig? platformsFoundationConfig;

  /// Approximate primary bar colour from brand OKLCH (Storybook dimensions rows).
  final Color? foundationAccentColor;

  /// `foundations[type=typography].config` from `getBrandOverviewData.typography`.
  final Map<String, dynamic>? typographyConfig;

  /// Uploaded font rows from `getBrandOverviewData.customFonts`.
  final List<Map<String, dynamic>>? customFonts;

  /// Convex `getNativeThemeSnapshot.designSystem` when schema ≥ 2.
  final NativeDesignSystemPayload? designSystem;

  /// Resolved typography tree from `getNativeThemeSnapshot.typography`
  /// (same object as RN `OneUINativeTheme.typography`).
  final NativeTypographySnapshot? nativeTypography;

  /// Convex `decorations` entry for `Button` when brand assigns an SVG ornament (e.g. Swadesh).
  final ButtonOrnamentConfig? buttonOrnament;

  static OneUiScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<OneUiScope>();
  }

  static OneUiScope of(BuildContext context) {
    final s = maybeOf(context);
    assert(s != null, 'OneUiScope not found');
    return s!;
  }

  static NativeDesignSystemPayload? designSystemOf(BuildContext context) {
    return maybeOf(context)?.designSystem;
  }

  static NativeTypographySnapshot? nativeTypographyOf(BuildContext context) {
    return maybeOf(context)?.nativeTypography;
  }

  @override
  bool updateShouldNotify(OneUiScope oldWidget) {
    return platformId != oldWidget.platformId ||
        density != oldWidget.density ||
        platformsFoundationConfig != oldWidget.platformsFoundationConfig ||
        foundationAccentColor != oldWidget.foundationAccentColor ||
        typographyConfig != oldWidget.typographyConfig ||
        customFonts != oldWidget.customFonts ||
        !identical(designSystem, oldWidget.designSystem) ||
        !identical(nativeTypography, oldWidget.nativeTypography) ||
        buttonOrnament != oldWidget.buttonOrnament;
  }
}
