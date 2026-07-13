import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/single_text_button_color_resolve.dart';
import '../engine/single_text_button_size_resolve.dart';
import '../engine/single_text_button_typography_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_single_text_button_types.dart';

/// Token-backed circular single-text action button — `SingleTextButton.tsx`.
///
/// Max 2 characters (e.g. "Ag", "En"). Colours and geometry resolve from Convex
/// `--SingleTextButton-*` + surface roles.
class OneUiSingleTextButton extends StatefulWidget {
  const OneUiSingleTextButton({
    required this.label,
    super.key,
    this.size = 'm',
    this.attention = OneUiSingleTextButtonAttention.high,
    this.appearance = 'auto',
    this.condensed = false,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.onPressed,
    this.onPress,
    this.onClick,
    this.semanticsLabel,
    this.semanticsHint,
    this.autofocus = false,
    this.forceFocusRing = false,
    this.testId,
    this.semanticButtonType = OneUiSemanticButtonType.button,
  });

  /// Visible label — max 2 characters (truncated in debug).
  final String label;
  final String size;
  final OneUiSingleTextButtonAttention attention;
  final String appearance;
  final bool condensed;
  final bool fullWidth;
  final bool disabled;
  final bool loading;

  final VoidCallback? onPressed;
  final VoidCallback? onPress;
  final VoidCallback? onClick;

  /// Optional override — defaults to [label].
  final String? semanticsLabel;
  final String? semanticsHint;
  final bool autofocus;
  final bool forceFocusRing;
  final String? testId;
  final OneUiSemanticButtonType semanticButtonType;

  @override
  State<OneUiSingleTextButton> createState() => _OneUiSingleTextButtonState();
}

class _OneUiSingleTextButtonState extends State<OneUiSingleTextButton> {
  bool _hovered = false;

  OneUiSingleTextButtonSize get _resolvedSize =>
      oneUiResolveSingleTextButtonSize(widget.size);

  OneUiSingleTextButtonAttentionKind get _attentionKind =>
      OneUiSingleTextButtonAttentionKind.values.byName(widget.attention.name);

  String get _resolvedAppearance =>
      resolveOneUiSingleTextButtonAppearance(context, widget.appearance);

  String get _displayLabel {
    final truncated = oneUiTruncateSingleTextButtonLabel(widget.label);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) return truncated;
    final scope = OneUiScope.of(context);
    return singleTextButtonDisplayLabel(
      ds,
      plainLabel: truncated,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
  }

  String get _effectiveSemanticsLabel =>
      (widget.semanticsLabel?.trim().isNotEmpty ?? false)
          ? widget.semanticsLabel!.trim()
          : _displayLabel;

  String? get _trimmedTestId {
    final tid = widget.testId?.trim();
    if (tid == null || tid.isEmpty) return null;
    return tid;
  }

  void _handleActivated() {
    final cb = widget.onPressed ?? widget.onPress ?? widget.onClick;
    switch (widget.semanticButtonType) {
      case OneUiSemanticButtonType.submit:
        final state = Form.maybeOf(context);
        if (state != null && !state.validate()) return;
        cb?.call();
      case OneUiSemanticButtonType.reset:
        Form.maybeOf(context)?.reset();
        cb?.call();
      case OneUiSemanticButtonType.button:
        cb?.call();
    }
  }

  Color _fill(
    SingleTextButtonResolvedColors colors, {
    required bool hovered,
    double pressT = 0,
  }) {
    final ambient = hovered && colors.backgroundHover != null
        ? colors.backgroundHover!
        : colors.background;
    if (pressT > 0) {
      return Color.lerp(ambient, colors.backgroundPressed, pressT)!;
    }
    return ambient;
  }

