import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/badge_slot_context.dart';
import '../engine/input_feedback_resolve.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_icon.dart';
import 'one_ui_icon_types.dart';
import 'one_ui_input_feedback_a11y.dart';
import 'one_ui_input_feedback_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_test_id_semantics.dart';
import 'one_ui_text_types.dart';

/// Validation / contextual feedback row — `InputFeedback.tsx` / `.native.tsx`.
///
/// Four variants × three attention levels × S/M/L sizes. Icon is decorative;
/// message is announced on the root live region.
class OneUiInputFeedback extends StatelessWidget {
  const OneUiInputFeedback({
    super.key,
    this.variant = OneUiInputFeedbackVariant.negative,
    this.attention = OneUiInputFeedbackAttention.low,
    this.size = OneUiInputFeedbackSize.m,
    String? feedbackMessage,

    /// Figma / web snake_case alias for [feedbackMessage].
    String? feedback_message,
    this.child,
    this.customIcon,

    /// Web `customIcon` semantic name — builds [OneUiIcon] when [customIcon] is null.
    this.customIconName,
    this.role,
    this.ariaLabel,
    this.ariaHidden = false,
    this.accessibilityHint,
    this.testId,

    /// Web `id` / semantics anchor for `aria-describedby` targets ([OneUiInputField]).
    this.semanticsIdentifier,

    /// Web `fieldErrorSlot` — empty `Field.Error` anchor when invalid without message.
    this.fieldErrorSlot = false,
  }) : _feedbackMessage = feedbackMessage ?? feedback_message;

  final OneUiInputFeedbackVariant variant;
  final OneUiInputFeedbackAttention attention;
  final Object? size;
  final String? _feedbackMessage;
  final Widget? child;
  final Widget? customIcon;
  final String? customIconName;
  final OneUiInputFeedbackRole? role;
  final String? ariaLabel;
  final bool ariaHidden;
  final String? accessibilityHint;
  final String? testId;
  final String? semanticsIdentifier;
  final bool fieldErrorSlot;

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiSurfaceScope.maybeOf(context);
    OneUiBrandLoadState.maybeOf(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final state = resolveOneUiInputFeedbackState(
      variant: variant,
      attention: attention,
      size: size,
      feedbackMessage: _feedbackMessage,
      child: child,
      roleOverride: role,
    );

    final showFieldErrorSlot =
        fieldErrorSlot && variant == OneUiInputFeedbackVariant.negative;

    // Web: null when no message and no field-error anchor (customIcon alone does not render).
    if (!state.hasMessage && !showFieldErrorSlot) {
      return const SizedBox.shrink();
    }

    if (showFieldErrorSlot && !state.hasMessage) {
      return Semantics(
        identifier: oneUiResolveSemanticsTestIdentifier(
          testId: testId,
          semanticsIdentifier: semanticsIdentifier,
        ),
        container: true,
        role: SemanticsRole.alert,
        liveRegion: true,
        child: const SizedBox.shrink(),
      );
    }

    final layout = resolveInputFeedbackLayout(
      context,
      ds,
      size: state.resolvedSize,
      attention: state.resolvedAttention,
    );
    final paint = resolveInputFeedbackPaint(
      context,
      variant: state.resolvedVariant,
      attention: state.resolvedAttention,
    );
    final a11y = resolveOneUiInputFeedbackSemantics(
      state: state,
      ariaLabel: ariaLabel,
      ariaHidden: ariaHidden,
    );

    final messageStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: layout.bodySizeKey,
      weight: OneUiTextWeight.low,
    )?.copyWith(color: paint.text);

    final iconName = customIconName ?? state.resolvedVariant.defaultIconName;
    final iconAppearance = state.resolvedVariant.surfaceRole;

    Widget resolvedCustomIcon = customIcon ??
        OneUiIcon(
          icon: iconName,
          size: layout.iconSizeKey,
          appearance: iconAppearance,
          emphasis: paint.iconEmphasis,
          excludeFromSemantics: true,
        );

    // RN `ComponentSlotIconContext` / web `Icon` appearance + emphasis — custom icons
    // must inherit variant `tintedA11y` (not `OneUiIcon`'s default `high` emphasis).
    Widget iconSlot = SizedBox(
      width: layout.iconSizePx,
      height: layout.iconSizePx,
      child: Center(
        child: ExcludeSemantics(
          child: OneUiSlotParentAppearanceScope(
            appearance: iconAppearance,
            child: BadgeSlotIconColorScope(
              color: paint.iconColor,
              child: resolvedCustomIcon,
            ),
          ),
        ),
      ),
    );

    Widget row = DecoratedBox(
      decoration: BoxDecoration(
        color: paint.background,
        borderRadius: layout.borderRadius,
      ),
      child: Padding(
        padding: layout.padding,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            iconSlot,
            if (state.hasMessage) ...[
              SizedBox(width: layout.gapPx),
              Expanded(
                child: ExcludeSemantics(
                  child: state.message != null
                      ? Text(
                          state.message!,
                          style: messageStyle,
                          softWrap: true,
                        )
                      : child ?? const SizedBox.shrink(),
                ),
              ),
            ],
          ],
        ),
      ),
    );

    if (a11y.container) {
      // Flutter forbids `SemanticsRole.alert` / `SemanticsRole.status` with `liveRegion` on one node.
      // Map alert → role only; status → polite live region only (RN `accessibilityRole` parity).
      final semanticsRole = state.role == OneUiInputFeedbackRole.alert
          ? SemanticsRole.alert
          : null;
      row = Semantics(
        identifier: oneUiResolveSemanticsTestIdentifier(
          testId: testId,
          semanticsIdentifier: semanticsIdentifier,
        ),
        label: a11y.label,
        hint: accessibilityHint,
        liveRegion: state.role == OneUiInputFeedbackRole.status
            ? a11y.liveRegion
            : false,
        container: true,
        role: semanticsRole,
        child: row,
      );
    }

    row = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: row,
    );

    final tid = testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      row = oneUiWrapKeyedTestId(testId: tid, child: row);
    }

    return row;
  }
}
