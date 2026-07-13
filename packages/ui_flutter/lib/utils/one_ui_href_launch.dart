import 'package:flutter/foundation.dart';

/// Optional app-level handler for [OneUiText] `href` navigation.
///
/// Web renders native `<a href>` navigation; Flutter has no built-in URL
/// opener. Register a handler (e.g. `url_launcher`) at app bootstrap. When
/// unset, [oneUiLaunchHref] is still invoked on tap so link semantics include
/// `SemanticsAction.tap` — matching web anchor activatability.
typedef OneUiHrefLaunchHandler = void Function(
  String href, {
  String? target,
  String? rel,
});

OneUiHrefLaunchHandler? oneUiHrefLaunchHandler;

void oneUiLaunchHref(
  String href, {
  String? target,
  String? rel,
}) {
  final trimmed = href.trim();
  if (trimmed.isEmpty) return;
  final handler = oneUiHrefLaunchHandler;
  if (handler != null) {
    handler(trimmed, target: target, rel: rel);
    return;
  }
  assert(() {
    debugPrint(
      'OneUiText: register oneUiHrefLaunchHandler to open href=$trimmed',
    );
    return true;
  }());
}
