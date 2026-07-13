import 'package:flutter/material.dart';

import '../engine/icon_contained_color_resolve.dart';
import '../engine/icon_contained_size_resolve.dart';
import 'one_ui_icon_contained_a11y.dart';
import 'one_ui_icon_contained_types.dart';
import 'one_ui_test_id_semantics.dart';
import 'semantic_icon_material.dart';

/// Design-system IconContained — parity with `IconContained.tsx`.
///
/// - 5 sizes (xs–xl), 2 attention levels (default medium), 9 appearance roles
/// - Circular container (`Shape-Pill` default)
/// - Surface-context-aware fills and on-colours
/// - Non-interactive; `semanticsLabel` → `role="img"` (inner glyph hidden)
class OneUiIconContained extends StatelessWidget {
  const OneUiIconContained({
    required this.icon,
    super.key,
    this.size = 'm',
    this.attention = OneUiIconContainedAttention.medium,
    this.appearance,
    this.disabled = false,

    /// Web `aria-label` / RN `accessibilityLabel`.
    this.semanticsLabel,

    /// RN `accessibilityHint` / supplementary web description text.
    this.semanticsHint,

    /// Web `aria-hidden` / RN `accessibilityElementsHidden`.
    this.excludeFromSemantics,

    /// RN `testID` / web `data-testid`.
    this.testId,
  });

  final Object icon;

  final OneUiIconContainedSize size;

  final OneUiIconContainedAttention attention;

  final OneUiIconContainedAppearance? appearance;

  final bool disabled;

  /// Web `aria-label` / RN `accessibilityLabel`.
  final String? semanticsLabel;

  /// RN `accessibilityHint`.
  final String? semanticsHint;

  /// Web `aria-hidden` — hides the entire contained icon from assistive tech.
  final bool? excludeFromSemantics;

  /// RN `testID` / web `data-testid`.
  final String? testId;

  @override
  Widget build(BuildContext context) {
    final resolvedAppearance = resolveOneUiIconContainedAppearance(
      context,
      appearance,
    );
    final state = OneUiIconContainedResolvedState(
      size: oneUiResolveIconContainedSize(size),
      attention: attention,
      appearance: resolvedAppearance,
      isDisabled: disabled,
    );

    final colors = resolveIconContainedColors(
      context,
      appearance: resolvedAppearance,
      attention: state.attention,
    );
    final sizes = resolveIconContainedSizes(context, state.size);
    final radius = resolveIconContainedBorderRadiusPx(
      context,
      size: state.size,
      containerPx: sizes.containerPx,
    );
    final disabledOpacity = resolveIconContainedDisabledOpacity(context);

    final semanticName = icon is String ? icon as String : null;
    final customGlyph = icon is Widget ? icon as Widget : null;
    final a11y = resolveOneUiIconContainedSemantics(
      semanticsLabel: semanticsLabel,
      semanticsHint: semanticsHint,
      excludeFromSemantics: excludeFromSemantics,
      isDisabled: state.isDisabled,
    );

    Widget glyph;
    if (customGlyph != null) {
      // IconContained: no FittedBox — custom glyphs render at intrinsic size
      // inside the fixed circular container (fix #4). Colour via IconTheme here;
      // plain OneUiIcon scales glyphs with FittedBox and tints via outer shell.
      glyph = IconTheme.merge(
        data: IconThemeData(color: colors.foreground, size: sizes.iconPx),
        child: Center(child: customGlyph),
      );
    } else if (semanticName != null) {
      glyph = OneUiSemanticIcon(
        semanticName,
        size: sizes.iconPx,
        color: colors.foreground,
        semanticLabel: '',
      );
    } else {
      glyph = const SizedBox.shrink();
    }

    final shell = Opacity(
      opacity: state.isDisabled ? disabledOpacity : 1,
      child: SizedBox(
        width: sizes.containerPx,
        height: sizes.containerPx,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: BorderRadius.circular(radius),
          ),
          child: Center(
            child: ExcludeSemantics(
              child: glyph,
            ),
          ),
        ),
      ),
    );

    final keyed = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-icon-contained|${state.dataAttributes.entries.map((e) => '${e.key}=${e.value}').join('|')}|disabled=${state.isDisabled}',
      ),
      child: shell,
    );

    Widget result = keyed;
    final tid = testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;
    if (hasTestId) {
      result = oneUiWrapKeyedTestId(testId: tid, child: result);
    }

    if (!a11y.exposed) {
      if (hasTestId) {
        return oneUiWrapDecorativeTestId(testId: tid, child: result);
      }
      return ExcludeSemantics(child: result);
    }

    // Web: outer `role="img"` + `aria-label`; inner glyph is `aria-hidden`.
    return Semantics(
      label: a11y.label,
      hint: a11y.hint,
      image: true,
      excludeSemantics: true,
      container: true,
      identifier: hasTestId ? tid : null,
      child: result,
    );
  }
}
