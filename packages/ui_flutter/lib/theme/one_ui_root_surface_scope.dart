import 'package:flutter/widgets.dart';

import 'surface_scope.dart';

/// Immutable page-root surface tokens — never updated by nested [OneUiSurface].
///
/// CounterBadge / IndicatorBadge inside Badge use this scope (web `.surfaceShield`
/// restoring root `--{Role}-Fill-*` tokens).
class OneUiRootSurfaceScope extends InheritedWidget {
  const OneUiRootSurfaceScope({
    required this.rootValue,
    required super.child,
    super.key,
  });

  final SurfaceContextValue rootValue;

  static SurfaceContextValue of(BuildContext context) {
    final value = maybeOf(context);
    assert(
      value != null,
      'OneUiRootSurfaceScope not found — wrap app with OneUiSurfaceBootstrap',
    );
    return value!;
  }

  static SurfaceContextValue? maybeOf(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<OneUiRootSurfaceScope>();
    return scope?.rootValue;
  }

  @override
  bool updateShouldNotify(OneUiRootSurfaceScope oldWidget) =>
      rootValue != oldWidget.rootValue;
}
