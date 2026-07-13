import 'package:flutter/material.dart';

import '../engine/badge_color_resolve.dart';
import '../engine/badge_size_resolve.dart';
import '../engine/badge_slot_context.dart';
import '../engine/badge_slot_padding.dart';
import '../theme/one_ui_scope.dart';
import 'badge_slot_utils.dart';
import 'badge_surface_immune_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_badge_a11y.dart';
import 'one_ui_badge_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_status_semantics.dart';
import 'one_ui_surface.dart';

export 'one_ui_counter_badge.dart';
export 'one_ui_indicator_badge.dart';

/// Token-backed Badge — `Badge.tsx` / `Badge.native.tsx`.
///
/// Non-interactive status chip with start/end slots. Colours and geometry from
/// Convex `--Badge-*` + brand typography via [resolveBadgeLayout].
///
/// Start/end accept [OneUiCounterBadge] and [OneUiIndicatorBadge] (same as
/// React/RN) with surface-immune shielding and nested-badge padding.
class OneUiBadge extends StatelessWidget {
  const OneUiBadge({
    super.key,
    this.child,
    this.size = 'm',
    this.variant,
    this.attention,
    this.appearance = 'auto',
    this.start,
    this.end,
    this.semanticsLabel,
    this.semanticsHint,
    this.testId,
  });

  final Object? child;
  final OneUiBadgeSize size;
  final OneUiBadgeVariant? variant;
  final OneUiBadgeAttention? attention;
  final OneUiBadgeAppearance appearance;
  final Widget? start;
  final Widget? end;
  final String? semanticsLabel;
  final String? semanticsHint;
  final String? testId;

  @override
  Widget build(BuildContext context) {
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Badge without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final state = resolveOneUiBadgeStateInContext(
      context,
      size: size,
      variant: variant,
      attention: attention,
      appearance: appearance,
    );

    final hasStart = start != null;
    final hasEnd = end != null;
    final slotFlags = BadgeSlotPaddingFlags(
      startIsBadge: isBadgeNestedSlotWidget(start),
      endIsBadge: isBadgeNestedSlotWidget(end),
    );

    final layout = resolveBadgeLayout(
      context,
      ds,
      size: state.size,
      hasStart: hasStart,
      hasEnd: hasEnd,
      slotFlags: slotFlags,
    );
    final paint = resolveBadgeColors(
      context,
      ds,
      variant: state.resolvedVariant,
      appearance: state.resolvedAppearance,
    );

    final a11y = resolveOneUiBadgeA11yPlan(
      semanticsLabel: semanticsLabel,
      child: child,
      semanticsHint: semanticsHint,
      start: start,
      end: end,
    );

    final labelStyle = layout.labelStyle.copyWith(color: paint.foreground);

    final rowChildren = <Widget>[];

    if (a11y.offscreenBadgeLabel && a11y.label != null) {
      rowChildren.add(
        Semantics(
          label: a11y.label,
          container: true,
          child: const SizedBox.shrink(),
        ),
      );
    }

    if (hasStart) {
      rowChildren.add(
        _BadgeSlot(
          appearance: state.resolvedAppearance,
          slotSizes: kBadgeSlotSizes[state.size]!,
          slotIconColor: paint.slotIconColor,
          surfaceMode: _badgeSurfaceModeForVariant(state.resolvedVariant),
          hideFromAccessibility: a11y.hideSlotsFromA11y,
          surfaceImmune: isSurfaceImmuneSlotWidget(start),
          child: start!,
        ),
      );
    }

    if (a11y.hasPlainTextChild) {
      final text = badgePlainTextChild(child)!;
      final compactTypography =
          state.size == 'xs' || state.size == 's' || state.size == 'm';
      Widget label = Text(
        text,
        style: labelStyle,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textHeightBehavior: compactTypography
            ? const TextHeightBehavior(
                applyHeightToFirstAscent: false,
                applyHeightToLastDescent: false,
              )
            : const TextHeightBehavior(),
      );
      if (a11y.hideVisualTextFromA11y) {
        label = ExcludeSemantics(child: label);
      } else if (a11y.exposeVisibleTextToA11y && a11y.label != null) {
        label = Semantics(
          container: true,
          label: a11y.label,
          child: ExcludeSemantics(child: label),
        );
      }
      rowChildren.add(Flexible(child: label));
    } else if (a11y.hasWidgetChild) {
      rowChildren.add(
        Flexible(
          child: a11y.emitAnonymousStatusRegion &&
                  a11y.anonymousStatusLabel == null
              ? (child as Widget)
              : ExcludeSemantics(child: child as Widget),
        ),
      );
    }

    if (hasEnd) {
      rowChildren.add(
        _BadgeSlot(
          appearance: state.resolvedAppearance,
          slotSizes: kBadgeSlotSizes[state.size]!,
          slotIconColor: paint.slotIconColor,
          surfaceMode: _badgeSurfaceModeForVariant(state.resolvedVariant),
          hideFromAccessibility: a11y.hideSlotsFromA11y,
          surfaceImmune: isSurfaceImmuneSlotWidget(end),
          child: end!,
        ),
      );
    }

    Widget content = DefaultTextStyle(
      style: labelStyle,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: layout.gap,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: rowChildren,
      ),
    );

