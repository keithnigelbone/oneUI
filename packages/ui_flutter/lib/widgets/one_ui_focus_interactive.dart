import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/motion_resolve.dart';
import 'one_ui_chip_group_focus.dart';

/// Semantics button + Space/Enter + web-aligned focus halo (`focusRing`).
///
/// Mirrors web **`Button`** + RN **`Button.native`** affordances aligned with WCAG 2.x:
/// - **`semanticsBusy`** ⇔ **`aria-busy`** / **`accessibilityState.busy`** (loading without replacing label).
/// - **`semanticsExpanded`** ⇔ **`aria-expanded`** (`accessibilityState.expanded`).
/// - **`Semantics.controlsNodes`** (**[semanticsControlsSemanticsIdentifiers]**) ⇔ **`aria-controls`**
///   on Flutter web when referenced nodes expose matching **`Semantics.identifier`** values.
/// - **`Semantics.hint`** aggregates [semanticsHint] + busy copy (similar to supplementary `aria-*` text).
///
/// Optionally drives a **normalized press animation** **[0 → 1]** (`Animation<double> press`)
/// for tap-scale (**[tapMotion]**) and/or custom paint ([pressAnimationBuilder]).
///
/// Mirrors web `:active`: pointer-down advances the curve, pointer-up reverses (~ `transition`).
class OneUiFocusInteractive extends StatefulWidget {
  const OneUiFocusInteractive({
    super.key,
    required this.semanticsLabel,
    required this.enabled,
    required this.onPressed,
    required this.borderRadius,
    this.child,
    this.pressAnimationBuilder,
    this.focusRing,
    this.tapMotion,
    this.autofocus = false,

    /// Storybook parity with web `[data-force-state="focus"]` — always paint the
    /// focus halo even when [FocusHighlightMode] is touch (not for production).
    this.forceFocusRing = false,
    this.semanticsHint,
    this.semanticsBusy = false,

    /// `aria-expanded` — menus / disclosure toggles (`accessibilityState.expanded` on RN).
    this.semanticsExpanded,

    /// Flutter [Semantics.controlsNodes] — on **web** maps to **`aria-controls`**
    /// when targets use matching [Semantics.identifier] values (see Flutter docs).
    /// Parity with RN **`accessibilityControls`** / web **`aria-controls`** on `Button.native`.
    this.semanticsControlsSemanticsIdentifiers,

    /// RN `testID` / web `data-testid` — emitted as [Semantics.identifier].
    this.semanticsIdentifier,

    /// Expands the gesture hit region while keeping [child] visually centered —
    /// parity with RN `hitSlop` / Material `IconButton` padded tap target.
    this.minHitTestSize,

    /// Pointer hover (Flutter web / desktop). Fires from the same [MouseRegion]
    /// as the click cursor so hit-testing aligns with the gesture target.
    this.onHoverChanged,

    /// RN `hitSlop` parity — transparent padding that expands the gesture hit
    /// area without resizing painted chrome (Chip, etc.).
    this.hitTestPadding = EdgeInsets.zero,
  }) : assert(child != null || pressAnimationBuilder != null);

  final String semanticsLabel;

  /// Mirrors web `aria-busy` announcement (loading) without replacing the visible label.
  final bool semanticsBusy;

  /// Mirrors web supplementary description / `aria-description` patterns.
  final String? semanticsHint;

  /// Menus / collapsible triggers — **`aria-expanded`** (both web and RN).
  final bool? semanticsExpanded;

  /// Targets this control owns / toggles (**`Semantics.identifier`** strings → web `aria-controls`).
  final Set<String>? semanticsControlsSemanticsIdentifiers;

  /// RN `testID` / web `data-testid`.
  final String? semanticsIdentifier;

  /// Minimum interactive extent per axis (visual chrome may stay smaller).
  final Size? minHitTestSize;

  /// `true` on pointer enter, `false` on exit — web `:hover` parity.
  final ValueChanged<bool>? onHoverChanged;

  /// Expands [GestureDetector] hit testing on touch-first platforms.
  final EdgeInsets hitTestPadding;

  final bool enabled;
  final VoidCallback? onPressed;

  final BorderRadius borderRadius;

  /// Baseline child when [pressAnimationBuilder] is null.
  final Widget? child;

  /// When set, builds the interactive surface; use [press] to lerp colours (~ web `transition`).
  final Widget Function(BuildContext context, Animation<double> press)?
      pressAnimationBuilder;

  final OneUiFocusRingSpec? focusRing;
  final OneUiTapMotionSpec? tapMotion;
  final bool autofocus;
  final bool forceFocusRing;

