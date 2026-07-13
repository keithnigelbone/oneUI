import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart'
    show resolveOneUiFocusRingSpec, resolveSurfaceHaloGapFromScope;
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/selectable_single_text_button_color_resolve.dart';
import '../engine/selectable_single_text_button_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button_types.dart';
import 'one_ui_circular_progress_indicator_types.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_selectable_single_text_button_types.dart';
import 'one_ui_slot_parent_appearance.dart';

export 'one_ui_selectable_single_text_button_types.dart';

OneUiCircularProgressIndicatorSize
    oneUiSelectableSingleTextButtonLoadingSpinnerSize(String size) {
  return switch (size.trim().toLowerCase()) {
    's' => 'S',
    'l' => 'L',
    _ => 'M',
  };
}

/// Token-backed circular text toggle — `SelectableSingleTextButton.tsx` parity.
///
/// Max 2-character label (e.g. language codes). Unselected is always muted ghost;
/// [attention] drives the **selected** fill only.
class OneUiSelectableSingleTextButton extends StatefulWidget {
  const OneUiSelectableSingleTextButton({
    required this.label,
    super.key,
    this.selected,
    this.defaultSelected = false,
    this.onSelectedChange,
    this.value,
    this.attention = OneUiSelectableSingleTextButtonAttention.high,
    this.size = 'm',
    this.appearance = 'auto',
    this.condensed = false,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.semanticsLabel,
    this.semanticsHint,
    this.autofocus = false,
    this.forceFocusRing = false,
    this.testId,
  });

  final String label;
  final bool? selected;
  final bool defaultSelected;
  final ValueChanged<bool>? onSelectedChange;
  final String? value;
  final OneUiSelectableSingleTextButtonAttention attention;
  final String size;
  final String appearance;
  final bool condensed;
  final bool fullWidth;
  final bool disabled;
  final bool loading;
  final String? semanticsLabel;
  final String? semanticsHint;
  final bool autofocus;
  final bool forceFocusRing;
  final String? testId;

  @override
  State<OneUiSelectableSingleTextButton> createState() =>
      _OneUiSelectableSingleTextButtonState();
}

