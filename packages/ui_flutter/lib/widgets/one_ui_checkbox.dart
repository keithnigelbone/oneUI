import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import '../engine/checkbox_color_resolve.dart';
import '../engine/checkbox_indicator_motion_resolve.dart';
import '../engine/checkbox_size_resolve.dart';
import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import '../engine/text_color_resolve.dart';
import '../brand/one_ui_brand_scope.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../utils/touch_target_a11y.dart';
import '../engine/surface_engine.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_checkbox_a11y.dart';
import 'one_ui_checkbox_group_scope.dart';
import 'one_ui_checkbox_types.dart';
import 'semantic_icon_material.dart';
import 'one_ui_text_types.dart';

export 'one_ui_checkbox_types.dart';
export 'one_ui_checkbox_a11y.dart';

typedef OneUiCheckboxChange = void Function(bool checked);

/// Token-backed checkbox — `Checkbox.tsx` / `Checkbox.native.tsx`.
class OneUiCheckbox extends StatefulWidget {
  const OneUiCheckbox({
    super.key,
    this.label,
    this.description,
    this.value = '',
    this.size = '',
    this.appearance = 'auto',

    /// @deprecated Ignored at runtime — use [appearance].
    String? accent,
    this.disabled = false,
    this.readOnly = false,
    this.checked,
    this.defaultChecked,
    this.selected,
    this.defaultSelected,
    this.indeterminate = false,
    this.onCheckedChange,
    this.onSelectedChange,
    this.onPress,
    this.errorHighlight = false,
    this.labelSuffixInside,
    this.labelTrailing,
    this.semanticsLabel,
    this.ariaLabel,
    this.accessibilityLabel,
    String? semanticsHint,
    String? accessibilityHint,
    this.ariaLabelledBy,
    this.ariaDescribedby,
    this.ariaInvalid,
    this.ariaHidden,
    this.required = false,
    this.autofocus = false,
    this.forceFocusRing = false,
    this.suppressTapScale = false,
    String? testId,
    String? testID,
  })  : semanticsHint = semanticsHint ?? accessibilityHint,
        testId = testId ?? testID;

  final String? label;
  final String? description;
  final String value;
  final OneUiCheckboxSize size;
  final OneUiCheckboxAppearance appearance;
  final bool disabled;
  final bool readOnly;
  final bool? checked;
  final bool? defaultChecked;
  final bool? selected;
  final bool? defaultSelected;
  final bool indeterminate;
  final OneUiCheckboxChange? onCheckedChange;
  final OneUiCheckboxChange? onSelectedChange;
  final VoidCallback? onPress;
  final bool errorHighlight;
  final Widget? labelSuffixInside;
  final Widget? labelTrailing;
  final String? semanticsLabel;
  final String? ariaLabel;
  final String? accessibilityLabel;
  final String? semanticsHint;
  final String? ariaLabelledBy;
  final String? ariaDescribedby;
  final Object? ariaInvalid;
  final bool? ariaHidden;
  final bool required;
  final bool autofocus;
  final bool forceFocusRing;
  final bool suppressTapScale;
  final String? testId;

  @override
  State<OneUiCheckbox> createState() => _OneUiCheckboxState();
}

