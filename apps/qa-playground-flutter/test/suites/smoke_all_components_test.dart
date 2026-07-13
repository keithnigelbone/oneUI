/// Smoke suite — verifies every catalogued component has a test folder.
library;

import 'package:flutter_test/flutter_test.dart';

import '../support/qa_slug_paths.dart';

void main() {
  group('[smoke] QA playground registry', () {
    test('[smoke] all catalog slugs have test folders', () {
      expect(kQaImplementedSlugs.length, 22);
      for (final slug in kQaImplementedSlugs) {
        expect(
          qaTestFolderForSlug(slug),
          isNotEmpty,
          reason: 'slug $slug should map to a test folder',
        );
      }
    });

    test('[smoke] core components are registered', () {
      expect(kQaImplementedSlugs, containsAll(['checkbox', 'button', 'input', 'badge']));
    });
  });
}
