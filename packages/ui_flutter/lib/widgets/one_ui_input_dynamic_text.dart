import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/input_dynamic_text_resolve.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_button.dart';
import 'one_ui_button_types.dart';
import 'one_ui_input_dynamic_text_a11y.dart';
import 'one_ui_input_dynamic_text_types.dart';
import 'one_ui_test_id_semantics.dart';
import 'one_ui_text_types.dart';

/// Figma `.DNA/DynamicText` helper row — `InputDynamicText.tsx` / `.native.tsx` parity.
///
/// Optional leading Body copy + optional trailing low condensed [OneUiButton].
/// Renders nothing when both `content` and `end` are empty after trim.
class OneUiInputDynamicText extends StatelessWidget {
  const OneUiInputDynamicText({
    super.key,
    this.content,
    this.end,
    this.size,
    this.disabled = false,
    this.ariaLive,
    this.onEndClick,
    this.endAriaLabel,
    this.accessibilityHint,
    this.testId,

    /// Web `id` / semantics anchor for `aria-describedby` targets ([OneUiInputField]).
    this.semanticsIdentifier,
  });

  final String? content;
  final String? end;
  final Object? size;
  final bool disabled;
  final OneUiInputDynamicTextAriaLive? ariaLive;
  final VoidCallback? onEndClick;
  final String? endAriaLabel;
  final String? accessibilityHint;
  final String? testId;
  final String? semanticsIdentifier;

  @override
  Widget build(BuildContext context) {
    OneUiScope.of(context);
    OneUiSurfaceScope.maybeOf(context);
    OneUiBrandLoadState.maybeOf(context);

    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(['OneUiScope.designSystem missing']);
    }

    final state = resolveOneUiInputDynamicTextState(
      content: content,
      end: end,
      size: size,
      disabled: disabled,
    );
    if (state.isEmpty) return const SizedBox.shrink();

    final style = resolveInputDynamicTextStyle(
      context,
      ds,
      size: state.size,
      disabled: state.isDisabled,
    );
    final bodySize = oneUiInputDynamicTextBodySize(state.size);
    final textStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.body,
      size: bodySize,
      weight: OneUiTextWeight.low,
    )?.copyWith(color: style.contentColor);
    final contentA11y =
        resolveOneUiInputDynamicTextContentA11y(ariaLive: ariaLive);

    Widget row = Row(
      key: semanticsIdentifier?.trim().isNotEmpty == true
          ? ValueKey('oneui-dynamic-text-${semanticsIdentifier!.trim()}')
          : null,
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: state.trailingOnly
          ? MainAxisAlignment.end
          : MainAxisAlignment.spaceBetween,
      children: [
        if (state.hasContent)
          Expanded(
            child: Semantics(
              liveRegion: contentA11y.liveRegion,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: style.contentMinHeightPx ?? 0,
                ),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    content!.trim(),
                    style: textStyle,
                    softWrap: true,
                  ),
                ),
              ),
            ),
          ),
        if (state.hasContent && state.hasEnd) SizedBox(width: style.gapPx),
        if (state.hasEnd)
          OneUiButton(
            label: end!.trim(),
            attention: OneUiButtonAttention.low,
            condensed: true,
            size: oneUiInputDynamicTextButtonSizeStep(state.size),
            disabled: state.isDisabled,
            onPressed: onEndClick,
            semanticsLabel: endAriaLabel,
            semanticsHint: accessibilityHint,
          ),
      ],
    );

    row = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: row,
    );

    final tid = testId?.trim();
    if (tid != null && tid.isNotEmpty) {
      row = oneUiWrapKeyedTestId(testId: tid, child: row);
    }

    final rowId = oneUiResolveSemanticsTestIdentifier(
      testId: testId,
      semanticsIdentifier: semanticsIdentifier,
    );
    if (rowId != null) {
      row = Semantics(
        identifier: rowId,
        container: true,
        child: row,
      );
    }

    return row;
  }
}
