import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import '../engine/radio_color_resolve.dart';
import '../engine/radio_indicator_motion_resolve.dart';
import '../engine/radio_size_resolve.dart';
import '../engine/text_color_resolve.dart';
import '../widgets/one_ui_text_types.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../utils/touch_target_a11y.dart';
import '../engine/surface_engine.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_radio_a11y.dart';
import 'one_ui_radio_group_focus.dart';
import 'one_ui_radio_group_scope.dart';
import 'one_ui_radio_types.dart';

export 'one_ui_radio_types.dart';
export 'one_ui_radio_a11y.dart';

typedef OneUiRadioChange = void Function(bool checked);

/// Token-backed radio — `Radio.tsx` / `Radio.native.tsx`.
class OneUiRadio extends StatefulWidget {
  const OneUiRadio({
    super.key,
    this.child,
    this.label,
    this.description,
    this.value = '',
    this.size = 'm',
    this.appearance = 'auto',

    /// @deprecated Ignored at runtime — use [appearance].
    String? accent,
    this.disabled = false,
    this.readOnly = false,
    this.checked,
    this.defaultChecked = false,
    this.onChange,
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

  final Object? child;
  final String? label;
  final String? description;
  final String value;
  final OneUiRadioSize size;
  final OneUiRadioAppearance appearance;
  final bool disabled;
  final bool readOnly;
  final bool? checked;
  final bool defaultChecked;
  final OneUiRadioChange? onChange;
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

  /// Storybook parity with web `[data-force-state="focus"]` — Informative focus halo.
  final bool forceFocusRing;

  /// Motion story “Subtle motion” — disables press scale (web reduced-motion).
  final bool suppressTapScale;
  final String? testId;

  @override
  State<OneUiRadio> createState() => _OneUiRadioState();
}

class _OneUiRadioState extends State<OneUiRadio>
    with SingleTickerProviderStateMixin {
  late bool _uncontrolledChecked;
  bool _pressed = false;
  bool _hovered = false;
  late final AnimationController _pressScale;
  late final Animation<double> _scaleAnim;
  late final FocusNode _focusNode;
  OneUiRadioGroupFocusController? _groupFocus;

  @override
  void initState() {
    super.initState();
    _uncontrolledChecked = widget.defaultChecked;
    _pressScale = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
      reverseDuration: const Duration(milliseconds: 300),
    );
    _scaleAnim = Tween<double>(begin: 1, end: 1.07).animate(
      CurvedAnimation(parent: _pressScale, curve: Curves.easeOut),
    );
    _focusNode = FocusNode();
  }

  @override
  void didUpdateWidget(OneUiRadio oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.checked == null &&
        oldWidget.defaultChecked != widget.defaultChecked) {
      _uncontrolledChecked = widget.defaultChecked;
    }
    _syncGroupFocusRegistration();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncGroupFocusRegistration();
  }

  void _syncGroupFocusRegistration() {
    final registry = OneUiRadioGroupFocusScope.maybeOf(context);
    if (_groupFocus == registry) {
      _updateGroupFocusEntry();
      return;
    }
    _groupFocus?.unregister(_focusNode);
    _groupFocus = registry;
    _updateGroupFocusEntry();
  }

