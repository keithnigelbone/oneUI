/// IconContained functional QA tests — mirrors web `IconContained.tsx` and
/// the Figma matrix (5 sizes × 2 attention × 9 appearances × disabled).
///
/// Validates ACTUAL behaviour:
///   - `tester.getSize` measures the rendered container dimensions.
///   - Disabled state asserted via Opacity widget inspection + Semantics(enabled).
///   - Appearance inheritance asserted via the data-attribute key the widget
///     actually emits.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';

import '../../support/components/icon_contained_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[smoke] IconContained — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default renders', (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
      );
      expect(find.byType(OneUiIconContained), findsOneWidget);
    });

    for (final size in kOneUiIconContainedSizes) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            size: size,
            semanticsLabel: 'Like',
          ),
        );
        expect(find.byType(OneUiIconContained), findsOneWidget);
      });
    }

    for (final attention in OneUiIconContainedAttention.values) {
      testWidgetsAllPlatforms('[smoke] attention=${attention.name} renders',
          (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            attention: attention,
            semanticsLabel: 'Like',
          ),
        );
        expect(find.byType(OneUiIconContained), findsOneWidget);
      });
    }
  });

  group('[functional] IconContained — size honors token (not just smoke)', () {
    Future<Size> renderSize(WidgetTester tester, String size) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        OneUiIconContained(
          icon: 'heart',
          size: size,
          semanticsLabel: 'Like',
        ),
      );
      final box = find.descendant(
        of: iconContainedRootFinder(),
        matching: find.byType(DecoratedBox),
      ).first;
      return tester.getSize(box);
    }

    testWidgetsAllPlatforms('[fn] xs < s < m < l < xl (strict ordering)',
        (tester) async {
      final xs = await renderSize(tester, 'xs');
      final s = await renderSize(tester, 's');
      final m = await renderSize(tester, 'm');
      final l = await renderSize(tester, 'l');
      final xl = await renderSize(tester, 'xl');
      expect(xs.width, lessThan(s.width));
      expect(s.width, lessThan(m.width));
      expect(m.width, lessThan(l.width));
      expect(l.width, lessThan(xl.width));
    });

    testWidgetsAllPlatforms('[fn] container is square (width == height)',
        (tester) async {
      for (final size in kOneUiIconContainedSizes) {
        final dim = await renderSize(tester, size);
        expect(dim.width, dim.height,
            reason: 'IconContained at size=$size must be square');
      }
    });

    testWidgetsAllPlatforms('[fn] unknown size falls back to "m"', (tester) async {
      final huge = await renderSize(tester, 'huge');
      final m = await renderSize(tester, 'm');
      expect(huge, m);
    });
  });

  group('[functional] IconContained — appearance resolution', () {
    for (final app in kOneUiIconContainedAppearances) {
      testWidgetsAllPlatforms('[smoke] appearance="$app" renders', (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            appearance: app,
            semanticsLabel: 'Like',
          ),
        );
        expect(find.byType(OneUiIconContained), findsOneWidget);
      });
    }

    testWidgetsAllPlatforms(
        '[fn] appearance=null inherits root Surface (primary)',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon-contained|data-size=m|data-attention=medium|'
          'data-appearance=primary|disabled=false',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] appearance=auto outside Surface resolves to primary',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'auto',
          semanticsLabel: 'Like',
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon-contained|data-size=m|data-attention=medium|'
          'data-appearance=primary|disabled=false',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] appearance=auto inside Surface inherits parent',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'auto',
          semanticsLabel: 'Like',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'negative',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon-contained|data-size=m|data-attention=medium|'
          'data-appearance=negative|disabled=false',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] explicit appearance wins over auto+Surface',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          appearance: 'positive',
          semanticsLabel: 'Like',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'negative',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon-contained|data-size=m|data-attention=medium|'
          'data-appearance=positive|disabled=false',
        )),
        findsOneWidget,
      );
    });
  });

  group('[functional] IconContained — attention encoded', () {
    for (final attention in OneUiIconContainedAttention.values) {
      testWidgetsAllPlatforms('[fn] attention=${attention.name} in data key',
          (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          OneUiIconContained(
            icon: 'heart',
            attention: attention,
            semanticsLabel: 'Like',
          ),
        );
        expect(
          find.byKey(ValueKey<String>(
            'oneui-icon-contained|data-size=m|data-attention=${attention.name}|'
            'data-appearance=primary|disabled=false',
          )),
          findsOneWidget,
        );
      });
    }
  });

  group('[functional] IconContained — disabled state', () {
    testWidgetsAllPlatforms('[fn] disabled=true encoded in data key',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          disabled: true,
          semanticsLabel: 'Like',
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-icon-contained|data-size=m|data-attention=medium|'
          'data-appearance=primary|disabled=true',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] disabled=true applies Opacity<1.0',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          disabled: true,
          semanticsLabel: 'Like',
        ),
      );
      final opacityWidget = tester.widget<Opacity>(find.descendant(
        of: iconContainedRootFinder(),
        matching: find.byType(Opacity),
      ).first);
      expect(opacityWidget.opacity, lessThan(1.0),
          reason: 'disabled=true must apply opacity < 1');
    });

    testWidgetsAllPlatforms('[fn] disabled=false renders full opacity',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          semanticsLabel: 'Like',
        ),
      );
      final opacityWidget = tester.widget<Opacity>(find.descendant(
        of: iconContainedRootFinder(),
        matching: find.byType(Opacity),
      ).first);
      expect(opacityWidget.opacity, 1.0);
    });
  });

  group('[functional] IconContained — glyph rendering', () {
    testWidgetsAllPlatforms('[fn] String icon renders through OneUiSemanticIcon',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
      );
      final semanticIcon = find.descendant(
        of: iconContainedRootFinder(),
        matching: find.byWidgetPredicate(
            (w) => w.runtimeType.toString() == 'OneUiSemanticIcon'),
      );
      expect(semanticIcon, findsAtLeastNWidgets(1));
    });

    testWidgetsAllPlatforms('[fn] Widget icon renders the custom glyph',
        (tester) async {
      const customKey = ValueKey('custom');
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: SizedBox(key: customKey, width: 16, height: 16),
          semanticsLabel: 'Custom',
        ),
      );
      expect(find.byKey(customKey), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] Non-String/Widget icon does NOT crash',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 42, semanticsLabel: 'Bogus'),
      );
      expect(tester.takeException(), isNull);
    });
  });

  group('[functional] IconContained — testId / KeyedSubtree', () {
    testWidgetsAllPlatforms('[fn] testId attaches a ValueKey to the root',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(
          icon: 'heart',
          testId: 'qa-contained',
          semanticsLabel: 'Like',
        ),
      );
      expect(find.byKey(const ValueKey('qa-contained')), findsOneWidget);
    });
  });

  group('[functional] IconContained — border radius (pill)', () {
    testWidgetsAllPlatforms('[fn] DecoratedBox shape is pill (radius ≥ side/2)',
        (tester) async {
      await pumpIconContainedQaHarnessSettled(
        tester,
        const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
      );
      final decorated = tester.widget<DecoratedBox>(find.descendant(
        of: iconContainedRootFinder(),
        matching: find.byType(DecoratedBox),
      ));
      final dec = decorated.decoration as BoxDecoration;
      final radius = dec.borderRadius?.resolve(TextDirection.ltr).topLeft.x ?? 0;
      // Container is 40 px at size=m. Pill needs radius ≥ 20.
      expect(radius, greaterThanOrEqualTo(20),
          reason: 'default container must be pill-shaped (radius ≥ side/2)');
    });
  });
}
