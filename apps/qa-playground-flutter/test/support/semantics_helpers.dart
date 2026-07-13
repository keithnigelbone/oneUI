/// Shared semantics helpers for QA widget tests.
library;

import 'package:flutter_test/flutter_test.dart';

void withSemanticsHandle(
  WidgetTester tester,
  void Function() body,
) {
  final handle = tester.ensureSemantics();
  try {
    body();
  } finally {
    handle.dispose();
  }
}
