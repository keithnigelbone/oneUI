/// IconContained accessibility QA tests — mirrors web `role="img"` + `aria-label`
/// and the resolver contract from `one_ui_icon_contained_a11y.dart`.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_a11y.dart';

import '../../support/components/icon_contained_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[a11y] oneUiIconContainedEffectiveLabel', () {
    test('[a11y] explicit semanticsLabel wins', () {
      expect(
        oneUiIconContainedEffectiveLabel(semanticsLabel: 'Favourite'),
        'Favourite',
      );
    });

    test('[a11y] omitted semanticsLabel → null (decorative)', () {
      expect(oneUiIconContainedEffectiveLabel(), isNull);
    });

    test('[a11y] no label → null', () {
      expect(oneUiIconContainedEffectiveLabel(semanticsLabel: ''), isNull);
    });
  });

  group('[a11y] resolveOneUiIconContainedSemantics', () {
    test('[a11y] excludeFromSemantics=true → not exposed', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Favourite',
        excludeFromSemantics: true,
        isDisabled: false,
      );
      expect(cfg.exposed, isFalse);
    });

    test('[a11y] label exposes config', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Favourite',
        isDisabled: false,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.label, 'Favourite');
    });

    test('[a11y] disabled appends suffix to label', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Favourite',
        isDisabled: true,
      );
      expect(cfg.label, 'Favourite, disabled');
    });

    test('[a11y] semanticsHint flows through', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Favourite',
        semanticsHint: 'Opens favourites',
        isDisabled: false,
      );
      expect(cfg.hint, 'Opens favourites');
    });

    test('[a11y] whitespace hint normalised to null', () {
      final cfg = resolveOneUiIconContainedSemantics(
        semanticsLabel: 'Favourite',
        semanticsHint: '   ',
        isDisabled: false,
      );
      expect(cfg.hint, isNull);
    });
  });

  group('[a11y] IconContained widget — semantics contract', () {
    testWidgetsAllPlatforms(
      '[a11y] semanticsLabel exposes the icon as image',
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            semanticsLabel: 'Favourite',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
          final data =
              iconContainedSemanticsData(tester, semanticsLabel: 'Favourite');
          expect(data.hasFlag(SemanticsFlag.isImage), isTrue,
              reason:
                  'IconContained must expose isImage flag (web role="img")');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] excludeFromSemantics=true hides icon (aria-hidden wins)',
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            semanticsLabel: 'Favourite',
            excludeFromSemantics: true,
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Favourite'), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] hint forwarded to AT',
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            semanticsLabel: 'Favourite',
            semanticsHint: 'Opens favourites',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data =
              iconContainedSemanticsData(tester, semanticsLabel: 'Favourite');
          expect(data.hint, contains('Opens favourites'));
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] does NOT expose isButton or tap action',
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart', semanticsLabel: 'Favourite'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data =
              iconContainedSemanticsData(tester, semanticsLabel: 'Favourite');
          expect(data.hasFlag(SemanticsFlag.isButton), isFalse,
              reason: 'IconContained is non-interactive');
          expect(data.hasAction(SemanticsAction.tap), isFalse);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] does NOT expose isFocusable (no tab stop on Flutter Web)',
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart', semanticsLabel: 'Favourite'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data =
              iconContainedSemanticsData(tester, semanticsLabel: 'Favourite');
          expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse);
        } finally {
          handle.dispose();
        }
      },
    );
  });
}