  List<String> _collectGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    }
    // Web `SingleTextButton.module.css` appearance classes always render: missing
    // role tokens fall back via `var(--Role-*, var(--Surface-*))`. Flutter mirrors
    // that through [OneUiSurfaceScope.tokensForAppearance] — do not gap on
    // unconfigured brand roles (e.g. tertiary/quaternary on Jio).

    final typo = OneUiScope.nativeTypographyOf(context);
    if (typo == null) {
      gaps.add('Convex: nativeTypography missing on OneUiScope');
    }

    final scope = OneUiScope.maybeOf(context);
    final plat = scope?.platformId;
    final den = scope?.density;
    final pc = scope?.platformsFoundationConfig;

    ds.resolveComponentLengthPxCascade(
      ['--SingleTextButton-borderRadius'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    resolveSingleTextButtonSizeMetrics(
      context,
      ds,
      size: _resolvedSize,
      condensed: widget.condensed,
      gaps: gaps,
    );

    return gaps;
  }

  Size? _minHitTestSize(
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

  Widget _buildChrome({
    required double width,
    required double height,
    required double paddingPx,
    required BorderRadius borderRadius,
    required Color fill,
    required Color textColor,
    required TextStyle textStyle,
    required double opacity,
    required Border? border,
    required Widget child,
    int? colorTransitionMs,
    Curve? colorTransitionCurve,
  }) {
    final inner = AnimatedContainer(
      duration: Duration(
        milliseconds: colorTransitionMs != null && colorTransitionMs > 0
            ? colorTransitionMs
            : 0,
      ),
      curve: colorTransitionCurve ?? Curves.easeInOut,
      decoration: BoxDecoration(
        color: fill,
        borderRadius: borderRadius,
        border: border,
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: Padding(
          padding: EdgeInsets.all(paddingPx),
          child: Center(child: child),
        ),
      ),
    );

    return Opacity(
      opacity: opacity,
      child: SizedBox(width: width, height: height, child: inner),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder([
        'Flutter cannot render a token-backed SingleTextButton without Convex '
        '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
      ]);
    }

    final gaps = _collectGaps(ds);
    if (gaps.isNotEmpty) {
      return oneUiConvexGapPlaceholder(gaps);
    }

    final metrics = resolveSingleTextButtonSizeMetrics(
      context,
      ds,
      size: _resolvedSize,
      condensed: widget.condensed,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
        ['Could not resolve SingleTextButton size tokens'],
      );
    }

    final colors = resolveSingleTextButtonColors(
      context,
      ds,
      attention: _attentionKind,
      appearance: _resolvedAppearance,
    );

    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);

    final radius = ds.resolveComponentLengthPxCascade(
      ['--SingleTextButton-borderRadius'],
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    )!;

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
      return double.tryParse(raw ?? '') ?? 0.5;
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
    final width = widget.fullWidth ? double.infinity : height;
    final borderRadius = BorderRadius.circular(radius);
    final interactive = !(widget.disabled || widget.loading);

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
      innerGapColorOverride: colors.background.a > 0
          ? colors.background
          : resolveSurfaceHaloGapFromScope(context),
    );

    final tapMotion = resolveSingleTextButtonTapMotionSpec(
      context,
      ds,
      sizeIsXs: _resolvedSize == 's',
      fullWidth: widget.fullWidth,
    );

    final colorTransition = resolveSingleTextButtonColorTransition(context, ds);
    final mq = MediaQuery.maybeOf(context);
    final animateHover = !(mq?.disableAnimations ?? false) &&
        colorTransition.durationMs > 0;

    final decorationBorder = resolveSingleTextButtonCssDecorationBorder(
      context,
      ds,
      attention: _attentionKind,
      appearance: _resolvedAppearance,
      fallbackStroke: colors.foreground,
    );

    Widget buildContent(Color textColor) {
      if (widget.loading) {
        return Semantics(
          label: 'Loading',
          child: OneUiLoadingSpinner(
            appearance: _resolvedAppearance,
            size: oneUiSingleTextButtonLoadingSpinnerSize(_resolvedSize),
            strokeColor: textColor,
          ),
        );
      }
      return ExcludeSemantics(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            _displayLabel,
            style: metrics.textStyle.copyWith(color: textColor),
            textAlign: TextAlign.center,
            maxLines: 1,
          ),
        ),
      );
    }

    Widget buildVisual(Color fill, Color textColor) {
      final opacity = widget.disabled
          ? disabledOpacity
          : widget.loading
              ? loadingOpacity
              : 1.0;
      return _buildChrome(
        width: width,
        height: height,
        paddingPx: metrics.paddingPx,
        borderRadius: borderRadius,
        fill: fill,
        textColor: textColor,
        textStyle: metrics.textStyle,
        opacity: opacity,
        border: decorationBorder,
        colorTransitionMs: interactive && animateHover ? colorTransition.durationMs : null,
        colorTransitionCurve: colorTransition.curve,
        child: buildContent(textColor),
      );
    }

    final body = OneUiFocusInteractive(
      semanticsLabel: _effectiveSemanticsLabel,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
      semanticsIdentifier: _trimmedTestId,
      minHitTestSize: _minHitTestSize(
        ds,
        scope,
        width: widget.fullWidth ? height : width,
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
              final fill = _fill(
                colors,
                hovered: _hovered,
                pressT: press.value,
              );
              return buildVisual(fill, colors.foreground);
            }
          : null,
      child: interactive
          ? null
          : buildVisual(
              _fill(colors, hovered: _hovered),
              colors.foreground,
            ),
    );

    Widget result = body;
    if (widget.fullWidth) {
      result = SizedBox(width: double.infinity, child: result);
    }

    final tid = _trimmedTestId;
    if (tid != null) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}