class _OneUiCheckboxState extends State<OneUiCheckbox>
    with SingleTickerProviderStateMixin {
  late bool _uncontrolledChecked;
  bool _pressed = false;
  bool _hovered = false;
  late final AnimationController _pressScale;
  late final Animation<double> _scaleAnim;
  late final FocusNode _focusNode;
  int? _appliedPressInMs;
  int? _appliedPressOutMs;

  static const double _kCheckboxPressScale = 1.07;

  @override
  void initState() {
    super.initState();
    _uncontrolledChecked = _resolveDefaultChecked();
    _pressScale = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
      reverseDuration: const Duration(milliseconds: 450),
    );
    _scaleAnim = Tween<double>(begin: 1, end: _kCheckboxPressScale).animate(
      CurvedAnimation(parent: _pressScale, curve: Curves.easeOutCubic),
    );
    _focusNode = FocusNode();
  }

  /// Web `Checkbox.module.css`: transform press-in M, release L.
  /// Never mutate the controller synchronously inside [build] — that can
  /// restart implicit animations and read as hover flicker on web.
  void _schedulePressScaleMotion(CheckboxIndicatorMotionSpec motion) {
    final pressInMs = motion.rotationDurationMs;
    final pressOutMs = motion.scaleDurationMs;
    if (_appliedPressInMs == pressInMs && _appliedPressOutMs == pressOutMs) {
      return;
    }
    _appliedPressInMs = pressInMs;
    _appliedPressOutMs = pressOutMs;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final pressIn = Duration(milliseconds: pressInMs);
      final pressOut = Duration(milliseconds: pressOutMs);
      if (_pressScale.duration != pressIn) {
        _pressScale.duration = pressIn;
      }
      if (_pressScale.reverseDuration != pressOut) {
        _pressScale.reverseDuration = pressOut;
      }
    });
  }

  void _setHovered(bool value) {
    if (_hovered == value) return;
    setState(() => _hovered = value);
  }

  bool _resolveDefaultChecked() {
    if (widget.defaultChecked != null) return widget.defaultChecked!;
    if (widget.defaultSelected != null) return widget.defaultSelected!;
    return false;
  }

  bool? get _controlledChecked => widget.checked ?? widget.selected;

  @override
  void dispose() {
    _pressScale.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(OneUiCheckbox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_controlledChecked == null) {
      final nextDefault = _resolveDefaultChecked();
      if (oldWidget.defaultChecked != widget.defaultChecked ||
          oldWidget.defaultSelected != widget.defaultSelected) {
        _uncontrolledChecked = nextDefault;
      }
    }
  }

  bool get _isChecked {
    final explicit = _controlledChecked;
    final group = OneUiCheckboxGroupScope.selectionOf(context);
    final optionValue = widget.value.trim();
    if (group != null && optionValue.isNotEmpty) {
      if (explicit != null) return explicit;
      return group.isSelected(optionValue);
    }
    return explicit ?? _uncontrolledChecked;
  }

  void _emitChange(bool next) {
    widget.onCheckedChange?.call(next);
    widget.onSelectedChange?.call(next);
  }

  void _handleTap() {
    final groupDefaults = OneUiCheckboxGroupScope.defaultsOf(context);
    final state = resolveOneUiCheckboxState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      indeterminate: widget.indeterminate,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );

    if (state.isDisabled || state.isReadOnly) return;

    widget.onPress?.call();

    final group = OneUiCheckboxGroupScope.selectionOf(context);
    if (group != null && widget.value.trim().isNotEmpty) {
      final option = widget.value.trim();
      final next = widget.indeterminate ? true : !_isChecked;
      group.toggleValue(option, next);
      _emitChange(next);
      return;
    }

    final next = widget.indeterminate ? true : !_isChecked;
    if (_controlledChecked == null) {
      setState(() => _uncontrolledChecked = next);
    }
    _emitChange(next);
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event, bool canTap) {
    if (!canTap) return KeyEventResult.ignored;
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    if (event.logicalKey != LogicalKeyboardKey.space &&
        event.logicalKey != LogicalKeyboardKey.enter) {
      return KeyEventResult.ignored;
    }
    _handleTap();
    if (!widget.suppressTapScale) {
      _pressScale.forward().then((_) {
        if (mounted) _pressScale.reverse();
      });
    }
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiBrandLoadState.maybeOf(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Checkbox without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final groupDefaults = OneUiCheckboxGroupScope.defaultsOf(context);
    final effectiveErrorHighlight =
        widget.errorHighlight || groupDefaults.errorHighlight;
    final state = resolveOneUiCheckboxState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      indeterminate: widget.indeterminate,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );

    final uncheckedAppearance = resolveOneUiCheckboxUncheckedAppearance(
      context,
      readOnly: state.isReadOnly,
    );
    final dataAttrs = oneUiCheckboxDataAttrs(
      resolvedSize: state.resolvedSize,
      resolvedAppearance: state.resolvedAppearance,
      uncheckedAppearance: uncheckedAppearance,
      isReadOnly: state.isReadOnly,
      isChecked: state.isChecked,
      isIndeterminate: state.isIndeterminate,
      isDisabled: state.isDisabled,
      errorHighlight: effectiveErrorHighlight,
    );

    final scope = OneUiScope.of(context);
    final metrics =
        resolveCheckboxMetrics(context, ds, size: state.resolvedSize);
    final touchTargetMin = resolveTouchTargetMinPx(
      ds,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: scope.nativeTypography,
    );
    final controlTouchSize = resolveControlTouchTargetSizePx(
      visualSizePx: metrics.boxSize,
      touchTargetMinPx: touchTargetMin,
      platformId: scope.platformId,
    );
    final paint = resolveCheckboxPaint(
      context,
      ds,
      state: state,
      pressed: _pressed,
      hovered: _hovered,
      roleAppearance: state.resolvedAppearance,
      uncheckedRoleAppearance: uncheckedAppearance,
    );

    final tapMotion = resolveOneUiTapMotionSpec(
      context,
      ds,
      sizeIsXs: state.resolvedSize == 's',
      fullWidthTapScale: false,
    );
    final indicatorMotion = resolveCheckboxIndicatorMotion(context, ds);
    final suppressIndicatorMotion =
        widget.suppressTapScale || indicatorMotion.reduceMotion;
    _schedulePressScaleMotion(indicatorMotion);
    final mq = MediaQuery.maybeOf(context);
    final animateColors = tapMotion.useDiscreteAnimation(mq);

    final disabledOpacity = () {
      final raw = ds.resolveCSSValue(
        ds.rawTokenValue('--Disabled-Opacity') ??
            ds.componentCustomProperties['--Disabled-Opacity'],
        platformId: OneUiScope.of(context).platformId,
        density: OneUiScope.of(context).density,
        platformsConfig: OneUiScope.of(context).platformsFoundationConfig,
      );
      return double.tryParse(raw ?? '') ?? 0.5;
    }();

    final a11y = resolveOneUiCheckboxSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      accessibilityLabel: widget.accessibilityLabel,
      label: widget.label,
      description: widget.description,
      semanticsHint: widget.semanticsHint,
      ariaLabelledBy: widget.ariaLabelledBy,
      ariaDescribedby: widget.ariaDescribedby,
      ariaInvalid: widget.ariaInvalid,
      ariaHidden: widget.ariaHidden,
      required: widget.required,
      errorHighlight: effectiveErrorHighlight,
      isChecked: state.isChecked,
      isIndeterminate: state.isIndeterminate,
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
    );

    final typo = OneUiScope.nativeTypographyOf(context);
    final labelTier = kCheckboxLabelBodySize[state.resolvedSize] ?? 'M';
    final labelColor = resolveOneUiTextColor(
      context,
      appearance: 'neutral',
      attention: OneUiTextAttention.high,
    );
    final descriptionColor = resolveOneUiTextColor(
      context,
      appearance: 'neutral',
      attention: OneUiTextAttention.medium,
    );
    final labelStyle =
        typo?.emphasisStyle('body', labelTier, emphasis: 'low') ??
            Theme.of(context).textTheme.bodyMedium;
    final descriptionStyle =
        typo?.emphasisStyle('body', 'S', emphasis: 'low') ??
            Theme.of(context).textTheme.bodySmall;

    final boxRadius = BorderRadius.circular(metrics.boxBorderRadius);

    OneUiFocusRingSpec? focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: 'informative',
    );
    if (focusRing != null) {
      final informative =
          OneUiSurfaceScope.tokensForAppearance(context, 'informative');
      final informativeBold = informative.surfaces[kSurfaceBold];
      if (informativeBold != null) {
        final outer = oneUiHexColor(informativeBold);
        focusRing = OneUiFocusRingSpec(
          strokeXlPx: focusRing.strokeXlPx,
          outlineWidthPx: focusRing.outlineWidthPx,
          outerShadowSpreadPx: focusRing.outerShadowSpreadPx,
          outerShadowColor: outer,
          innerGapShadowSpreadPx: focusRing.innerGapShadowSpreadPx,
          innerGapShadowColor: focusRing.innerGapShadowColor,
        );
      }
    }

    Widget control = Focus(
      focusNode: _focusNode,
      autofocus: widget.autofocus,
      canRequestFocus: !state.isDisabled,
      onFocusChange: (_) => setState(() {}),
      onKeyEvent: (node, event) => _handleKeyEvent(node, event, a11y.canTap),
      child: Builder(
        builder: (context) {
          final showFocusRing =
              widget.forceFocusRing || Focus.of(context).hasFocus;
          final shadows =
              showFocusRing && focusRing != null ? focusRing.boxShadows : null;

          return ScaleTransition(
            scale: widget.suppressTapScale
                ? const AlwaysStoppedAnimation<double>(1)
                : _scaleAnim,
            child: AnimatedContainer(
              duration: animateColors
                  ? Duration(milliseconds: tapMotion.durationMs)
                  : Duration.zero,
              curve: tapMotion.curve,
              clipBehavior: Clip.antiAlias,
              width: metrics.boxSize,
              height: metrics.boxSize,
              decoration: BoxDecoration(
                color: _pressed
                    ? paint.pressedBackgroundColor
                    : paint.backgroundColor,
                borderRadius: boxRadius,
                border: Border.all(
                  color: paint.borderColor,
                  width: paint.borderWidth,
                ),
                boxShadow: shadows,
              ),
              alignment: Alignment.center,
              child: KeyedSubtree(
                key: ValueKey<String>(
                  'cb-glyph-${state.isChecked}-${state.isIndeterminate}',
                ),
                child: _CheckboxGlyphIndicator(
                  isChecked: state.isChecked,
                  isIndeterminate: state.isIndeterminate,
                  iconSize: metrics.iconSize,
                  boxSize: metrics.boxSize,
                  color: paint.indicatorColor,
                  motion: indicatorMotion,
                  suppressMotion: suppressIndicatorMotion,
                ),
              ),
            ),
          );
        },
      ),
    );

    final visualControl = control;

    final mouseCursor = state.isDisabled
        ? SystemMouseCursors.forbidden
        : state.isReadOnly || !a11y.canTap
            ? SystemMouseCursors.basic
            : SystemMouseCursors.click;

    // Hover on the box only (web `.checkbox:hover`). Cursor lives on the row
    // [MouseRegion] below — a second cursor region on the control caused
    // spurious exit/enter + rebuild flicker on Flutter web.
    Widget buildControl(double layoutSide) {
      var box = visualControl;
      if (layoutSide > metrics.boxSize) {
        box = SizedBox(
          width: layoutSide,
          height: layoutSide,
          child: Center(child: visualControl),
        );
      }
      return MouseRegion(
        onEnter: state.isDisabled ? null : (_) => _setHovered(true),
        onExit: (_) => _setHovered(false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: state.isDisabled
              ? null
              : (_) {
                  setState(() => _pressed = true);
                  if (!widget.suppressTapScale) {
                    _pressScale.forward();
                  }
                },
          onTapUp: state.isDisabled
              ? null
              : (_) {
                  setState(() => _pressed = false);
                  if (!widget.suppressTapScale) {
                    _pressScale.reverse();
                  }
                },
          onTapCancel: state.isDisabled
              ? null
              : () {
                  setState(() => _pressed = false);
                  if (!widget.suppressTapScale) {
                    _pressScale.reverse();
                  }
                },
          onTap: a11y.canTap ? _handleTap : null,
          child: box,
        ),
      );
    }

    final labelText = widget.label;
    final hasLabel = labelText != null && labelText.isNotEmpty;
    final hasDescription =
        widget.description != null && widget.description!.trim().isNotEmpty;
    final hasTextColumn = hasLabel || hasDescription;

    final explicitA11yLabel = () {
      for (final candidate in [
        widget.semanticsLabel,
        widget.ariaLabel,
        widget.accessibilityLabel,
      ]) {
        if (candidate != null && candidate.trim().isNotEmpty) {
          return candidate.trim();
        }
      }
      return null;
    }();

    Widget visibleCopy(Widget child) {
      if (explicitA11yLabel != null) {
        return ExcludeSemantics(child: child);
      }
      return child;
    }

    Widget? textColumn;
    if (hasTextColumn) {
      if (hasLabel) {
        textColumn = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: visibleCopy(
                    Text(
                      labelText,
                      style: labelStyle?.copyWith(color: labelColor, height: 1),
                    ),
                  ),
                ),
                if (widget.labelSuffixInside != null) widget.labelSuffixInside!,
              ],
            ),
            if (hasDescription)
              Padding(
                padding: EdgeInsets.only(top: metrics.labelGap),
                child: visibleCopy(
                  Text(
                    widget.description!,
                    style: descriptionStyle?.copyWith(
                      color: descriptionColor,
                      height: 1,
                    ),
                  ),
                ),
              ),
          ],
        );
      } else {
        // Web: description in label slot when label is omitted.
        textColumn = visibleCopy(
          Text(
            widget.description!,
            style: labelStyle?.copyWith(color: labelColor, height: 1),
          ),
        );
      }
    }

    final describedByNodes = oneUiParseAriaDescribedByNodeIds(a11y.describedBy);
    final tid = widget.testId?.trim();
    final isMixed = a11y.checked == 'mixed';
    final isCheckedSemantics = a11y.checked == true;

    Widget buildRow(BoxConstraints constraints) {
      final layoutSide = resolveCheckboxControlLayoutSide(
        constraints: constraints,
        controlTouchSize: controlTouchSize,
        visualBoxSize: metrics.boxSize,
      );

      Widget row = Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: hasDescription
            ? CrossAxisAlignment.start
            : CrossAxisAlignment.center,
        spacing: metrics.labelGap,
        children: [
          buildControl(layoutSide),
          if (textColumn != null) Flexible(child: textColumn),
          if (widget.labelTrailing != null) widget.labelTrailing!,
        ],
      );

      row = KeyedSubtree(
        key: ValueKey<String>(oneUiCheckboxDataPayloadKey(dataAttrs)),
        child: row,
      );

      row = a11y.hidden
          ? ExcludeSemantics(child: row)
          : MouseRegion(
              cursor: mouseCursor,
              child: Semantics(
                identifier: tid != null && tid.isNotEmpty ? tid : null,
                checked: isMixed ? false : isCheckedSemantics,
                mixed: isMixed ? true : null,
                enabled: !state.isDisabled,
                readOnly: state.isReadOnly ? true : null,
                isRequired: a11y.isRequired ? true : null,
                label: a11y.label.isEmpty ? null : a11y.label,
                hint: a11y.hint,
                validationResult: a11y.isInvalid
                    ? SemanticsValidationResult.invalid
                    : SemanticsValidationResult.none,
                controlsNodes: describedByNodes,
                onTap: a11y.canTap ? _handleTap : null,
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: a11y.canTap ? _handleTap : null,
                  child: row,
                ),
              ),
            );

      if (tid != null && tid.isNotEmpty) {
        row = KeyedSubtree(key: ValueKey(tid), child: row);
      }

      return Opacity(
        opacity: state.isDisabled && !state.isReadOnly ? disabledOpacity : 1,
        child: row,
      );
    }

    return LayoutBuilder(
        builder: (context, constraints) => buildRow(constraints));
  }
}

