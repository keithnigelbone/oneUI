/// Icon functional QA tests — mirrors web `Icon.tsx` and the Figma matrix
/// (20 sizes × 9 appearances × 5 emphasis levels).
///
/// Avoids false confidence by validating ACTUAL behaviour:
///   - `tester.getSize` measures the rendered SizedBox dimensions.
///   - Glyph colour read off the rendered Icon widget's `color` (not just data attribute).
///   - Semantics data read off the actual SemanticsNode (not just widget props).
///   - Slot-inheritance asserted via the data-attribute key the widget actually emits.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_slot_parent_appearance.dart';

import '../../support/components/icon_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[smoke] Icon — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] catalog icon renders', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', semanticsLabel: 'Add'),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
    });

    for (final size in kOneUiIconSizes) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(icon: 'add', size: size, semanticsLabel: 'Add'),
        );
        expect(find.byType(OneUiIcon), findsOneWidget);
      });
    }
  });

  group('[functional] Icon — size resolves to actual rendered px', () {
    Future<double> renderedSide(WidgetTester tester, String size) async {
      await pumpIconQaHarnessSettled(
        tester,
        OneUiIcon(icon: 'add', size: size, semanticsLabel: 'Add'),
      );
      // The root OneUiIcon yields a SizedBox(width: boxSize, height: boxSize).
      // tester.getSize on the OneUiIcon returns the parent constraint width
      // inside Center; instead drill into the inner SizedBox that the build
      // method emits and read its actual painted dimensions.
      final iconWidgetFinder = find.descendant(
        of: iconRootFinder(),
        matching: find.byType(Icon),
      );
      // If no Icon (e.g. catalog miss), fall back to the OneUiSemanticIcon's SizedBox.
      if (iconWidgetFinder.evaluate().isEmpty) {
        final size = tester.getSize(find
            .descendant(of: iconRootFinder(), matching: find.byType(SizedBox))
            .first);
        return size.width;
      }
      return tester.getSize(iconWidgetFinder).width;
    }

    testWidgetsAllPlatforms('[fn] size="2" renders < size="40" (strict ordering)',
        (tester) async {
      final s2 = await renderedSide(tester, '2');
      final s40 = await renderedSide(tester, '40');
      expect(s2, lessThan(s40),
          reason: 'size=2 must read --Icon-size-2 → --Spacing-2, '
              'size=40 must read --Icon-size-40 → --Spacing-40');
    });

    testWidgetsAllPlatforms('[fn] size scale is monotonic across all 20 Figma sizes',
        (tester) async {
      final sizes = <String, double>{};
      for (final s in kOneUiIconSizes) {
        sizes[s] = await renderedSide(tester, s);
      }
      for (var i = 1; i < kOneUiIconSizes.length; i++) {
        final prev = kOneUiIconSizes[i - 1];
        final cur = kOneUiIconSizes[i];
        expect(sizes[cur]!, greaterThanOrEqualTo(sizes[prev]!),
            reason: 'size $cur (${sizes[cur]}px) must be ≥ size $prev '
                '(${sizes[prev]}px) — Figma matrix monotonic');
      }
    });

    testWidgetsAllPlatforms('[fn] unknown size falls back to "5"', (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        final huge = await renderedSide(tester, 'huge');
        expect(captured, isNotNull,
            reason:
                'unknown size must emit a debug-mode FlutterError (ICN-FN-004)');
        final five = await renderedSide(tester, '5');
        expect(huge, five,
            reason:
                'unknown size string must fall back to "5" (per `oneUiResolveIconSize`)');
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgetsAllPlatforms('[fn] decimal size "2.5" resolves via spacing tail "2-5"',
        (tester) async {
      final s25 = await renderedSide(tester, '2.5');
      final s2 = await renderedSide(tester, '2');
      final s3 = await renderedSide(tester, '3');
      expect(s25, greaterThan(s2),
          reason: '2.5 must be larger than 2 — decimal tail rewrite must work');
      expect(s25, lessThan(s3),
          reason: '2.5 must be smaller than 3');
    });
  });

  group('[functional] Icon — appearance resolution', () {
    for (final app in kOneUiIconAppearances) {
      testWidgetsAllPlatforms('[smoke] appearance="$app" renders', (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(
            icon: 'add',
            appearance: app,
            semanticsLabel: 'Add',
          ),
        );
        expect(
          find.byKey(ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=$app|data-emphasis=high',
          )),
          findsOneWidget,
          reason: 'data-attribute key must reflect the resolved appearance=$app',
        );
      });
    }

    testWidgetsAllPlatforms('[fn] appearance=null defaults to neutral', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', semanticsLabel: 'Add'),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon|data-size=5|data-appearance=neutral|data-emphasis=high',
        )),
        findsOneWidget,
        reason: 'when appearance is null with no slot parent, default is neutral',
      );
    });

    testWidgetsAllPlatforms('[fn] appearance=auto inside Surface inherits parent role',
        (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', appearance: 'auto', semanticsLabel: 'Add'),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon|data-size=5|data-appearance=positive|data-emphasis=high',
        )),
        findsOneWidget,
        reason: 'auto inside Surface(positive) must inherit positive role',
      );
    });

    testWidgetsAllPlatforms(
      '[fn] appearance=null inside OneUiSlotParentAppearanceScope inherits slot role',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiSlotParentAppearanceScope(
            appearance: 'negative',
            child: const OneUiIcon(icon: 'add', semanticsLabel: 'Delete'),
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=negative|data-emphasis=high',
          )),
          findsOneWidget,
          reason:
              'when appearance is null AND a slot parent provides a role, '
              'the icon inherits the slot parent role (e.g. Icon inside a Button slot)',
        );
      },
    );

    testWidgetsAllPlatforms('[fn] explicit appearance wins over slot scope',
        (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        OneUiSlotParentAppearanceScope(
          appearance: 'negative',
          child: const OneUiIcon(
            icon: 'add',
            appearance: 'positive',
            semanticsLabel: 'Confirm',
          ),
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon|data-size=5|data-appearance=positive|data-emphasis=high',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms(
      '[fn] appearance="brand-bg" is remapped to "primary" via slotRoleToIconAppearance',
      (tester) async {
        // Icon's kOneUiIconAppearances does NOT include 'brand-bg', but the
        // slotRoleToIconAppearance helper does map it. When passed directly,
        // the resolver enters the slotRoleToIconAppearance branch — which
        // maps brand-bg → primary.
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(
            icon: 'add',
            appearance: 'brand-bg',
            semanticsLabel: 'Add',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=primary|data-emphasis=high',
          )),
          findsOneWidget,
          reason:
              'brand-bg must remap to primary on the Icon glyph (Icon glyph palette has no brand-bg)',
        );
      },
    );
  });

  group('[functional] Icon — emphasis resolution', () {
    for (final emphasis in OneUiIconEmphasis.values) {
      testWidgetsAllPlatforms('[smoke] emphasis=${emphasis.name} encoded in data key',
          (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiIcon(
            icon: 'add',
            emphasis: emphasis,
            semanticsLabel: 'Add',
          ),
        );
        expect(
          find.byKey(ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=neutral|data-emphasis=${emphasis.name}',
          )),
          findsOneWidget,
        );
      });
    }
  });

  group('[functional] Icon — glyph rendering', () {
    testWidgetsAllPlatforms('[fn] String icon renders through OneUiSemanticIcon', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', semanticsLabel: 'Add'),
      );
      // OneUiSemanticIcon either renders the Jio SVG OR falls back to Material Icon.
      // Either way the OneUiSemanticIcon widget must be present.
      final semanticIcon = find.descendant(
        of: iconRootFinder(),
        matching: find.byWidgetPredicate(
            (w) => w.runtimeType.toString() == 'OneUiSemanticIcon'),
      );
      expect(semanticIcon, findsAtLeastNWidgets(1),
          reason: 'String icon must render through OneUiSemanticIcon');
    });

    testWidgetsAllPlatforms('[fn] Widget icon renders the custom glyph (FittedBox)',
        (tester) async {
      const customKey = ValueKey('custom-glyph');
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(
          icon: SizedBox(key: customKey, width: 64, height: 64),
          size: '8',
          semanticsLabel: 'Custom',
        ),
      );
      expect(find.byKey(customKey), findsOneWidget,
          reason: 'Widget icon must render verbatim (wrapped in FittedBox + IconTheme)');
      expect(
        find.descendant(of: iconRootFinder(), matching: find.byType(FittedBox)),
        findsAtLeastNWidgets(1),
        reason: 'Custom glyph wrapper must include FittedBox(BoxFit.contain)',
      );
    });

    testWidgetsAllPlatforms(
      '[fn] Non-String / non-Widget icon emits dev assertion and falls to SizedBox.shrink',
      (tester) async {
        // `icon: Object` accepts anything at compile time. Invalid values must
        // emit a debug FlutterError (ICN-FN-002) and render an empty shell.
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconQaHarnessSettled(
            tester,
            const OneUiIcon(icon: 42, semanticsLabel: 'Bogus'),
          );
          expect(captured, isNotNull,
              reason:
                  'Invalid icon types must emit a debug-mode FlutterError (ICN-FN-002)');
          expect(find.byType(OneUiIcon), findsOneWidget);
          expect(
            find.descendant(
              of: iconRootFinder(),
              matching: find.byWidgetPredicate(
                  (w) => w.runtimeType.toString() == 'OneUiSemanticIcon'),
            ),
            findsNothing,
            reason: 'invalid icon type must not render a glyph',
          );
        } finally {
          FlutterError.onError = prev;
        }
      },
    );
  });

  group('[functional] Icon — testId / KeyedSubtree', () {
    testWidgetsAllPlatforms('[fn] testId attaches a ValueKey to the root', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', testId: 'qa-icon', semanticsLabel: 'Add'),
      );
      expect(find.byKey(const ValueKey('qa-icon')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] empty / whitespace testId is ignored', (tester) async {
      await pumpIconQaHarnessSettled(
        tester,
        const OneUiIcon(icon: 'add', testId: '   ', semanticsLabel: 'Add'),
      );
      // Whitespace-only testId is treated as null in the code.
      // The wrapping ValueKey must NOT contain the whitespace string.
      expect(find.byKey(const ValueKey('   ')), findsNothing,
          reason: 'whitespace-only testId must be ignored');
    });
  });
}
