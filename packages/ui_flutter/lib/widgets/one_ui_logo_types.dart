import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Portable Logo API — mirrors Figma API + `Logo.shared.ts` / RN `interface.ts`.
enum OneUiLogoVariant { mark, full }

/// Canonical size tokens (CSS / RN style tables).
enum OneUiLogoSize { xs, s, m, l, xl, custom }

/// Figma API `size` values (XS–XL + custom). Default: `m`.
const List<String> kOneUiLogoFigmaSizes = ['xs', 's', 'm', 'l', 'xl', 'custom'];

/// Figma t-shirt labels and other accepted aliases before canonicalisation.
typedef OneUiLogoSizeInput = Object?;

enum OneUiLogoContentMode { children, svg, image, empty }

const Map<String, OneUiLogoSize> _kLogoSizeAliases = {
  'xs': OneUiLogoSize.xs,
  's': OneUiLogoSize.s,
  'm': OneUiLogoSize.m,
  'l': OneUiLogoSize.l,
  'xl': OneUiLogoSize.xl,
  'custom': OneUiLogoSize.custom,
  'XS': OneUiLogoSize.xs,
  'S': OneUiLogoSize.s,
  'M': OneUiLogoSize.m,
  'L': OneUiLogoSize.l,
  'XL': OneUiLogoSize.xl,
  'CUSTOM': OneUiLogoSize.custom,
};

const Set<OneUiLogoSize> _kValidLogoSizes = {
  OneUiLogoSize.xs,
  OneUiLogoSize.s,
  OneUiLogoSize.m,
  OneUiLogoSize.l,
  OneUiLogoSize.xl,
  OneUiLogoSize.custom,
};

/// Normalises `size` to canonical enum. Unknown values warn in debug and fall back to `m`.
OneUiLogoSize resolveOneUiLogoSize(Object? size) {
  if (size == null) return OneUiLogoSize.m;
  if (size is OneUiLogoSize && _kValidLogoSizes.contains(size)) return size;
  final key = size.toString();
  final resolved = _kLogoSizeAliases[key];
  if (resolved != null) return resolved;
  assert(() {
    // ignore: avoid_print
    print(
      '[OneUiLogo] size="$key" is not supported. Use xs | s | m | l | xl | custom. Using m.',
    );
    return true;
  }());
  return OneUiLogoSize.m;
}

String oneUiLogoSizeWire(OneUiLogoSize size) => switch (size) {
      OneUiLogoSize.xs => 'xs',
      OneUiLogoSize.s => 's',
      OneUiLogoSize.m => 'm',
      OneUiLogoSize.l => 'l',
      OneUiLogoSize.xl => 'xl',
      OneUiLogoSize.custom => 'custom',
    };

String oneUiLogoVariantWire(OneUiLogoVariant variant) => variant.name;

Map<String, String> oneUiLogoDataAttrs({
  required OneUiLogoVariant variant,
  required OneUiLogoSize resolvedSize,
  required bool isInteractive,
  String? material,
}) {
  return {
    'data-variant': oneUiLogoVariantWire(variant),
    'data-size': oneUiLogoSizeWire(resolvedSize),
    if (isInteractive) 'data-interactive': 'true',
    if (material != null && material.isNotEmpty) 'data-material': material,
  };
}

String oneUiLogoDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-logo');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

class OneUiLogoResolvedState {
  const OneUiLogoResolvedState({
    required this.contentMode,
    required this.resolvedVariant,
    required this.resolvedSize,
    required this.isInteractive,
    required this.isDisabled,
    required this.isPressable,
    required this.dataAttrs,
  });

  final OneUiLogoContentMode contentMode;
  final OneUiLogoVariant resolvedVariant;
  final OneUiLogoSize resolvedSize;
  final bool isInteractive;
  final bool isDisabled;
  final bool isPressable;

  /// Web / RN `data-*` on the logo root.
  final Map<String, String> dataAttrs;

  String get dataPayloadKey => oneUiLogoDataPayloadKey(dataAttrs);
}

bool oneUiLogoIsDecorative(String alt) => alt.trim().isEmpty;

bool oneUiLogoIsPressable({
  required bool isInteractive,
  required String alt,
  VoidCallback? onPress,
  VoidCallback? onClick,
}) {
  if (!isInteractive || oneUiLogoIsDecorative(alt)) return false;
  return onPress != null || onClick != null;
}

OneUiLogoResolvedState resolveOneUiLogoState({
  OneUiLogoVariant variant = OneUiLogoVariant.mark,
  Object? size,
  Widget? children,
  String? svgContent,
  String? src,
  String? material,
  bool interactive = false,
  bool disabled = false,
  VoidCallback? onPress,
  VoidCallback? onClick,
  required String alt,
}) {
  final resolvedSize = resolveOneUiLogoSize(size);
  final isInteractive = interactive && !disabled;
  final isPressable = oneUiLogoIsPressable(
    isInteractive: isInteractive,
    alt: alt,
    onPress: onPress,
    onClick: onClick,
  );

  assert(() {
    if (isInteractive && !isPressable) {
      if (onPress == null && onClick == null) {
        // ignore: avoid_print
        print(
            '[OneUiLogo] interactive=true requires onPress or onClick. Rendering as static.');
      }
      if (oneUiLogoIsDecorative(alt)) {
        // ignore: avoid_print
        print(
            '[OneUiLogo] interactive logos require a meaningful alt label. Rendering as static.');
      }
    }
    return true;
  }());

  final OneUiLogoContentMode contentMode = children != null
      ? OneUiLogoContentMode.children
      : (svgContent != null && svgContent.isNotEmpty)
          ? OneUiLogoContentMode.svg
          : (src != null && src.isNotEmpty)
              ? OneUiLogoContentMode.image
              : OneUiLogoContentMode.empty;

  final dataAttrs = oneUiLogoDataAttrs(
    variant: variant,
    resolvedSize: resolvedSize,
    isInteractive: isInteractive,
    material: material,
  );

  return OneUiLogoResolvedState(
    contentMode: contentMode,
    resolvedVariant: variant,
    resolvedSize: resolvedSize,
    isInteractive: isInteractive,
    isDisabled: disabled,
    isPressable: isPressable,
    dataAttrs: dataAttrs,
  );
}
