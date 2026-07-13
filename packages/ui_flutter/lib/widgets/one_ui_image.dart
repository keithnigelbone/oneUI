import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/image_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_image_a11y.dart';
import 'one_ui_image_fallback_icon.dart';
import 'one_ui_image_remote.dart';
import 'one_ui_image_types.dart';

/// Token-backed image — `Image.tsx` / `Image.native.tsx` parity.
///
/// Static: outer `Semantics` image role; inner remote image is decorative.
/// Interactive: [OneUiFocusInteractive] button + neutral state layer.
class OneUiImage extends StatefulWidget {
  const OneUiImage({
    required this.src,
    required this.alt,
    super.key,
    this.aspectRatio = OneUiImageAspectRatio.auto,
    this.interactive = false,
    this.disabled = false,
    this.fit,
    this.objectFit,
    this.objectPosition = 'center',
    this.loading = OneUiImageLoadingStrategy.auto,
    this.width,
    this.height,
    this.onPress,
    this.onClick,
    this.onLoad,
    this.onError,
    this.fallback,
    this.fallbackSrc,
    this.ariaLabel,
    this.testId,

    /// Per-instance `--Image-borderRadius` override (e.g. `--Shape-3`).
    this.borderRadiusToken,
  });

  final String src;
  final String alt;
  final OneUiImageAspectRatio aspectRatio;
  final bool interactive;
  final bool disabled;
  final OneUiImageObjectFit? fit;
  final OneUiImageObjectFit? objectFit;
  final String objectPosition;

  /// Figma / HTML `loading` — accepted for API parity; no-op on IO (RN eager).
  final OneUiImageLoadingStrategy loading;

  /// Number (px) or string (`120px`) — percentage strings are ignored (web parity).
  final Object? width;
  final Object? height;
  final VoidCallback? onPress;
  final VoidCallback? onClick;
  final VoidCallback? onLoad;
  final VoidCallback? onError;
  final Widget? fallback;
  final String? fallbackSrc;
  final String? ariaLabel;
  final String? testId;
  final String? borderRadiusToken;

  @override
  State<OneUiImage> createState() => _OneUiImageState();
}

class _OneUiImageState extends State<OneUiImage> {
  bool _hasError = false;
  bool _usingFallbackSrc = false;
  bool _hovered = false;

