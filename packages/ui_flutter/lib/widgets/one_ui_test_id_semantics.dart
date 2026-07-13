/// Cross-platform test locator helpers — RN `testID` / web `data-testid` parity.
library;

import 'package:flutter/widgets.dart';

/// Resolves [Semantics.identifier] from explicit [testId] or form anchor [semanticsIdentifier].
///
/// [testId] wins when both are set (matches web `data-testid` over `id`).
String? oneUiResolveSemanticsTestIdentifier({
  String? testId,
  String? semanticsIdentifier,
}) {
  final tid = testId?.trim();
  if (tid != null && tid.isNotEmpty) return tid;
  final sid = semanticsIdentifier?.trim();
  if (sid != null && sid.isNotEmpty) return sid;
  return null;
}

/// Optional [KeyedSubtree] for in-process widget tests (`find.byKey`).
Widget oneUiWrapKeyedTestId({
  required Widget child,
  String? testId,
}) {
  final tid = testId?.trim();
  if (tid == null || tid.isEmpty) return child;
  return KeyedSubtree(key: ValueKey<String>(tid), child: child);
}

/// Outer semantics locator when the subtree is hidden from AT (`ExcludeSemantics`).
Widget oneUiWrapDecorativeTestId({
  required Widget child,
  required String testId,
}) {
  final tid = testId.trim();
  return Semantics(
    identifier: tid,
    container: true,
    child: ExcludeSemantics(child: child),
  );
}