  void _updateGroupFocusEntry() {
    final registry = _groupFocus;
    if (registry == null) return;
    final group = OneUiRadioGroupScope.selectionOf(context);
    final groupDefaults = OneUiRadioGroupScope.defaultsOf(context);
    final state = resolveOneUiRadioState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );
    final optionValue = widget.value.trim();
    registry.register(
      node: _focusNode,
      value: optionValue,
      canSelect: !state.isDisabled &&
          !state.isReadOnly &&
          group != null &&
          optionValue.isNotEmpty,
      onSelect: _selectInGroup,
    );
  }

  void _selectInGroup() {
    final group = OneUiRadioGroupScope.selectionOf(context);
    final optionValue = widget.value.trim();
    if (group == null || optionValue.isEmpty) return;
    final groupDefaults = OneUiRadioGroupScope.defaultsOf(context);
    final state = resolveOneUiRadioState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );
    if (state.isDisabled || state.isReadOnly) return;
    widget.onPress?.call();
    if (!_isChecked) {
      group.selectValue(optionValue);
      widget.onChange?.call(true);
    }
  }

  @override
  void dispose() {
    _groupFocus?.unregister(_focusNode);
    _pressScale.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  bool get _isChecked {
    final group = OneUiRadioGroupScope.selectionOf(context);
    final optionValue = widget.value.trim();
    if (group != null && optionValue.isNotEmpty) {
      return group.isSelected(optionValue);
    }
    return widget.checked ?? _uncontrolledChecked;
  }

  void _handleTap() {
    final group = OneUiRadioGroupScope.selectionOf(context);
    final groupDefaults = OneUiRadioGroupScope.defaultsOf(context);
    final state = resolveOneUiRadioState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );

    if (state.isDisabled || state.isReadOnly) return;

    widget.onPress?.call();

    if (group != null && widget.value.trim().isNotEmpty) {
      final option = widget.value.trim();
      if (_isChecked && group.deselectOnReselect) {
        group.selectValue('');
        widget.onChange?.call(false);
      } else if (!_isChecked) {
        group.selectValue(option);
        widget.onChange?.call(true);
      }
      return;
    }

    final next = !_isChecked;
    if (widget.checked == null) {
      setState(() => _uncontrolledChecked = next);
    }
    widget.onChange?.call(next);
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
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Radio without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final groupDefaults = OneUiRadioGroupScope.defaultsOf(context);
    final state = resolveOneUiRadioState(
      size: widget.size,
      appearance: widget.appearance,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      isChecked: _isChecked,
      groupSize: groupDefaults.size,
      groupAppearance: groupDefaults.appearance,
      groupDisabled: groupDefaults.disabled,
      groupReadOnly: groupDefaults.readOnly,
    );

    final uncheckedAppearance = resolveOneUiRadioUncheckedAppearance(
      context,
      readOnly: state.isReadOnly,
    );
    final dataAttrs = oneUiRadioDataAttrs(
      resolvedSize: state.resolvedSize,
      resolvedAppearance: state.resolvedAppearance,
      isReadOnly: state.isReadOnly,
      isChecked: state.isChecked,
      uncheckedAppearance: uncheckedAppearance,
      isDisabled: state.isDisabled,
      errorHighlight: widget.errorHighlight,
    );

    final metrics = resolveRadioMetrics(context, ds, size: state.resolvedSize);
    final scope = OneUiScope.of(context);
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
    final paint = resolveRadioPaint(
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
    final indicatorMotion = resolveRadioIndicatorMotion(context, ds);
    final suppressIndicatorMotion =
        widget.suppressTapScale || indicatorMotion.reduceMotion;
    final mq = MediaQuery.maybeOf(context);
    final animateColors = tapMotion.useDiscreteAnimation(mq);
    final innerDotFits = metrics.dotSize >= 1 &&
        metrics.dotSize < metrics.boxSize - metrics.borderWidth * 2;
    final dotContrastsFill = paint.backgroundColor.toARGB32() !=
            paint.indicatorColor.toARGB32() &&
        ((paint.backgroundColor.red - paint.indicatorColor.red).abs() +
                (paint.backgroundColor.green - paint.indicatorColor.green)
                    .abs() +
                (paint.backgroundColor.blue - paint.indicatorColor.blue).abs() >
            24);
    // Read-only checked mirrors web/RN: `--_rd-default-high` fill + inner
    // indicator (`--_rd-bold-high`). Do not suppress the dot for readOnly.
    final showInnerDot = state.isChecked &&
        innerDotFits &&
        (state.isReadOnly || dotContrastsFill);

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

    final a11y = resolveOneUiRadioSemantics(
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      accessibilityLabel: widget.accessibilityLabel,
      label: widget.label,
      child: widget.child,
      semanticsHint: widget.semanticsHint,
      ariaLabelledBy: widget.ariaLabelledBy,
      ariaDescribedby: widget.ariaDescribedby,
      ariaInvalid: widget.ariaInvalid,
      ariaHidden: widget.ariaHidden,
      required: widget.required,
      isChecked: state.isChecked,
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
    );
    _updateGroupFocusEntry();

    final typo = OneUiScope.nativeTypographyOf(context);
    final labelTier = kRadioLabelBodySize[state.resolvedSize] ?? 'M';
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
    final dotRadius = BorderRadius.circular(metrics.dotBorderRadius);

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
              child: showInnerDot
                  ? _RadioKnobIndicator(
                      key: ValueKey(
                        'knob-${state.isChecked}-${paint.indicatorColor.toARGB32()}',
                      ),
                      checked: state.isChecked,
                      dotSize: metrics.dotSize,
                      dotRadius: dotRadius,
                      color: paint.indicatorColor,
                      motion: indicatorMotion,
                      suppressMotion: suppressIndicatorMotion,
                      animateColors: animateColors,
                      colorDurationMs: tapMotion.durationMs,
                      colorCurve: tapMotion.curve,
                    )
                  : null,
            ),
          );
        },
      ),
    );

    final visualControl = control;

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
        onEnter:
            state.isDisabled ? null : (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
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

    final labelText = widget.label ??
        (widget.child is String ? widget.child as String : null);
    final hasDescription =
        widget.description != null && widget.description!.trim().isNotEmpty;

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
          if (labelText != null && labelText.isNotEmpty)
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          labelText,
                          style: labelStyle?.copyWith(
                            color: labelColor,
                            height: 1,
                          ),
                        ),
                      ),
                      if (widget.labelSuffixInside != null)
                        widget.labelSuffixInside!,
                    ],
                  ),
                  if (hasDescription)
                    Padding(
                      padding: EdgeInsets.only(top: metrics.labelGap),
                      child: Text(
                        widget.description!,
                        style: descriptionStyle?.copyWith(
                          color: descriptionColor,
                          height: 1,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          if (widget.labelTrailing != null) widget.labelTrailing!,
        ],
      );

      final describedByNodes =
          oneUiParseAriaDescribedByNodeIds(a11y.describedBy);
      final inRadioGroup = OneUiRadioGroupScope.selectionOf(context) != null;
      final tid = widget.testId?.trim();

      row = KeyedSubtree(
        key: ValueKey<String>(oneUiRadioDataPayloadKey(dataAttrs)),
        child: row,
      );

      row = a11y.hidden
          ? ExcludeSemantics(child: row)
          : Semantics(
              identifier: tid != null && tid.isNotEmpty ? tid : null,
              checked: state.isChecked,
              inMutuallyExclusiveGroup: inRadioGroup ? true : null,
              enabled: !state.isDisabled,
              isRequired: a11y.isRequired ? true : null,
              label: a11y.label,
              hint: a11y.hint,
              controlsNodes: describedByNodes,
              onTap: a11y.canTap ? _handleTap : null,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: a11y.canTap ? _handleTap : null,
                child: row,
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
      builder: (context, constraints) => buildRow(constraints),
    );
  }
}

