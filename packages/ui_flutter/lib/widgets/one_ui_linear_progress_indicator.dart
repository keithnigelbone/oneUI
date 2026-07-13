import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/semantics.dart';

import '../engine/lpi_color_resolve.dart';
import '../engine/lpi_motion_resolve.dart';
import '../engine/lpi_size_resolve.dart';
import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_linear_progress_indicator_a11y.dart';
import 'one_ui_linear_progress_indicator_layout.dart';
import 'one_ui_linear_progress_indicator_types.dart';
import 'one_ui_semantics_label_lookup.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_aria_described_by.dart';

export 'one_ui_linear_progress_indicator_types.dart';

/// Token-backed linear progress — `LinearProgressIndicator.tsx` parity.
class OneUiLinearProgressIndicator extends StatefulWidget {
  const OneUiLinearProgressIndicator({
    super.key,
    this.type = 'determinate',
    this.size = 'M',
    this.appearance = 'primary',
    this.roundCaps = true,
    this.value = 0,
    this.semanticsLabel,
    this.semanticsLabelledBy,
    this.semanticsDescribedBy,
    this.ariaLive,
    this.ariaHidden = false,
    this.semanticsHint,
    this.testId,
    this.indicatorColor,
    this.trackColor,
  });

  final OneUiLinearProgressIndicatorType type;
  final OneUiLinearProgressIndicatorSize size;
  final OneUiLinearProgressIndicatorAppearance appearance;
  final bool roundCaps;
  final double value;
  final String? semanticsLabel;
  final String? semanticsLabelledBy;
  final String? semanticsDescribedBy;
  final String? ariaLive;
  final bool ariaHidden;
  final String? semanticsHint;
  final String? testId;
  final Color? indicatorColor;
  final Color? trackColor;

  @override
  State<OneUiLinearProgressIndicator> createState() =>
      _OneUiLinearProgressIndicatorState();
}

