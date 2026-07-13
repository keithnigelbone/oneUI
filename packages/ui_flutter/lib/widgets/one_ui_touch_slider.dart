import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/badge_slot_context.dart';
import '../engine/touch_slider_cap_ratio.dart';
import '../engine/touch_slider_color_resolve.dart';
import '../engine/touch_slider_motion_resolve.dart';
import '../engine/touch_slider_size_resolve.dart';
import '../engine/slider_value_math.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_touch_slider_a11y.dart';
import 'one_ui_touch_slider_types.dart';

export 'one_ui_touch_slider_types.dart';
export 'one_ui_touch_slider_a11y.dart';

typedef OneUiTouchSliderChange = void Function(double value);

/// Chunky fingertip-friendly slider — `TouchSlider.tsx`.
class OneUiTouchSlider extends StatefulWidget {
  const OneUiTouchSlider({
    super.key,
    this.value,
    this.defaultValue = 0,
    this.onValueChange,
    this.onValueCommitted,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.largeStep = 10,
    this.appearance = 'auto',
    this.orientation = 'horizontal',
    this.progressStyle = 'rounded',
    this.start,
    this.disabled = false,
    this.readOnly = false,
    this.semanticsLabel,
    this.ariaLabel,
    this.forceFocusRing = false,
    this.testId,
  });

  final double? value;
  final double defaultValue;
  final OneUiTouchSliderChange? onValueChange;
  final OneUiTouchSliderChange? onValueCommitted;
  final double min;
  final double max;
  final double step;
  final double largeStep;
  final OneUiTouchSliderAppearance appearance;
  final OneUiTouchSliderOrientation orientation;
  final OneUiTouchSliderProgressStyle progressStyle;
  final Widget? start;
  final bool disabled;
  final bool readOnly;
  final String? semanticsLabel;
  final String? ariaLabel;
  final bool forceFocusRing;
  final String? testId;

  @override
  State<OneUiTouchSlider> createState() => _OneUiTouchSliderState();
}

