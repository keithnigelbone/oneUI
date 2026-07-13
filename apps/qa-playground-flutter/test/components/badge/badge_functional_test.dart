/// Badge functional QA tests — mirrors web `badge-qa.spec.ts` / RN
/// `Badge.test.tsx` and the Figma API matrix (size × attention × appearance ×
/// start/end slots).
///
/// Asserts observable behavior (rendered height, slot presence, ordering,
/// shrink-wrapping, conditional rules) so a regression that silently ignores
/// a Figma prop fails here instead of slipping through.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../../support/components/badge_harness.dart';

void main() {
  // Preload the Jio Convex fixture before any testWidgets runs.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[smoke] Badge — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default badge renders', (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'status', child: 'Badge'),
      );
      expect(find.text('Badge'), findsOneWidget);
    });

    for (final size in kOneUiBadgeSizes) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          OneUiBadge(semanticsLabel: 'badge', size: size, child: 'Badge'),
        );
        expect(find.text('Badge'), findsOneWidget);
      });
    }
  });

  group('[functional] Badge — size honors token (not just smoke)', () {
    Future<double> renderHeight(WidgetTester tester, String size) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        OneUiBadge(semanticsLabel: 'badge', size: size, child: 'Sz'),
      );
      return tester.getSize(badgeRootFinder()).height;
    }

    testWidgetsAllPlatforms(
        '[fn] size="xl" renders strictly taller than size="xs"',
        (tester) async {
      final hXl = await renderHeight(tester, 'xl');
      final hXs = await renderHeight(tester, 'xs');
      expect(hXl, greaterThan(hXs),
          reason: 'xl must read --Badge-height-xl, xs reads --Badge-height-xs');
    });

    testWidgetsAllPlatforms('[fn] size is monotonic xs ≤ s ≤ m ≤ l ≤ xl',
        (tester) async {
      final hXs = await renderHeight(tester, 'xs');
      final hS = await renderHeight(tester, 's');
      final hM = await renderHeight(tester, 'm');
      final hL = await renderHeight(tester, 'l');
      final hXl = await renderHeight(tester, 'xl');
      expect(hXs, lessThanOrEqualTo(hS));
      expect(hS, lessThanOrEqualTo(hM));
      expect(hM, lessThanOrEqualTo(hL));
      expect(hL, lessThanOrEqualTo(hXl));
      expect(hXs, lessThan(hXl),
          reason:
              'distinct seeded heights must yield distinct rendered heights');
    });

    testWidgetsAllPlatforms('[fn] unknown size falls back to "m"',
        (tester) async {
      // Per `oneUiResolveBadgeSize` — unknown strings must NOT crash the
      // engine and must render at the default-m height.
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'badge', size: 'huge', child: 'X'),
      );
      final hUnknown = tester.getSize(badgeRootFinder()).height;

      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'badge', size: 'm', child: 'X'),
      );
      final hM = tester.getSize(badgeRootFinder()).height;

      expect(hUnknown, hM,
          reason: 'unknown size token must fall back to m height');
    });
  });

  group('[smoke] Badge — Figma matrix: appearance (all 8 + auto + brand-bg)',
      () {
    for (final appearance in const [
      'auto',
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'positive',
      'negative',
      'informative',
      'warning',
      'brand-bg',
    ]) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders',
          (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          OneUiBadge(
            semanticsLabel: 'badge',
            appearance: appearance,
            child: 'Save',
          ),
        );
        expect(find.text('Save'), findsOneWidget);
      });
    }
  });

  group('[functional] Badge — attention → variant resolution', () {
    test('[fn] kBadgeAttentionToVariant pins the Figma mapping', () {
      expect(kBadgeAttentionToVariant['high'], 'bold');
      expect(kBadgeAttentionToVariant['medium'], 'subtle');
      expect(kBadgeAttentionToVariant['low'], 'ghost');
    });

    test('[fn] kBadgeVariantToAttention is the inverse', () {
      expect(kBadgeVariantToAttention['bold'], 'high');
      expect(kBadgeVariantToAttention['subtle'], 'medium');
      expect(kBadgeVariantToAttention['ghost'], 'low');
    });

    for (final attention in const ['high', 'medium', 'low']) {
      testWidgetsAllPlatforms(
          '[smoke] attention=$attention encodes correct data-variant',
          (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          OneUiBadge(
            semanticsLabel: 'badge',
            attention: attention,
            child: 'A',
          ),
        );
        final expectedVariant = kBadgeAttentionToVariant[attention]!;
        expect(
          find.byKey(ValueKey<String>(
            'oneui-badge|data-size=m|data-variant=$expectedVariant|'
            'data-attention=$attention|data-appearance=sparkle',
          )),
          findsOneWidget,
          reason:
              'attention=$attention must encode variant=$expectedVariant in the data-attribute key',
        );
      });
    }

    testWidgetsAllPlatforms('[fn] explicit variant wins over attention',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'badge',
          variant: 'bold',
          attention: 'low',
          child: 'P',
        ),
      );
      // The data-attribute key encodes the resolved variant. attention=low
      // alone would map to ghost — explicit variant=bold must override.
      // Web omits data-attention when variant is explicit (see BADGE-FN-009).
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|data-appearance=sparkle',
        )),
        findsOneWidget,
      );
    });
  });

  group('[functional] Badge — child content', () {
    testWidgetsAllPlatforms('[fn] String child renders as text',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'b', child: 'Beta'),
      );
      expect(find.text('Beta'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] numeric child renders via toString',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'b', child: 3),
      );
      expect(find.text('3'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] label widget enforces maxLines=1 + ellipsis',
        (tester) async {
      // Badge MUST stay on a single line (Figma rule). We assert the Text
      // widget's own maxLines/overflow props rather than parent-constrained
      // clipping, because Row(min) does not propagate a maxWidth down — the
      // ellipsis fires when the badge sits inside a flex / IntrinsicWidth
      // parent that bounds the row directly.
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          child: 'Long enough label',
        ),
      );
      final textWidget = tester.widget<Text>(
        find.descendant(of: badgeRootFinder(), matching: find.byType(Text)),
      );
      expect(textWidget.maxLines, 1,
          reason: 'Badge label must enforce maxLines=1');
      expect(textWidget.overflow, TextOverflow.ellipsis,
          reason: 'Badge label must use TextOverflow.ellipsis');
    });

    testWidgetsAllPlatforms('[fn] empty string child renders no text element',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'b', child: ''),
      );
      // With no visible text the row holds no Text widget — the badge still
      // renders (as a dot-ish chip) but no `''` is emitted.
      expect(find.byType(Text), findsNothing,
          reason: 'empty child must not emit a Text widget');
      expect(find.byType(OneUiBadge), findsOneWidget);
    });
  });

  group('[functional] Badge — start / end slots', () {
    testWidgetsAllPlatforms('[fn] start slot renders an Icon child',
        (tester) async {
      const markerKey = ValueKey('start-icon');
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          start: OneUiIcon(icon: 'check', key: markerKey),
          child: 'Badge',
        ),
      );
      expect(find.byKey(markerKey), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] end slot renders an Icon child',
        (tester) async {
      const markerKey = ValueKey('end-icon');
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          end: OneUiIcon(icon: 'arrow_forward', key: markerKey),
          child: 'Badge',
        ),
      );
      expect(find.byKey(markerKey), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] both slots render simultaneously',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          start: OneUiIcon(icon: 'check', key: ValueKey('s')),
          end: OneUiIcon(icon: 'arrow_forward', key: ValueKey('e')),
          child: 'Both',
        ),
      );
      expect(find.byKey(const ValueKey('s')), findsOneWidget);
      expect(find.byKey(const ValueKey('e')), findsOneWidget);
      expect(find.text('Both'), findsOneWidget);
    });

    // Nested CounterBadge/IndicatorBadge/Avatar slots are exercised by the
    // dev-owned widget tests in `packages/ui_flutter/test/one_ui_badge_widget_test.dart`,
    // which use a tight synthetic design-system payload that bypasses the
    // Jio fixture's full token resolution path. We keep a smoke check here
    // that arbitrary widgets are accepted in either slot (KeyedSubtree marker),
    // which is the contract the Figma API actually exposes.
    testWidgetsAllPlatforms('[fn] arbitrary widget accepted in start slot',
        (tester) async {
      const marker = ValueKey('arbitrary-start');
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          start: SizedBox(key: marker, width: 8, height: 8),
          child: 'Badge',
        ),
      );
      expect(find.byKey(marker), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] arbitrary widget accepted in end slot',
        (tester) async {
      const marker = ValueKey('arbitrary-end');
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          end: SizedBox(key: marker, width: 8, height: 8),
          child: 'Badge',
        ),
      );
      expect(find.byKey(marker), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] start-only renders without label',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'icon-only',
          start: OneUiIcon(icon: 'check'),
        ),
      );
      expect(find.byType(OneUiIcon), findsOneWidget);
      expect(find.byType(Text), findsNothing);
    });
  });

  group('[functional] Badge — width grows with content', () {
    // The badge's outer KeyedSubtree-rooted [OneUiBadge] does not carry its
    // own RenderObject; tester.getSize on it returns the parent constraint
    // width inside this harness. We instead probe the inner DecoratedBox —
    // the visual shell — which sizes to its content. That makes the width
    // assertion deterministic regardless of the parent layout chain.
    Finder badgeShellFinder() => find
        .descendant(of: badgeRootFinder(), matching: find.byType(DecoratedBox))
        .first;

    testWidgetsAllPlatforms('[fn] adding a start slot increases shell width',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'b', child: 'Badge'),
      );
      final wPlain = tester.getSize(badgeShellFinder()).width;

      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          start: OneUiIcon(icon: 'check'),
          child: 'Badge',
        ),
      );
      final wWithStart = tester.getSize(badgeShellFinder()).width;

      expect(wWithStart, greaterThan(wPlain),
          reason:
              'adding a start slot must widen the visual shell to fit the icon');
    });
  });

  group('[functional] Badge — testId / KeyedSubtree', () {
    testWidgetsAllPlatforms('[fn] testId attaches a ValueKey to the root',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          testId: 'qa-badge',
          child: 'New',
        ),
      );
      expect(find.byKey(const ValueKey('qa-badge')), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[fn] data-attribute key encodes size+variant+attention+appearance',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          size: 'l',
          attention: 'medium',
          appearance: 'positive',
          child: 'OK',
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-badge|data-size=l|data-variant=subtle|'
          'data-attention=medium|data-appearance=positive',
        )),
        findsOneWidget,
        reason: 'data-attribute key must reflect the resolved state',
      );
    });
  });

  group('[functional] Badge — Surface context (appearance="auto")', () {
    testWidgetsAllPlatforms(
        '[fn] appearance=auto outside Surface defaults to sparkle',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(semanticsLabel: 'b', child: 'X'),
      );
      // Outside `<Surface>` the engine falls back to sparkle.
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=sparkle',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms(
        '[fn] appearance=auto inside Surface inherits parent role',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          appearance: 'auto',
          child: 'X',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=secondary',
        )),
        findsOneWidget,
        reason: 'appearance=auto inside Surface must inherit the parent role',
      );
    });

    testWidgetsAllPlatforms('[fn] explicit appearance wins over Surface',
        (tester) async {
      await pumpBadgeQaHarnessSettled(
        tester,
        const OneUiBadge(
          semanticsLabel: 'b',
          appearance: 'negative',
          child: 'Err',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=negative',
        )),
        findsOneWidget,
      );
    });
  });
}