class _OneUiLinearProgressIndicatorState
    extends State<OneUiLinearProgressIndicator>
    with TickerProviderStateMixin {
  late OneUiLinearProgressIndicatorState _state;
  AnimationController? _valueController;
  AnimationController? _indeterminateController;
  Animation<double>? _indeterminateAnimation;
  double _animatedFillFraction = 0;
  double _indeterminateTranslateFactor =
      LpiIndeterminateMotion.startTranslateFactor;
  bool _reducedMotion = false;
  bool _hadDesignSystem = false;
  String? _cachedLabelledByName;
  bool _labelLookupScheduled = false;

  @override
  void initState() {
    super.initState();
    _recomputeState();
    _animatedFillFraction = _state.fillFraction;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reducedMotion = MediaQuery.disableAnimationsOf(context);
    final ds = OneUiScope.maybeOf(context)?.designSystem;
    final dsBecameAvailable = !_hadDesignSystem && ds != null;
    _hadDesignSystem = ds != null;

    if (_valueController == null && !_state.isIndeterminate) {
      if (ds == null) {
        _animatedFillFraction = _state.fillFraction;
      } else if (dsBecameAvailable) {
        _updateValueAnimation(
          widget,
          forceAnimate: !_reducedMotion,
        );
      }
    }
    _syncIndeterminateController();
  }

  @override
  void didUpdateWidget(OneUiLinearProgressIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.semanticsLabel != widget.semanticsLabel ||
        oldWidget.semanticsLabelledBy != widget.semanticsLabelledBy) {
      _cachedLabelledByName = null;
      _labelLookupScheduled = false;
    }
    _recomputeState();
    _updateValueAnimation(oldWidget);
    _syncIndeterminateController();
  }

  String? _resolveEffectiveSemanticsLabel(
    OneUiLinearProgressIndicatorSemantics a11y,
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
    required OneUiLinearProgressIndicatorSemantics a11y,
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
    _valueController?.dispose();
    _indeterminateController?.dispose();
    super.dispose();
  }

  void _recomputeState() {
    _state = resolveOneUiLinearProgressIndicatorState(
      type: widget.type,
      size: widget.size,
      appearance: widget.appearance,
      roundCaps: widget.roundCaps,
      value: widget.value,
    );
  }

  void _updateValueAnimation(
    OneUiLinearProgressIndicator oldWidget, {
    bool forceAnimate = false,
  }) {
    if (_state.isIndeterminate) {
      _valueController?.dispose();
      _valueController = null;
      _animatedFillFraction = 0;
      return;
    }

    final target = _state.fillFraction;

    if (_reducedMotion) {
      _valueController?.dispose();
      _valueController = null;
      _animatedFillFraction = target;
      return;
    }

    final ds = OneUiScope.maybeOf(context)?.designSystem;
    if (ds == null) {
      _animatedFillFraction = target;
      return;
    }

    if (!forceAnimate &&
        oldWidget.value == widget.value &&
        _valueController == null) {
      _animatedFillFraction = target;
      return;
    }

    final motion = resolveLpiValueTransitionMotion(context, ds);
    _valueController?.dispose();
    _valueController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: motion.durationMs),
    );
    final animation = CurvedAnimation(
      parent: _valueController!,
      curve: motion.curve,
    );
    final begin = _animatedFillFraction;
    void listener() {
      if (!mounted) return;
      setState(() {
        _animatedFillFraction = begin + (target - begin) * animation.value;
      });
    }

    animation.addListener(listener);
    _valueController!.forward(from: 0);
  }

  void _syncIndeterminateController() {
    if (!_state.isIndeterminate) {
      _indeterminateController?.dispose();
      _indeterminateController = null;
      _indeterminateAnimation = null;
      _indeterminateTranslateFactor =
          LpiIndeterminateMotion.startTranslateFactor;
      return;
    }

    if (_reducedMotion) {
      _indeterminateController?.dispose();
      _indeterminateController = null;
      _indeterminateAnimation = null;
      setState(() {
        _indeterminateTranslateFactor =
            LpiIndeterminateMotion.reducedMotionTranslateFactor;
      });
      return;
    }

    final ds = OneUiScope.maybeOf(context)?.designSystem;
    final durationMs = ds != null
        ? resolveLpiIndeterminateDurationMs(context, ds)
        : 1015;

    if (_indeterminateController != null &&
        _indeterminateController!.duration?.inMilliseconds == durationMs) {
      return;
    }

    _indeterminateController?.dispose();
    _indeterminateController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: durationMs),
    );
    final curve = ds != null
        ? resolveLpiIndeterminateEasing(context, ds)
        : LpiValueTransitionMotionSpec.defaults.curve;
    _indeterminateAnimation = CurvedAnimation(
      parent: _indeterminateController!,
      curve: curve,
    );
    _indeterminateAnimation!.addListener(() {
      if (!mounted) return;
      setState(() {
        _indeterminateTranslateFactor =
            LpiIndeterminateMotion.translateFactorForProgress(
          _indeterminateAnimation!.value,
          reducedMotion: false,
        );
      });
    });
    _indeterminateController!.repeat();
  }

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed LinearProgressIndicator without '
              'Convex `nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    assert(() {
      void reportWhenUnmounted(void Function() report) {
        SchedulerBinding.instance.addPostFrameCallback((_) {
          if (!context.mounted) return;
          report();
        });
      }

      final rawAppearance = widget.appearance.trim();
      if (rawAppearance.isNotEmpty &&
          rawAppearance != 'auto' &&
          !kOneUiLinearProgressIndicatorAppearances.contains(rawAppearance)) {
        reportWhenUnmounted(() {
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: FlutterError(
                'Unknown LinearProgressIndicator appearance: "$rawAppearance". '
                'Valid roles: '
                '${kOneUiLinearProgressIndicatorAppearances.join(', ')}.',
              ),
              library: 'ui_flutter',
              context: ErrorDescription(
                'while building OneUiLinearProgressIndicator',
              ),
            ),
          );
        });
      }
      if (!widget.ariaHidden &&
          (widget.semanticsLabel == null || widget.semanticsLabel!.isEmpty) &&
          (widget.semanticsLabelledBy == null ||
              widget.semanticsLabelledBy!.isEmpty)) {
        // Web: console.warn in dev. Flutter: FlutterError.reportError — intentional
        // stricter gate for WCAG 4.1.2 in debug builds.
        reportWhenUnmounted(() {
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: FlutterError(
                'OneUiLinearProgressIndicator requires semanticsLabel or '
                'semanticsLabelledBy for accessibility (WCAG 4.1.2), '
                'unless ariaHidden is true.',
              ),
              library: 'ui_flutter',
              context: ErrorDescription(
                'while building OneUiLinearProgressIndicator',
              ),
            ),
          );
        });
      }
      return true;
    }());

    final colors = resolveLpiColors(
      context,
      ds,
      appearance: _state.resolvedAppearance,
    );
    final indicatorColor = widget.indicatorColor ?? colors.indicator;
    final trackColor = widget.trackColor ?? colors.track;
    final trackHeight = resolveLpiTrackHeightPx(
      context,
      ds,
      size: _state.resolvedSize,
    );
    final fillFraction =
        _state.isIndeterminate ? 0.0 : _animatedFillFraction;
    final layout = resolveLpiLayout(
      context,
      ds,
      size: _state.resolvedSize,
      roundCaps: _state.roundCaps,
      fillFraction: fillFraction,
      trackHeightPx: trackHeight,
    );

    final a11y = resolveOneUiLinearProgressIndicatorSemantics(
      state: _state,
      semanticsLabel: widget.semanticsLabel,
      semanticsLabelledBy: widget.semanticsLabelledBy,
      semanticsDescribedBy: widget.semanticsDescribedBy,
      ariaLive: widget.ariaLive,
      ariaHidden: widget.ariaHidden,
      semanticsHint: widget.semanticsHint,
    );

    Widget body = OneUiLinearProgressIndicatorLayout(
      key: ValueKey<String>(_state.dataPayloadKey),
      layout: layout,
      colors: LpiResolvedColors(
        indicator: indicatorColor,
        track: trackColor,
      ),
      isIndeterminate: _state.isIndeterminate,
      indeterminateTranslateFactor: _indeterminateTranslateFactor,
    );

    body = OneUiSlotParentAppearanceScope(
      appearance: _state.resolvedAppearance,
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

    // LPI-FN-001: testId wins Semantics.identifier (CPI lesson).
    // labelledBy-only: Flutter sets identifier to the anchor id for automation;
    // web keeps data-testid separate from aria-labelledby — intentional platform
    // divergence so TalkBack/VoiceOver can resolve the anchor node.
    // Flutter validates progressBar value ∈ [min, max]. valueNow is the
    // normalised 0–100 percentage — always pair with semantics min/max 0–100.
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
