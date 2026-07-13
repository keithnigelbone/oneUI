import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/semantics.dart';

import '../engine/cpi_color_resolve.dart';
import '../engine/cpi_motion_resolve.dart';
import '../engine/cpi_size_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_circular_progress_indicator_a11y.dart';
import 'one_ui_circular_progress_indicator_painter.dart';
import 'one_ui_circular_progress_indicator_types.dart';
import 'one_ui_aria_described_by.dart';
import 'one_ui_icon.dart';
import 'one_ui_icon_types.dart';
import 'one_ui_semantics_label_lookup.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_text_types.dart';

export 'one_ui_circular_progress_indicator_types.dart';

enum _CpiAnimationPhase { entering, visible, exiting, hidden }

_CpiAnimationPhase _initialPhase({
  required bool animate,
  required bool show,
  required String variant,
  required double? value,
}) {
  if (!show) return _CpiAnimationPhase.hidden;
  if (!animate) return _CpiAnimationPhase.visible;
  if (variant == 'determinate') {
    return value == 0
        ? _CpiAnimationPhase.entering
        : _CpiAnimationPhase.visible;
  }
  return _CpiAnimationPhase.entering;
}

/// Token-backed circular progress — `CircularProgressIndicator.tsx` /
/// `CircularProgressIndicator.native.tsx`.
class OneUiCircularProgressIndicator extends StatefulWidget {
  const OneUiCircularProgressIndicator({
    super.key,
    this.variant = 'determinate',
    this.size = 'M',
    this.appearance = 'auto',
    this.content = 'none',
    this.value,
    this.min = 0,
    this.max = 100,
    this.child,
    this.semanticsLabel,
    this.semanticsLabelledBy,
    this.semanticsDescribedBy,
    this.ariaLive,
    this.ariaHidden = false,
    this.semanticsHint,
    this.animate = false,
    this.show = true,
    this.valueTransitionDuration,
    this.testId,

    /// When set, overrides resolved `--CircularProgressIndicator-indicatorColor`
    /// (e.g. button loading `currentColor`).
    this.indicatorColor,

    /// When set, overrides resolved `--CircularProgressIndicator-trackColor`
    /// (e.g. `transparent` for embedded spinners).
    this.trackColor,
  });

  final OneUiCircularProgressIndicatorVariant variant;
  final OneUiCircularProgressIndicatorSize size;
  final OneUiCircularProgressIndicatorAppearance appearance;
  final OneUiCircularProgressIndicatorContent content;
  final double? value;
  final double min;
  final double max;
  final Widget? child;
  final String? semanticsLabel;
  final String? semanticsLabelledBy;
  final String? semanticsDescribedBy;
  final String? ariaLive;
  final bool ariaHidden;
  final String? semanticsHint;
  final bool animate;
  final bool show;
  final int? valueTransitionDuration;
  final String? testId;
  final Color? indicatorColor;
  final Color? trackColor;

  @override
  State<OneUiCircularProgressIndicator> createState() =>
      _OneUiCircularProgressIndicatorState();
}

