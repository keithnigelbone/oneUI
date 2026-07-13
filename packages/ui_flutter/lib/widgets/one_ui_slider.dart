import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../engine/slider_color_resolve.dart';
import '../engine/slider_motion_resolve.dart';
import '../engine/slider_size_resolve.dart';
import '../engine/slider_value_math.dart' show enforceRangeSeparation, clampSliderValue, fractionToValue, normalizeSliderValues, valueToFraction;
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_slider_active_track.dart';
import 'one_ui_slider_a11y.dart';
import 'one_ui_slider_knob.dart';
import 'one_ui_slider_steps.dart';
import 'one_ui_slider_types.dart';
import 'one_ui_slider_value_tooltip.dart';
import 'one_ui_slot_parent_appearance.dart';

export 'one_ui_slider_types.dart';
export 'one_ui_slider_a11y.dart';

typedef OneUiSliderChange = void Function(Object value);

/// Precision range input — `Slider.tsx`.
class OneUiSlider extends StatefulWidget {
  const OneUiSlider({
    super.key,
    this.value,
    this.defaultValue = 0,
    this.onValueChange,
    this.onValueCommitted,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.largeStep = 10,
    this.minStepsBetweenValues,
    this.appearance = 'auto',
    this.orientation = 'horizontal',
    this.size = 'm',
    this.knobStyle = 'outside',
    this.showTooltip = 'auto',
    this.formatValue,
    this.showSteps = false,
    this.stepLabels,
    this.snapToSteps = true,
    this.start,
    this.end,
    this.disabled = false,
    this.readOnly = false,
    this.semanticsLabel,
    this.semanticsLabels,
    this.ariaLabel,
    this.ariaLabels,
    this.testId,
  });

  final Object? value;
  final Object defaultValue;
  final OneUiSliderChange? onValueChange;
  final OneUiSliderChange? onValueCommitted;
  final double min;
  final double max;
  final double step;
  final double largeStep;
  final int? minStepsBetweenValues;
  final OneUiSliderAppearance appearance;
  final OneUiSliderOrientation orientation;
  final OneUiSliderSize size;
  final OneUiSliderKnobStyle knobStyle;
  final OneUiSliderTooltipMode showTooltip;
  final String Function(double value, int index)? formatValue;
  final bool showSteps;
  final List<Widget>? stepLabels;
  final bool snapToSteps;
  final Widget? start;
  final Widget? end;
  final bool disabled;
  final bool readOnly;
  final String? semanticsLabel;
  final List<String>? semanticsLabels;
  final String? ariaLabel;
  final List<String>? ariaLabels;
  final String? testId;

  @override
  State<OneUiSlider> createState() => _OneUiSliderState();
}

class _OneUiSliderState extends State<OneUiSlider> {
  late List<double> _internalValues;
  int? _activeThumb;
  final List<FocusNode> _focusNodes = [FocusNode(), FocusNode()];
  bool _dragging = false;

  bool get _isRange =>
      widget.value is List || widget.defaultValue is List;

  @override
  void initState() {
    super.initState();
    _internalValues = normalizeSliderValues(
      widget.value ?? widget.defaultValue,
      isRange: _isRange,
    );
    if (_isRange && _internalValues.length < 2) {
      _internalValues = [widget.min, widget.max * 0.5];
    }
  }

