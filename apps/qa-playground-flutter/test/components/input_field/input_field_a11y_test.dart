library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_a11y.dart';

import '../../support/components/input_field_harness.dart';

void main() {
  setUpAll(() async {
    await ensureInputIconsLoaded();
  });

  group('[a11y] resolveOneUiInputFieldAccessibility', () {
    test('[a11y] root is decorative — focus on inner input', () {
      final a11y = resolveOneUiInputFieldAccessibility();
      expect(a11y.excludeFromSemantics, isTrue);
      expect(a11y.hideDescendants, isFalse);
    });

    test('[a11y] aria-hidden collapses descendants', () {
      final a11y = resolveOneUiInputFieldAccessibility(ariaHidden: true);
      expect(a11y.hideDescendants, isTrue);
    });
  });

  group('[a11y] InputField widget', () {
    testWidgetsAllPlatforms('[a11y] inner input exposes ariaLabel',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          label: 'Visible label',
          ariaLabel: 'Email address',
          placeholder: 'email',
        ),
      );
      expect(find.bySemanticsLabel('Email address'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] description semantics id when id is set',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          id: 'email',
          label: 'Email',
          description: 'Work email only.',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputFieldSemanticsAnchor('email-description'), findsOneWidget);
        final ids = inputFieldDescribedByNodeIds(tester);
        expect(ids, contains('email-description'));
      });
    });

    testWidgetsAllPlatforms('[a11y] error feedback exposes alert role',
        (tester) async {
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(label: 'Email', error: 'Invalid format'),
      );
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.role == SemanticsRole.alert,
          ),
          findsWidgets,
        );
      });
    });
  });
}
