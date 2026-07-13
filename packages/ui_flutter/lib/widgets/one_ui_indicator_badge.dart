import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../engine/badge_slot_context.dart';
import '../engine/indicator_badge_color_resolve.dart';
import '../engine/indicator_badge_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'one_ui_indicator_badge_a11y.dart';
import 'one_ui_indicator_badge_types.dart';
import 'one_ui_status_semantics.dart';

/// Token-backed IndicatorBadge — `IndicatorBadge.tsx` / `IndicatorBadge.native.tsx`.
///
/// Non-interactive status/presence dot. Five sizes, multi-accent roles.
class OneUiIndicatorBadge extends StatelessWidget {
  const OneUiIndicatorBadge({
    super.key,
    this.size,
    this.appearance = 'auto',
    required this.semanticsLabel,
    this.testId,
  });

  final OneUiIndicatorBadgeSize? size;
  final String appearance;
  final String semanticsLabel;
  final String? testId;

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    final a11y = resolveOneUiIndicatorBadgeSemantics(
      semanticsLabel: semanticsLabel,
    );
    final tid = testId?.trim();

    if (ds == null) {
      assert(() {
        debugPrint(
          'OneUiIndicatorBadge: designSystem is null — rendering silent '
          'fallback (Semantics only). Wire OneUiScope with Convex snapshot.',
        );
        return true;
      }());
      Widget shell = const SizedBox.shrink();
      if (a11y.accessible) {
        final label = a11y.label;
        if (label != null && label.isNotEmpty) {
          shell = OneUiStatusSemantics(
            label: label,
            announceChanges: false,
            identifier: tid != null && tid.isNotEmpty ? tid : null,
            child: shell,
          );
        }
      }
      return shell;
    }

    final state = resolveOneUiIndicatorBadgeState(
      context: context,
      size: size,
      appearance: appearance,
    );

    if (state.size == 'xs' && BadgeSlotSizeScope.maybeOf(context) == null) {
      assert(() {
        debugPrint(
          'OneUiIndicatorBadge: size xs is for overlay/Badge-slot use; '
          'use s minimum for standalone indicators.',
        );
        return true;
      }());
    }

    final layout = resolveIndicatorBadgeLayout(
      context,
      ds,
      size: state.size,
      inheritSlotGeometry: size == null,
    );
    final paint = resolveIndicatorBadgeColors(
      context,
      ds,
      appearance: state.resolvedAppearance,
    );

    final cornerRadius = math.min(layout.borderRadius, layout.side / 2);

    Widget shell = SizedBox(
      width: layout.side,
      height: layout.side,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: paint.background,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.circular(cornerRadius),
          border: paint.borderWidth != null && paint.borderColor != null
              ? Border.all(
                  color: paint.borderColor!,
                  width: paint.borderWidth!,
                )
              : null,
        ),
      ),
    );

    shell = ExcludeSemantics(child: shell);

    if (a11y.accessible) {
      final label = a11y.label;
      if (label != null && label.isNotEmpty) {
        shell = OneUiStatusSemantics(
          label: label,
          announceChanges: false,
          identifier: tid != null && tid.isNotEmpty ? tid : null,
          child: shell,
        );
      }
    }

    shell = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-indicator-badge|data-size=${state.dataSize}|'
        'data-appearance=${state.dataAppearance}',
      ),
      child: shell,
    );

    if (tid != null && tid.isNotEmpty) {
      shell = KeyedSubtree(key: ValueKey<String>(tid), child: shell);
    }

    return shell;
  }
}