/// Inner dot — web `.indicator` scale (2→1) + opacity on check/uncheck.
class _RadioKnobIndicator extends StatelessWidget {
  const _RadioKnobIndicator({
    required this.checked,
    required this.dotSize,
    required this.dotRadius,
    required this.color,
    required this.motion,
    required this.suppressMotion,
    required this.animateColors,
    required this.colorDurationMs,
    required this.colorCurve,
    super.key,
  });

  final bool checked;
  final double dotSize;
  final BorderRadius dotRadius;
  final Color color;
  final RadioIndicatorMotionSpec motion;
  final bool suppressMotion;
  final bool animateColors;
  final int colorDurationMs;
  final Curve colorCurve;

  @override
  Widget build(BuildContext context) {
    final dot = AnimatedContainer(
      duration: animateColors
          ? Duration(milliseconds: colorDurationMs)
          : Duration.zero,
      curve: colorCurve,
      width: dotSize,
      height: dotSize,
      decoration: BoxDecoration(
        color: color,
        borderRadius: dotRadius,
      ),
    );

    if (suppressMotion) {
      return Opacity(
        opacity: checked ? 1 : 0,
        child: Transform.scale(scale: checked ? 1 : 2, child: dot),
      );
    }

    final scaleDuration = Duration(milliseconds: motion.scaleDurationMs);
    final opacityDuration = Duration(milliseconds: motion.opacityDurationMs);

    return TweenAnimationBuilder<double>(
      key: ValueKey<bool>(checked),
      tween: Tween(
        begin: checked ? 2.0 : 1.0,
        end: checked ? 1.0 : 2.0,
      ),
      duration: scaleDuration,
      curve: motion.curve,
      builder: (context, scale, child) {
        return TweenAnimationBuilder<double>(
          tween: Tween(
            begin: checked ? 0.0 : 1.0,
            end: checked ? 1.0 : 0.0,
          ),
          duration: checked
              ? opacityDuration
              : opacityDuration + Duration(milliseconds: motion.opacityDelayMs),
          curve: motion.curve,
          builder: (context, opacity, inner) {
            return Transform.scale(
              scale: scale,
              child: Opacity(
                opacity: opacity.clamp(0.0, 1.0),
                child: inner,
              ),
            );
          },
          child: child,
        );
      },
      child: dot,
    );
  }
}