  @override
  void didUpdateWidget(OneUiSlider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != null) {
      _internalValues = normalizeSliderValues(widget.value, isRange: _isRange);
    }
  }

  @override
  void dispose() {
    for (final n in _focusNodes) {
      n.dispose();
    }
    super.dispose();
  }

  List<double> get _currentValues =>
      widget.value != null
          ? normalizeSliderValues(widget.value, isRange: _isRange)
          : _internalValues;

  void _emit(List<double> next, {bool commit = false}) {
    if (widget.readOnly) return;
    if (widget.value == null) {
      setState(() => _internalValues = next);
    } else {
      setState(() {});
    }
    final payload = _isRange ? next : next.first;
    widget.onValueChange?.call(payload);
    if (commit) widget.onValueCommitted?.call(payload);
  }

  double _freeDragStep() {
    final range = widget.max - widget.min;
    return widget.snapToSteps
        ? widget.step
        : (widget.step < range / 1000 ? widget.step : range / 1000);
  }

  double _valueFromLocal(Offset local, Size trackSize, bool vertical) {
    final fraction = vertical
        ? (1 - (local.dy / trackSize.height)).clamp(0.0, 1.0)
        : (local.dx / trackSize.width).clamp(0.0, 1.0);
    final dragStep = _freeDragStep();
    return fractionToValue(
      fraction,
      widget.min,
      widget.max,
      step: widget.snapToSteps ? widget.step : dragStep,
    );
  }

  void _updateThumb(int index, double raw, {bool commit = false}) {
    var next = List<double>.from(_currentValues);
    next = enforceRangeSeparation(
      next,
      index,
      raw,
      widget.min,
      widget.max,
      widget.step,
      widget.minStepsBetweenValues,
    );
    if (!widget.snapToSteps) {
      next[index] = clampSliderValue(raw, widget.min, widget.max);
    }
    _emit(next, commit: commit);
  }

  void _nudgeThumb(int index, {required bool increase, bool page = false}) {
    final delta = page
        ? (widget.largeStep > 0 ? widget.largeStep : widget.step * 10)
        : (widget.step > 0 ? widget.step : 1);
    _updateThumb(
      index,
      _currentValues[index] + (increase ? delta : -delta),
      commit: true,
    );
  }

  String _tooltipText(int index) {
    final v = _currentValues[index];
    if (widget.formatValue != null) return widget.formatValue!(v, index);
    return v.round().toString();
  }

  bool _tooltipVisible(int index) {
    if (widget.showTooltip == 'false') return false;
    if (widget.showTooltip == 'always') return true;
    return _dragging || _activeThumb == index || _focusNodes[index].hasFocus;
  }

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiMissingDesignSystemPlaceholder();
    }
    final surface = OneUiSurfaceScope.maybeOf(context);
    final values = _currentValues;
    final state = resolveOneUiSliderState(
      values: values,
      appearance: widget.appearance,
      orientation: widget.orientation,
      size: widget.size,
      knobStyle: widget.knobStyle,
      showTooltip: widget.showTooltip,
      snapToSteps: widget.snapToSteps,
      disabled: widget.disabled,
      readOnly: widget.readOnly,
      surface: surface,
    );
    final layout = resolveSliderLayout(context, ds, size: state.size);
    final colors = resolveSliderColors(
      context,
      ds,
      appearance: state.resolvedAppearance,
    );
    final motion = resolveSliderMotion(context, ds);
    final trackThickness = layout.trackHeightFor(state.knobStyle);

    Widget trackArea = LayoutBuilder(
      builder: (context, constraints) {
        final trackLength = state.isVertical
            ? constraints.maxHeight
            : constraints.maxWidth;

        return SizedBox(
          width: state.isVertical ? trackThickness : trackLength,
          height: state.isVertical ? trackLength : trackThickness,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: colors.rail,
                    borderRadius:
                        BorderRadius.circular(layout.trackBorderRadiusPx),
                  ),
                ),
              ),
              if (widget.showSteps)
                OneUiSliderSteps(
                  min: widget.min,
                  max: widget.max,
                  step: widget.step,
                  activeValues: values,
                  vertical: state.isVertical,
                  trackLength: trackLength,
                  layout: layout,
                  knobStyle: state.knobStyle,
                  tickColor: colors.tick,
                  stepLabels: widget.stepLabels,
                ),
              OneUiSliderActiveTrack(
                values: values,
                min: widget.min,
                max: widget.max,
                vertical: state.isVertical,
                isRange: state.isRange,
                knobStyle: state.knobStyle,
                trackLength: trackLength,
                trackThickness: trackThickness,
                colors: colors,
                borderRadius: layout.trackBorderRadiusPx,
              ),
              GestureDetector(
                behavior: HitTestBehavior.translucent,
                onPanStart: state.isDisabled || state.isReadOnly
                    ? null
                    : (d) {
                        setState(() {
                          _dragging = true;
                          _activeThumb = 0;
                        });
                        final box = context.findRenderObject() as RenderBox?;
                        if (box == null) return;
                        final local = box.globalToLocal(d.globalPosition);
                        final v = _valueFromLocal(
                          local,
                          Size(trackLength, trackThickness),
                          state.isVertical,
                        );
                        final idx = _nearestThumbIndex(v, values);
                        setState(() => _activeThumb = idx);
                        _updateThumb(idx, v);
                      },
                onPanUpdate: state.isDisabled || state.isReadOnly
                    ? null
                    : (d) {
                        final box = context.findRenderObject() as RenderBox?;
                        if (box == null || _activeThumb == null) return;
                        final local = box.globalToLocal(d.globalPosition);
                        _updateThumb(
                          _activeThumb!,
                          _valueFromLocal(
                            local,
                            Size(trackLength, trackThickness),
                            state.isVertical,
                          ),
                        );
                      },
                onPanEnd: state.isDisabled || state.isReadOnly
                    ? null
                    : (_) {
                        setState(() {
                          _dragging = false;
                          _activeThumb = null;
                        });
                        if (!state.isReadOnly) {
                          widget.onValueCommitted?.call(
                            _isRange ? values : values.first,
                          );
                        }
                      },
                child: SizedBox(
                  width: state.isVertical ? trackThickness : trackLength,
                  height: state.isVertical ? trackLength : trackThickness,
                ),
              ),
              for (var i = 0; i < values.length; i++)
                OneUiSliderKnob(
                  knobStyle: state.knobStyle,
                  fraction: valueToFraction(values[i], widget.min, widget.max),
                  vertical: state.isVertical,
                  trackLength: trackLength,
                  colors: colors,
                  layout: layout,
                  motion: motion,
                  active: _activeThumb == i,
                  focused: _focusNodes[i].hasFocus,
                  disabled: state.isDisabled || state.isReadOnly,
                  onPanStart: () => setState(() {
                    _dragging = true;
                    _activeThumb = i;
                  }),
                  onPanUpdate: (d) {
                    final box = context.findRenderObject() as RenderBox?;
                    if (box == null) return;
                    final local = box.globalToLocal(d.globalPosition);
                    _updateThumb(
                      i,
                      _valueFromLocal(
                        local,
                        Size(trackLength, trackThickness),
                        state.isVertical,
                      ),
                    );
                  },
                  onPanEnd: () {
                    setState(() {
                      _dragging = false;
                      _activeThumb = null;
                    });
                    if (!state.isReadOnly) {
                      widget.onValueCommitted?.call(
                        _isRange ? _currentValues : _currentValues.first,
                      );
                    }
                  },
                  onTapDown: (_) => setState(() => _activeThumb = i),
                  tooltip: OneUiSliderValueTooltip(
                    text: _tooltipText(i),
                    visible: _tooltipVisible(i),
                  ),
                  semanticsChild: _buildThumbSemantics(
                    context,
                    state: state,
                    index: i,
                    value: values[i],
                  ),
                ),
            ],
          ),
        );
      },
    );

    final trackCore = trackArea;

    Widget row = LayoutBuilder(
      builder: (context, outerConstraints) {
        final startSlot =
            widget.start != null ? layout.slotSizePx + layout.slotGapPx : 0.0;
        final endSlot =
            widget.end != null ? layout.slotSizePx + layout.slotGapPx : 0.0;

        final horizontalWidth = state.isVertical
            ? layout.containerHeightPx
            : (outerConstraints.maxWidth.isFinite
                ? outerConstraints.maxWidth
                : layout.containerWidthPx);

        final horizontalTrackWidth = horizontalWidth - startSlot - endSlot;

        return SizedBox(
          width: state.isVertical ? layout.containerHeightPx : horizontalWidth,
          height: state.isVertical
              ? layout.verticalHeightPx
              : layout.containerHeightPx,
          child: state.isVertical
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.end != null) _slot(widget.end!, layout),
                    Expanded(child: trackCore),
                    if (widget.start != null) _slot(widget.start!, layout),
                  ],
                )
              : Row(
                  children: [
                    if (widget.start != null) _slot(widget.start!, layout),
                    SizedBox(
                      width: horizontalTrackWidth,
                      child: trackCore,
                    ),
                    if (widget.end != null) _slot(widget.end!, layout),
                  ],
                ),
        );
      },
    );

    if (state.isDisabled && !state.isReadOnly) {
      row = Opacity(opacity: 0.38, child: row);
    }

    return OneUiSlotParentAppearanceScope(
      appearance: state.resolvedAppearance,
      child: row,
    );
  }

  Widget _slot(Widget child, SliderResolvedLayout layout) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: layout.slotGapPx / 2),
      child: SizedBox(
        width: layout.slotSizePx,
        height: layout.slotSizePx,
        child: Center(child: child),
      ),
    );
  }

  int _nearestThumbIndex(double value, List<double> values) {
    var best = 0;
    var bestDist = (value - values[0]).abs();
    for (var i = 1; i < values.length; i++) {
      final d = (value - values[i]).abs();
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    return best;
  }

  Widget _buildThumbSemantics(
    BuildContext context, {
    required OneUiSliderState state,
    required int index,
    required double value,
  }) {
    final sem = resolveOneUiSliderThumbSemantics(
      state: state,
      thumbIndex: index,
      thumbValue: value,
      min: widget.min,
      max: widget.max,
      step: widget.step,
      largeStep: widget.largeStep,
      semanticsLabel: widget.semanticsLabel,
      ariaLabel: widget.ariaLabel,
      semanticsLabels: widget.semanticsLabels,
      ariaLabels: widget.ariaLabels,
    );

    return Focus(
      focusNode: _focusNodes[index],
      canRequestFocus: !state.isDisabled,
      skipTraversal: state.isDisabled,
      onKeyEvent: (node, event) {
        if (event is! KeyDownEvent || state.isDisabled || state.isReadOnly) {
          return KeyEventResult.ignored;
        }
        if (event.logicalKey == LogicalKeyboardKey.arrowRight ||
            event.logicalKey == LogicalKeyboardKey.arrowUp) {
          _nudgeThumb(index, increase: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.arrowLeft ||
            event.logicalKey == LogicalKeyboardKey.arrowDown) {
          _nudgeThumb(index, increase: false);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.pageUp) {
          _nudgeThumb(index, increase: true, page: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.pageDown) {
          _nudgeThumb(index, increase: false, page: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.home) {
          _updateThumb(index, widget.min, commit: true);
          return KeyEventResult.handled;
        }
        if (event.logicalKey == LogicalKeyboardKey.end) {
          _updateThumb(index, widget.max, commit: true);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Semantics(
        slider: true,
        enabled: sem.enabled,
        readOnly: sem.readOnly,
        label: sem.label,
        value: sem.value.toString(),
        increasedValue: sem.increasedValue.toString(),
        decreasedValue: sem.decreasedValue.toString(),
        identifier: widget.testId,
        child: const SizedBox.expand(),
      ),
    );
  }
}