class _OneUiTouchSliderState extends State<OneUiTouchSlider> {
  late double _internalValue;
  bool _dragging = false;
  final FocusNode _focusNode = FocusNode();
  final GlobalKey _trackKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _internalValue = widget.value ?? widget.defaultValue;
  }

  @override
  void didUpdateWidget(OneUiTouchSlider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != null) {
      _internalValue = widget.value!;
    }
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  double get _currentValue => widget.value ?? _internalValue;

  void _setValue(double next, {bool commit = false}) {
    if (widget.readOnly || widget.disabled) return;
    final snapped = snapSliderValue(next, widget.min, widget.max, widget.step);
    if (widget.value == null) {
      setState(() => _internalValue = snapped);
    } else {
      setState(() {});
    }
    widget.onValueChange?.call(snapped);
    if (commit) widget.onValueCommitted?.call(snapped);
  }

  void _nudge({required bool increase, bool page = false}) {
    final delta = touchSliderKeyboardStep(
      page: page,
      step: widget.step,
      largeStep: widget.largeStep,
    );
    _setValue(_currentValue + (increase ? delta : -delta), commit: true);
  }

  double _valueFromLocal(Offset local, Size size, bool vertical) {
    final fraction = vertical
        ? (1 - (local.dy / size.height)).clamp(0.0, 1.0)
        : (local.dx / size.width).clamp(0.0, 1.0);
    return fractionToValue(fraction, widget.min, widget.max, step: widget.step);
  }

  void _updateFromPointer(Offset local, Size trackSize, bool vertical) {
    _setValue(_valueFromLocal(local, trackSize, vertical));
  }

  Size? _trackHitSize() {
    final box = _trackKey.currentContext?.findRenderObject() as RenderBox?;
    return box?.size;
  }

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiMissingDesignSystemPlaceholder();
    }
    final surface = OneUiSurfaceScope.maybeOf(context);
    final state = resolveOneUiTouchSliderState(
      value: _currentValue,
      min: widget.min,
      max: widget.max,
      appearance: widget.appearance,
      orientation: widget.orientation,
      progressStyle: widget.progressStyle,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      surface: surface,
    );
    final layout = resolveTouchSliderLayout(context, ds);
    final colors = resolveTouchSliderColors(
      context,
      ds,
      appearance: state.resolvedAppearance,
    );
    final motion = resolveTouchSliderMotion(context, ds);
    final capRatio = computeTouchSliderCapRatio(
      layout.trackLengthPx,
      layout.thicknessPx,
    );
    final startOnRail = widget.start != null &&
        isTouchSliderStartSlotOnRail(
          state.fillRatio,
          capRatio,
          state.progressStyle,
        );
    final slotColor = resolveTouchSliderStartSlotColor(
      colors: colors,
      startOnRail: startOnRail,
      fillRatio: state.fillRatio,
      progressStyle: state.progressStyle,
    );

    final semantics = resolveOneUiTouchSliderSemantics(
      state: state,
      min: widget.min,
      max: widget.max,
      step: widget.step,
      largeStep: widget.largeStep,
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
    );

    final focusRing = resolveOneUiFocusRingSpec(
      context,
      ds,
      semanticAppearanceFallback: 'informative',
    );

    final trackLength = layout.trackLengthPx;
    final thickness = layout.thicknessPx;
    final controlSize = state.isVertical
        ? Size(thickness, trackLength)
        : Size(trackLength, thickness);

    final fillDuration = _dragging
        ? Duration.zero
        : Duration(milliseconds: motion.fillDurationMs);

    Widget buildTrackStack(double actualTrackLength, double actualThickness) {
      final pillRadius = layout.borderRadiusPx.clamp(0.0, actualThickness / 2);
      final trailRadius = state.progressStyle == 'sharp' ? 0.0 : pillRadius;

      // RN / Figma — fill grows from the leading cap; trailing edge is a pill
      // cap (rounded) or flat cut (sharp) at the value boundary.
      final fillExtent = touchSliderFillExtentPx(
        fillRatio: state.fillRatio,
        thickness: actualThickness,
        trackLength: actualTrackLength,
        progressStyle: state.progressStyle,
        hasStartSlot: widget.start != null,
      );

      final fillDecoration = BoxDecoration(
        color: colors.fill,
        borderRadius: state.isVertical
            ? BorderRadius.only(
                bottomLeft: Radius.circular(pillRadius),
                bottomRight: Radius.circular(pillRadius),
                topLeft: Radius.circular(trailRadius),
                topRight: Radius.circular(trailRadius),
              )
            : BorderRadius.only(
                topLeft: Radius.circular(pillRadius),
                bottomLeft: Radius.circular(pillRadius),
                topRight: Radius.circular(trailRadius),
                bottomRight: Radius.circular(trailRadius),
              ),
      );

      return Stack(
        clipBehavior: Clip.hardEdge,
        children: [
          Positioned.fill(
            child: ColoredBox(color: colors.rail),
          ),
          if (fillExtent > 0)
            AnimatedPositioned(
              key: const ValueKey<String>('touch-slider-fill'),
              duration: fillDuration,
              curve: motion.fillCurve,
              left: 0,
              top: state.isVertical
                  ? actualTrackLength - fillExtent
                  : 0,
              width: state.isVertical ? actualThickness : fillExtent,
              height: state.isVertical ? fillExtent : actualThickness,
              child: DecoratedBox(decoration: fillDecoration),
            ),
          if (widget.start != null)
            Positioned(
              left: state.isVertical
                  ? (actualThickness - layout.slotSizePx) / 2
                  : actualThickness / 2 - layout.slotSizePx / 2,
              top: state.isVertical
                  ? null
                  : (actualThickness - layout.slotSizePx) / 2,
              bottom: state.isVertical
                  ? actualThickness / 2 - layout.slotSizePx / 2
                  : null,
              child: ExcludeSemantics(
                child: BadgeSlotIconColorScope(
                  // Web `--Icon-color: currentColor` on `.slot` — [OneUiIcon] must
                  // read slot tint instead of resolving its own appearance colour.
                  color: slotColor,
                  child: IconTheme(
                    data: IconThemeData(
                      color: slotColor,
                      size: layout.slotSizePx,
                    ),
                    child: DefaultTextStyle(
                      style: TextStyle(color: slotColor),
                      child: SizedBox(
                        width: layout.slotSizePx,
                        height: layout.slotSizePx,
                        child: Center(child: widget.start),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      );
    }

    final pillRadius = layout.borderRadiusPx.clamp(0.0, thickness / 2);

    Widget control = ClipRRect(
      borderRadius: BorderRadius.circular(pillRadius),
      child: ConstrainedBox(
        key: _trackKey,
        constraints: BoxConstraints.tightFor(
          width: controlSize.width,
          height: controlSize.height,
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final actualTrackLength = state.isVertical
                ? constraints.maxHeight
                : constraints.maxWidth;
            final actualThickness = state.isVertical
                ? constraints.maxWidth
                : constraints.maxHeight;
            return buildTrackStack(actualTrackLength, actualThickness);
          },
        ),
      ),
    );

    if (focusRing != null && (_focusNode.hasFocus || widget.forceFocusRing)) {
      control = DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(pillRadius),
          boxShadow: focusRing.boxShadows,
        ),
        child: control,
      );
    }

    control = GestureDetector(
      behavior: HitTestBehavior.opaque,
      dragStartBehavior: DragStartBehavior.down,
      onPanStart: state.isDisabled || state.isReadOnly
          ? null
          : (d) {
              setState(() => _dragging = true);
              final size = _trackHitSize();
              if (size == null) return;
              _updateFromPointer(d.localPosition, size, state.isVertical);
            },
      onPanUpdate: state.isDisabled || state.isReadOnly
          ? null
          : (d) {
              final size = _trackHitSize();
              if (size == null) return;
              _updateFromPointer(d.localPosition, size, state.isVertical);
            },
      onPanEnd: state.isDisabled || state.isReadOnly
          ? null
          : (_) {
              setState(() => _dragging = false);
              widget.onValueCommitted?.call(_currentValue);
            },
      onPanCancel: state.isDisabled || state.isReadOnly
          ? null
          : () => setState(() => _dragging = false),
      onTapDown: state.isDisabled || state.isReadOnly
          ? null
          : (d) {
              final size = _trackHitSize();
              if (size == null) return;
              _setValue(
                _valueFromLocal(d.localPosition, size, state.isVertical),
                commit: true,
              );
            },
      child: control,
    );

    control = Focus(
      focusNode: _focusNode,
      canRequestFocus: !state.isDisabled,
      skipTraversal: state.isDisabled,
      onKeyEvent: (node, event) {
        if (event is! KeyDownEvent ||
            state.isDisabled ||
            state.isReadOnly) {
          return KeyEventResult.ignored;
        }
        if (event.logicalKey == LogicalKeyboardKey.arrowRight ||
            event.logicalKey == LogicalKeyboardKey.arrowUp) {
          _nudge(increase: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.arrowLeft ||
            event.logicalKey == LogicalKeyboardKey.arrowDown) {
          _nudge(increase: false);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.pageUp) {
          _nudge(increase: true, page: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.pageDown) {
          _nudge(increase: false, page: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.home) {
          _setValue(widget.min, commit: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.end) {
          _setValue(widget.max, commit: true);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Semantics(
        slider: true,
        enabled: semantics.enabled,
        readOnly: semantics.readOnly,
        label: semantics.label,
        value: semantics.value.toString(),
        increasedValue: semantics.increasedValue.toString(),
        decreasedValue: semantics.decreasedValue.toString(),
        identifier: widget.testId,
        child: control,
      ),
    );

    if (state.isDisabled && !state.isReadOnly) {
      control = Opacity(opacity: 0.38, child: control);
    }

    return OneUiSlotParentAppearanceScope(
      appearance: state.resolvedAppearance,
      // `inline-flex` parity — never grow to fill a wide parent (e.g. vertical
      // track must stay token thickness, not stretch to 800px showcase width).
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: controlSize.width,
            height: controlSize.height,
            child: control,
          ),
        ],
      ),
    );
  }
}
