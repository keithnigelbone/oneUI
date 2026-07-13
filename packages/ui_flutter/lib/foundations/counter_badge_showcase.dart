library;

import 'dart:async';

import 'package:flutter/material.dart';

import '../engine/motion_resolve.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_counter_badge.dart';
import '../widgets/one_ui_counter_badge_types.dart';
import '../widgets/one_ui_surface.dart';

const List<String> kCounterBadgeAppearances = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

double _gap(BuildContext context, [String tail = '4']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

TextStyle? _caption(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'S', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _label(BuildContext context, String text) {
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '3')),
    child: Text(text, style: _caption(context)),
  );
}

Widget _counter(
  BuildContext context, {
  int value = 5,
  String attention = 'high',
  String? variant,
  String size = 'm',
  String appearance = 'auto',
  int? max,
  bool showZero = false,
  String semanticsLabel = '5 notifications',
}) {
  return OneUiCounterBadge(
    value: value,
    attention: attention,
    variant: variant,
    size: size,
    appearance: appearance,
    max: max ?? 99,
    showZero: showZero,
    semanticsLabel: semanticsLabel,
  );
}

Widget buildCounterBadgeDefaultPreview(BuildContext context) {
  return Center(
    child: _counter(context, semanticsLabel: '5 notifications'),
  );
}

Widget buildCounterBadgeVariantsSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4'),
    runSpacing: _gap(context, '3'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      _counter(context, attention: 'high'),
      _counter(context, attention: 'medium'),
      _counter(context, attention: 'low'),
    ],
  );
}

Widget buildCounterBadgeSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4'),
    runSpacing: _gap(context, '3'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final s in kOneUiCounterBadgeSizes)
        _counter(context, size: s, semanticsLabel: '$s size'),
    ],
  );
}

Widget buildCounterBadgeMaxValueSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Default max (99)'),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _counter(context, value: 50, semanticsLabel: '50 notifications'),
          _counter(context, value: 99, semanticsLabel: '99 notifications'),
          _counter(context, value: 150, semanticsLabel: '150 notifications'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Custom max (9)'),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _counter(context,
              value: 5, max: 9, semanticsLabel: '5 notifications'),
          _counter(context,
              value: 9, max: 9, semanticsLabel: '9 notifications'),
          _counter(context,
              value: 15, max: 9, semanticsLabel: '15 notifications'),
        ],
      ),
    ],
  );
}

Widget buildCounterBadgeAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in kCounterBadgeAppearances) ...[
        Text(
          role,
          style: _caption(context)?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: _gap(context, '3')),
        Wrap(
          spacing: _gap(context, '4'),
          runSpacing: _gap(context, '3'),
          children: [
            _counter(
              context,
              appearance: role,
              attention: 'high',
              semanticsLabel: '5 notifications',
            ),
            _counter(
              context,
              appearance: role,
              attention: 'medium',
              semanticsLabel: '5 notifications',
            ),
            _counter(
              context,
              appearance: role,
              attention: 'low',
              semanticsLabel: '5 notifications',
            ),
          ],
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

/// Invalid appearance, hidden zero, variant precedence, and auto on Surface.
Widget buildCounterBadgeEdgeCasesSection(BuildContext context) {
  final gap = _gap(context);
  final caption = _caption(context);

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (caption != null)
        Text(
          'Edge cases aligned with web/RN: invalid explicit appearance normalises to '
          '`neutral` (debug warning); `value=0` with default `showZero` renders nothing; '
          'explicit `variant` wins over a conflicting `attention` alias; `appearance=auto` '
          'inherits slot/surface role inside [OneUiSurface].',
          style: caption,
        ),
      SizedBox(height: gap),
      _label(context,
          'Invalid appearance `primry` → neutral (compare `negative`)'),
      SizedBox(height: _gap(context, '2')),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _counter(
            context,
            appearance: 'primry',
            semanticsLabel: 'invalid appearance',
          ),
          _counter(
            context,
            appearance: 'negative',
            semanticsLabel: '5 notifications',
          ),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context,
          'Hidden when value=0 and showZero=false (web/RN return null)'),
      SizedBox(height: _gap(context, '2')),
      Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _counter(context, value: 0, semanticsLabel: '0 notifications'),
          SizedBox(width: gap),
          Text('← empty (no badge node)', style: caption),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'showZero=true reveals zero count'),
      SizedBox(height: _gap(context, '2')),
      _counter(
        context,
        value: 0,
        showZero: true,
        semanticsLabel: '0 notifications',
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context,
          'variant=ghost wins over attention=high (low-attention styling)'),
      SizedBox(height: _gap(context, '2')),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        children: [
          _counter(
            context,
            variant: 'ghost',
            attention: 'high',
            semanticsLabel: '5 notifications',
          ),
          _counter(
            context,
            attention: 'high',
            semanticsLabel: '5 notifications',
          ),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'appearance=auto inside bold Surface'),
      SizedBox(height: _gap(context, '2')),
      OneUiSurface(
        mode: 'bold',
        child: Padding(
          padding: EdgeInsets.all(_gap(context, '4')),
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: [
              _counter(
                context,
                appearance: 'auto',
                semanticsLabel: '5 notifications',
              ),
              _counter(
                context,
                appearance: 'primary',
                semanticsLabel: '5 notifications',
              ),
            ],
          ),
        ),
      ),
    ],
  );
}

Widget buildCounterBadgeResponsiveSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final s in kOneUiCounterBadgeSizes)
        _counter(context, size: s, value: 3, semanticsLabel: '3 notifications'),
    ],
  );
}

Widget buildCounterBadgeThemesSection(BuildContext context) {
  const modes = ['default', 'minimal', 'subtle', 'elevated'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 90,
              child: Text(mode, style: _caption(context)),
            ),
            SizedBox(width: _gap(context, '4-5')),
            OneUiSurface(
              mode: mode,
              child: Padding(
                padding: EdgeInsets.all(_gap(context, '4-5')),
                child: Wrap(
                  spacing: _gap(context, '4'),
                  children: [
                    _counter(context, attention: 'high'),
                    _counter(context, attention: 'medium'),
                    _counter(context, attention: 'low'),
                  ],
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

/// Entry/exit demo — Flutter motion tokens (web Motion story parity).
class CounterBadgeMotionDemo extends StatefulWidget {
  const CounterBadgeMotionDemo({
    super.key,
    this.reducedMotion = false,
    this.appearance = 'auto',
    this.size = 'm',
    this.initialValue = 5,
    this.max = 99,
  });

  final bool reducedMotion;
  final String appearance;
  final String size;
  final int initialValue;
  final int max;

  @override
  State<CounterBadgeMotionDemo> createState() => _CounterBadgeMotionDemoState();
}

class _CounterBadgeMotionDemoState extends State<CounterBadgeMotionDemo> {
  late int _count;
  late int _displayCount;
  bool _visible = true;
  int _pulseGeneration = 0;
  Timer? _numberChangeTimer;

  @override
  void initState() {
    super.initState();
    _count = widget.initialValue;
    _displayCount = widget.initialValue;
  }

  @override
  void didUpdateWidget(covariant CounterBadgeMotionDemo oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialValue != widget.initialValue) {
      _count = widget.initialValue;
      _displayCount = widget.initialValue;
    }
  }

  @override
  void dispose() {
    _numberChangeTimer?.cancel();
    super.dispose();
  }

  bool _useReducedMotion(BuildContext context) {
    if (widget.reducedMotion) return true;
    return MediaQuery.disableAnimationsOf(context);
  }

  void _handleIncrement(BuildContext context) {
    _numberChangeTimer?.cancel();
    if (_useReducedMotion(context)) {
      setState(() {
        _count += 1;
        _displayCount = _count;
      });
      return;
    }

    final ds = OneUiScope.designSystemOf(context);
    final motion = ds != null
        ? resolveCounterBadgeIncrementMotion(context, ds)
        : CounterBadgeIncrementMotionSpec.defaults;

    setState(() => _pulseGeneration += 1);
    _numberChangeTimer = Timer(
      Duration(milliseconds: motion.numberChangeDelayMs),
      () {
        if (!mounted) return;
        setState(() {
          _count += 1;
          _displayCount = _count;
        });
      },
    );
  }

  void _handleDecrement() {
    _numberChangeTimer?.cancel();
    setState(() {
      _count = (_count - 1).clamp(0, 999);
      _displayCount = _count;
    });
  }

  void _handleReset() {
    _numberChangeTimer?.cancel();
    setState(() {
      _count = widget.initialValue;
      _displayCount = widget.initialValue;
      _visible = true;
      _pulseGeneration = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final reduced = _useReducedMotion(context);
    final ds = OneUiScope.designSystemOf(context);
    final incrementMotion = ds != null
        ? resolveCounterBadgeIncrementMotion(context, ds)
        : CounterBadgeIncrementMotionSpec.defaults;

    final entryDuration = reduced
        ? const Duration(milliseconds: 135)
        : const Duration(milliseconds: 300);
    final exitDuration = reduced
        ? const Duration(milliseconds: 135)
        : const Duration(milliseconds: 200);

    return Column(
      children: [
        Wrap(
          spacing: _gap(context, '3-5'),
          children: [
            TextButton(
                onPressed: () => setState(() => _visible = true),
                child: const Text('Entry')),
            TextButton(
                onPressed: () => setState(() => _visible = false),
                child: const Text('Exit')),
            TextButton(
              onPressed: () => _handleIncrement(context),
              child: const Text('Increment'),
            ),
            TextButton(
              onPressed: _handleDecrement,
              child: const Text('Decrement'),
            ),
            TextButton(
              onPressed: _handleReset,
              child: const Text('Reset'),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '5')),
        Wrap(
          spacing: _gap(context, '4-5'),
          runSpacing: _gap(context, '4'),
          alignment: WrapAlignment.center,
          children: [
            for (final attention in ['high', 'medium', 'low'])
              Column(
                children: [
                  Text(attention, style: _caption(context)),
                  SizedBox(height: _gap(context, '3')),
                  AnimatedOpacity(
                    opacity: _visible ? 1 : 0,
                    duration: _visible ? entryDuration : exitDuration,
                    child: AnimatedScale(
                      scale: _visible || reduced ? 1 : 0.5,
                      duration: _visible ? entryDuration : exitDuration,
                      child: _CounterBadgePulseWrap(
                        pulseGeneration: _pulseGeneration,
                        motion: incrementMotion,
                        enabled: !reduced,
                        child: OneUiCounterBadge(
                          value: _displayCount,
                          max: widget.max,
                          attention: attention,
                          appearance: widget.appearance,
                          size: widget.size,
                          semanticsLabel: '$_displayCount notifications',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

/// Scale pulse on increment — web `.counter-pulse-active` parity.
class _CounterBadgePulseWrap extends StatefulWidget {
  const _CounterBadgePulseWrap({
    required this.child,
    required this.pulseGeneration,
    required this.motion,
    required this.enabled,
  });

  final Widget child;
  final int pulseGeneration;
  final CounterBadgeIncrementMotionSpec motion;
  final bool enabled;

  @override
  State<_CounterBadgePulseWrap> createState() => _CounterBadgePulseWrapState();
}

class _CounterBadgePulseWrapState extends State<_CounterBadgePulseWrap>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _initController();
  }

  void _initController() {
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: widget.motion.totalDurationMs),
    );
    _scale = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1, end: widget.motion.peakScale),
        weight: widget.motion.scaleUpDurationMs.toDouble(),
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: widget.motion.peakScale, end: 1),
        weight: widget.motion.scaleDownDurationMs.toDouble(),
      ),
    ]).animate(
      CurvedAnimation(parent: _controller, curve: widget.motion.curve),
    );
  }

  @override
  void didUpdateWidget(covariant _CounterBadgePulseWrap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.motion.totalDurationMs != oldWidget.motion.totalDurationMs ||
        widget.motion.peakScale != oldWidget.motion.peakScale) {
      _controller.dispose();
      _initController();
    }
    if (widget.enabled &&
        widget.pulseGeneration != oldWidget.pulseGeneration &&
        widget.pulseGeneration > 0) {
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) return widget.child;
    return ScaleTransition(scale: _scale, child: widget.child);
  }
}

Widget buildCounterBadgeMotionSection(BuildContext context) {
  return const CounterBadgeMotionDemo();
}
