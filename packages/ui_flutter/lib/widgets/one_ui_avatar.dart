import 'package:flutter/material.dart';

import '../engine/avatar_color_resolve.dart';
import '../engine/avatar_size_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_avatar_a11y.dart';
import 'one_ui_avatar_default_person.dart';
import 'one_ui_avatar_network_image.dart';
import 'one_ui_avatar_types.dart';
import 'one_ui_button_types.dart';

/// Token-backed avatar — `Avatar.tsx` / `Avatar.native.tsx`.
///
/// Non-interactive `role="img"`; colours and geometry from Convex `--Avatar-*`.
class OneUiAvatar extends StatefulWidget {
  const OneUiAvatar({
    super.key,
    this.content = OneUiAvatarContent.image,
    this.size = 'm',
    this.attention = OneUiAvatarAttention.high,
    this.appearance = 'auto',
    this.src,
    this.alt = '',
    this.fallback,
    this.icon,
    this.customSize,
    this.disabled = false,

    /// RN `accessibilityHint` / supplementary description for screen readers.
    this.semanticsHint,

    /// Web `aria-hidden` — hides avatar from assistive tech (e.g. redundant decorative).
    this.excludeFromSemantics = false,

    /// RN `testID` / web `data-testid`.
    this.testId,
  });

  final OneUiAvatarContent content;
  final String size;
  final OneUiAvatarAttention attention;
  final String appearance;
  final String? src;
  final String alt;
  final Widget? fallback;
  final Widget? icon;
  final double? customSize;
  final bool disabled;
  final String? semanticsHint;
  final bool excludeFromSemantics;
  final String? testId;

  @override
  State<OneUiAvatar> createState() => _OneUiAvatarState();
}

class _OneUiAvatarState extends State<OneUiAvatar> {
  bool _imageError = false;