    Widget shell = ConstrainedBox(
      constraints: BoxConstraints(minHeight: layout.height),
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
          padding: layout.padding,
          // `Align` + widthFactor shrink-wraps like CSS `inline-flex` (unlike
          // `Center`, which expands to the parent's max width and can squeeze the
          // Row when brand tokens set a tight `--Badge-height-*`).
          child: Align(
            alignment: Alignment.center,
            widthFactor: 1,
            heightFactor: 1,
            child: content,
          ),
        ),
      ),
    );

    if (a11y.rootAccessible && a11y.label != null) {
      shell = ExcludeSemantics(child: shell);
      shell = OneUiStatusSemantics(
        label: a11y.label!,
        child: Semantics(
          hint: a11y.hint,
          child: shell,
        ),
      );
    } else if (a11y.emitAnonymousStatusRegion) {
      // Web `role="status"` — unnamed status node when child is a widget subtree.
      // TalkBack tracks live regions via label/value changes on the semantics node;
      // a bare `liveRegion` wrapper with ExcludeSemantics children stays silent.
      final anonymousLabel = a11y.anonymousStatusLabel;
      if (anonymousLabel != null) {
        shell = ExcludeSemantics(child: shell);
        shell = OneUiStatusSemantics(
          label: anonymousLabel,
          child: Semantics(
            hint: a11y.hint,
            child: shell,
          ),
        );
      } else {
        if (a11y.hasWidgetChild) {
          warnUnlabeledWidgetChildOneUiBadge();
        }
        shell = Semantics(
          container: true,
          liveRegion: true,
          hint: a11y.hint,
          child: MergeSemantics(child: shell),
        );
      }
    }

    shell = KeyedSubtree(
      key: ValueKey<String>(
        oneUiBadgeDataPayloadKey(
          state,
          includeAttention: variant == null,
        ),
      ),
      child: shell,
    );

    final tid = testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      shell = Semantics(identifier: tid, child: shell);
      shell = KeyedSubtree(key: ValueKey<String>(tid), child: shell);
    }

    return shell;
  }
}

String _badgeSurfaceModeForVariant(String variant) {
  return switch (variant) {
    'subtle' => 'subtle',
    'ghost' => 'ghost',
    _ => 'bold',
  };
}

class _BadgeSlot extends StatelessWidget {
  const _BadgeSlot({
    required this.child,
    required this.appearance,
    required this.slotSizes,
    required this.slotIconColor,
    required this.surfaceMode,
    required this.hideFromAccessibility,
    required this.surfaceImmune,
  });

  final Widget child;
  final String appearance;
  final BadgeSlotSizes slotSizes;
  final Color slotIconColor;
  final String surfaceMode;
  final bool hideFromAccessibility;
  final bool surfaceImmune;

  @override
  Widget build(BuildContext context) {
    Widget slot = OneUiSlotParentAppearanceScope(
      appearance: appearance,
      child: BadgeSlotSizeScope(
        sizes: slotSizes,
        child: BadgeSlotIconColorScope(
          color: slotIconColor,
          child: child,
        ),
      ),
    );

    if (surfaceImmune) {
      slot = BadgeSurfaceImmuneScope(child: slot);
    }

    slot = OneUiSurface(
      mode: surfaceMode,
      appearance: appearance,
      transparentBackground: true,
      child: slot,
    );

    if (hideFromAccessibility) {
      slot = ExcludeSemantics(child: slot);
    }

    return Align(alignment: Alignment.center, child: slot);
  }
}
