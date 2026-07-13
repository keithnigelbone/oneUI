/// Divider accessibility QA tests — resolver units + real widget SemanticsData.
///
/// Probed contract: the divider exposes a container landmark (web
/// `role="separator"`; Flutter 3.44 has no `SemanticsRole.divider`, so a
/// container node + `explicitChildNodes` is the closest mapping); `semanticsHint`
/// (falling back to `accessibilityHint`) surfaces on that node; the decorative
/// line segments are excluded from semantics; and `testId` reaches the AT tree
/// via `Semantics.identifier`.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/divider_harness.dart';

/// A [Semantics] widget carrying the given automation identifier.
Finder _identifierFinder(String id) => find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.identifier == id,
    );

void main() {
  // ===========================================================================
  // RESOLVER — resolveOneUiDividerSemantics units.
  // ===========================================================================

  group('[a11y] resolveOneUiDividerSemantics', () {
    test('[a11y] prefers semanticsHint over accessibilityHint', () {
      final a = resolveOneUiDividerSemantics(
        orientation: 'horizontal',
        semanticsHint: 'Section break',
        accessibilityHint: 'fallback',
      );
      expect(a.hint, 'Section break');
    });

    test('[a11y] falls back to accessibilityHint', () {
      final a = resolveOneUiDividerSemantics(
        orientation: 'horizontal',
        accessibilityHint: 'From a11y prop',
      );
      expect(a.hint, 'From a11y prop');
    });

    test('[a11y] blank hints resolve to null', () {
      final a = resolveOneUiDividerSemantics(
        orientation: 'vertical',
        semanticsHint: '   ',
      );
      expect(a.hint, isNull);
    });

    test('[a11y] orientation is carried through', () {
      expect(
        resolveOneUiDividerSemantics(orientation: 'vertical').orientation,
        'vertical',
      );
    });
  });

  // ===========================================================================
  // WIDGET — real SemanticsData on the rendered separator landmark.
  // ===========================================================================

  group('[a11y] Divider widget — real semantics', () {
    testWidgetsAllPlatforms('[a11y] exposes a container separator landmark', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsWidgets);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces on the separator node', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(semanticsHint: 'End of section'),
      );
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'End of section');
      });
    });

    testWidgetsAllPlatforms('[a11y] accessibilityHint surfaces when semanticsHint is unset', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(accessibilityHint: 'Divides comments'),
      );
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'Divides comments');
      });
    });

    testWidgetsAllPlatforms('[a11y] decorative line segments are excluded from semantics', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
      );
      withSemanticsHandle(tester, () {
        // both flanking lines are ExcludeSemantics; the visible label remains.
        expect(dividerHiddenLineSegmentCount(tester), 2);
        expect(find.text('OR'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] testId reaches the AT tree via Semantics.identifier', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(testId: 'section-break'));
      withSemanticsHandle(tester, () {
        expect(_identifierFinder('section-break'), findsOneWidget);
        expect(
          tester.getSemantics(_identifierFinder('section-break')).identifier,
          'section-break',
        );
      });
    });

    testWidgetsAllPlatforms('[a11y] legacy testID alias also reaches the identifier', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(testID: 'legacy-id'));
      withSemanticsHandle(tester, () {
        expect(_identifierFinder('legacy-id'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] centre icon is excluded from semantics by default', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'icon', child: OneUiIcon(icon: 'check')),
      );
      // the divider icon defaults to excludeFromSemantics — it is decorative.
      expect(find.byType(OneUiIcon), findsOneWidget);
    });
  });
}