class _OneUiCircularProgressIndicatorState
    extends State<OneUiCircularProgressIndicator>
    with TickerProviderStateMixin {
  late OneUiCircularProgressIndicatorState _state;
  _CpiAnimationPhase _phase = _CpiAnimationPhase.visible;
  bool _isFirstRender = true;
  double? _prevValue;
  bool _prevShow = true;
  final Set<Timer> _phaseTimers = {};

  AnimationController? _dashController;
  double _animatedNormalized = 0;

  Ticker? _indeterminateTicker;
  int? _indeterminateAnimStartMs;
  double _indeterminateHead = CpiIndeterminateSegments.headStart;
  double _indeterminateTail = CpiIndeterminateSegments.tailStart;
  double _indeterminateRotation = 0;

  double _scale = 1;
  double _strokeScale = 1;
  double _contentOpacity = 1;
  String? _cachedLabelledByName;
  bool _labelLookupScheduled = false;

  @override
  void initState() {
    super.initState();
    _recomputeState();
    _phase = _initialPhase(
      animate: widget.animate,
      show: widget.show,
      variant: widget.variant,
      value: widget.value,
    );
    if (!widget.show && !widget.animate) {
      _phase = _CpiAnimationPhase.hidden;
    }
    _animatedNormalized = _state.normalizedValue;
    _prevValue = widget.value;
    _prevShow = widget.show;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Ticker + MediaQuery must not run in initState (framework assert / red screen).
    _maybeStartIndeterminate();
  }

  @override
  void didUpdateWidget(OneUiCircularProgressIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.semanticsLabel != widget.semanticsLabel ||
        oldWidget.semanticsLabelledBy != widget.semanticsLabelledBy) {
      _cachedLabelledByName = null;
      _labelLookupScheduled = false;
    }
    _recomputeState();
    _runPhaseMachine(oldWidget);
    _updateDeterminateAnimation(oldWidget);
    _maybeStartIndeterminate();
    if (oldWidget.show != widget.show ||
        oldWidget.animate != widget.animate ||
        oldWidget.value != widget.value) {
      _applyEntryExitVisuals();
    }
  }

  String? _resolveEffectiveSemanticsLabel(
    OneUiCircularProgressIndicatorSemantics a11y,
  ) {
    final explicit = a11y.label?.trim();
    if (explicit != null && explicit.isNotEmpty) return explicit;

    final labelledById = a11y.labelledBy?.trim();
    if (labelledById == null || labelledById.isEmpty) return null;

    final fromTree =
        oneUiLookupSemanticsLabelByIdentifier(context, labelledById);
    if (fromTree != null) {
      _cachedLabelledByName = fromTree;
      return fromTree;
    }

    if (!_labelLookupScheduled) {
      _labelLookupScheduled = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _labelLookupScheduled = false;
        if (!mounted) return;
        final id = widget.semanticsLabelledBy?.trim();
        if (id == null || id.isEmpty) return;
        if (widget.semanticsLabel?.trim().isNotEmpty ?? false) return;
        final resolved = oneUiLookupSemanticsLabelByIdentifier(context, id);
        if (resolved != _cachedLabelledByName) {
          setState(() => _cachedLabelledByName = resolved);
        }
      });
    }

    return _cachedLabelledByName;
  }

  String? _resolveSemanticsIdentifier({
    required bool hasTestId,
    required String testId,
    required OneUiCircularProgressIndicatorSemantics a11y,
    required bool hasExplicitLabel,
    required bool hasEffectiveLabel,
  }) {
    if (hasTestId) return testId;
    if (hasExplicitLabel) return a11y.labelledBy;
    if (hasEffectiveLabel) return null;
    return a11y.labelledBy;
  }

  @override
  void dispose() {
    for (final t in _phaseTimers) {
      t.cancel();
    }
    _phaseTimers.clear();
    _indeterminateTicker?.dispose();
    _dashController?.dispose();
    super.dispose();
  }

  void _recomputeState() {
    _state = resolveOneUiCircularProgressIndicatorState(
      variant: widget.variant,
      size: widget.size,
      appearance: widget.appearance,
      content: widget.content,
      value: widget.value,
      min: widget.min,
      max: widget.max,
    );
  }

  void _schedulePhase(_CpiAnimationPhase next, Duration delay) {
    late final Timer timer;
    timer = Timer(delay, () {
      if (!mounted) return;
      setState(() => _phase = next);
      _phaseTimers.remove(timer);
      _applyEntryExitVisuals();
    });
    _phaseTimers.add(timer);
  }

  void _clearPhaseTimers() {
    for (final t in _phaseTimers) {
      t.cancel();
    }
    _phaseTimers.clear();
  }

  void _runPhaseMachine(OneUiCircularProgressIndicator oldWidget) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) return;
    final entryExit = resolveCpiEntryExitMotion(context, ds);
    final valueMotion = resolveCpiValueTransitionMotion(
      context,
      ds,
      overrideDurationMs: widget.valueTransitionDuration,
    );

    if (_isFirstRender) {
      _isFirstRender = false;
      if (_phase == _CpiAnimationPhase.entering) {
        _schedulePhase(
          _CpiAnimationPhase.visible,
          Duration(milliseconds: entryExit.durationMs),
        );
      }
      _prevValue = widget.value;
      _prevShow = widget.show;
      return;
    }

    if (!widget.animate) {
      _clearPhaseTimers();
      setState(() => _phase =
          widget.show ? _CpiAnimationPhase.visible : _CpiAnimationPhase.hidden);
      _prevValue = widget.value;
      _prevShow = widget.show;
      return;
    }

    final prevValue = _prevValue;
    final prevShow = _prevShow;
    _prevValue = widget.value;
    _prevShow = widget.show;

    if (_state.resolvedVariant == 'determinate') {
      if (!widget.show) {
        if (_phase != _CpiAnimationPhase.hidden) {
          _clearPhaseTimers();
          setState(() => _phase = _CpiAnimationPhase.hidden);
        }
        return;
      }
      if (!prevShow && widget.show) {
        _clearPhaseTimers();
        if (widget.value == 0) {
          setState(() => _phase = _CpiAnimationPhase.entering);
          _schedulePhase(
            _CpiAnimationPhase.visible,
            Duration(milliseconds: entryExit.durationMs),
          );
        } else {
          setState(() => _phase = _CpiAnimationPhase.visible);
        }
        return;
      }
      if (prevValue != null &&
          prevValue < widget.max &&
          widget.value == widget.max &&
          (_phase == _CpiAnimationPhase.visible ||
              _phase == _CpiAnimationPhase.entering)) {
        _clearPhaseTimers();
        setState(() => _phase = _CpiAnimationPhase.exiting);
        _schedulePhase(
          _CpiAnimationPhase.hidden,
          Duration(
            milliseconds: valueMotion.durationMs + entryExit.durationMs,
          ),
        );
        return;
      }
      if (prevValue != 0 &&
          widget.value == 0 &&
          _phase == _CpiAnimationPhase.hidden) {
        _clearPhaseTimers();
        setState(() => _phase = _CpiAnimationPhase.entering);
        _schedulePhase(
          _CpiAnimationPhase.visible,
          Duration(milliseconds: entryExit.durationMs),
        );
      }
      return;
    }

    if (widget.show) {
      if (_phase == _CpiAnimationPhase.hidden ||
          _phase == _CpiAnimationPhase.exiting) {
        _clearPhaseTimers();
        setState(() => _phase = _CpiAnimationPhase.entering);
        _schedulePhase(
          _CpiAnimationPhase.visible,
          Duration(milliseconds: entryExit.durationMs),
        );
      }
    } else if (_phase == _CpiAnimationPhase.visible ||
        _phase == _CpiAnimationPhase.entering) {
      _clearPhaseTimers();
      setState(() => _phase = _CpiAnimationPhase.exiting);
      _schedulePhase(
        _CpiAnimationPhase.hidden,
        Duration(milliseconds: entryExit.durationMs),
      );
    }
  }

  void _updateDeterminateAnimation(OneUiCircularProgressIndicator oldWidget) {
    if (_state.isIndeterminate) return;
    if (oldWidget.value == widget.value &&
        oldWidget.min == widget.min &&
        oldWidget.max == widget.max) {
      return;
    }
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) return;

    final mq = MediaQuery.maybeOf(context);
    final reduceMotion = mq?.disableAnimations ?? false;
    final motion = resolveCpiValueTransitionMotion(
      context,
      ds,
      overrideDurationMs: widget.valueTransitionDuration,
    );

    final target = _state.normalizedValue;
    if (reduceMotion || motion.durationMs <= 0) {
      _dashController?.stop();
      setState(() => _animatedNormalized = target);
      return;
    }

    final from = _animatedNormalized;
    _dashController?.dispose();
    _dashController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: motion.durationMs),
    );
    final animation =
        CurvedAnimation(parent: _dashController!, curve: motion.curve);
    animation.addListener(() {
      setState(() {
        _animatedNormalized = from + (target - from) * animation.value;
      });
    });
    _dashController!.forward();
  }

  void _maybeStartIndeterminate() {
    if (!_state.isIndeterminate) {
      _indeterminateTicker?.dispose();
      _indeterminateTicker = null;
      _indeterminateAnimStartMs = null;
      return;
    }
    final mq = MediaQuery.maybeOf(context);
    if (mq?.disableAnimations ?? false) return;

    _indeterminateAnimStartMs ??= DateTime.now().millisecondsSinceEpoch;

    if (_indeterminateTicker == null) {
      _indeterminateTicker = createTicker(_onIndeterminateTick)..start();
    } else if (!_indeterminateTicker!.isActive) {
      _indeterminateTicker!.start();
    }
  }

  void _onIndeterminateTick(Duration _) {
    final ds = OneUiScope.designSystemOf(context);
    const segments = CpiIndeterminateSegments();

    final trimMs = ds != null
        ? resolveCpiIndeterminateTrimMs(context, ds)
        : CpiIndeterminateSegments.trimCycleMs;
    final rotateMs = ds != null
        ? resolveCpiIndeterminateRotateMs(context, ds)
        : CpiIndeterminateSegments.rotateCycleMs;
    final motion = ds != null
        ? resolveCpiValueTransitionMotion(context, ds)
        : CpiValueTransitionMotionSpec(
            durationMs: CpiValueTransitionMotionSpec.defaults.durationMs,
            curve: CpiValueTransitionMotionSpec.defaults.curve,
          );

    final safeTrimMs =
        trimMs > 0 ? trimMs : CpiIndeterminateSegments.trimCycleMs;
    final safeRotateMs =
        rotateMs > 0 ? rotateMs : CpiIndeterminateSegments.rotateCycleMs;

    final startMs =
        _indeterminateAnimStartMs ?? DateTime.now().millisecondsSinceEpoch;
    final sinceStart = DateTime.now().millisecondsSinceEpoch - startMs;
    final trimElapsed = sinceStart % safeTrimMs;
    final rotateElapsed = sinceStart % safeRotateMs;
    final t = trimElapsed / safeTrimMs;
    final headBreak = segments.headBreakForTrimMs(safeTrimMs);
    final tailBreak = segments.tailBreakForTrimMs(safeTrimMs);

    double head;
    if (t < headBreak) {
      final local = t / headBreak;
      head = CpiIndeterminateSegments.headStart +
          motion.curve.transform(local) * segments.headS1Span;
    } else {
      final local = (t - headBreak) / (1 - headBreak);
      head = CpiIndeterminateSegments.headSegment1To +
          motion.curve.transform(local) * segments.headS2Span;
    }

    double tail;
    if (t < tailBreak) {
      tail = CpiIndeterminateSegments.tailStart;
    } else {
      final local = (t - tailBreak) / (1 - tailBreak);
      tail = CpiIndeterminateSegments.tailStart +
          motion.curve.transform(local) * segments.tailS2Span;
    }

    setState(() {
      _indeterminateHead = head;
      _indeterminateTail = tail;
      _indeterminateRotation = (rotateElapsed / safeRotateMs) * 1080;
    });
  }

  void _applyEntryExitVisuals() {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) return;
    final spec = resolveCpiEntryExitMotion(context, ds);
    final mq = MediaQuery.maybeOf(context);
    final reduceMotion = mq?.disableAnimations ?? false;

    if (!widget.animate || reduceMotion) {
      setState(() {
        _scale = spec.scaleTo;
        _strokeScale = 1;
        _contentOpacity = 1;
      });
      return;
    }

    switch (_phase) {
      case _CpiAnimationPhase.entering:
        setState(() {
          _scale = spec.scaleFrom;
          _strokeScale = 0;
          _contentOpacity = 0;
        });
        Future<void>.delayed(Duration(milliseconds: spec.durationMs), () {
          if (!mounted || _phase != _CpiAnimationPhase.entering) return;
          setState(() {
            _scale = spec.scaleTo;
            _strokeScale = 1;
            _contentOpacity = 1;
          });
        });
      case _CpiAnimationPhase.exiting:
        setState(() {
          _scale = spec.scaleFrom;
          _strokeScale = 0;
          _contentOpacity = 0;
        });
      case _CpiAnimationPhase.visible:
        setState(() {
          _scale = spec.scaleTo;
          _strokeScale = 1;
          _contentOpacity = 1;
        });
      case _CpiAnimationPhase.hidden:
        break;
    }
  }

  Widget? _buildCenterContent(
    BuildContext context,
    NativeDesignSystemPayload ds,
    CpiResolvedColors colors,
    CpiResolvedLayout layout,
  ) {
    if (_state.resolvedContent == 'text' &&
        isCpiLabelVisible(_state.resolvedSize)) {
      final labelSize = kCpiSizeToLabelSize[_state.resolvedSize]!;
      final style = resolveOneUiTextTypographyStyle(
        context,
        variant: OneUiTextVariant.label,
        size: labelSize,
        weight: OneUiTextWeight.medium,
      );
      final innerPx = resolveCpiInnerContentDiameterPx(
        layout,
        strokeScale: _strokeScale,
      );
      final labelFontPx = resolveCpiCenterLabelFontSizePx(
        innerPx: innerPx,
        percentage: _state.percentage,
      );
      final baseStyle = style ?? const TextStyle();
      return ExcludeSemantics(
        child: Text(
          '${_state.percentage}',
          style: baseStyle.copyWith(
            color: colors.text,
            fontSize: labelFontPx,
            height: 1,
          ),
          maxLines: 1,
          textAlign: TextAlign.center,
        ),
      );
    }
    if (_state.resolvedContent == 'icon' &&
        isCpiIconContentVisible(_state.resolvedContent, widget.child)) {
      final child = widget.child!;
      if (child is OneUiIcon) {
        return OneUiIcon(
          icon: child.icon,
          size: kCpiSizeToIconSize[_state.resolvedSize]!,
          boxSize: resolveCpiCenterIconSlotPx(
            context,
            ds,
            size: _state.resolvedSize,
          ),
          appearance: cpiAppearanceToIconAppearance(_state.resolvedAppearance),
          emphasis: OneUiIconEmphasis.tintedA11y,
          excludeFromSemantics: true,
        );
      }
      return ExcludeSemantics(child: child);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed CircularProgressIndicator without '
              'Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    if (_phase == _CpiAnimationPhase.hidden) {
      return const SizedBox.shrink();
    }

    assert(() {
      void reportWhenUnmounted(void Function() report) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!context.mounted) return;
          report();
        });
      }

      final rawAppearance = widget.appearance.trim();
      if (rawAppearance.isNotEmpty &&
          rawAppearance != 'auto' &&
          !kOneUiCircularProgressIndicatorAppearances.contains(rawAppearance)) {
        reportWhenUnmounted(() {
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: FlutterError(
                'Unknown CircularProgressIndicator appearance: "$rawAppearance". '
                'Valid roles: '
                '${kOneUiCircularProgressIndicatorAppearances.join(', ')}.',
              ),
              library: 'ui_flutter',
              context: ErrorDescription(
                'while building OneUiCircularProgressIndicator',
              ),
            ),
          );
        });
      }
      if (!widget.ariaHidden &&
          (widget.semanticsLabel == null || widget.semanticsLabel!.isEmpty) &&
          (widget.semanticsLabelledBy == null ||
              widget.semanticsLabelledBy!.isEmpty)) {
        reportWhenUnmounted(() {
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: FlutterError(
                'OneUiCircularProgressIndicator requires semanticsLabel or '
                'semanticsLabelledBy for accessibility (WCAG 4.1.2), '
                'unless ariaHidden is true.',
              ),
              library: 'ui_flutter',
              context: ErrorDescription(
                'while building OneUiCircularProgressIndicator',
              ),
            ),
          );
        });
      }
      return true;
    }());

    final colors =
        resolveCpiColors(context, ds, appearance: _state.resolvedAppearance);
    final indicatorColor = widget.indicatorColor ?? colors.indicator;
    final trackColor = widget.trackColor ?? colors.track;
    final layout =
        resolveCpiLayout(context, ds, size: _state.resolvedSize, state: _state);
    final a11y = resolveOneUiCircularProgressIndicatorSemantics(
      state: _state,
      semanticsLabel: widget.semanticsLabel,
      semanticsLabelledBy: widget.semanticsLabelledBy,
      semanticsDescribedBy: widget.semanticsDescribedBy,
      ariaLive: widget.ariaLive,
      ariaHidden: widget.ariaHidden,
      semanticsHint: widget.semanticsHint,
      min: widget.min,
      max: widget.max,
    );

    final ring = CustomPaint(
      size: Size.square(layout.diameterPx),
      painter: OneUiCircularProgressIndicatorPainter(
        trackColor: trackColor,
        indicatorColor: indicatorColor,
        strokeWidthViewBox: layout.strokeWidthViewBox,
        radiusViewBox: layout.radiusViewBox,
        isIndeterminate: _state.isIndeterminate,
        determinateSweepFraction: _animatedNormalized.clamp(0.0, 1.0),
        indeterminateHead: _indeterminateHead,
        indeterminateTail: _indeterminateTail,
        strokeScale: _strokeScale,
        rotationDegrees: _state.isIndeterminate ? _indeterminateRotation : 0,
      ),
    );

    final center = _buildCenterContent(context, ds, colors, layout);

    Widget body = SizedBox(
      width: layout.diameterPx,
      height: layout.diameterPx,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ring,
          if (center != null) Opacity(opacity: _contentOpacity, child: center),
        ],
      ),
    );

    body = Transform.scale(scale: _scale, child: body);

    body = OneUiSlotParentAppearanceScope(
      appearance: _state.resolvedAppearance,
      child: body,
    );

    body = KeyedSubtree(
      key: ValueKey<String>(_state.dataPayloadKey),
      child: body,
    );

    final tid = widget.testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;
    if (hasTestId) {
      body = KeyedSubtree(key: ValueKey<String>(tid), child: body);
    }

    final semanticsChild = body;

    if (a11y.excludeSemantics) {
      if (hasTestId) {
        return Semantics(
          container: true,
          identifier: tid,
          child: ExcludeSemantics(child: semanticsChild),
        );
      }
      return ExcludeSemantics(child: semanticsChild);
    }

    final explicitLabel = a11y.label?.trim();
    final hasExplicitLabel =
        explicitLabel != null && explicitLabel.isNotEmpty;
    final effectiveLabel = _resolveEffectiveSemanticsLabel(a11y);
    final hasEffectiveLabel =
        effectiveLabel != null && effectiveLabel.isNotEmpty;
    final semanticsIdentifier = _resolveSemanticsIdentifier(
      hasTestId: hasTestId,
      testId: tid ?? '',
      a11y: a11y,
      hasExplicitLabel: hasExplicitLabel,
      hasEffectiveLabel: hasEffectiveLabel,
    );
    final describedByNodes =
        oneUiParseAriaDescribedByNodeIds(widget.semanticsDescribedBy);

    // Flutter validates progressBar value ∈ [min, max]. valueNow is always the
    // normalised 0–100 percentage (web aria-valuenow / RN accessibilityValue.now),
    // so semantics min/max are fixed at 0–100 even when the widget uses a custom
    // value range for sweep geometry.
    final isProgressBar = !a11y.isBusy && a11y.valueNow != null;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      identifier: semanticsIdentifier,
      label: hasEffectiveLabel ? effectiveLabel : null,
      hint: a11y.hint,
      role: isProgressBar
          ? SemanticsRole.progressBar
          : SemanticsRole.loadingSpinner,
      minValue: isProgressBar ? '0' : null,
      maxValue: isProgressBar ? '100' : null,
      value: isProgressBar ? '${a11y.valueNow!.round()}' : null,
      liveRegion: a11y.liveRegion,
      controlsNodes: describedByNodes,
      child: semanticsChild,
    );
  }
}
