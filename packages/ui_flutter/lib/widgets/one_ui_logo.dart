import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/logo_color_resolve.dart';
import '../engine/logo_material_resolve.dart';
import '../engine/logo_size_resolve.dart';
import '../engine/logo_svg_material.dart';
import '../engine/logo_svg_recolor.dart';
import '../foundations/logo_brand_bind.dart';
import '../theme/one_ui_scope.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_image_remote.dart';
import 'one_ui_logo_a11y.dart';
import 'one_ui_logo_types.dart';

/// INTENTIONAL-LITERAL: matches RN `DISABLED_OPACITY` / Image disabled opacity.
const double kOneUiLogoDisabledOpacity = 0.5;

/// INTENTIONAL-LITERAL: matches RN `PRESSED_OPACITY`.
const double kOneUiLogoPressedOpacity = 0.85;

/// Token-backed brand logo — parity with `Logo.tsx` / `Logo.native.tsx`.
///
/// Transparent size container; SVG/image controls shape and fill.
/// Content priority: [child] > [svgContent] > [src] > empty (+ [fallback]).
class OneUiLogo extends StatefulWidget {
  const OneUiLogo({
    required this.alt,
    super.key,
    this.variant = OneUiLogoVariant.mark,
    this.size = OneUiLogoSize.m,
    this.customSize,
    this.child,
    this.svgContent,
    this.src,
    this.material,
    this.materialTarget,
    this.materialGradientType,
    this.materialGradientAngle,
    this.onLoad,
    this.onError,
    this.fallback,
    this.interactive = false,
    this.disabled = false,
    this.onPress,
    this.onClick,
    this.accessibilityHint,
    this.testId,
  });

  final OneUiLogoVariant variant;
  final OneUiLogoSizeInput size;
  final double? customSize;
  final Widget? child;
  final String? svgContent;
  final String? src;

  /// Metallic material for inline SVG — React `Logo.shared.ts` parity. Raster [src] unchanged.
  final String? material;
  final String? materialTarget;
  final String? materialGradientType;
  final double? materialGradientAngle;

  final String alt;
  final VoidCallback? onLoad;
  final VoidCallback? onError;
  final Widget? fallback;
  final bool interactive;
  final bool disabled;
  final VoidCallback? onPress;
  final VoidCallback? onClick;
  final String? accessibilityHint;
  final String? testId;

  @override
  State<OneUiLogo> createState() => _OneUiLogoState();
}

class _OneUiLogoState extends State<OneUiLogo> {
  bool _imageError = false;
  int _materialGradientSeq = 0;

  @override
  void initState() {
    super.initState();
    _materialGradientSeq = identityHashCode(this);
  }