  @override
  void didUpdateWidget(OneUiAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src || oldWidget.content != widget.content) {
      _imageError = false;
    }
  }

  List<String> _collectGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    final resolvedAppearance = resolveOneUiAvatarAppearance(
      context,
      appearance: widget.appearance,
    );
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiButtonAppearanceConfigured(context, resolvedAppearance)) {
      gaps.add('theme has no appearance "$resolvedAppearance"');
    }

    final scope = OneUiScope.of(context);
    final typo = OneUiScope.nativeTypographyOf(context);
    final resolvedSize = oneUiResolveAvatarSize(widget.size);
    final sz = widget.size == 'custom' ? 'custom' : resolvedSize;

    double? containerPx;
    if (widget.size != 'custom') {
      containerPx = ds.resolveComponentLengthPxCascade(
        ['--Avatar-size-$sz', '--Avatar-size-m'],
        gaps: gaps,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      );
      ds.resolveComponentLengthPxCascade(
        ['--Avatar-iconSize-$sz', '--Avatar-iconSize-m', '--Avatar-iconSize'],
        gaps: gaps,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
        relativeToPx: containerPx,
      );
    }

    ds.resolveComponentLengthPxCascade(
      ['--Avatar-borderRadius'],
      gaps: gaps,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: typo,
    );
    return gaps;
  }

  /// Non-empty after trim — whitespace-only `src` is treated as absent (web/RN `src &&`).
  String? get _effectiveImageSrc {
    final raw = widget.src;
    if (raw == null) return null;
    final trimmed = raw.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  void _scheduleImageError() {
    if (_imageError || !mounted) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_imageError) {
        setState(() => _imageError = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      assert(() {
        FlutterError.reportError(
          FlutterErrorDetails(
            exception: FlutterError(
              'OneUiAvatar requires OneUiBrandProvider / OneUiScope — wrap '
              'MaterialApp with OneUiSurfaceBootstrap.',
            ),
            library: 'ui_flutter',
            context: ErrorDescription('while building OneUiAvatar'),
          ),
        );
        return true;
      }());
      return oneUiConvexGapPlaceholder([
        'Flutter cannot render a token-backed Avatar without Convex '
        '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
      ]);
    }

    final gaps = _collectGaps(ds);
    if (gaps.isNotEmpty) {
      return oneUiConvexGapPlaceholder(gaps);
    }

    final state = resolveOneUiAvatarStateInContext(
      context,
      content: widget.content,
      size: widget.size,
      attention: widget.attention,
      appearance: widget.appearance,
      alt: widget.alt,
      disabled: widget.disabled,
    );

    final metrics = resolveAvatarMetrics(
      context,
      size: state.resolvedSize,
      customSize: widget.customSize,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
          ['Could not resolve Avatar size tokens']);
    }

    final showImage = state.resolvedContent == OneUiAvatarContent.image &&
        _effectiveImageSrc != null &&
        !_imageError;

    final colors = resolveAvatarColors(
      context,
      appearance: state.resolvedAppearance,
      attention: state.resolvedAttention,
      showingImage: showImage,
    );
    final iconPaintColor = resolveAvatarIconSlotColor(colors);

    final side = metrics.containerPx;
    final radiusPx = resolveAvatarBorderRadiusPx(context, containerPx: side);
    final disabledOpacity = resolveAvatarDisabledOpacity(context);
    final radius = BorderRadius.circular(radiusPx);

    Widget body;
    if (showImage) {
      // Web `Avatar.module.css` `.image` — fill container, transparent root (`data-showing-image`).
      body = ExcludeSemantics(
        child: OneUiAvatarNetworkImage(
          url: _effectiveImageSrc!,
          side: side,
          borderRadius: radius,
          onError: _scheduleImageError,
        ),
      );
    } else {
      Widget inner;
      if (state.resolvedContent == OneUiAvatarContent.text) {
        final textStyle =
            (metrics.textStyle ?? Theme.of(context).textTheme.labelSmall)
                ?.copyWith(color: colors.textColor, height: 1);
        inner = DefaultTextStyle.merge(
          style: textStyle ?? TextStyle(color: colors.textColor),
          child: widget.fallback ??
              Text(
                oneUiAvatarGetInitials(widget.alt),
                textAlign: TextAlign.center,
              ),
        );
      } else {
        final glyph = widget.icon ??
            widget.fallback ??
            OneUiAvatarDefaultPersonIcon(size: metrics.iconPx, color: iconPaintColor);
        inner = glyph is OneUiAvatarDefaultPersonIcon
            ? glyph
            : IconTheme.merge(
                data: IconThemeData(color: iconPaintColor, size: metrics.iconPx),
                child: SizedBox(
                  width: metrics.iconPx,
                  height: metrics.iconPx,
                  child: FittedBox(fit: BoxFit.contain, child: glyph),
                ),
              );
      }

      body = ClipRRect(
        borderRadius: radius,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: radius,
          ),
          child: Center(child: ExcludeSemantics(child: inner)),
        ),
      );
    }

    final a11y = resolveOneUiAvatarSemantics(
      alt: widget.alt,
      semanticsHint: widget.semanticsHint,
      isDisabled: state.isDisabled,
      excludeFromSemantics: widget.excludeFromSemantics,
    );

    Widget result = Opacity(
      opacity: state.isDisabled ? disabledOpacity : 1,
      child: SizedBox(width: side, height: side, child: body),
    );

    final tid = widget.testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;

    if (a11y.exposed) {
      result = Semantics(
        image: true,
        label: a11y.label,
        hint: a11y.hint,
        enabled: a11y.enabled,
        identifier: hasTestId ? tid : null,
        child: result,
      );
    } else if (hasTestId) {
      result = Semantics(
        identifier: tid,
        container: true,
        child: ExcludeSemantics(child: result),
      );
    } else {
      result = ExcludeSemantics(child: result);
    }

    result = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-avatar|data-content=${state.dataContent}|data-size=${state.dataSize}|data-attention=${state.dataAttention}|data-appearance=${state.dataAppearance}',
      ),
      child: result,
    );

    if (hasTestId) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}
