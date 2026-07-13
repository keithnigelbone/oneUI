import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../widgets/one_ui_circular_progress_indicator.dart';
import 'circular_progress_indicator_showcase.dart';

/// Motion mode — `CircularProgressIndicator.stories.tsx` `MotionMode`.
enum CpiMotionMode { indeterminate, jumping, tracking }

/// `AnimatedProgress` + `MotionShowcase` from web Storybook.
class CpiAnimatedProgressRow extends StatefulWidget {
  const CpiAnimatedProgressRow({super.key});

  @override
  State<CpiAnimatedProgressRow> createState() => _CpiAnimatedProgressRowState();
}

class _CpiAnimatedProgressRowState extends State<CpiAnimatedProgressRow> {
  int _tracking = 0;
  int _jumping = 25;
  Timer? _trackingTimer;
  Timer? _jumpingTimer;

  @override
  void initState() {
    super.initState();
    _trackingTimer = Timer.periodic(const Duration(milliseconds: 50), (_) {
      if (!mounted) return;
      setState(() => _tracking = _tracking >= 100 ? 0 : _tracking + 1);
    });
    _jumpingTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      setState(() => _jumping = math.Random().nextInt(101));
    });
  }

  @override
  void dispose() {
    _trackingTimer?.cancel();
    _jumpingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        cpiStoryColumn(
          context,
          indicator: OneUiCircularProgressIndicator(
            value: _tracking.toDouble(),
            size: '4XL',
            content: 'text',
            valueTransitionDuration: 0,
            semanticsLabel: 'Continuous tracking progress',
          ),
          label: 'Tracking — continuous',
        ),
        SizedBox(width: cpiStoryGap(context, '6')),
        cpiStoryColumn(
          context,
          indicator: OneUiCircularProgressIndicator(
            value: _jumping.toDouble(),
            size: '4XL',
            content: 'text',
            appearance: 'positive',
            semanticsLabel: 'Jumping progress',
          ),
          label: 'Jumping — 3XL Transition',
        ),
        SizedBox(width: cpiStoryGap(context, '6')),
        cpiStoryColumn(
          context,
          indicator: const OneUiCircularProgressIndicator(
            variant: 'indeterminate',
            size: '4XL',
            appearance: 'secondary',
            semanticsLabel: 'Indeterminate loading',
          ),
          label: 'Indeterminate',
        ),
      ],
    );
  }
}

/// Single CPI for Motion story — mirrors `MotionShowcase`.
class CpiMotionShowcase extends StatefulWidget {
  const CpiMotionShowcase({
    super.key,
    required this.mode,
    this.entryExit = false,
  });

  final CpiMotionMode mode;
  final bool entryExit;

  @override
  State<CpiMotionShowcase> createState() => _CpiMotionShowcaseState();
}

class _CpiMotionShowcaseState extends State<CpiMotionShowcase> {
  int _tracking = 0;
  int _jumping = 25;
  bool _show = true;
  int _demoValue = 0;

  final List<Timer> _timers = [];
  bool _jumpingCycleCancelled = false;

  @override
  void initState() {
    super.initState();
    _bindMotion();
  }

  @override
  void didUpdateWidget(CpiMotionShowcase oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.mode != widget.mode ||
        oldWidget.entryExit != widget.entryExit) {
      _clearTimers();
      _jumpingCycleCancelled = true;
      _bindMotion();
    }
  }

  @override
  void dispose() {
    _clearTimers();
    _jumpingCycleCancelled = true;
    super.dispose();
  }

  void _clearTimers() {
    for (final t in _timers) {
      t.cancel();
    }
    _timers.clear();
  }

  void _bindMotion() {
    final mode = widget.mode;
    final entryExit = widget.entryExit;

    if (mode == CpiMotionMode.tracking && !entryExit) {
      _timers.add(Timer.periodic(const Duration(milliseconds: 50), (_) {
        if (!mounted) return;
        setState(() => _tracking = _tracking >= 100 ? 0 : _tracking + 1);
      }));
    }
    if (mode == CpiMotionMode.jumping && !entryExit) {
      _timers.add(Timer.periodic(const Duration(seconds: 2), (_) {
        if (!mounted) return;
        setState(() => _jumping = math.Random().nextInt(101));
      }));
    }

    if (!entryExit) {
      if (!_show) setState(() => _show = true);
      return;
    }

    if (mode == CpiMotionMode.indeterminate) {
      setState(() => _show = true);
      _timers.add(Timer.periodic(const Duration(seconds: 2), (_) {
        if (!mounted) return;
        setState(() => _show = !_show);
      }));
      return;
    }

    if (mode == CpiMotionMode.tracking) {
      setState(() => _demoValue = 0);
      var progress = 0;
      var waiting = false;
      _timers.add(Timer.periodic(const Duration(milliseconds: 50), (_) {
        if (!mounted || waiting) return;
        progress += 1;
        if (progress >= 100) {
          progress = 100;
          setState(() => _demoValue = 100);
          waiting = true;
          _timers.add(Timer(const Duration(milliseconds: 800), () {
            if (!mounted) return;
            progress = 0;
            waiting = false;
            setState(() => _demoValue = 0);
          }));
        } else {
          setState(() => _demoValue = progress);
        }
      }));
      return;
    }

    // Jumping + entry/exit cycle
    _jumpingCycleCancelled = false;
    setState(() => _demoValue = 0);
    _runJumpingCycle();
  }

  void _runJumpingCycle() {
    if (_jumpingCycleCancelled || !mounted) return;
    _timers.add(Timer(const Duration(milliseconds: 1500), () {
      if (_jumpingCycleCancelled || !mounted) return;
      final mid = 30 + math.Random().nextInt(50);
      setState(() => _demoValue = mid);
      _timers.add(Timer(const Duration(milliseconds: 1500), () {
        if (_jumpingCycleCancelled || !mounted) return;
        setState(() => _demoValue = 100);
        _timers.add(Timer(const Duration(milliseconds: 1700), () {
          if (_jumpingCycleCancelled || !mounted) return;
          setState(() => _demoValue = 0);
          _timers
              .add(Timer(const Duration(milliseconds: 1500), _runJumpingCycle));
        }));
      }));
    }));
  }

  @override
  Widget build(BuildContext context) {
    final entryExit = widget.entryExit;
    switch (widget.mode) {
      case CpiMotionMode.indeterminate:
        return OneUiCircularProgressIndicator(
          variant: 'indeterminate',
          size: '4XL',
          animate: entryExit,
          show: entryExit ? _show : true,
          semanticsLabel: 'Indeterminate spinner',
        );
      case CpiMotionMode.jumping:
        return OneUiCircularProgressIndicator(
          value: entryExit ? _demoValue.toDouble() : _jumping.toDouble(),
          size: '4XL',
          content: 'text',
          animate: entryExit,
          semanticsLabel: 'Determinate jumping',
        );
      case CpiMotionMode.tracking:
        return OneUiCircularProgressIndicator(
          value: entryExit ? _demoValue.toDouble() : _tracking.toDouble(),
          size: '4XL',
          content: 'text',
          valueTransitionDuration: 0,
          animate: entryExit,
          semanticsLabel: 'Determinate tracking',
        );
    }
  }
}
