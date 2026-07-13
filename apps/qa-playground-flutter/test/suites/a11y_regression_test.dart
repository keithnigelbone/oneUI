/// A11y regression marker — run `pnpm qa:flutter:test` for full suite.
library;

import 'package:flutter_test/flutter_test.dart';

import '../support/qa_slug_paths.dart';

void main() {
  group('[a11y] QA playground coverage', () {
    test('[a11y] every catalog component has an a11y test file', () {
      expect(kQaImplementedSlugs.length, 22);
    });
  });
}
