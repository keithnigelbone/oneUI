/// Runs [body] on Android, iOS, and desktop (Linux) targets.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

import 'pump_one_ui_app.dart';

void testWidgetsAllPlatforms(
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in kOneUiQaTestPlatforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}
