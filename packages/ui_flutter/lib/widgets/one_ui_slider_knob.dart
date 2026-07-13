import 'package:flutter/material.dart';

import '../engine/focus_ring_resolve.dart';
import '../engine/slider_color_resolve.dart';
import '../engine/slider_motion_resolve.dart';
import '../engine/slider_size_resolve.dart';
import '../theme/one_ui_scope.dart';

class OneUiSliderKnob extends StatelessWidget {
  const OneUiSliderKnob({
    super.key,
    required this.knobStyle,
    required this.fraction,
    required this.vertical,
    required this.trackLength,
    required this.colors,
    required this.layout,
    required this.motion,
    required this.active,
    required this.focused,
    required this.disabled,
    required this.onPanStart,
    required this.onPanUpdate,
    required this.onPanEnd,
    required this.onTapDown,
    required this.semanticsChild,
    this.tooltip,
  });

  final String knobStyle;
  final double fraction;
  final bool vertical;
  final double trackLength;
  final SliderResolvedColors colors;
  final SliderResolvedLayout layout;
  final SliderMotionSpec motion;
  final bool active;
  final bool focused;
  final bool disabled;
  final VoidCallback onPanStart;
  final GestureDragUpdateCallback onPanUpdate;
  final VoidCallback onPanEnd;
  final GestureTapDownCallback onTapDown;
  final Widget semanticsChild;
  final Widget? tooltip;

  @override
  Widget build(BuildContext context) {
    final hit = layout.hitTargetPx;
    final scale = active || focused ? layout.knobScaleFor(knobStyle) : 1.0;
    final knobIdle = layout.knobIdleFor(knobStyle);
    final isInside = knobStyle == 'inside';

    final centerAlong = fraction * trackLength;
    final offset = vertical
        ? Offset(
            (layout.trackHeightFor(knobStyle) - hit) / 2,
            trackLength - centerAlong - hit / 2,
          )
        : Offset(
            centerAlong - hit / 2,
            (layout.trackHeightFor(knobStyle) - hit) / 2,
          );

    Widget dot = AnimatedScale(
      scale: scale,
      duration: Duration(milliseconds: motion.knobScaleDurationMs),
      curve: motion.knobScaleCurve,
      child: Container(
        width: knobIdle,
        height: knobIdle,
        decoration: BoxDecoration(
          color: isInside ? colors.innerDot : colors.knob,
          shape: BoxShape.circle,
        ),
      ),
    );

    if (focused) {
      final ds = OneUiScope.of(context).designSystem;
      if (ds != null) {
        final ring = resolveOneUiFocusRingSpec(
          context,
          ds,
          semanticAppearanceFallback: 'informative',
        );
        if (ring != null) {
          dot = DecoratedBox(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: ring.boxShadows,
            ),
            child: dot,
          );
        }
      }
    }

    return Positioned(
      left: offset.dx,
      top: offset.dy,
      width: hit,
      height: hit,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onPanStart: disabled ? null : (_) => onPanStart(),
            onPanUpdate: disabled ? null : onPanUpdate,
            onPanEnd: disabled ? null : (_) => onPanEnd(),
            onTapDown: disabled ? null : onTapDown,
            child: SizedBox(
              width: hit,
              height: hit,
              child: Center(child: ExcludeSemantics(child: dot)),
            ),
          ),
          if (tooltip != null)
            Positioned(
              bottom: vertical ? null : hit + 4,
              top: vertical ? hit + 4 : null,
              child: ExcludeSemantics(child: tooltip!),
            ),
          Positioned.fill(child: semanticsChild),
        ],
      ),
    );
  }
}
