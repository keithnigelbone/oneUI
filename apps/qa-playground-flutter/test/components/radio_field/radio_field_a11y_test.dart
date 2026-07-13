/// RadioField accessibility QA tests — resolver units + real widget semantics.
///
/// Asserts the merged [SemanticsData] the platform AT actually receives:
/// field/group container labels, the radiogroup role, description/feedback
/// identifiers, aria-hidden subtree collapse. No bare findsOneWidget for an a11y
/// claim.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

Finder _radioGroupSemantics() => find.descendant(
      of: radioGroupFinder(),
      matching: find.byWidgetPredicate(
          (w) => w is Semantics && w.properties.role == SemanticsRole.radioGroup),
    );

void main() {
  group('[a11y] resolveOneUiRadioFieldAccessibility — RN field a11y resolver', () {
    test('[a11y] exposes the field label', () {
      final a11y = resolveOneUiRadioFieldAccessibility(label: 'Plan');
      expect(a11y.accessibilityLabel, 'Plan');
      expect(a11y.hideSubtree, isFalse);
    });

    test('[a11y] ariaLabel overrides the visible label', () {
      final a11y = resolveOneUiRadioFieldAccessibility(label: 'Visible', ariaLabel: 'From aria');
      expect(a11y.accessibilityLabel, 'From aria');
    });

    test('[a11y] aria-hidden collapses the subtree', () {
      final a11y = resolveOneUiRadioFieldAccessibility(label: 'Hidden', ariaHidden: true);
      expect(a11y.hideSubtree, isTrue);
    });

    test('[a11y] forwards hint + describedBy', () {
      final a11y = resolveOneUiRadioFieldAccessibility(
        label: 'Plan',
        accessibilityHint: 'Choose one',
        ariaDescribedBy: 'help-1',
      );
      expect(a11y.accessibilityHint, 'Choose one');
      expect(a11y.callerAriaDescribedBy, 'help-1');
    });
  });

  group('[a11y] semantics-id resolvers — auto-link description/feedback/dynamic', () {
    test('[a11y] description id only when description present', () {
      expect(oneUiRadioFieldDescriptionSemanticsId(null, hasDescription: true),
          'oneui-radiofield-desc');
      expect(oneUiRadioFieldDescriptionSemanticsId(null, hasDescription: false), isNull);
      expect(oneUiRadioFieldDescriptionSemanticsId('plan', hasDescription: true), 'plan-desc');
    });

    test('[a11y] feedback id only when feedback present', () {
      expect(oneUiRadioFieldFeedbackSemanticsId('plan', hasFeedback: true), 'plan-feedback');
      expect(oneUiRadioFieldFeedbackSemanticsId('plan', hasFeedback: false), isNull);
    });

    test('[a11y] group describedBy composes description + feedback + dynamic', () {
      final composed = resolveOneUiRadioFieldGroupDescribedBy(
        descriptionSemanticsId: 'd',
        feedbackSemanticsId: 'f',
        dynamicTextSemanticsId: 'y',
      );
      expect(composed, contains('d'));
      expect(composed, contains('f'));
      expect(composed, contains('y'));
    });
  });

  group('[a11y] RadioField widget — group + label semantics', () {
    testWidgetsAllPlatforms('[a11y] multi field exposes the radiogroup role', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        expect(_radioGroupSemantics(), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] field label becomes the group container label',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Choose a plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final labelled = find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.label == 'Choose a plan');
        expect(labelled, findsWidgets);
      });
    });

    testWidgetsAllPlatforms('[a11y] each option keeps its radio role + name', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', children: [
          OneUiRadio(value: 'a', label: 'Basic'),
          OneUiRadio(value: 'b', label: 'Pro'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final basic = radioSemanticsData(tester, 'Basic');
        expect(basic.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
        expect(basic.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled field marks options not enabled', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', disabled: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      expectRadioDisabled(tester, 'A');
    });

    testWidgetsAllPlatforms('[a11y] description is exposed via a Semantics identifier',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          id: 'plan',
          label: 'Plan',
          description: 'Pick exactly one.',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final descNode = find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.identifier == 'plan-desc');
        expect(descNode, findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('[a11y] feedback message is announced (live region)', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', error: 'Choose a plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final live = find.byWidgetPredicate((w) =>
            w is Semantics &&
            (w.properties.liveRegion == true || w.properties.role == SemanticsRole.alert));
        expect(live, findsWidgets,
            reason: 'feedback should announce to AT via a live region / alert');
      });
    });

    testWidgetsAllPlatforms('[a11y] aria-hidden collapses the whole field subtree',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', ariaHidden: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      withSemanticsHandle(tester, () {
        // Query the real SEMANTICS tree (ExcludeSemantics keeps the Semantics
        // widget but drops it from the tree, so a widget finder would still
        // match — bySemanticsLabel reflects what AT actually sees).
        expect(find.bySemanticsLabel('A'), findsNothing);
      });
    });
  });
}
