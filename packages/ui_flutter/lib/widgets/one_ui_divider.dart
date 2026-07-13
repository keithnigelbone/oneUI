import 'package:flutter/material.dart';

import '../brand/divider_brand_bind.dart';
import '../engine/divider_color_resolve.dart';
import '../engine/divider_size_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'convex_design_system_guard.dart';
import 'one_ui_divider_a11y.dart';
import 'one_ui_divider_types.dart';
import 'one_ui_icon.dart';
import 'one_ui_icon_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_text.dart';
import 'one_ui_text_types.dart';

export 'one_ui_divider_types.dart';
export 'one_ui_divider_a11y.dart';

/// Visual separator — `Divider.tsx` / `Divider.native.tsx`.
///
/// Token-backed stroke, multi-accent appearance, optional centre icon/text,
/// and surface-context-aware colours via [OneUiSurfaceScope].
class OneUiDivider extends StatelessWidget {
  const OneUiDivider({
    super.key,
    this.orientation = kOneUiDividerHorizontal,
    this.size = kOneUiDividerSizeM,

    /// Figma `slot` — `none` (default) ignores [child]; `icon` / `label` render centre slot.
    this.content = kOneUiDividerContentNone,
    this.child,
    this.contentAlign = kOneUiDividerAlignCenter,
    this.appearance = 'auto',
    this.attention = 'low',
    this.roundCaps = kOneUiDividerRoundCapsDefault,
    this.semanticsHint,
    this.accessibilityHint,
    this.testId,
    this.testID,
  });

  final OneUiDividerOrientation orientation;
  final OneUiDividerSize size;

  /// Figma `slot`: `none` | `icon` | `label` (web alias `text` → `label`).
  final OneUiDividerContent content;

  /// Plain [String] / [num] or [OneUiIcon] / [OneUiText] when slot is `icon` / `label`.
  final Object? child;
  final OneUiDividerContentAlign contentAlign;
  final OneUiDividerAppearance appearance;
  final OneUiDividerAttention attention;
  final bool roundCaps;
  final String? semanticsHint;
  final String? accessibilityHint;
  final String? testId;
  final String? testID;

