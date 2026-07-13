import 'package:flutter/material.dart';

import '../engine/button_color_resolve.dart';
import '../engine/focus_ring_resolve.dart';
import '../engine/icon_button_color_resolve.dart';
import '../engine/icon_button_size_resolve.dart';
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_icon_button_types.dart';
import 'semantic_icon_material.dart';

/// Token-backed icon-only control — `IconButton.tsx` / `IconButton.native.tsx`.
///
/// Requires [semanticsLabel] (web `aria-label`). Colours and geometry resolve from
/// Convex `designSystem` `--IconButton-*` + surface roles (no Material fallbacks).
class OneUiIconButton extends StatefulWidget {
  const OneUiIconButton({
    required this.icon,
    required this.semanticsLabel,
    super.key,
    this.variant,
    this.attention,
    this.size = 10,
    this.sizeAlias,
    this.appearance = 'auto',
    this.condensed = false,
    this.contained = true,
    this.layout = OneUiIconButtonLayout.square,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.onPressed,
    this.onPress,
    this.onClick,
    this.semanticsHint,
    this.semanticsExpanded,
    this.autofocus = false,

    /// Storybook parity with web `data-force-state="focus"` — always paint focus halo.
    this.forceFocusRing = false,

    /// RN `testID` / web `data-testid` — [ValueKey] + [Semantics.identifier].
    this.testId,
  });

  /// Semantic icon name (`String`) or custom glyph (`Widget`).
  final Object icon;

  final OneUiIconButtonVariant? variant;
  final OneUiIconButtonAttention? attention;
  final int size;
  final String? sizeAlias;
  final String appearance;
  final bool condensed;

  /// Default `true`. When `false`, Figma uncontained form — transparent chrome,
  /// accent icon colours; [condensed] and [fullWidth] are ignored.
  final bool contained;
  final OneUiIconButtonLayout layout;
  final bool fullWidth;
  final bool disabled;
  final bool loading;

  final VoidCallback? onPressed;
  final VoidCallback? onPress;
  final VoidCallback? onClick;

  /// Web `aria-label` / RN `accessibilityLabel`.
  final String semanticsLabel;
  final String? semanticsHint;
  final bool? semanticsExpanded;
  final bool autofocus;
  final bool forceFocusRing;

  /// RN `testID` / web `data-testid`.
  final String? testId;

  @override
  State<OneUiIconButton> createState() => _OneUiIconButtonState();
}

class _OneUiIconButtonState extends State<OneUiIconButton> {
  bool _hovered = false;

  Color _iconButtonFill(
    IconButtonResolvedColors colors, {
    required bool hovered,
    double pressT = 0,
  }) {
    if (pressT > 0 && colors.backgroundPressedFill != null) {
      return Color.lerp(
        colors.background,
        colors.backgroundPressedFill!,
        pressT,
      )!;
    }
    if (hovered && colors.backgroundHover != null) {
      return colors.backgroundHover!;
    }
    return colors.background;
  }

  Color? _iconButtonStateLayer(
    IconButtonResolvedColors colors, {
    required bool hovered,
    double pressT = 0,
  }) {
    if (pressT > 0) {
      return Color.lerp(
          colors.stateLayerHover, colors.stateLayerPressed, pressT);
    }
    if (hovered) return colors.stateLayerHover;
    return null;
  }

