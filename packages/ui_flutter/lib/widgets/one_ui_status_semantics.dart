import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';

/// Status semantics — web `role="status"` / RN `accessibilityLiveRegion: 'polite'`.
///
/// Flutter re-announces whenever `Semantics.liveRegion` stays true across rebuilds.
/// This wrapper enables [liveRegion] only on the first paint and when [label]
/// changes, matching platform intent without spamming static counters.
class OneUiStatusSemantics extends StatefulWidget {
  const OneUiStatusSemantics({
    super.key,
    required this.label,
    required this.child,
    this.announceChanges = true,
    this.identifier,
  });

  final String label;
  final Widget child;
  final String? identifier;

  /// When false, exposes [label] without a live region (IndicatorBadge RN parity).
  final bool announceChanges;

  @override
  State<OneUiStatusSemantics> createState() => _OneUiStatusSemanticsState();
}

class _OneUiStatusSemanticsState extends State<OneUiStatusSemantics> {
  String? _committedLabel;

  @override
  Widget build(BuildContext context) {
    final liveRegion = widget.announceChanges &&
        (_committedLabel == null || _committedLabel != widget.label);

    if (liveRegion) {
      SchedulerBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _committedLabel == widget.label) return;
        setState(() => _committedLabel = widget.label);
      });
    }

    return Semantics(
      container: true,
      identifier: widget.identifier,
      label: widget.label,
      liveRegion: liveRegion,
      child: widget.child,
    );
  }
}