  @override
  Widget build(BuildContext context) {
    bindDividerBrandScope(context);
    final ds = OneUiScope.designSystemOf(context);
    if (ds == null) {
      return oneUiConvexGapPlaceholder(
        [
          'Flutter cannot render a token-backed Divider without Convex '
              '`nativeTheme:getNativeThemeSnapshot.designSystem`.',
        ],
      );
    }

    final state = resolveOneUiDividerState(
      orientation: orientation,
      size: size,
      content: content,
      child: child,
      contentAlign: contentAlign,
      appearance: appearance,
      attention: attention,
      roundCaps: roundCaps,
    );

    final layout = resolveDividerLayout(
      context,
      ds,
      size: state.size,
      roundCaps: state.roundCaps,
    );
    final colors = resolveDividerColors(
      context,
      ds,
      resolvedAppearance: state.resolvedAppearance,
      attention: state.attention,
    );
    final a11y = resolveOneUiDividerSemantics(
      orientation: state.orientation,
      semanticsHint: semanticsHint,
      accessibilityHint: accessibilityHint,
    );

    final isHorizontal = state.orientation == kOneUiDividerHorizontal;
    final radius = layout.roundCapRadiusPx > 0
        ? BorderRadius.circular(layout.roundCapRadiusPx)
        : BorderRadius.zero;
    final lineDecoration = BoxDecoration(
      color: colors.lineColor,
      borderRadius: radius,
    );

    Widget root;
    if (!state.hasContent) {
      root = _SimpleDivider(
        isHorizontal: isHorizontal,
        strokePx: layout.strokePx,
        decoration: lineDecoration,
      );
    } else {
      final showLeading = state.contentAlign != kOneUiDividerAlignStart;
      final showTrailing = state.contentAlign != kOneUiDividerAlignEnd;
      final slot = _buildContentSlot(
        context,
        state: state,
        appearanceProp: appearance,
        iconBoxSize: layout.iconSizePx,
      );

      if (isHorizontal) {
        root = Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (showLeading)
              Expanded(
                child: _LineSegment(
                  isHorizontal: true,
                  strokePx: layout.strokePx,
                  decoration: lineDecoration,
                ),
              ),
            if (showLeading) SizedBox(width: layout.contentGapPx),
            Flexible(fit: FlexFit.loose, child: slot),
            if (showTrailing) SizedBox(width: layout.contentGapPx),
            if (showTrailing)
              Expanded(
                child: _LineSegment(
                  isHorizontal: true,
                  strokePx: layout.strokePx,
                  decoration: lineDecoration,
                ),
              ),
          ],
        );
      } else {
        root = Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (showLeading)
              Expanded(
                child: _LineSegment(
                  isHorizontal: false,
                  strokePx: layout.strokePx,
                  decoration: lineDecoration,
                ),
              ),
            if (showLeading) SizedBox(height: layout.contentGapPx),
            Flexible(fit: FlexFit.loose, child: slot),
            if (showTrailing) SizedBox(height: layout.contentGapPx),
            if (showTrailing)
              Expanded(
                child: _LineSegment(
                  isHorizontal: false,
                  strokePx: layout.strokePx,
                  decoration: lineDecoration,
                ),
              ),
          ],
        );
      }
    }

    // Web `role="separator"` / RN `role: 'separator'` — Flutter 3.32 has no
    // [SemanticsRole.separator]; container landmark + explicitChildNodes is the
    // closest cross-platform mapping until the engine adds the role.
    root = KeyedSubtree(
      key: ValueKey<String>(state.dataPayloadKey),
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        hint: a11y.hint,
        child: root,
      ),
    );

    final id = testId ?? testID;
    if (id != null) {
      root = Semantics(identifier: id, child: root);
    }

    if (!isHorizontal && !state.hasContent) {
      root = Align(alignment: Alignment.center, child: root);
    }

    // Web `width: 100%` / `.withContent { width: 100% }` — always span the parent.
    if (isHorizontal) {
      root = SizedBox(width: double.infinity, child: root);
    } else if (state.hasContent) {
      root = SizedBox(height: double.infinity, child: root);
    }

    return root;
  }

  Widget _buildContentSlot(
    BuildContext context, {
    required OneUiDividerState state,
    required OneUiDividerAppearance appearanceProp,
    required double iconBoxSize,
  }) {
    final iconEmphasisName =
        oneUiDividerAttentionToIconEmphasis(state.attention);
    final iconEmphasis = switch (iconEmphasisName) {
      'high' => OneUiIconEmphasis.high,
      'medium' => OneUiIconEmphasis.medium,
      _ => OneUiIconEmphasis.low,
    };
    final textAttention = oneUiDividerAttentionToTextAttention(state.attention);

    Widget enriched(Object? raw) {
      if (raw is String || raw is num) {
        return OneUiText(
          variant: OneUiTextVariant.label,
          size: kOneUiDividerTextSize,
          weight: OneUiTextWeight.medium,
          attention: textAttention,
          appearance: appearanceProp,
          text: raw.toString(),
          textAlign: OneUiTextAlign.center,
        );
      }
      if (raw is OneUiText) {
        return OneUiText(
          variant: raw.variant,
          size: raw.size ?? kOneUiDividerTextSize,
          weight: raw.weight,
          attention: raw.attention == OneUiTextAttention.none
              ? textAttention
              : raw.attention,
          appearance:
              raw.appearance == 'auto' ? appearanceProp : raw.appearance,
          text: raw.text,
          child: raw.child,
          textAlign: raw.textAlign ?? OneUiTextAlign.center,
          excludeFromSemantics: raw.excludeFromSemantics,
        );
      }
      if (raw is OneUiIcon) {
        return SizedBox(
          width: iconBoxSize,
          height: iconBoxSize,
          child: Center(
            child: OneUiIcon(
              icon: raw.icon,
              size: kOneUiDividerIconSize,
              appearance: raw.appearance ?? state.resolvedAppearance,
              emphasis: iconEmphasis,
              excludeFromSemantics: raw.excludeFromSemantics ?? true,
              testId: raw.testId ?? 'divider-child-icon',
            ),
          ),
        );
      }
      if (raw is Widget) return raw;
      return const SizedBox.shrink();
    }

    return OneUiSlotParentAppearanceScope(
      appearance: state.resolvedAppearance,
      child: enriched(child),
    );
  }
}

class _SimpleDivider extends StatelessWidget {
  const _SimpleDivider({
    required this.isHorizontal,
    required this.strokePx,
    required this.decoration,
  });

  final bool isHorizontal;
  final double strokePx;
  final BoxDecoration decoration;

  @override
  Widget build(BuildContext context) {
    if (isHorizontal) {
      return SizedBox(
        width: double.infinity,
        height: strokePx,
        child: DecoratedBox(decoration: decoration),
      );
    }
    return SizedBox(
      width: strokePx,
      child: DecoratedBox(
        decoration: decoration,
        child: const SizedBox.expand(),
      ),
    );
  }
}

class _LineSegment extends StatelessWidget {
  const _LineSegment({
    required this.isHorizontal,
    required this.strokePx,
    required this.decoration,
  });

  final bool isHorizontal;
  final double strokePx;
  final BoxDecoration decoration;

  @override
  Widget build(BuildContext context) {
    final line = DecoratedBox(decoration: decoration);
    if (isHorizontal) {
      return ExcludeSemantics(
        child: SizedBox(height: strokePx, width: double.infinity, child: line),
      );
    }
    return ExcludeSemantics(
      child: SizedBox(width: strokePx, child: line),
    );
  }
}