/// Check / minus stack — web `Checkbox.module.css` indicator + crossfade.
class _CheckboxGlyphIndicator extends StatelessWidget {
  const _CheckboxGlyphIndicator({
    required this.isChecked,
    required this.isIndeterminate,
    required this.iconSize,
    required this.boxSize,
    required this.color,
    required this.motion,
    required this.suppressMotion,
  });

  final bool isChecked;
  final bool isIndeterminate;
  final double iconSize;
  final double boxSize;
  final Color color;
  final CheckboxIndicatorMotionSpec motion;
  final bool suppressMotion;

  bool get _filled => isChecked || isIndeterminate;

  double get _burstScale =>
      iconSize > 0 ? (boxSize / iconSize).clamp(1.0, 2.5) : 1.33;

  @override
  Widget build(BuildContext context) {
    final scaleDuration = Duration(milliseconds: motion.scaleDurationMs);
    final opacityDuration = Duration(milliseconds: motion.opacityDurationMs);
    final opacityOutDuration =
        opacityDuration + Duration(milliseconds: motion.opacityDelayMs);
    final rotationDuration = Duration(milliseconds: motion.rotationDurationMs);
    final curve = motion.curve;

    Widget glyphIcon(String name) {
      return OneUiSemanticIcon(
        name,
        size: iconSize,
        color: color,
        semanticLabel: '',
      );
    }

    final icons = SizedBox(
      width: iconSize,
      height: iconSize,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (suppressMotion) ...[
            Opacity(
              opacity: isChecked && !isIndeterminate && _filled ? 1 : 0,
              child: glyphIcon('check'),
            ),
            Opacity(
              opacity: isIndeterminate && _filled ? 1 : 0,
              child: glyphIcon('remove'),
            ),
          ] else ...[
            AnimatedOpacity(
              opacity: isChecked && !isIndeterminate ? 1 : 0,
              duration: isIndeterminate ? rotationDuration : opacityDuration,
              curve: curve,
              child: AnimatedRotation(
                turns: isIndeterminate ? 0.125 : 0,
                duration: rotationDuration,
                curve: curve,
                child: glyphIcon('check'),
              ),
            ),
            AnimatedOpacity(
              opacity: isIndeterminate ? 1 : 0,
              duration: isIndeterminate ? rotationDuration : opacityDuration,
              curve: curve,
              child: AnimatedRotation(
                turns: isIndeterminate ? 0 : -0.125,
                duration: rotationDuration,
                curve: curve,
                child: glyphIcon('remove'),
              ),
            ),
          ],
        ],
      ),
    );

    if (suppressMotion) {
      return Transform.scale(
        scale: _filled ? 1 : _burstScale,
        child: Opacity(opacity: _filled ? 1 : 0, child: icons),
      );
    }

    return AnimatedScale(
      scale: _filled ? 1 : _burstScale,
      duration: scaleDuration,
      curve: curve,
      child: AnimatedOpacity(
        opacity: _filled ? 1 : 0,
        duration: _filled ? opacityDuration : opacityOutDuration,
        curve: curve,
        child: icons,
      ),
    );
  }
}
