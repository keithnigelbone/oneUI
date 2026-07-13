import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart'
    show resolveOneUiFocusRingSpec, resolveSurfaceHaloGapFromScope;
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/selectable_icon_button_color_resolve.dart';
import '../engine/selectable_icon_button_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_selectable_icon_button_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'semantic_icon_material.dart';

export 'one_ui_selectable_icon_button_types.dart';

/// Token-backed icon toggle — `SelectableIconButton.tsx` parity.
///
/// Unselected is always muted ghost; [attention] drives the **selected** fill.
class OneUiSelectableIconButton extends StatefulWidget {
  const OneUiSelectableIconButton({
    required this.icon,
    required this.semanticsLabel,
    super.key,
    this.selected,
    this.defaultSelected = false,
    this.onSelectedChange,
    this.value,
    this.attention = OneUiSelectableIconButtonAttention.high,
    this.size = 10,
    this.sizeAlias,
    this.appearance = 'auto',
    this.condensed = false,
    this.shape = OneUiSelectableIconButtonShape.square,
    this.contained = true,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.semanticsHint,
    this.autofocus = false,
    this.forceFocusRing = false,
    this.testId,
  });

  final Object icon;
  final bool? selected;
  final bool defaultSelected;
  final ValueChanged<bool>? onSelectedChange;
  final String? value;
  final OneUiSelectableIconButtonAttention attention;
  final int size;
  final String? sizeAlias;
  final String appearance;
  final bool condensed;
  final OneUiSelectableIconButtonShape shape;
  final bool contained;
  final bool fullWidth;
  final bool disabled;
  final bool loading;
  final String semanticsLabel;
  final String? semanticsHint;
  final bool autofocus;
  final bool forceFocusRing;
  final String? testId;

  @override
  State<OneUiSelectableIconButton> createState() =>
      _OneUiSelectableIconButtonState();
}

