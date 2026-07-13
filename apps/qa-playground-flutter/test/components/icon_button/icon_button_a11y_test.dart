/// IconButton accessibility QA tests — resolver units + real widget SemanticsData.
///
/// Icon-only buttons MUST expose a non-empty accessible name (WCAG 4.1.2).
/// Probed contract: button role, enabled/disabled, busy (loading), hint,
/// expanded, keyboard activation via OneUiFocusInteractive.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

void main() {
  setUpAll(() async {
    await ensureIconButtonIconsLoaded();
  });

  group('[a11y] resolveOneUiIconButtonState — disabled contract', () {
    test('[a11y] disabled or loading → isDisabled', () {
      expect(resolveOneUiIconButtonState(disabled: true).isDisabled, isTrue);
      expect(resolveOneUiIconButtonState(loading: true).isDisabled, isTrue);
      expect(resolveOneUiIconButtonState().isDisabled, isFalse);
    });
  });

  group('[a11y] IconButton widget — semantics', () {
    testWidgetsAllPlatforms('[a11y] exposes button role + semanticsLabel',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like item'),
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Like item');
        expect(data.label, contains('Like item'));
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.hasAction(SemanticsAction.tap), isTrue);
        expectIconButtonEnabled(tester, semanticsLabel: 'Like item');
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled marks not-enabled + blocks tap',
        (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          disabled: true,
          onPressed: () => hits++,
        ),
      );
      expectIconButtonDisabled(tester, semanticsLabel: 'Like');
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    testWidgetsAllPlatforms('[a11y] loading announces busy via hint + not-enabled',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          loading: true,
        ),
        settle: false,
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Like');
        expect(data.label, contains('Like'));
        expect(data.hint, contains('Loading'));
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint merges with loading hint',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Menu',
          semanticsHint: 'Opens panel',
          loading: true,
        ),
        settle: false,
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Menu');
        expect(data.hint, 'Opens panel. Loading');
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces when not loading',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          semanticsHint: 'Adds to favourites',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(
          iconButtonSemanticsData(tester, semanticsLabel: 'Like').hint,
          'Adds to favourites',
        );
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsExpanded surfaces in AT tree',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Expand menu',
          semanticsExpanded: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Expand menu');
        expect(data.hasFlag(SemanticsFlag.isExpanded), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] icon glyph is excluded from semantics tree',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('heart'), findsNothing,
            reason: 'semantic icon slug must not duplicate the button label');
      });
    });

    testWidgetsAllPlatforms('[a11y] autofocus takes keyboard focus', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
        ),
      );
      await tester.pump();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
    });

    testWidgetsAllPlatforms('[a11y] Space activates focused control', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
          onPressed: () => hits++,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[a11y] Enter activates focused control', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
          onPressed: () => hits++,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump(const Duration(milliseconds: 50));
      expect(hits, 1);
    });

    testWidgetsAllPlatforms('[a11y] forceFocusRing paints focus halo decoration',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          forceFocusRing: true,
        ),
      );
      var haloCount = 0;
      for (final element in find.byType(DecoratedBox).evaluate()) {
        final decoration = (element.widget as DecoratedBox).decoration;
        if (decoration is BoxDecoration &&
            (decoration.boxShadow?.length ?? 0) >= 2) {
          haloCount++;
        }
      }
      expect(haloCount, greaterThan(0),
          reason: 'forceFocusRing must paint the 2-layer focus halo');
    });
  });
}