class _OneUiSelectableSingleTextButtonState
    extends State<OneUiSelectableSingleTextButton> {
  late bool _selected;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _selected = widget.selected ?? widget.defaultSelected;
  }

  @override
  void didUpdateWidget(OneUiSelectableSingleTextButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected != null) {
      _selected = widget.selected!;
    }
  }

  bool get _isSelected => widget.selected ?? _selected;

  String get _normalizedSize =>
      oneUiNormalizeSelectableSingleTextButtonSize(widget.size);

  String get _resolvedAppearance =>
      resolveOneUiButtonAppearance(context, widget.appearance);

  String get _displayLabel =>
      oneUiSelectableSingleTextButtonLabel(widget.label);

  String get _accessibleName {
    final custom = widget.semanticsLabel?.trim();
    if (custom != null && custom.isNotEmpty) return custom;
    return _displayLabel;
  }

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

  List<String> _collectGaps(NativeDesignSystemPayload ds) {
    final gaps = <String>[];
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface == null) {
      gaps.add('OneUiSurfaceScope missing');
    } else if (!isOneUiSelectableSingleTextButtonAppearanceConfigured(
        context, widget.appearance)) {
      gaps.add('theme has no appearance "${widget.appearance}"');
    }

    final scope = OneUiScope.maybeOf(context);
    if (scope == null) {
      gaps.add('OneUiScope missing');
      return gaps;
    }
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final sz = _normalizedSize;

    ds.resolveComponentLengthPxCascade(
      ['--SelectableSingleTextButton-borderRadius'],
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );

    final metrics = resolveSelectableSingleTextButtonSizeMetrics(
      ds,
      size: sz,
      condensed: widget.condensed,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
      gaps: gaps,
    );
    if (metrics == null) {
      gaps.add('Could not resolve SelectableSingleTextButton size tokens');
    }

    return gaps;
  }

  Widget _buildChrome({
    required double width,
    required double height,
    required double paddingPx,
    required BorderRadius borderRadius,
    required Color fill,
    required Color textColor,
    required Widget child,
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
            child: Padding(
              padding: EdgeInsets.all(paddingPx),
              child: Center(child: child),
            ),
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

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed SelectableSingleTextButton '
              'without Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final state = resolveOneUiSelectableSingleTextButtonState(
      context: context,
      attention: widget.attention,
      appearance: widget.appearance,
      size: widget.size,
      condensed: widget.condensed,
      fullWidth: widget.fullWidth,
      disabled: widget.disabled,
      loading: widget.loading,
      selected: _isSelected,
    );

    final gaps = _collectGaps(ds);
    if (gaps.isNotEmpty) {
      return oneUiConvexGapPlaceholder(gaps);
    }

    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);

    final metrics = resolveSelectableSingleTextButtonSizeMetrics(
      ds,
      size: _normalizedSize,
      condensed: widget.condensed,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );
    if (metrics == null) {
      return oneUiConvexGapPlaceholder(
        ['Could not resolve SelectableSingleTextButton size tokens'],
      );
    }

    final paint = resolveSelectableSingleTextButtonPaint(
      context,
      ds,
      selected: _isSelected,
      attention: widget.attention,
      appearance: _resolvedAppearance,
    );

    final radius = ds.resolveComponentLengthPxCascade(
          ['--SelectableSingleTextButton-borderRadius'],
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        ) ??
        metrics.minSizePx / 2;
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

    final height = metrics.minSizePx;
    final width = widget.fullWidth ? double.infinity : height;
    final interactive = !(widget.disabled || widget.loading);

    final labelStyle = TextStyle(
      fontFamily: typo?.fontFamilyPrimaryOrBundled,
      fontSize: metrics.fontSizePx,
      height: metrics.lineHeightPx / metrics.fontSizePx,
      fontWeight: metrics.fontWeight,
      color: paint.foreground,
    );

    final innerExtent = (height - (metrics.paddingPx * 2)).clamp(0.0, height);

    Widget buildGlyph(Color textColor) {
      if (widget.loading) {
        return Semantics(
          label: 'Loading',
          child: SizedBox(
            width: innerExtent,
            height: innerExtent,
            child: Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: OneUiLoadingSpinner(
                  appearance: _resolvedAppearance,
                  size: oneUiSelectableSingleTextButtonLoadingSpinnerSize(
                    _normalizedSize,
                  ),
                  strokeColor: textColor,
                ),
              ),
            ),
          ),
        );
      }

      return ExcludeSemantics(
        child: SizedBox(
          width: innerExtent,
          height: innerExtent,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              _displayLabel,
              style: labelStyle.copyWith(color: textColor),
              maxLines: 1,
              softWrap: false,
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    Widget buildVisual(Color fill, Color textColor, {Border? border}) {
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
        child: buildGlyph(textColor),
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
      sizeIsXs: _normalizedSize == 's',
      fullWidthTapScale: widget.fullWidth,
    );

    final body = OneUiFocusInteractive(
      semanticsLabel: _accessibleName,
      semanticsHint: widget.semanticsHint,
      semanticsBusy: widget.loading,
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
              final fill = resolveSelectableSingleTextButtonFill(
                paint,
                hovered: _hovered,
                pressT: press.value,
              );
              final border = paint.borderWidth > 0
                  ? Border.all(
                      color: paint.borderColor,
                      width: paint.borderWidth,
                    )
                  : null;
              return buildVisual(fill, paint.foreground, border: border);
            }
          : null,
      child: interactive
          ? null
          : buildVisual(
              resolveSelectableSingleTextButtonFill(paint, hovered: _hovered),
              paint.foreground,
              border: paint.borderWidth > 0
                  ? Border.all(
                      color: paint.borderColor,
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
      label: _accessibleName,
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
