/// CounterBadge functional QA tests — mirrors web `CounterBadge.tsx` and the
/// Figma API matrix (size × attention × appearance × dot-mode × overflow).
///
/// Asserts observable behavior (rendered display value, height, attention
/// resolution, appearance auto-inheritance, max overflow, dot mode, etc.) so
/// a regression that silently ignores a Figma prop fails here.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_types.dart';

import '../../support/components/counter_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[smoke] CounterBadge — renders without crashing', () {
    testWidgetsAllPlatforms('[smoke] default counter renders the count', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 3, semanticsLabel: '3 unread'),
      );
      expect(find.text('3'), findsOneWidget);
    });

    for (final size in kOneUiCounterBadgeSizes) {
      testWidgetsAllPlatforms('[smoke] size="$size" renders', (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          OneUiCounterBadge(value: 1, size: size, semanticsLabel: '1'),
        );
        expect(find.byType(OneUiCounterBadge), findsOneWidget);
      });
    }
  });

  group('[functional] CounterBadge — size honors token (not just smoke)', () {
    Future<double> renderHeight(WidgetTester tester, String size) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        OneUiCounterBadge(value: 5, size: size, semanticsLabel: '5'),
      );
      return tester.getSize(counterBadgeRootFinder()).height;
    }

    testWidgetsAllPlatforms('[fn] size="xl" renders strictly taller than size="xs"', (tester) async {
      final hXl = await renderHeight(tester, 'xl');
      final hXs = await renderHeight(tester, 'xs');
      expect(hXl, greaterThan(hXs),
          reason: 'xl must read --CounterBadge-height-xl, xs reads --CounterBadge-height-xs');
    });

    testWidgetsAllPlatforms('[fn] size is monotonic xs ≤ s ≤ m ≤ l ≤ xl', (tester) async {
      final hXs = await renderHeight(tester, 'xs');
      final hS = await renderHeight(tester, 's');
      final hM = await renderHeight(tester, 'm');
      final hL = await renderHeight(tester, 'l');
      final hXl = await renderHeight(tester, 'xl');
      expect(hXs, lessThanOrEqualTo(hS));
      expect(hS, lessThanOrEqualTo(hM));
      expect(hM, lessThanOrEqualTo(hL));
      expect(hL, lessThanOrEqualTo(hXl));
    });

    testWidgetsAllPlatforms('[fn] unknown size falls back to "m"', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5, size: 'huge', semanticsLabel: '5'),
      );
      final hUnknown = tester.getSize(counterBadgeRootFinder()).height;

      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 5, size: 'm', semanticsLabel: '5'),
      );
      final hM = tester.getSize(counterBadgeRootFinder()).height;

      expect(hUnknown, hM,
          reason: 'unknown size token must fall back to m height');
    });
  });

  group('[smoke] CounterBadge — Figma matrix: appearance', () {
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
    ]) {
      testWidgetsAllPlatforms('[smoke] appearance="$appearance" renders', (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          OneUiCounterBadge(value: 8, appearance: appearance, semanticsLabel: '8'),
        );
        expect(find.text('8'), findsOneWidget);
      });
    }
  });

  group('[functional] CounterBadge — attention → variant resolution', () {
    test('[fn] kCounterBadgeAttentionToVariant pins the Figma mapping', () {
      expect(kCounterBadgeAttentionToVariant['high'], 'bold');
      expect(kCounterBadgeAttentionToVariant['medium'], 'subtle');
      expect(kCounterBadgeAttentionToVariant['low'], 'ghost');
    });

    test('[fn] kCounterBadgeVariantToAttention is the inverse', () {
      expect(kCounterBadgeVariantToAttention['bold'], 'high');
      expect(kCounterBadgeVariantToAttention['subtle'], 'medium');
      expect(kCounterBadgeVariantToAttention['ghost'], 'low');
    });

    for (final attention in const ['high', 'medium', 'low']) {
      testWidgetsAllPlatforms('[smoke] attention=$attention encodes correct data-variant', (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          OneUiCounterBadge(value: 8, attention: attention, semanticsLabel: '8'),
        );
        final expectedVariant = kCounterBadgeAttentionToVariant[attention]!;
        // Outside a Surface, appearance=auto resolves to 'primary' per CB-FN-004.
        expect(
          find.byKey(ValueKey<String>(
            'oneui-counter-badge|data-size=m|data-variant=$expectedVariant|'
            'data-attention=$attention|data-appearance=primary',
          )),
          findsOneWidget,
          reason: 'attention=$attention must encode variant=$expectedVariant',
        );
      });
    }

    testWidgetsAllPlatforms('[fn] explicit variant wins over attention for data-variant key',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          variant: 'bold',
          attention: 'low',
          semanticsLabel: '8',
        ),
      );
      // Explicit variant wins for paint + data-variant. data-attention is the
      // value derived from variant (bold → high), not the conflicting input.
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=primary',
        )),
        findsOneWidget,
      );
    });
  });

  group('[functional] CounterBadge — max overflow', () {
    testWidgetsAllPlatforms('[fn] value > max emits "max+" string', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 120, max: 99, semanticsLabel: '99+'),
      );
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] value == max renders the value (not max+)', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 99, max: 99, semanticsLabel: '99'),
      );
      expect(find.text('99'), findsOneWidget);
      expect(find.text('99+'), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] default max = 99 (when not provided)', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 100, semanticsLabel: '99+'),
      );
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] max=999 supports larger threshold', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 1500, max: 999, semanticsLabel: '999+'),
      );
      expect(find.text('999+'), findsOneWidget);
    });
  });

  group('[functional] CounterBadge — hidden when value <= 0', () {
    testWidgetsAllPlatforms('[fn] value=0 + showZero=false → no visible text', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 0, showZero: false, semanticsLabel: '0'),
      );
      expect(find.text('0'), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] value=0 + showZero=true renders "0"', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 0, showZero: true, semanticsLabel: '0'),
      );
      expect(find.text('0'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] negative value is hidden regardless of showZero', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: -3, showZero: true, semanticsLabel: '-3'),
      );
      expect(find.text('-3'), findsNothing);
    });
  });

  group('[functional] CounterBadge — xs dot-mode vs numerals', () {
    testWidgetsAllPlatforms('[fn] xs + attention=high renders dot (no visible digit)',
        (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          size: 'xs',
          attention: 'high',
          semanticsLabel: '5 new',
        ),
      );
      expect(find.text('5'), findsNothing,
          reason:
              'Flutter dot-mode (xs+high) hides numerals; callers supply '
              'semanticsLabel for AT.');
      expect(find.byType(OneUiCounterBadge), findsOneWidget);
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-counter-badge|data-size=xs|data-variant=bold|'
          'data-attention=high|data-appearance=primary',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] xs + attention=medium renders numerals', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          size: 'xs',
          attention: 'medium',
          semanticsLabel: '5 new',
        ),
      );
      expect(find.text('5'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] xs badge min-width fits single digit', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 9,
          size: 'xs',
          attention: 'high',
          semanticsLabel: '9 new',
        ),
      );
      final size = tester.getSize(counterBadgeRootFinder());
      expect(size.height, greaterThan(0));
      expect(size.width, greaterThanOrEqualTo(size.height));
    });
  });

  group('[functional] CounterBadge — display value content', () {
    testWidgetsAllPlatforms('[fn] single-digit value renders verbatim', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 7, semanticsLabel: '7'),
      );
      expect(find.text('7'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] two-digit value renders verbatim', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 42, semanticsLabel: '42'),
      );
      expect(find.text('42'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] Text widget enforces maxLines=1', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 99, semanticsLabel: '99'),
      );
      final textWidget = tester.widget<Text>(
        find.descendant(of: counterBadgeRootFinder(), matching: find.byType(Text)),
      );
      expect(textWidget.maxLines, 1,
          reason: 'CounterBadge label must enforce maxLines=1 (digits never wrap)');
    });
  });

  group('[functional] CounterBadge — testId / KeyedSubtree', () {
    testWidgetsAllPlatforms('[fn] testId attaches a ValueKey to the root', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 5,
          testId: 'qa-counter',
          semanticsLabel: '5',
        ),
      );
      expect(find.byKey(const ValueKey('qa-counter')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] data-attribute key encodes size+variant+attention+appearance', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          size: 'l',
          attention: 'medium',
          appearance: 'positive',
          semanticsLabel: '8',
        ),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-counter-badge|data-size=l|data-variant=subtle|'
          'data-attention=medium|data-appearance=positive',
        )),
        findsOneWidget,
        reason: 'data-attribute key must reflect the resolved state',
      );
    });
  });

  group('[functional] CounterBadge — Surface context (appearance="auto")', () {
    testWidgetsAllPlatforms('[fn] appearance=auto outside Surface defaults to primary', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(value: 8, semanticsLabel: '8'),
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=primary',
        )),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('[fn] explicit appearance wins over auto fallback', (tester) async {
      await pumpCounterBadgeQaHarnessSettled(
        tester,
        const OneUiCounterBadge(
          value: 8,
          appearance: 'negative',
          semanticsLabel: '8',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'secondary',
      );
      expect(
        find.byKey(const ValueKey<String>(
          'oneui-counter-badge|data-size=m|data-variant=bold|'
          'data-attention=high|data-appearance=negative',
        )),
        findsOneWidget,
      );
    });
  });
}
