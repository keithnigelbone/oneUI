/// Button accessibility QA tests — mirrors RN Button a11y / web button-accessibility.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';

import '../../support/components/button_harness.dart';

void main() {
  // Preload the Jio Convex fixture before any testWidgets runs.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[a11y] Button — semantics contract', () {
    testWidgetsAllPlatforms('[a11y] exposes button role + label', (tester) async {
      await pumpButtonQaHarnessSettled(tester, const OneUiButton(label: 'Hello'));
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.label, contains('Hello'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isEnabled), isTrue);
        expect(d.hasAction(SemanticsAction.tap), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled marks not enabled', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Off', disabled: true),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.label, contains('Off'));
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled removes tap action', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'NoTap', disabled: true),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.hasAction(SemanticsAction.tap), isFalse,
            reason: 'disabled button must not expose a tap action to AT');
      });
    });

    testWidgetsAllPlatforms('[a11y] loading disables tap and adds Loading hint', (tester) async {
      await pumpButtonQaHarness(tester, const OneUiButton(label: 'Wait', loading: true));
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.label, contains('Wait'));
        expect(d.hint, contains('Loading'));
        expect(d.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsLabel overrides visible label', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'X', semanticsLabel: 'Custom label'),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.label, contains('Custom label'));
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] merge semanticsHint with loading hint', (tester) async {
      await pumpButtonQaHarness(
        tester,
        const OneUiButton(
          label: 'Menu',
          loading: true,
          semanticsHint: 'Opens panel',
        ),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.hint, 'Opens panel. Loading');
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint forwarded without loading', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Disclose', semanticsHint: 'Opens panel'),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.hint, 'Opens panel');
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsExpanded exposes expanded state', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Disclose', semanticsExpanded: true),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isExpanded), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsExpanded=false flips the flag', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Collapsed', semanticsExpanded: false),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isExpanded), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsControlsSemanticsIdentifiers maps to controlsNodes', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Open',
          semanticsControlsSemanticsIdentifiers: {'panel-1', 'panel-2'},
        ),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.controlsNodes, isNotNull);
        expect(d.controlsNodes, containsAll(<String>['panel-1', 'panel-2']),
            reason: 'aria-controls IDs must flow to Semantics.controlsNodes');
      });
    });

    testWidgetsAllPlatforms('[a11y] empty controls identifiers are dropped', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Open',
          semanticsControlsSemanticsIdentifiers: {'  ', ''},
        ),
      );
      withSemanticsHandle(tester, () {
        final d = buttonSemanticsData(tester);
        expect(d.controlsNodes, anyOf(isNull, isEmpty),
            reason: 'whitespace-only IDs must not leak through to AT');
      });
    });

    testWidgetsAllPlatforms('[a11y] excludeFromSemantics hides control', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Hidden', excludeFromSemantics: true),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] autofocus claims primary focus on first frame', (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(label: 'Auto', autofocus: true),
      );
      // The focusable subtree must own primary focus.
      final hasFocus = FocusManager.instance.primaryFocus?.hasFocus ?? false;
      expect(hasFocus, isTrue,
          reason: 'autofocus=true must request focus on first frame');
    });
  });
}
