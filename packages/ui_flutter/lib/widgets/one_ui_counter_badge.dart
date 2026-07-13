import 'package:flutter/material.dart';

import '../engine/counter_badge_color_resolve.dart';
import '../engine/counter_badge_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_counter_badge_a11y.dart';
import 'one_ui_counter_badge_types.dart';
import 'one_ui_status_semantics.dart';

/// Token-backed CounterBadge — `CounterBadge.tsx` / `CounterBadge.native.tsx`.
///
/// Non-interactive numeric count chip. Supports attention levels, multi-accent
/// roles, and four sizes. Inherits size from [BadgeSlotSizeScope] when nested
/// in a Badge slot.
class OneUiCounterBadge extends StatelessWidget {
  const OneUiCounterBadge({
    super.key,
    required this.value,
    this.max = 99,
    this.showZero = false,
    this.size,
    this.variant,
    this.attention,
    this.appearance = 'auto',
    this.semanticsLabel,
    this.testId,
  });

  final int value;
  final int max;
  final bool showZero;
  final OneUiCounterBadgeSize? size;
  final OneUiCounterBadgeVariant? variant;
  final OneUiCounterBadgeAttention? attention;
  final String appearance;
  final String? semanticsLabel;
  final String? testId;

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiMissingDesignSystemPlaceholder([
        'Flutter cannot render a token-backed CounterBadge without Convex '
            '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
      ]);
    }

    final state = resolveOneUiCounterBadgeState(
      context: context,
      value: value,
      max: max,
      showZero: showZero,
      size: size,
      variant: variant,
      attention: attention,
      appearance: appearance,
    );

    final a11y = resolveOneUiCounterBadgeSemantics(
      semanticsLabel: semanticsLabel,
      displayValue: state.displayValue,
      isDotMode: state.isDotMode,
    );
    final tid = testId?.trim();

    if (state.isHidden) {
      if (a11y.accessible) {
        final label = a11y.label;
        if (label != null && label.isNotEmpty) {
          return OneUiStatusSemantics(
            label: label,
            identifier: tid != null && tid.isNotEmpty ? tid : null,
            child: const SizedBox.shrink(),
          );
        }
      }
      return const SizedBox.shrink();
    }

    final layout = resolveCounterBadgeLayout(
      context,
      ds,
      size: state.size,
      inheritSlotGeometry: size == null,
    );
    final paint = resolveCounterBadgeColors(
      context,
      ds,
      variant: state.resolvedVariant,
      appearance: state.resolvedAppearance,
    );

    final textScaler = MediaQuery.textScalerOf(context);
    final scaledMinHeight = layout.height * textScaler.scale(1.0);

    final padH = layout.padH;
    final showLabel = state.visualDisplayValue.isNotEmpty;

    Widget shell = ConstrainedBox(
      constraints: BoxConstraints(
        minHeight: scaledMinHeight,
        minWidth: scaledMinHeight,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: paint.background,
          borderRadius: BorderRadius.circular(layout.borderRadius),
          border: paint.borderWidth != null && paint.borderColor != null
              ? Border.all(
                  color: paint.borderColor!,
                  width: paint.borderWidth!,
                )
              : null,
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: padH),
          child: Align(
            alignment: Alignment.center,
            widthFactor: 1,
            heightFactor: 1,
            child: showLabel
                ? Text(
                    state.visualDisplayValue,
                    style: layout.labelStyle.copyWith(
                      color: paint.foreground,
                    ),
                    maxLines: 1,
                  )
                : const SizedBox.shrink(),
          ),
        ),
      ),
    );

    shell = ExcludeSemantics(child: shell);

    if (a11y.accessible) {
      final label = a11y.label;
      if (label != null && label.isNotEmpty) {
        shell = OneUiStatusSemantics(
          label: label,
          identifier: tid != null && tid.isNotEmpty ? tid : null,
          child: shell,
        );
      }
    }

    shell = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-counter-badge|data-size=${state.dataSize}|data-variant=${state.dataVariant}|'
        'data-attention=${state.dataAttention}|data-appearance=${state.dataAppearance}',
      ),
      child: shell,
    );

    if (tid != null && tid.isNotEmpty) {
      shell = KeyedSubtree(key: ValueKey<String>(tid), child: shell);
    }

    return shell;
  }
}
