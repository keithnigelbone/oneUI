import 'package:flutter/material.dart';

import '../engine/icon_color_resolve.dart';
import '../engine/icon_size_resolve.dart';
import 'one_ui_icon_a11y.dart';
import 'one_ui_icon_remote.dart';
import 'one_ui_icon_types.dart';
import 'one_ui_slot_parent_appearance.dart';
import 'one_ui_test_id_semantics.dart';
import 'semantic_icon_material.dart';

/// Design-system Icon — parity with `packages/ui/src/components/Icon/Icon.tsx`.
///
/// - 20 spacing-index sizes
/// - 8 appearance roles × 5 emphasis levels (surface-context-aware)
/// - [icon]: Jio semantic name, remote URL, or custom [Widget] glyph
/// - Decorative by default; [semanticsLabel] / [excludeFromSemantics] for a11y
class OneUiIcon extends StatelessWidget {
  const OneUiIcon({
    required this.icon,
    super.key,
    this.size = '5',
    this.appearance,
    this.emphasis = OneUiIconEmphasis.high,
    this.semanticsLabel,
    this.excludeFromSemantics,

    /// When [icon] is a raster URL, tint with role colour (SVG always tints).
    this.tintRaster = false,
    this.onLoad,
    this.onError,

    /// When set, overrides [size] token resolution (e.g. CPI centre slot CSS).
    this.boxSize,

    /// RN `testID` / web `data-testid`.
    this.testId,

    /// Inline icons can opt into user text scaling; standalone icons remain fixed.
    this.respectTextScale = false,
  });

  /// Jio semantic name (`'heart'`), remote URL (`https://…`), or custom glyph ([Widget]).
  ///
  /// Strings starting with `http://` or `https://` load SVG/raster from the network.
  final Object icon;

  final OneUiIconSize size;

  /// When null, inherits [OneUiSlotParentAppearanceScope] then defaults to `neutral`.
  final OneUiIconAppearance? appearance;

  final OneUiIconEmphasis emphasis;

  /// Web `aria-label` — when set, icon is exposed as `Semantics` image (not decorative).
  final String? semanticsLabel;

  /// Web `aria-hidden` — `true` hides from assistive tech even if [semanticsLabel] is set.
  final bool? excludeFromSemantics;

  /// RN `testID` / web `data-testid`.
  final String? testId;

  final bool tintRaster;
  final VoidCallback? onLoad;
  final VoidCallback? onError;

  /// Resolved box dimension override — skips [resolveOneUiIconSizePx] when set.
  final double? boxSize;

  /// Whether the resolved icon box should scale with [MediaQuery.textScaler].
  final bool respectTextScale;

  String? get _networkUrl {
    if (icon is String && isOneUiIconNetworkSrc(icon as String)) {
      return (icon as String).trim();
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final slotParent = OneUiSlotParentAppearanceScope.maybeOf(context);
    final resolvedSize = oneUiResolveIconSize(size);
    final resolvedAppearance = resolveOneUiIconAppearance(
      context,
      appearance: appearance,
      slotParentAppearance: slotParent,
    );
    final resolvedEmphasis = resolveOneUiIconEmphasis(context, emphasis);
    final state = OneUiIconResolvedState(
      size: resolvedSize,
      appearance: resolvedAppearance,
      emphasis: resolvedEmphasis,
    );

    final baseBoxSize =
        this.boxSize ?? resolveOneUiIconSizePx(context, state.size);
    final boxSize = respectTextScale
        ? (MediaQuery.maybeOf(context)?.textScaler.scale(baseBoxSize) ??
            baseBoxSize)
        : baseBoxSize;
    final color = resolveOneUiIconColor(
      context,
      appearance: state.appearance,
      emphasis: state.emphasis,
    );

    final networkUrl = _networkUrl;
    final semanticName =
        icon is String && networkUrl == null ? icon as String : null;
    final customGlyph = icon is Widget ? icon as Widget : null;
    final effectiveLabel = oneUiIconEffectiveLabel(
      ariaLabel: semanticsLabel,
      ariaHidden: excludeFromSemantics,
      semanticIconName: semanticName,
    );
    final hidden = excludeFromSemantics ?? (effectiveLabel == null);

    Widget glyph;
    if (networkUrl != null) {
      glyph = OneUiIconRemote(
        src: networkUrl,
        size: boxSize,
        color: color,
        tintRaster: tintRaster,
        onLoad: onLoad,
        onError: onError,
      );
    } else if (customGlyph != null) {
      // Plain Icon: scale custom glyphs into the resolved spacing box (Figma slot
      // parity). Colour inherits from the outer IconTheme.merge below — do not
      // wrap the glyph branch; IconContained intentionally omits FittedBox so
      // pre-sized glyphs keep intrinsic dimensions inside a fixed container.
      glyph = SizedBox(
        width: boxSize,
        height: boxSize,
        child: FittedBox(
          fit: BoxFit.contain,
          child: customGlyph,
        ),
      );
    } else if (semanticName != null) {
      glyph = OneUiSemanticIcon(
        semanticName,
        size: boxSize,
        color: color,
        semanticLabel: hidden ? '' : null,
      );
    } else {
      assert(() {
        FlutterError.reportError(
          FlutterErrorDetails(
            exception: FlutterError(
              'OneUiIcon: `icon` must be a String semantic name, network URL, or Widget. '
              'Got ${icon.runtimeType}.',
            ),
            library: 'ui_flutter',
            context: ErrorDescription('while building OneUiIcon'),
          ),
        );
        return true;
      }());
      glyph = const SizedBox.shrink();
    }

    final shell = SizedBox(
      width: boxSize,
      height: boxSize,
      child: Center(
        child: IconTheme.merge(
          data: IconThemeData(color: color, size: boxSize),
          child: glyph,
        ),
      ),
    );

    final keyed = KeyedSubtree(
      key: ValueKey<String>(
        'oneui-icon|${state.dataAttributes.entries.map((e) => '${e.key}=${e.value}').join('|')}',
      ),
      child: shell,
    );

    Widget result = keyed;
    final tid = testId?.trim();
    final hasTestId = tid != null && tid.isNotEmpty;
    if (hasTestId) {
      result = oneUiWrapKeyedTestId(testId: tid, child: result);
    }

    if (hidden) {
      if (hasTestId) {
        return oneUiWrapDecorativeTestId(testId: tid, child: result);
      }
      return ExcludeSemantics(child: result);
    }

    // Web: `role="img"` + `aria-label` when label is set.
    return Semantics(
      label: effectiveLabel,
      image: true,
      excludeSemantics: true,
      container: true,
      identifier: hasTestId ? tid : null,
      child: result,
    );
  }
}