  @override
  void didUpdateWidget(OneUiImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src ||
        oldWidget.fallbackSrc != widget.fallbackSrc) {
      _hasError = false;
      _usingFallbackSrc = false;
    }
  }

  void _handleError() {
    // Image.network `errorBuilder` / IO `errorBuilder` run during build — defer
    // state updates (matches Avatar network image pattern).
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final fb = widget.fallbackSrc;
      if (!_usingFallbackSrc &&
          fb != null &&
          fb.isNotEmpty &&
          fb != widget.src) {
        setState(() => _usingFallbackSrc = true);
        return;
      }
      if (!_hasError) {
        setState(() => _hasError = true);
        widget.onError?.call();
      }
    });
  }

  Widget _buildFallback(ImageResolvedStyle style) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      constraints: BoxConstraints(minHeight: style.minFallbackHeightPx),
      color: style.fallbackBackground,
      alignment: Alignment.center,
      child: widget.fallback ??
          OneUiImageFallbackIcon(
            color: style.fallbackColor,
            size: style.fallbackIconSizePx,
          ),
    );
  }

  Widget _buildImageContent(ImageResolvedStyle style, BoxFit boxFit) {
    if (_hasError) {
      if (widget.fallback != null) {
        return Container(
          width: double.infinity,
          height: double.infinity,
          constraints: BoxConstraints(minHeight: style.minFallbackHeightPx),
          color: style.fallbackBackground,
          alignment: Alignment.center,
          child: widget.fallback,
        );
      }
      return _buildFallback(style);
    }
    final uri = _usingFallbackSrc && widget.fallbackSrc != null
        ? widget.fallbackSrc!
        : widget.src;
    return OneUiImageRemote(
      url: uri,
      fit: boxFit,
      alignment: style.objectPositionAlignment,
      onLoad: widget.onLoad,
      onError: _handleError,
    );
  }

  Widget _clipChild(Widget child, ImageResolvedStyle style) {
    return ClipRRect(
      borderRadius: style.borderRadius,
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }

  Widget _sizedWrapper(
      {required ImageResolvedStyle style, required Widget child}) {
    final ratio = widget.aspectRatio.numeric;
    Widget core = child;
    if (ratio != null) {
      core = AspectRatio(aspectRatio: ratio, child: core);
    }
    final w = parseImageLayoutLength(widget.width);
    final h = parseImageLayoutLength(widget.height);
    if (w != null || h != null) {
      core = SizedBox(width: w, height: h, child: core);
    }
    return core;
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final style = resolveImageStyle(
      context,
      ds,
      fit: widget.fit,
      objectFit: widget.objectFit,
      objectPosition: widget.objectPosition,
      borderRadiusToken: widget.borderRadiusToken,
    );
    final boxFit = boxFitForImageObjectFit(style.objectFit);
    final handlePress = widget.onPress ?? widget.onClick;
    final state = resolveOneUiImageState(
      aspectRatio: widget.aspectRatio,
      interactive: widget.interactive,
      disabled: widget.disabled,
      fit: widget.fit,
      objectFit: widget.objectFit,
      onPress: widget.onPress,
      onClick: widget.onClick,
    );
    final a11y = resolveOneUiImageA11y(
      alt: widget.alt,
      ariaLabel: widget.ariaLabel,
      interactive: state.isActionable,
      disabled: widget.disabled,
    );

    final showErrorChrome =
        _hasError && widget.fallback == null && !_usingFallbackSrc;
    final bg = showErrorChrome ? style.fallbackBackground : Colors.transparent;

    final imageBody = Container(
      color: bg,
      child: _buildImageContent(style, boxFit),
    );
    final clippedBody = _clipChild(imageBody, style);

    Widget inner;
    if (state.isActionable && handlePress != null) {
      final focusRing = resolveOneUiFocusRingSpec(context, ds,
          semanticAppearanceFallback: 'neutral');
      inner = OneUiFocusInteractive(
        semanticsLabel: a11y.label,
        enabled: !widget.disabled,
        onPressed: handlePress,
        onHoverChanged: widget.disabled
            ? null
            : (hovered) => setState(() => _hovered = hovered),
        borderRadius: style.borderRadius,
        focusRing: focusRing,
        pressAnimationBuilder: (ctx, press) {
          final Color? overlay;
          if (press.value > 0.5) {
            overlay = style.stateLayerPressed;
          } else if (_hovered) {
            overlay = style.stateLayerHover;
          } else {
            overlay = null;
          }
          return Stack(
            fit: StackFit.passthrough,
            children: [
              clippedBody,
              Positioned.fill(
                child: IgnorePointer(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    color: overlay == null
                        ? Colors.transparent
                        : press.value > 0
                            ? overlay.withValues(alpha: 0.35)
                            : overlay,
                  ),
                ),
              ),
            ],
          );
        },
      );
    } else {
      inner = Semantics(
        label: a11y.label,
        image: true,
        child: clippedBody,
      );
    }

    if (widget.disabled) {
      inner = Opacity(opacity: style.disabledOpacity, child: inner);
    }

    inner = _sizedWrapper(style: style, child: inner);

    final dataKey = state.dataAttributes.entries
        .map((e) => '${e.key}=${e.value}')
        .join('|');
    inner = KeyedSubtree(
      key:
          ValueKey<String>('oneui-image|${dataKey.isEmpty ? 'auto' : dataKey}'),
      child: inner,
    );

    final tid = widget.testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;
    if (hasTestId) {
      inner = Semantics(identifier: tid, child: inner);
      inner = KeyedSubtree(key: ValueKey(tid), child: inner);
    }

    return inner;
  }
}
