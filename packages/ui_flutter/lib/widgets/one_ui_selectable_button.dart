import 'package:flutter/material.dart';

import '../engine/button_decoration.dart';
import '../engine/button_ornament_chrome.dart';
import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/selectable_button_color_resolve.dart';
import '../engine/selectable_button_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../engine/badge_slot_context.dart';
import '../utils/touch_target_a11y.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_focus_interactive.dart';
import 'one_ui_loading_spinner.dart';
import 'one_ui_selectable_button_a11y.dart';
import 'one_ui_selectable_button_types.dart';
import 'one_ui_slot_parent_appearance.dart';

export 'one_ui_selectable_button_types.dart';
export 'one_ui_selectable_button_a11y.dart';
export '../engine/button_ornament_chrome.dart'
    show
        selectableButtonOrnamentIsGhost,
        selectableButtonOrnamentVariantKind;

typedef OneUiSelectableButtonSelectedChange = void Function(bool selected);

/// Token-backed toggle button — `SelectableButton.tsx` (Base UI Toggle).
///
/// Unselected state is always muted ghost. Selected appearance is driven by
/// [attention]: high=bold fill, medium=subtle fill, low=ghost+accent border.
class OneUiSelectableButton extends StatefulWidget {
  const OneUiSelectableButton({
    super.key,
    this.label,
    this.child,
    this.selected,
    this.defaultSelected = false,
    this.onSelectedChange,
    this.value,
    this.size = 'm',
    this.attention = 'high',
    this.appearance = 'auto',
    this.contained = true,
    this.condensed = false,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
    this.start,
    this.end,
    this.semanticsLabel,
    this.ariaLabel,
    this.semanticsHint,
    this.autofocus = false,
    this.forceFocusRing = false,
    this.testId,
  });

  final String? label;
  final Widget? child;
  final bool? selected;
  final bool defaultSelected;
  final OneUiSelectableButtonSelectedChange? onSelectedChange;
/// Reserved for web ToggleGroup parity (`BaseToggle` value). Not wired in Flutter
/// yet — no toggle-group consumer exists.
  final String? value;
  final String size;
  final String attention;
  final String appearance;
  final bool contained;
  final bool condensed;
  final bool fullWidth;
  final bool disabled;
  final bool loading;
  final Widget? start;
  final Widget? end;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? semanticsHint;
  final bool autofocus;
  final bool forceFocusRing;
  final String? testId;

  @override
  State<OneUiSelectableButton> createState() => _OneUiSelectableButtonState();
}

