import 'package:flutter/widgets.dart';

import '../theme/one_ui_root_surface_scope.dart';
import '../theme/surface_scope.dart';

/// Restores page-root surface tokens for CounterBadge / IndicatorBadge slots.
///
/// Parity with web `Badge.tsx` → `styles.surfaceShield` (`data-surface="default"` +
/// Fill-* token aliases).
class BadgeSurfaceImmuneScope extends StatelessWidget {
  const BadgeSurfaceImmuneScope({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return OneUiSurfaceScope(
      value: OneUiRootSurfaceScope.of(context),
      child: child,
    );
  }
}