  Widget _buildIconButtonChrome({
    required double width,
    required double height,
    required BorderRadius borderRadius,
    required Color fill,
    required Widget glyph,
    required double opacity,
    Border? border,
    Color? stateLayer,
  }) {
    return Opacity(
      opacity: opacity,
      child: SizedBox(
        width: width,
        height: height,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: fill,
            borderRadius: borderRadius,
            border: border,
          ),
          child: ClipRRect(
            borderRadius: borderRadius,
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (stateLayer != null && stateLayer.a > 0)
                  ColoredBox(color: stateLayer),
                Center(child: glyph),
              ],
            ),
          ),
        ),
      ),
    );
  }

  OneUiIconButtonVariant get _effectiveVariant =>
      widget.variant ??
      (widget.attention != null
          ? oneUiIconButtonVariantFromAttention(widget.attention!)
          : OneUiIconButtonVariant.bold);

  OneUiIconButtonVariantKind get _variantKind => switch (_effectiveVariant) {
        OneUiIconButtonVariant.bold => OneUiIconButtonVariantKind.bold,
        OneUiIconButtonVariant.subtle => OneUiIconButtonVariantKind.subtle,
        OneUiIconButtonVariant.ghost => OneUiIconButtonVariantKind.ghost,
      };

  int get _numericSize => oneUiResolveIconButtonSize(
      size: widget.size, sizeAlias: widget.sizeAlias);

  String get _resolvedAppearance =>
      resolveOneUiButtonAppearance(context, widget.appearance);

  OneUiButtonVariantKind get _buttonVariantKind => switch (_variantKind) {
        OneUiIconButtonVariantKind.bold => OneUiButtonVariantKind.bold,
        OneUiIconButtonVariantKind.subtle => OneUiButtonVariantKind.subtle,
        OneUiIconButtonVariantKind.ghost => OneUiButtonVariantKind.ghost,
      };

  bool get _effectiveCondensed => widget.contained && widget.condensed;

  bool get _effectiveFullWidth => widget.contained && widget.fullWidth;

  void _handleActivated() {
    (widget.onPressed ?? widget.onPress ?? widget.onClick)?.call();
  }

  List<String> _collectGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiButtonAppearanceConfigured(context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final scope = OneUiScope.maybeOf(context);
    final plat = scope?.platformId;
    final den = scope?.density;
    final pc = scope?.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final sz = '$_numericSize';

    ds.resolveComponentLengthPxCascade(
      ['--IconButton-borderRadius'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    final containerKeys = _effectiveCondensed
        ? [
            '--IconButton-containerSize-$sz-condensed',
            '--IconButton-condensedContainerSize-$sz',
            '--IconButton-containerSize-$sz',
          ]
        : ['--IconButton-containerSize-$sz'];
    ds.resolveComponentLengthPxCascade(
      containerKeys,
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    ds.resolveComponentLengthPxCascade(
      ['--IconButton-iconSize-$sz'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    return gaps;
  }

  List<String> _collectUncontainedGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiButtonAppearanceConfigured(context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final scope = OneUiScope.maybeOf(context);
    final plat = scope?.platformId;
    final den = scope?.density;
    final pc = scope?.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final sz = '$_numericSize';

    ds.resolveComponentLengthPxCascade(
      ['--IconButton-iconSize-$sz', '--IconButton-iconSize'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    return gaps;
  }

  double _uncontainedCornerRadius(
    NativeDesignSystemPayload ds,
    OneUiScope scope,
  ) {
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final shape2Raw =
        ds.dimensionContextFor(plat, den)?.dimensions['--Shape-2'];
    if (shape2Raw != null) {
      return ds.parsePx(shape2Raw) ??
          resolveFStepPx(
            designSystem: ds,
            platformsConfig: pc,
            platformId: plat,
            density: den,
            step: 'f4',
          );
    }
    return resolveFStepPx(
      designSystem: ds,
      platformsConfig: pc,
      platformId: plat,
      density: den,
      step: 'f4',
    );
  }

  Size? _iconButtonMinHitTestSize(
    NativeDesignSystemPayload ds,
    OneUiScope scope, {
    required double width,
    required double height,
  }) {
    final touchMin = resolveTouchTargetMinPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: scope.nativeTypography,
    );
    final hit = resolveIconButtonHitTestSize(
      visualWidth: width,
      visualHeight: height,
      touchTargetMinPx: touchMin,
      platformId: scope.platformId,
    );
    if (hit.width <= width + 0.01 && hit.height <= height + 0.01) {
      return null;
    }
    return hit;
  }

  String? get _trimmedTestId {
    final tid = widget.testId?.trim();
    if (tid == null || tid.isEmpty) return null;
    return tid;
  }

  Widget _buildUncontained(BuildContext context, NativeDesignSystemPayload ds) {
    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);

    final metrics = resolveIconButtonSizeMetrics(
      context,
      ds,
      numericSize: _numericSize,
      condensed: false,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
        ['Could not resolve IconButton icon size tokens'],
      );
    }

    final colors = resolveUncontainedButtonColors(
      context,
      variant: _buttonVariantKind,
      appearance: _resolvedAppearance,
    );

    final pad = resolveSpacingPx(
      designSystem: ds,
      platformsConfig: pc,
      platformId: plat,
      density: den,
      spacingName: '0-5',
    );
    final cornerRadius = _uncontainedCornerRadius(ds, scope);
    final borderRadius = BorderRadius.circular(cornerRadius);
    final iconPx = metrics.iconPx;
    final height = iconPx + pad * 2;
    final width =
        widget.layout == OneUiIconButtonLayout.wide ? height * 1.5 : height;

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity',
                platformId: plat, density: den) ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? 0.38;
    }();

    final loadingOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Loading-Opacity', platformId: plat, density: den) ??
            ds.componentCustomProperties['--Loading-Opacity'] ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? disabledOpacity;
    }();

    final interactive = !(widget.disabled || widget.loading);
    final bgAmbient = interactive && _hovered
        ? colors.backgroundHover
        : const Color(0x00000000);

    Widget buildGlyph(Color iconColor) {
      if (widget.loading) {
        return Semantics(
          label: 'Loading',
          child: OneUiLoadingSpinner(
            appearance: _resolvedAppearance,
            size: oneUiIconButtonLoadingSpinnerSize(_numericSize),
            strokeColor: iconColor,
          ),
        );
      }

      final Widget glyph = widget.icon is Widget
          ? IconTheme.merge(
              data: IconThemeData(color: iconColor, size: iconPx),
              child: SizedBox(
                width: iconPx,
                height: iconPx,
                child: FittedBox(
                  fit: BoxFit.contain,
                  child: widget.icon as Widget,
                ),
              ),
            )
          : OneUiSemanticIcon(
              widget.icon as String,
              size: iconPx,
              color: iconColor,
              semanticLabel: '',
            );

      return ExcludeSemantics(
        child: SizedBox(
          width: iconPx,
          height: iconPx,
          child: Center(child: glyph),
        ),
      );
    }

    Widget buildChrome(Color fill, Color iconColor) {
      final opacity = widget.disabled
          ? disabledOpacity
          : widget.loading
              ? loadingOpacity
              : 1.0;
      return _buildIconButtonChrome(
        width: width,
        height: height,
        borderRadius: BorderRadius.circular(cornerRadius),
        fill: fill,
        glyph: buildGlyph(iconColor),
        opacity: opacity,
      );
    }

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
    );
    final tapMotion = resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: _numericSize == 6,
      fullWidthTapScale: false,
    );

    final body = OneUiFocusInteractive(
      semanticsLabel: widget.semanticsLabel,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
      semanticsExpanded: widget.semanticsExpanded,
      semanticsIdentifier: _trimmedTestId,
      minHitTestSize: _iconButtonMinHitTestSize(
        ds,
        scope,
        width: width,
        height: height,
      ),
      enabled: interactive,
      onPressed: interactive ? _handleActivated : null,
      onHoverChanged:
          interactive ? (hovered) => setState(() => _hovered = hovered) : null,
      borderRadius: borderRadius,
      focusRing: focusRing,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      pressAnimationBuilder: interactive
          ? (_, press) {
              final fill =
                  Color.lerp(bgAmbient, colors.backgroundPressed, press.value)!;
              return buildChrome(fill, colors.foreground);
            }
          : null,
      child: interactive ? null : buildChrome(bgAmbient, colors.foreground),
    );

    Widget result = body;

    final tid = _trimmedTestId;
    if (tid != null) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed IconButton without Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
          'Web Storybook injects `--IconButton-*` via `useBrandCSSNew`; Flutter reads the flat `componentCustomProperties` map from the snapshot.',
        ],
      );
    }

    if (!widget.contained) {
      final uncontainedGaps = _collectUncontainedGaps(ds);
      if (uncontainedGaps.isNotEmpty) {
        return oneUiConvexGapPlaceholder(uncontainedGaps);
      }
      return _buildUncontained(context, ds);
    }

    final gaps = _collectGaps(ds);
    if (gaps.isNotEmpty) {
      return oneUiConvexGapPlaceholder(gaps);
    }

    final metrics = resolveIconButtonSizeMetrics(
      context,
      ds,
      numericSize: _numericSize,
      condensed: _effectiveCondensed,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
        ['Could not resolve IconButton container/icon size tokens'],
      );
    }

    final colors = resolveIconButtonColors(
      context,
      ds,
      variant: _variantKind,
      appearance: _resolvedAppearance,
    );

    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final variantSuffix = oneUiIconButtonVariantSuffix(_effectiveVariant);

    final radius = ds.resolveComponentLengthPxCascade(
      ['--IconButton-borderRadius'],
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    )!;

    final bw = ds.resolveComponentLengthPxCascade(
          ['--IconButton-borderWidth-$variantSuffix'],
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        ) ??
        0;

    Border? border = colors.borderColor != null && bw > 0
        ? Border.all(color: colors.borderColor!, width: bw)
        : null;

    if (border == null && _effectiveVariant == OneUiIconButtonVariant.bold) {
      final insetW = ds.resolveComponentLengthPxCascade(
        [
          '--IconButton-cssDecorationInsetStrokeWidth-$variantSuffix',
          '--IconButton-cssDecorationInsetStrokeWidth',
        ],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      if (insetW != null && insetW > 0) {
        final rawDeco = ds.rawComponentCascade([
          '--IconButton-cssDecorationColor-$variantSuffix',
          '--IconButton-cssDecorationColor',
        ]);
        Color? strokeColor;
        if (rawDeco != null) {
          strokeColor = resolveButtonTokenColor(
            context,
            ds,
            rawDeco,
            appearance: _resolvedAppearance,
          );
          final concrete = ds.resolveCSSValue(
            rawDeco,
            platformId: plat,
            density: den,
            platformsConfig: pc,
            nativeTypography: typo,
          );
          if (strokeColor == null &&
              concrete != null &&
              concrete.trim().toLowerCase() == 'currentcolor') {
            strokeColor = colors.foreground;
          }
        }
        strokeColor ??= colors.foreground;
        if (strokeColor.a > 0) {
          border = Border.all(width: insetW, color: strokeColor);
        }
      }
    }

    final interactive = !(widget.disabled || widget.loading);

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity',
                platformId: plat, density: den) ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? 0.38;
    }();

    final loadingOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Loading-Opacity', platformId: plat, density: den) ??
            ds.componentCustomProperties['--Loading-Opacity'] ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );
      return double.tryParse(raw ?? '') ?? disabledOpacity;
    }();

    final height = metrics.containerPx;
    final width = _effectiveFullWidth
        ? double.infinity
        : widget.layout == OneUiIconButtonLayout.wide
            ? height * 1.5
            : height;

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
      innerGapColorOverride: colors.background.a > 0
          ? colors.background
          : resolveSurfaceHaloGapFromScope(context),
    );
    final pressScale = resolveIconButtonPressScaleSpec(
      context,
      ds,
      layoutWide: widget.layout == OneUiIconButtonLayout.wide,
      fullWidth: _effectiveFullWidth,
    );

    Widget buildGlyph(Color iconColor) {
      if (widget.loading) {
        return Semantics(
          label: 'Loading',
          child: OneUiLoadingSpinner(
            appearance: _resolvedAppearance,
            size: oneUiIconButtonLoadingSpinnerSize(_numericSize),
            strokeColor: iconColor,
          ),
        );
      }

      final Widget glyph = widget.icon is Widget
          ? IconTheme.merge(
              data: IconThemeData(color: iconColor, size: metrics.iconPx),
              child: SizedBox(
                width: metrics.iconPx,
                height: metrics.iconPx,
                child: FittedBox(
                  fit: BoxFit.contain,
                  child: widget.icon as Widget,
                ),
              ),
            )
          : OneUiSemanticIcon(
              widget.icon as String,
              size: metrics.iconPx,
              color: iconColor,
              semanticLabel: '',
            );

      // Web/RN parity: Pressable / `.iconButton` paints fill; icon slot uses
      // `--IconButton-iconColor` / `currentColor` — no nested Surface fill (RN
      // wraps `<Surface style={{ backgroundColor: 'transparent' }}>` for context only).
      return ExcludeSemantics(
        child: SizedBox(
          width: metrics.iconPx,
          height: metrics.iconPx,
          child: Center(child: glyph),
        ),
      );
    }

    final borderRadius = BorderRadius.circular(radius);

    Widget buildChrome(
      Color fill,
      Color iconColor, {
      Color? stateLayer,
    }) {
      final opacity = widget.disabled
          ? disabledOpacity
          : widget.loading
              ? loadingOpacity
              : 1.0;
      return _buildIconButtonChrome(
        width: width,
        height: height,
        borderRadius: borderRadius,
        fill: fill,
        glyph: buildGlyph(iconColor),
        opacity: opacity,
        border: border,
        stateLayer: stateLayer,
      );
    }

    final body = OneUiFocusInteractive(
      semanticsLabel: widget.semanticsLabel,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
      semanticsExpanded: widget.semanticsExpanded,
      semanticsIdentifier: _trimmedTestId,
      minHitTestSize: _iconButtonMinHitTestSize(
        ds,
        scope,
        width: width,
        height: height,
      ),
      enabled: interactive,
      onPressed: interactive ? _handleActivated : null,
      onHoverChanged:
          interactive ? (hovered) => setState(() => _hovered = hovered) : null,
      borderRadius: borderRadius,
      focusRing: focusRing,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      pressAnimationBuilder: interactive
          ? (_, press) {
              final fill = _iconButtonFill(
                colors,
                hovered: _hovered,
                pressT: press.value,
              );
              final stateLayer = _iconButtonStateLayer(
                colors,
                hovered: _hovered,
                pressT: press.value,
              );
              final scale = pressScale.pressedMultiplier == 1.0
                  ? 1.0
                  : (1.0 + (pressScale.pressedMultiplier - 1.0) * press.value);
              return Transform.scale(
                scale: scale,
                child: buildChrome(
                  fill,
                  colors.foreground,
                  stateLayer: stateLayer,
                ),
              );
            }
          : null,
      child: interactive
          ? null
          : buildChrome(
              _iconButtonFill(colors, hovered: _hovered),
              colors.foreground,
              stateLayer: _iconButtonStateLayer(colors, hovered: _hovered),
            ),
    );

    Widget result = body;
    if (_effectiveFullWidth) {
      result = SizedBox(width: double.infinity, child: result);
    }

    final tid = _trimmedTestId;
    if (tid != null) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}