class _OneUiSelectableButtonState extends State<OneUiSelectableButton> {
  late bool _uncontrolledSelected;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _uncontrolledSelected = widget.defaultSelected;
  }

  @override
  void didUpdateWidget(OneUiSelectableButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected == null &&
        oldWidget.defaultSelected != widget.defaultSelected) {
      _uncontrolledSelected = widget.defaultSelected;
    }
  }

  bool get _isSelected => widget.selected ?? _uncontrolledSelected;

  void _toggle() {
    if (widget.disabled || widget.loading) return;
    final next = !_isSelected;
    if (widget.selected == null) {
      setState(() => _uncontrolledSelected = next);
    }
    widget.onSelectedChange?.call(next);
  }

  String? get _visibleLabel {
    if (widget.label != null && widget.label!.trim().isNotEmpty) {
      return widget.label!.trim();
    }
    if (widget.child is String) return (widget.child as String).trim();
    return null;
  }

  Widget? _buildLabel(SelectableButtonResolvedPaint paint, TextStyle baseStyle) {
    if (widget.child != null && widget.child is! String) {
      return ExcludeSemantics(
        child: DefaultTextStyle.merge(
          style: baseStyle.copyWith(color: paint.foreground),
          child: widget.child!,
        ),
      );
    }
    final text = _visibleLabel;
    if (text == null || text.isEmpty) return null;
    return ExcludeSemantics(
      child: Text(
        text,
        style: baseStyle.copyWith(
          color: paint.foreground,
          fontWeight: paint.uncontainedSelectedFontWeight ??
              baseStyle.fontWeight,
        ),
        textAlign: widget.fullWidth && widget.contained
            ? TextAlign.center
            : null,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textHeightBehavior: const TextHeightBehavior(
          applyHeightToFirstAscent: false,
          applyHeightToLastDescent: false,
        ),
      ),
    );
  }

  Widget _slot(Widget child, Color iconColor, double iconSize) {
    return BadgeSlotIconColorScope(
      color: iconColor,
      child: IconTheme.merge(
        data: IconThemeData(color: iconColor, size: iconSize),
        child: child,
      ),
    );
  }

  Widget _preserveLayoutWhenLoading({required Widget child}) {
    if (!widget.loading) return child;
    return Visibility(
      visible: false,
      maintainState: true,
      maintainAnimation: true,
      maintainSize: true,
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed SelectableButton without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final state = resolveOneUiSelectableButtonState(
      context,
      size: widget.size,
      attention: widget.attention,
      appearance: widget.appearance,
      contained: widget.contained,
      condensed: widget.condensed,
      disabled: widget.disabled,
      loading: widget.loading,
    );

    final hasStart = widget.start != null;
    final hasEnd = widget.end != null;

    // Typography / icon metrics are always resolved — uncontained still needs
    // label style + slot icon size (web `1em`); only container padding is skipped.
    final layout = resolveSelectableButtonLayout(
      context,
      ds,
      size: state.size,
      condensed: state.contained && state.condensed,
      hasStart: state.contained && hasStart,
      hasEnd: state.contained && hasEnd,
    );
    final iconSize = selectableButtonResolvedIconSize(
      layout,
      contained: state.contained,
    );

    SelectableButtonResolvedPaint resolvePaint({required bool hovered}) =>
        resolveSelectableButtonPaint(
          context,
          ds,
          selected: _isSelected,
          hovered: hovered,
          contained: state.contained,
          attention: state.attention,
          appearance: state.resolvedAppearance,
        );

    final idlePaint = resolvePaint(hovered: false);
    final hoverPaint = resolvePaint(hovered: true);

    final scope = OneUiScope.of(context);
    final plat = scope.platformId;
    final den = scope.density;
    final pc = scope.platformsFoundationConfig;
    final typo = OneUiScope.nativeTypographyOf(context);
    final ornament = scope.buttonOrnament;
    final ornamentVariant = selectableButtonOrnamentVariantKind(
      selected: _isSelected,
      attention: state.attention,
    );
    const componentPrefix = '--SelectableButton';
    final ornamentMargins = ornament != null
        ? componentOrnamentMargins(
            ds: ds,
            minHeightPx: layout.minHeight,
            ornament: ornament,
            componentPrefix: componentPrefix,
            platformId: plat,
            density: den,
          )
        : (left: 0.0, right: 0.0);
    final ornamentHeightScale = ornament != null
        ? componentOrnamentHeightScale(
            ds,
            componentPrefix: componentPrefix,
            platformId: plat,
            density: den,
          )
        : 1.0;

    final touchTargetMin = resolveTouchTargetMinPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );

    final minHeight = state.contained ? layout.minHeight : 0.0;
    final hitTestPadding = state.contained
        ? resolvePressableHitPaddingForControl(
            height: minHeight,
            touchTargetMinPx: touchTargetMin,
            platformId: scope.platformId,
          )
        : EdgeInsets.zero;

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: state.resolvedAppearance,
      innerGapColorOverride: selectableButtonFocusHaloGapOverride(
        context,
        restingFill: idlePaint.background,
        selected: _isSelected,
      ),
    );

    final tapMotion = resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: state.size == 'xs' || state.size == 's',
      fullWidthTapScale: widget.fullWidth && state.contained,
    );

    final colorTransition = resolveSelectableButtonColorTransition(context, ds);
    final mq = MediaQuery.maybeOf(context);
    final animateColors = !(mq?.disableAnimations ?? false) &&
        colorTransition.durationMs > 0;

    final a11y = resolveOneUiSelectableButtonSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      label: widget.label,
      child: widget.child,
      semanticsHint: widget.semanticsHint,
      selected: _isSelected,
      disabled: widget.disabled,
      loading: widget.loading,
    );

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity') ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
      );
      return double.tryParse(raw ?? '') ?? 0.5;
    }();

    final loadingOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Loading-Opacity') ??
            ds.componentCustomProperties['--Loading-Opacity'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
      );
      return double.tryParse(raw ?? '') ?? disabledOpacity;
    }();

    final opacity = widget.loading
        ? loadingOpacity
        : (widget.disabled ? disabledOpacity : 1.0);

    BorderRadius coreBorderRadius() =>
        buttonOrnamentCoreBorderRadius(
          ornament: ornament,
          radius: layout.borderRadius,
        );

    Widget buildChrome(Animation<double> press) {
      final ambient =
          _hovered && !state.isDisabled ? hoverPaint : idlePaint;
      final paint = ambient;
      final bw = paint.borderWidth;

      Border? border;
      if (paint.borderWidth > 0 && paint.borderColor.a > (8 / 255)) {
        border = Border.all(
          color: paint.borderColor,
          width: paint.borderWidth,
        );
      }
      border = resolveButtonCoreInsetBorder(
        context: context,
        ds: ds,
        variantKind: ornamentVariant,
        existingBorder: border,
        foreground: paint.foreground,
        componentPrefix: componentPrefix,
        appearance: state.resolvedAppearance,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );

      final row = <Widget>[];
      if (hasStart) {
        row.add(_preserveLayoutWhenLoading(
          child: _slot(widget.start!, paint.slotIconColor, iconSize),
        ));
      }
      final labelWidget = _buildLabel(paint, layout.labelStyle);
      if (labelWidget != null) {
        row.add(
          Flexible(
            fit: widget.fullWidth && state.contained
                ? FlexFit.tight
                : FlexFit.loose,
            child: _preserveLayoutWhenLoading(child: labelWidget),
          ),
        );
      }
      if (hasEnd) {
        row.add(_preserveLayoutWhenLoading(
          child: _slot(widget.end!, paint.slotIconColor, iconSize),
        ));
      }

      Widget content = Row(
        mainAxisSize: widget.fullWidth && state.contained
            ? MainAxisSize.max
            : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        spacing: layout.gap,
        children: row,
      );

      if (widget.loading) {
        content = Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            content,
            ExcludeSemantics(
              child: OneUiLoadingSpinner(
                appearance: state.resolvedAppearance,
                size: selectableButtonLoadingSpinnerSize(state.size),
                strokeColor: paint.foreground,
              ),
            ),
          ],
        );
      }

      if (!state.contained) {
        return Opacity(opacity: opacity, child: content);
      }

      final fill = Color.lerp(
        paint.background,
        paint.background.withValues(alpha: 0.92),
        press.value,
      )!;

      final ornamentStroke = ornament != null
          ? resolveButtonOrnamentStroke(
              context: context,
              ds: ds,
              ornament: ornament,
              variantKind: ornamentVariant,
              fillPaint: fill,
              foreground: paint.foreground,
              tokenBorderWidthPx: bw,
              componentPrefix: componentPrefix,
              appearance: state.resolvedAppearance,
              platformId: plat,
              density: den,
              platformsConfig: pc,
              nativeTypography: typo,
              ghostStrokeColor: paint.borderColor.a > (8 / 255)
                  ? paint.borderColor
                  : null,
            )
          : null;

      final ornamentLayers = ornament != null && ornamentStroke != null
          ? resolveButtonOrnamentLayers(
              ornament: ornament,
              bodyFill: ornamentStroke.bodyFill,
              ornamentStrokeColor: ornamentStroke.strokeColor,
              ornamentStrokeWidthPx: ornamentStroke.strokeWidthPx,
            )
          : null;

      Widget coreButton = AnimatedContainer(
        duration: animateColors
            ? Duration(milliseconds: colorTransition.durationMs)
            : Duration.zero,
        curve: colorTransition.curve,
        constraints: BoxConstraints(
          minHeight: layout.minHeight,
          minWidth: widget.fullWidth ? double.infinity : touchTargetMin,
        ),
        decoration: BoxDecoration(
          color: fill,
          borderRadius: coreBorderRadius(),
          border: border,
        ),
        child: Padding(
          padding: layout.padding,
          child: content,
        ),
      );

      final leftBarW = ornament != null &&
              ornamentLayers?.left != null &&
              ornamentMargins.left > 0
          ? ornamentMargins.left
          : 0.0;
      final rightBarW = ornament != null &&
              ornamentLayers?.right != null &&
              ornamentMargins.right > 0
          ? ornamentMargins.right
          : 0.0;

      Widget chrome = coreButton;
      if (ornament != null && (leftBarW > 0 || rightBarW > 0)) {
        final strokeSx = lengthPrimitiveSansPlatformDims('--Stroke-S');
        final strokeAlignPx = ds.parsePx(
              ds.resolveCSSValue(
                strokeSx,
                platformId: plat,
                density: den,
                platformsConfig: pc,
                nativeTypography: typo,
              ),
              platformId: plat,
              density: den,
              platformsConfig: pc,
              nativeTypography: typo,
            ) ??
            0.5;

        chrome = buildButtonOrnamentChrome(
          params: ButtonOrnamentChromeParams(
            ornament: ornament,
            layers: ornamentLayers!,
            leftBarW: leftBarW,
            rightBarW: rightBarW,
            strokeAlignPx: strokeAlignPx,
            ornamentHeightScale: ornamentHeightScale,
            borderWidthPx: bw,
            minHeightPx: layout.minHeight,
            borderRadius: coreBorderRadius(),
          ),
          coreButton: coreButton,
          fullWidth: widget.fullWidth,
        );
      } else if (widget.fullWidth) {
        chrome = SizedBox(width: double.infinity, child: coreButton);
      }

      return Opacity(opacity: opacity, child: chrome);
    }

    final borderRadius = state.contained
        ? BorderRadius.circular(layout.borderRadius)
        : BorderRadius.zero;

    Widget body = OneUiFocusInteractive(
      semanticsLabel: a11y.label,
      enabled: a11y.enabled,
      onPressed: state.isDisabled ? null : _toggle,
      onHoverChanged: state.isDisabled || !state.contained
          ? null
          : (hovered) {
              if (_hovered == hovered) return;
              setState(() => _hovered = hovered);
            },
      borderRadius: borderRadius,
      focusRing: focusRing,
      tapMotion: tapMotion,
      autofocus: widget.autofocus,
      forceFocusRing: widget.forceFocusRing,
      hitTestPadding: hitTestPadding,
      semanticsIdentifier: widget.testId?.trim().isNotEmpty == true
          ? widget.testId!.trim()
          : null,
      pressAnimationBuilder: (ctx, press) => buildChrome(press),
    );

    if (state.contained && widget.fullWidth) {
      body = SizedBox(width: double.infinity, child: body);
    }

    final dataKey = state.dataAttrs.entries
        .map((e) => '${e.key}=${e.value}')
        .join(';');

    final mergedSemanticsHint = () {
      final hints = <String>[];
      final custom = a11y.hint?.trim();
      if (custom != null && custom.isNotEmpty) hints.add(custom);
      if (a11y.busy) hints.add('Loading');
      if (hints.isEmpty) return null;
      return hints.join('. ');
    }();

    Widget result = Semantics(
      button: true,
      toggled: a11y.selected,
      enabled: a11y.enabled,
      label: a11y.label,
      hint: mergedSemanticsHint,
      identifier: widget.testId?.trim().isNotEmpty == true
          ? widget.testId!.trim()
          : null,
      onTap: state.isDisabled ? null : _toggle,
      child: KeyedSubtree(
        key: ValueKey<String>('sb:$dataKey:sel=$_isSelected'),
        child: OneUiSlotParentAppearanceScope(
          appearance: state.resolvedAppearance,
          child: ExcludeSemantics(child: body),
        ),
      ),
    );

    final tid = widget.testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      result = KeyedSubtree(key: ValueKey(tid), child: result);
    }

    return result;
  }
}