class _OneUiSelectableIconButtonState extends State<OneUiSelectableIconButton> {
  late bool _selected;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _selected = widget.selected ?? widget.defaultSelected;
  }

  @override
  void didUpdateWidget(OneUiSelectableIconButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected != null) {
      _selected = widget.selected!;
    }
  }

  bool get _isSelected => widget.selected ?? _selected;

  int get _numericSize => oneUiResolveSelectableIconButtonSize(
        size: widget.size,
        sizeAlias: widget.sizeAlias,
      );

  String get _resolvedAppearance =>
      resolveOneUiButtonAppearance(context, widget.appearance);

  bool get _effectiveCondensed => widget.contained && widget.condensed;

  bool get _effectiveFullWidth => widget.contained && widget.fullWidth;

  void _toggle() {
    if (widget.disabled || widget.loading) return;
    final next = !_isSelected;
    if (widget.selected == null) {
      setState(() => _selected = next);
    }
    widget.onSelectedChange?.call(next);
  }

  String? get _trimmedTestId {
    final tid = widget.testId?.trim();
    if (tid == null || tid.isEmpty) return null;
    return tid;
  }

  Widget _buildChrome({
    required double width,
    required double height,
    required BorderRadius borderRadius,
    required Color fill,
    required Color iconColor,
    required Widget glyph,
    required double opacity,
    Border? border,
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
            child: Center(child: glyph),
          ),
        ),
      ),
    );
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

  List<String> _collectGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiSelectableIconButtonAppearanceConfigured(
        context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final scope = OneUiScope.maybeOf(context);
    final plat = scope?.platformId;
    final den = scope?.density;
    final pc = scope?.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final sz = '$_numericSize';

    ds.resolveComponentLengthPxCascade(
      ['--SelectableIconButton-borderRadius'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    final containerKeys = _effectiveCondensed
        ? [
            '--SelectableIconButton-containerSize-$sz-condensed',
            '--SelectableIconButton-condensedContainerSize-$sz',
            '--SelectableIconButton-containerSize-$sz',
          ]
        : ['--SelectableIconButton-containerSize-$sz'];
    ds.resolveComponentLengthPxCascade(
      containerKeys,
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    ds.resolveComponentLengthPxCascade(
      ['--SelectableIconButton-iconSize-$sz'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    return gaps;
  }

  @override
  Widget build(BuildContext context) {
    assert(() {
      if (widget.semanticsLabel.trim().isEmpty) {
        FlutterError.reportError(
          FlutterErrorDetails(
            exception: FlutterError(
              'OneUiSelectableIconButton requires semanticsLabel for '
              'icon-only toggle accessibility.',
            ),
            library: 'ui_flutter',
          ),
        );
      }
      return true;
    }());

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed SelectableIconButton without '
              'Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final state = resolveOneUiSelectableIconButtonState(
      context: context,
      attention: widget.attention,
      appearance: widget.appearance,
      size: widget.size,
      sizeAlias: widget.sizeAlias,
      condensed: widget.condensed,
      shape: widget.shape,
      contained: widget.contained,
      fullWidth: widget.fullWidth,
      disabled: widget.disabled,
      loading: widget.loading,
      selected: _isSelected,
    );

    if (widget.contained) {
      final gaps = _collectGaps(ds);
      if (gaps.isNotEmpty) {
        return oneUiConvexGapPlaceholder(gaps);
      }
    }

    final metrics = resolveSelectableIconButtonSizeMetrics(
      context,
      ds,
      numericSize: _numericSize,
      condensed: _effectiveCondensed,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
        ['Could not resolve SelectableIconButton size tokens'],
      );
    }

    final paint = resolveSelectableIconButtonPaint(
      context,
      ds,
      selected: _isSelected,
      attention: widget.attention,
      appearance: _resolvedAppearance,
      contained: widget.contained,
    );

    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);

    final radius = widget.contained
        ? (ds.resolveComponentLengthPxCascade(
              ['--SelectableIconButton-borderRadius'],
              platformId: plat,
              density: den,
              platformsConfig: pc,
              nativeTypography: typo,
            ) ??
            metrics.containerPx / 2)
        : 0.0;

    final borderRadius = BorderRadius.circular(radius);

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

    final height = widget.contained ? metrics.containerPx : metrics.iconPx;
    final width = widget.contained
        ? (_effectiveFullWidth
            ? double.infinity
            : widget.shape == OneUiSelectableIconButtonShape.wide
                ? height * 1.5
                : height)
        : height;

    final interactive = !(widget.disabled || widget.loading);

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

      return ExcludeSemantics(
        child: SizedBox(
          width: metrics.iconPx,
          height: metrics.iconPx,
          child: Center(child: glyph),
        ),
      );
    }

    Widget buildVisual(Color fill, Color iconColor, {Border? border}) {
      final opacity = widget.disabled
          ? disabledOpacity
          : widget.loading
              ? loadingOpacity
              : 1.0;
      return _buildChrome(
        width: width,
        height: height,
        borderRadius: borderRadius,
        fill: fill,
        iconColor: iconColor,
        glyph: buildGlyph(iconColor),
        opacity: opacity,
        border: border,
      );
    }

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: _resolvedAppearance,
      innerGapColorOverride: paint.background.a > 0
          ? paint.background
          : resolveSurfaceHaloGapFromScope(context),
    );
    final tapMotion = resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: _numericSize == 6,
      fullWidthTapScale: false,
    );

    final body = OneUiFocusInteractive(
      // Outer [Semantics] owns the a11y tree (inner is [ExcludeSemantics]).
      semanticsLabel: widget.semanticsLabel,
      enabled: interactive,
      onPressed: interactive ? _toggle : null,
      onHoverChanged:
          interactive ? (hovered) => setState(() => _hovered = hovered) : null,
      borderRadius: borderRadius,
      focusRing: focusRing,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      minHitTestSize: _minHitTestSize(ds, scope, width: width, height: height),
      pressAnimationBuilder: interactive
          ? (_, press) {
              final fill = resolveSelectableIconButtonFill(
                paint,
                hovered: _hovered,
                pressT: press.value,
              );
              final border = paint.borderColor != null && paint.borderWidth > 0
                  ? Border.all(
                      color: paint.borderColor!,
                      width: paint.borderWidth,
                    )
                  : null;
              return buildVisual(fill, paint.foreground, border: border);
            }
          : null,
      child: interactive
          ? null
          : buildVisual(
              resolveSelectableIconButtonFill(paint, hovered: _hovered),
              paint.foreground,
              border: paint.borderColor != null && paint.borderWidth > 0
                  ? Border.all(
                      color: paint.borderColor!,
                      width: paint.borderWidth,
                    )
                  : null,
            ),
    );

    final mergedSemanticsHint = () {
      final hints = <String>[];
      final custom = widget.semanticsHint?.trim();
      if (custom != null && custom.isNotEmpty) hints.add(custom);
      if (widget.loading) hints.add('Loading');
      if (hints.isEmpty) return null;
      return hints.join('. ');
    }();

    Widget result = Semantics(
      button: true,
      toggled: _isSelected,
      enabled: interactive,
      label: widget.semanticsLabel,
      hint: mergedSemanticsHint,
      identifier: _trimmedTestId,
      onTap: interactive ? _toggle : null,
      child: KeyedSubtree(
        key: ValueKey<String>(state.dataPayloadKey),
        child: OneUiSlotParentAppearanceScope(
          appearance: _resolvedAppearance,
          child: ExcludeSemantics(child: body),
        ),
      ),
    );

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
