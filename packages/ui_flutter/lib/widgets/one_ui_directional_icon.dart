import 'package:flutter/widgets.dart';

import '../icons/jio_semantic_mapping.dart';

/// Horizontal navigation glyphs that mirror in RTL — Material
/// `matchTextDirection` convention + WCAG meaningful sequence.
const Set<String> kOneUiRtlMirrorSemanticIcons = {
  'arrowLeft',
  'arrowRight',
  'chevronLeft',
  'chevronRight',
  'back',
  'next',
  'firstPage',
  'lastPage',
};

/// Whether [semanticName] should flip when [TextDirection] is RTL.
bool oneUiSemanticIconMirrorsInRtl(String semanticName) {
  final canonical = resolveCanonicalSemanticIconName(semanticName);
  return kOneUiRtlMirrorSemanticIcons.contains(canonical);
}

/// Applies horizontal mirror for directional semantic icons in RTL layouts.
Widget oneUiWrapDirectionalSemanticIcon(
  BuildContext context, {
  required String semanticName,
  required Widget child,
}) {
  if (!oneUiSemanticIconMirrorsInRtl(semanticName)) return child;
  if (Directionality.of(context) != TextDirection.rtl) return child;
  return Transform(
    alignment: Alignment.center,
    transform: Matrix4.diagonal3Values(-1, 1, 1),
    child: child,
  );
}