  static const Map<ShortcutActivator, Intent> _activateShortcuts =
      <ShortcutActivator, Intent>{
    SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.space): ActivateIntent(),
  };

  @override
  State<OneUiFocusInteractive> createState() => _OneUiFocusInteractiveState();
}

class _OneUiFocusInteractiveState extends State<OneUiFocusInteractive>
    with TickerProviderStateMixin {
  late final FocusNode _node;
  late AnimationController _pressCtrl;
  late CurvedAnimation _pressCurve;
  OneUiChipGroupFocusController? _chipGroupFocus;

  /// Test-only accessor: drives the press animation directly for
  /// deterministic golden capture. Production callers must never reach
  /// past this — gesture handling owns the controller.
  @visibleForTesting
  AnimationController get pressControllerForTesting => _pressCtrl;

  @override
  void initState() {
    super.initState();
    _node = FocusNode(debugLabel: widget.semanticsLabel);
    _node.addListener(_tick);
    FocusManager.instance.addListener(_tick);
    _initPressAnimation();
    _syncEnabled();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncChipGroupFocusRegistration();
  }

  void _syncChipGroupFocusRegistration() {
    final registry = OneUiChipGroupFocusScope.maybeOf(context);
    if (_chipGroupFocus == registry) return;
    _chipGroupFocus?.unregister(_node);
    _chipGroupFocus = registry;
    _chipGroupFocus?.register(_node);
  }

  void _tick() {
    if (mounted) setState(() {});
  }

  void _initPressAnimation() {
    final ms =
        widget.tapMotion?.durationMs ?? OneUiTapMotionSpec.defaults.durationMs;
    final curve = widget.tapMotion?.curve ?? OneUiTapMotionSpec.defaults.curve;
    _pressCtrl = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: ms),
    );
    _pressCurve = CurvedAnimation(parent: _pressCtrl, curve: curve);
  }

  @override
  void didUpdateWidget(covariant OneUiFocusInteractive oldWidget) {
    super.didUpdateWidget(oldWidget);
    final oldMs = oldWidget.tapMotion?.durationMs ??
        OneUiTapMotionSpec.defaults.durationMs;
    final newMs =
        widget.tapMotion?.durationMs ?? OneUiTapMotionSpec.defaults.durationMs;
    final curve = widget.tapMotion?.curve ?? OneUiTapMotionSpec.defaults.curve;
    final oldCurve =
        oldWidget.tapMotion?.curve ?? OneUiTapMotionSpec.defaults.curve;
    if (oldMs != newMs || curve != oldCurve) {
      _pressCurve.dispose();
      _pressCtrl.dispose();
      _initPressAnimation();
    }
    _syncEnabled();
    if (widget.semanticsLabel != oldWidget.semanticsLabel) {
      _node.debugLabel = widget.semanticsLabel;
    }
    if (!widget.enabled) {
      _pressCtrl.value = 0;
      if (oldWidget.enabled && widget.onHoverChanged != null) {
        widget.onHoverChanged!(false);
      }
    }
  }

  void _handleHoverEnter(PointerEnterEvent _) {
    if (!widget.enabled) return;
    widget.onHoverChanged?.call(true);
  }

  void _handleHoverExit(PointerExitEvent _) {
    if (!widget.enabled) return;
    widget.onHoverChanged?.call(false);
  }

  void _syncEnabled() {
    _node.canRequestFocus = widget.enabled;
    if (!widget.enabled) {
      _node.unfocus(disposition: UnfocusDisposition.previouslyFocusedChild);
    }
  }

  bool _suppressPressAnimation(MediaQueryData? mq) {
    return mq?.disableAnimations ?? false;
  }

  void _applyPressedTarget(bool pressed) {
    final mq = MediaQuery.maybeOf(context);
    if (_suppressPressAnimation(mq)) {
      _pressCtrl.value = pressed ? 1.0 : 0.0;
      return;
    }
    if (pressed) {
      _pressCtrl.forward();
    } else {
      _pressCtrl.reverse();
    }
  }

  @override
  void dispose() {
    _chipGroupFocus?.unregister(_node);
    _chipGroupFocus = null;
    _node.removeListener(_tick);
    FocusManager.instance.removeListener(_tick);
    _node.dispose();
    _pressCurve.dispose();
    _pressCtrl.dispose();
    super.dispose();
  }

  bool _showFocusRing() {
    if (!widget.enabled || widget.focusRing == null) return false;
    if (widget.focusRing!.strokeXlPx <= 0) return false;
    if (widget.forceFocusRing) return true;
    final traditional =
        FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    return _node.hasFocus && traditional;
  }

  bool get _tracksPointerPress {
    if (!widget.enabled) return false;
    final tm = widget.tapMotion;
    final wantScale = tm != null && tm.materiallyShrinks;
    return wantScale || widget.pressAnimationBuilder != null;
  }

  Widget _withOptionalScale(Widget w) {
    final tm = widget.tapMotion;
    if (tm == null || !tm.materiallyShrinks) return w;
    return AnimatedBuilder(
      animation: _pressCurve,
      builder: (_, __) {
        final v = _pressCurve.value;
        final s =
            lerpDouble(1.0, tm.pressedScale, v)!.clamp(0.82, 1.0).toDouble();
        return Transform.scale(
          alignment: Alignment.center,
          scale: s,
          child: w,
        );
      },
    );
  }

  /// Web paints focus as `box-shadow` on the **same** element as the fill — not a
  /// separate overlay. A top-layer halo was hiding the button interior on Flutter web.
  Widget _wrapFocusHalo(Widget child) {
    final ring = widget.focusRing;
    if (ring == null || !_showFocusRing()) return child;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: widget.borderRadius,
        boxShadow: ring.boxShadows,
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget tactileChild = widget.pressAnimationBuilder != null
        ? AnimatedBuilder(
            animation: _pressCurve,
            builder: (_, __) =>
                widget.pressAnimationBuilder!(context, _pressCurve),
          )
        : widget.child!;

    tactileChild = _withOptionalScale(tactileChild);
    tactileChild = _wrapFocusHalo(tactileChild);

    final minHit = widget.minHitTestSize;
    if (minHit != null && (minHit.width > 0 || minHit.height > 0)) {
      tactileChild = ConstrainedBox(
        constraints: BoxConstraints(
          minWidth: minHit.width > 0 ? minHit.width : 0,
          minHeight: minHit.height > 0 ? minHit.height : 0,
        ),
        child: Center(child: tactileChild),
      );
    }

    Widget core = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: widget.enabled ? widget.onPressed : null,
      onTapDown: _tracksPointerPress ? (_) => _applyPressedTarget(true) : null,
      onTapCancel:
          _tracksPointerPress ? () => _applyPressedTarget(false) : null,
      onTapUp: _tracksPointerPress ? (_) => _applyPressedTarget(false) : null,
      child: tactileChild,
    );

    final hitPad = widget.hitTestPadding;
    if (hitPad != EdgeInsets.zero) {
      core = Padding(padding: hitPad, child: core);
    }

    // Web `cursor: pointer` / `.disabled { cursor: not-allowed }` on Button & IconButton.
    core = MouseRegion(
      cursor: widget.enabled
          ? SystemMouseCursors.click
          : SystemMouseCursors.forbidden,
      onEnter: widget.onHoverChanged != null ? _handleHoverEnter : null,
      onExit: widget.onHoverChanged != null ? _handleHoverExit : null,
      child: core,
    );

    final hints = <String>[];
    if (widget.semanticsHint != null &&
        widget.semanticsHint!.trim().isNotEmpty) {
      hints.add(widget.semanticsHint!.trim());
    }
    if (widget.semanticsBusy) hints.add('Loading');
    final mergedHint = hints.isEmpty ? null : hints.join('. ');

    Set<String>? controlsTrimmed;
    final rawControls = widget.semanticsControlsSemanticsIdentifiers;
    if (rawControls != null && rawControls.isNotEmpty) {
      final parsed =
          rawControls.map((s) => s.trim()).where((s) => s.isNotEmpty).toSet();
      if (parsed.isNotEmpty) controlsTrimmed = parsed;
    }

    final id = widget.semanticsIdentifier?.trim();

    return Semantics(
      identifier: id != null && id.isNotEmpty ? id : null,
      button: true,
      enabled: widget.enabled,
      label: widget.semanticsLabel,
      hint: mergedHint,
      expanded: widget.semanticsExpanded,
      controlsNodes: controlsTrimmed,
      child: Shortcuts(
        shortcuts: widget.enabled
            ? OneUiFocusInteractive._activateShortcuts
            : const {},
        child: Actions(
          actions: <Type, Action<Intent>>{
            ActivateIntent: CallbackAction<ActivateIntent>(
              onInvoke: (_) {
                if (widget.enabled) widget.onPressed?.call();
                return null;
              },
            ),
          },
          child: Focus(
            autofocus: widget.autofocus,
            focusNode: _node,
            canRequestFocus: widget.enabled,
            skipTraversal: !widget.enabled,
            child: Builder(
              builder: (context) {
                final ring = widget.focusRing;
                final pad = ring != null && _showFocusRing()
                    ? ring.outerShadowSpreadPx
                    : 0.0;
                if (pad <= 0) return core;
                return Padding(
                  padding: EdgeInsets.all(pad),
                  child: core,
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
