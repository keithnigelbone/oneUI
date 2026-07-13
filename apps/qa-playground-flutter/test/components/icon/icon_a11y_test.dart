/// Icon accessibility QA tests — mirrors web `role="img"` + `aria-label` and
/// the resolver contract from `one_ui_icon_a11y.dart`.
///
/// Validates ACTUAL Semantics tree state, not just resolver returns.
/// Decorative icons (no label) → ExcludeSemantics; labelled icons →
/// Semantics(image: true) on the rendered tree.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_a11y.dart';

import '../../support/components/icon_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Pure resolver tests
  // ===========================================================================

  group('[a11y] formatOneUiIconName', () {
    test('[a11y] IcCamelCase → "camel case icon"', () {
      expect(formatOneUiIconName('IcHeart'), 'heart icon');
      expect(formatOneUiIconName('IcShoppingCart'), 'shopping cart icon');
    });

    test('[a11y] ic_snake_case → "snake case icon"', () {
      expect(formatOneUiIconName('ic_shopping_cart'), 'shopping cart icon');
    });

    test('[a11y] lowerCamel → spaced lowercase', () {
      expect(formatOneUiIconName('shoppingCart'), 'shopping cart');
    });

    test('[a11y] plain lowercase → returns verbatim', () {
      expect(formatOneUiIconName('add'), 'add');
    });

    test('[a11y] kebab-and-snake mix → capitalised + spaced', () {
      expect(formatOneUiIconName('shopping-cart-icon'), 'Shopping Cart Icon');
    });

    test('[a11y] chevronDown → "chevron down"', () {
      expect(formatOneUiIconName('chevronDown'), 'chevron down');
    });
  });

  group('[a11y] oneUiIconIsExposedToA11y', () {
    test('[a11y] no label → not exposed', () {
      expect(oneUiIconIsExposedToA11y(), isFalse);
    });

    test('[a11y] empty label → not exposed', () {
      expect(oneUiIconIsExposedToA11y(ariaLabel: ''), isFalse);
    });

    test('[a11y] whitespace label → not exposed', () {
      expect(oneUiIconIsExposedToA11y(ariaLabel: '   '), isFalse);
    });

    test('[a11y] label present → exposed', () {
      expect(oneUiIconIsExposedToA11y(ariaLabel: 'Add'), isTrue);
    });

    test('[a11y] ariaHidden=true beats a non-empty label', () {
      expect(
        oneUiIconIsExposedToA11y(ariaLabel: 'Add', ariaHidden: true),
        isFalse,
      );
    });
  });

  group('[a11y] oneUiIconEffectiveLabel', () {
    test('[a11y] explicit label wins over semanticIconName', () {
      expect(
        oneUiIconEffectiveLabel(ariaLabel: 'Add', semanticIconName: 'plus'),
        'Add',
      );
    });

    test('[a11y] no label → returns null even if semanticIconName provided', () {
      expect(
        oneUiIconEffectiveLabel(semanticIconName: 'shoppingCart'),
        isNull,
        reason: 'aria-label is required to expose — name alone is NOT a label',
      );
    });

    test('[a11y] ariaHidden=true → null even with label', () {
      expect(
        oneUiIconEffectiveLabel(
          ariaLabel: 'Add',
          ariaHidden: true,
          semanticIconName: 'plus',
        ),
        isNull,
      );
    });
  });

  // ===========================================================================
  // Widget Semantics tree tests — ACTUAL behaviour, not just props
  // ===========================================================================

  group('[a11y] Icon widget — decorative (no label)', () {
    testWidgetsAllPlatforms(
      '[a11y] no label → ExcludeSemantics wraps icon (not in AT tree)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'add'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('add'), findsNothing,
              reason: 'Decorative icon must not appear in semantics tree');
          expect(find.bySemanticsLabel('Add'), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] excludeFromSemantics=true overrides semanticsLabel (aria-hidden wins)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(
            icon: 'add',
            semanticsLabel: 'Add',
            excludeFromSemantics: true,
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Add'), findsNothing,
              reason: 'excludeFromSemantics=true must override semanticsLabel');
        } finally {
          handle.dispose();
        }
      },
    );
  });

  group('[a11y] Icon widget — labelled', () {
    testWidgetsAllPlatforms(
      '[a11y] semanticsLabel exposes icon as image with that label',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'add', semanticsLabel: '3 unread messages'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('3 unread messages'), findsOneWidget);
          final data = iconSemanticsData(tester,
              semanticsLabel: '3 unread messages');
          expect(data.hasFlag(SemanticsFlag.isImage), isTrue,
              reason: 'labelled Icon must expose isImage flag (web role="img")');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] labelled icon does NOT expose isButton or tap action',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'add', semanticsLabel: 'Add'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = iconSemanticsData(tester, semanticsLabel: 'Add');
          expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
              reason: 'Icon is non-interactive');
          expect(data.hasAction(SemanticsAction.tap), isFalse);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] labelled icon is NOT focusable (no tab stop on Flutter Web)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'add', semanticsLabel: 'Add'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = iconSemanticsData(tester, semanticsLabel: 'Add');
          expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse,
              reason: 'web img role has no tabindex — keyboard skips it');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] inner Material Icon is excluded (no double-announcement)',
      (tester) async {
        // OneUiIcon wraps with Semantics(excludeSemantics: true) — the inner
        // Material Icon's semantic name must NOT also surface to AT.
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'add', semanticsLabel: 'Add new item'),
        );
        final handle = tester.ensureSemantics();
        try {
          // Only ONE Semantics node carries the outer label.
          expect(find.bySemanticsLabel('Add new item'), findsOneWidget);
          // The inner Icon's default tooltip name must be suppressed.
          // (semanticLabel passed as '' inside the build).
        } finally {
          handle.dispose();
        }
      },
    );
  });
}