  @override
  void didUpdateWidget(OneUiLogo oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src) {
      _imageError = false;
    }
  }

  void _handleImageError() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (!_imageError) {
        setState(() => _imageError = true);
        widget.onError?.call();
      }
    });
  }

  String? _renderedSvgXml(String raw, BuildContext context) {
    final preset = normalizeLogoMaterialPreset(widget.material);
    if (preset == null) return raw;
    final colors = resolveLogoMetallicGradientColors(context, preset);
    if (colors == null) return raw;
    final gradientId = 'oneui-logo-metal-$_materialGradientSeq';
    return applyLogoSvgMaterial(
      raw,
      colors: colors,
      gradientId: gradientId,
      target: parseLogoMaterialTarget(widget.materialTarget),
      gradientType: parseLogoMaterialGradientType(widget.materialGradientType),
      gradientAngle: widget.materialGradientAngle?.round(),
    );
  }

  Widget _markShell({
    required Widget child,
    required double? width,
    required double height,
    required Color logoColor,
    required Color fallbackColor,
    required bool applyLogoColorTheme,
  }) {
    Widget content = Align(
      alignment: Alignment.center,
      widthFactor: width == null ? null : 1,
      child: SizedBox(
        width: width,
        height: height,
        child: ExcludeSemantics(child: child),
      ),
    );

    if (applyLogoColorTheme) {
      content = IconTheme(
        data: IconThemeData(color: logoColor, size: height),
        child: DefaultTextStyle(
          style: TextStyle(color: fallbackColor),
          child: content,
        ),
      );
    }

    return content;
  }

  Widget _buildSvg({
    required String xml,
    required double dim,
    required bool isMark,
    required Color logoColor,
    required Color fallbackColor,
    required bool hasMaterial,
    required bool applyCurrentColorTheme,
  }) {
    final aspect = oneUiLogoSvgAspectRatio(xml);
    final svgWidth = isMark ? dim : (aspect != null ? dim * aspect : dim);
    return _markShell(
      width: isMark ? dim : svgWidth,
      height: dim,
      logoColor: logoColor,
      fallbackColor: fallbackColor,
      applyLogoColorTheme: applyCurrentColorTheme,
      child: SvgPicture.string(
        xml,
        width: svgWidth,
        height: dim,
        fit: BoxFit.contain,
        theme: hasMaterial || !applyCurrentColorTheme
            ? null
            : SvgTheme(currentColor: logoColor),
      ),
    );
  }

  Widget _buildContent({
    required BuildContext context,
    required OneUiLogoResolvedState state,
    required double dim,
    required Color logoColor,
    required Color fallbackColor,
  }) {
    final isMark = state.resolvedVariant == OneUiLogoVariant.mark;
    final materialPreset = normalizeLogoMaterialPreset(widget.material);

    switch (state.contentMode) {
      case OneUiLogoContentMode.children:
        return _markShell(
          width: isMark ? dim : null,
          height: dim,
          logoColor: logoColor,
          fallbackColor: fallbackColor,
          applyLogoColorTheme: true,
          child: widget.child!,
        );

      case OneUiLogoContentMode.svg:
        final prepared = prepareLogoSvgForRender(
          widget.svgContent!,
          hasLogoColorOverride: hasLogoColorOverrideFromContext(context),
          nestedSurfaceBackgroundHex:
              resolveLogoNestedSurfaceBackgroundHex(context),
        );
        final xml = _renderedSvgXml(prepared.svg, context) ?? prepared.svg;
        return _buildSvg(
          xml: xml,
          dim: dim,
          isMark: isMark,
          logoColor: logoColor,
          fallbackColor: fallbackColor,
          hasMaterial: materialPreset != null,
          applyCurrentColorTheme: prepared.applyCurrentColorTheme,
        );

      case OneUiLogoContentMode.image:
        if (widget.src != null && !_imageError) {
          return _markShell(
            width: isMark ? dim : null,
            height: dim,
            logoColor: logoColor,
            fallbackColor: fallbackColor,
            applyLogoColorTheme: false,
            child: OneUiImageRemote(
              url: widget.src!,
              fit: BoxFit.contain,
              onLoad: widget.onLoad,
              onError: _handleImageError,
            ),
          );
        }
        if (_imageError && widget.fallback != null) {
          return _markShell(
            width: isMark ? dim : null,
            height: dim,
            logoColor: logoColor,
            fallbackColor: fallbackColor,
            applyLogoColorTheme: true,
            child: Center(child: widget.fallback),
          );
        }
        return const SizedBox.shrink();

      case OneUiLogoContentMode.empty:
        if (widget.fallback != null) {
          return _markShell(
            width: isMark ? dim : null,
            height: dim,
            logoColor: logoColor,
            fallbackColor: fallbackColor,
            applyLogoColorTheme: true,
            child: Center(child: widget.fallback),
          );
        }
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    bindLogoBrandScope(context);

    final state = resolveOneUiLogoState(
      variant: widget.variant,
      size: widget.size,
      children: widget.child,
      svgContent: widget.svgContent,
      src: widget.src,
      material: widget.material,
      interactive: widget.interactive,
      disabled: widget.disabled,
      onPress: widget.onPress,
      onClick: widget.onClick,
      alt: widget.alt,
    );

    final dim = resolveOneUiLogoSizePx(
      context,
      state.resolvedSize,
      customSize: widget.customSize,
    );
    final logoColor = resolveOneUiLogoColor(context);
    final fallbackColor = resolveOneUiLogoFallbackColor(context);
    final a11y = resolveOneUiLogoA11y(
      alt: widget.alt,
      accessibilityHint: widget.accessibilityHint,
      state: state,
    );

    final isMark = state.resolvedVariant == OneUiLogoVariant.mark;
    final isFull = state.resolvedVariant == OneUiLogoVariant.full;

    double? shellWidth = isMark ? dim : null;
    if (isFull &&
        state.contentMode == OneUiLogoContentMode.svg &&
        widget.svgContent != null) {
      final prepared = prepareLogoSvgForRender(
        widget.svgContent!,
        hasLogoColorOverride: hasLogoColorOverrideFromContext(context),
        nestedSurfaceBackgroundHex:
            resolveLogoNestedSurfaceBackgroundHex(context),
      );
      final aspect = oneUiLogoSvgAspectRatio(prepared.svg);
      if (aspect != null && aspect.isFinite && aspect > 0) {
        shellWidth = dim * aspect;
      }
    }

    Widget body = _buildContent(
      context: context,
      state: state,
      dim: dim,
      logoColor: logoColor,
      fallbackColor: fallbackColor,
    );

    Widget shell = Align(
      alignment: isFull ? Alignment.centerLeft : Alignment.center,
      widthFactor: isFull ? null : 1,
      child: SizedBox(
        width: shellWidth,
        height: dim,
        child: body,
      ),
    );

    if (widget.disabled) {
      shell = Opacity(opacity: kOneUiLogoDisabledOpacity, child: shell);
    }

    final handlePress = widget.onPress ?? widget.onClick;
    Widget result;
    if (a11y.isPressable && handlePress != null) {
      final ds = OneUiScope.designSystemOf(context);
      final focusRing = ds == null
          ? null
          : resolveOneUiFocusRingSpec(context, ds,
              semanticAppearanceFallback: 'neutral');
      result = OneUiFocusInteractive(
        semanticsLabel: a11y.label!,
        semanticsHint: a11y.hint,
        enabled: !widget.disabled,
        onPressed: handlePress,
        borderRadius: BorderRadius.zero,
        focusRing: focusRing,
        pressAnimationBuilder: (ctx, press) {
          final opacity = press.value > 0 ? kOneUiLogoPressedOpacity : 1.0;
          return Opacity(opacity: opacity, child: shell);
        },
      );
    } else if (a11y.isDecorative) {
      result = ExcludeSemantics(child: shell);
    } else {
      result = Semantics(
        label: a11y.label,
        hint: a11y.hint,
        image: !a11y.isPressable,
        button: a11y.isPressable,
        child: shell,
      );
    }

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = Semantics(
        identifier: tid,
        child: KeyedSubtree(key: ValueKey(tid), child: result),
      );
    }

    return KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: KeyedSubtree(
        key: ValueKey(
          logoBrandScopeKey(
            context,
            svgContent: widget.svgContent,
            material: widget.material,
          ),
        ),
        child: result,
      ),
    );
  }
}
