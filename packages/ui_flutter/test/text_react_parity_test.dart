/// React parity — `Text.test.tsx` + RN `textA11y.test.ts` (functionality + a11y).
///
/// Test names mirror the web/RN specs. Widget cases run on Android, iOS, and
/// desktop targets so semantics hold on Flutter mobile and web.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import 'text_test_harness.dart';

void main() {
  // ---------------------------------------------------------------------------
  // Text.test.tsx — resolveTextSize
  // ---------------------------------------------------------------------------
  group('React parity — Text.test.tsx resolveTextSize', () {
    test('keeps valid display / headline / title sizes', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.display, 'L'), 'L');
      expect(resolveOneUiTextSize(OneUiTextVariant.title, 'M'), 'M');
      expect(resolveOneUiTextSize(OneUiTextVariant.headline, 'S'), 'S');
    });

    test('clamps display sizes below S to S and above L to L', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.display, '3XS'), 'S');
      expect(resolveOneUiTextSize(OneUiTextVariant.display, '2XL'), 'L');
      expect(resolveOneUiTextSize(OneUiTextVariant.headline, 'XL'), 'L');
    });

    test('maps body 3XS to 2XS', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.body, '3XS'), '2XS');
    });

    test('maps invalid body sizes to nearest in body order', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.body, 'bogus'), 'M');
    });

    test('maps code L / XL / 2XL to M and tiny steps to XS', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.code, 'L'), 'M');
      expect(resolveOneUiTextSize(OneUiTextVariant.code, 'XL'), 'M');
      expect(resolveOneUiTextSize(OneUiTextVariant.code, '2XL'), 'M');
      expect(resolveOneUiTextSize(OneUiTextVariant.code, '3XS'), 'XS');
      expect(resolveOneUiTextSize(OneUiTextVariant.code, '2XS'), 'XS');
    });

    test('maps invalid label sizes to nearest label step', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.label, 'bogus'), 'M');
    });
  });

  // ---------------------------------------------------------------------------
  // textA11y.test.ts — useTextState
  // ---------------------------------------------------------------------------
  group('Figma Text spec — weight and attention scoping', () {
    test('display clamps weight to medium and attention to high', () {
      final s = resolveOneUiTextState(
        variant: OneUiTextVariant.display,
        weight: OneUiTextWeight.high,
        attention: OneUiTextAttention.low,
      );
      expect(s.dataWeight, 'medium');
      expect(s.dataAttention, 'high');
    });

    test('code clamps weight to medium', () {
      final s = resolveOneUiTextState(
        variant: OneUiTextVariant.code,
        weight: OneUiTextWeight.high,
      );
      expect(s.dataWeight, 'medium');
    });

    test('body preserves weight and attention', () {
      final s = resolveOneUiTextState(
        variant: OneUiTextVariant.body,
        weight: OneUiTextWeight.low,
        attention: OneUiTextAttention.medium,
      );
      expect(s.dataWeight, 'low');
      expect(s.dataAttention, 'medium');
    });

    test('underline metrics scale with body weight', () {
      final low = resolveOneUiTextUnderlineMetrics(
        variant: OneUiTextVariant.body,
        weight: OneUiTextWeight.low,
        fontSize: 20,
      );
      final high = resolveOneUiTextUnderlineMetrics(
        variant: OneUiTextVariant.body,
        weight: OneUiTextWeight.high,
        fontSize: 20,
      );
      expect(low.thicknessPx, closeTo(2, 0.01));
      expect(high.thicknessPx, closeTo(3, 0.01));
      expect(low.offsetPx, closeTo(5, 0.01));
    });
  });

  group('React parity — textA11y.test.ts useTextState', () {
    test('defaults to body / M / high / neutral', () {
      final s = resolveOneUiTextState();
      expect(s.resolvedVariant, OneUiTextVariant.body);
      expect(s.resolvedSize, 'M');
      expect(s.resolvedWeight, OneUiTextWeight.high);
      expect(s.resolvedAttention, OneUiTextAttention.high);
      expect(s.resolvedAppearance, 'neutral');
      expect(s.dataVariant, 'body');
      expect(s.dataSize, 'M');
      expect(s.dataWeight, 'high');
      expect(s.dataAttention, 'high');
      expect(s.dataAppearance, 'neutral');
    });

    test('collapses attention="none" to "high"', () {
      final s = resolveOneUiTextState(attention: OneUiTextAttention.none);
      expect(s.resolvedAttention, OneUiTextAttention.high);
      expect(s.dataAttention, 'high');
    });

    test('resolves appearance="auto" to "neutral"', () {
      final s = resolveOneUiTextState(appearance: 'auto');
      expect(s.resolvedAppearance, 'neutral');
      expect(s.dataAppearance, 'neutral');
    });

    test('clamps invalid sizes for the variant', () {
      expect(resolveOneUiTextSize(OneUiTextVariant.body, '3XS'), '2XS');
      expect(resolveOneUiTextSize(OneUiTextVariant.display, 'XS'), 'S');
      expect(resolveOneUiTextSize(OneUiTextVariant.display, '2XL'), 'L');
      expect(resolveOneUiTextSize(OneUiTextVariant.code, '2XL'), 'M');
    });

    test('lang maps to devanagari script in payload', () {
      final s = resolveOneUiTextState(lang: 'hi');
      expect(s.dataScript, 'devanagari');
    });

    test('explicit script and reading mode in payload', () {
      final s = resolveOneUiTextState(
        script: 'devanagari',
        scriptMode: OneUiTextScriptMode.reading,
      );
      expect(s.dataScript, 'devanagari');
      expect(s.dataScriptMode, 'reading');
    });

    test('legacy language=others in payload', () {
      final s = resolveOneUiTextState(language: OneUiTextLanguage.others);
      expect(s.dataLanguage, 'others');
      expect(s.dataScript, isNull);
    });
  });

  // ---------------------------------------------------------------------------
  // Text.test.tsx — functionality (widget)
  // ---------------------------------------------------------------------------
  group('React parity — Text.test.tsx functionality', () {
    testWidgetsAllPlatforms('defaults to body / M / high payload',
        (tester) async {
      await tester.pumpWidget(pumpTextApp(const OneUiText(text: 'Hello')));
      await tester.pumpAndSettle();
      expect(find.text('Hello'), findsOneWidget);
      final payload = oneUiTextPayloadValue(tester);
      expect(payload, contains('data-variant=body'));
      expect(payload, contains('data-size=M'));
      expect(payload, contains('data-weight=high'));
      expect(payload, contains('data-attention=high'));
      expect(payload, contains('data-appearance=neutral'));
    });

    testWidgetsAllPlatforms('display and headline variants differ in size',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiText(variant: OneUiTextVariant.headline, text: 'Section'),
              OneUiText(variant: OneUiTextVariant.display, text: 'Big'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final headlineSize =
          tester.widget<Text>(find.text('Section')).style?.fontSize;
      final displaySize = tester.widget<Text>(find.text('Big')).style?.fontSize;
      expect(headlineSize, isNotNull);
      expect(displaySize, isNotNull);
      expect(displaySize!, greaterThan(headlineSize!));
    });

    testWidgetsAllPlatforms(
        'code variant uses monospace family when configured', (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
            const OneUiText(variant: OneUiTextVariant.code, text: 'x = 1')),
      );
      await tester.pumpAndSettle();
      final style = tester.widget<Text>(find.text('x = 1')).style;
      expect(style?.fontFamily, contains('Mono'));
    });

    testWidgetsAllPlatforms('title variant payload encodes title role',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(
            variant: OneUiTextVariant.title, text: 'Card title')),
      );
      await tester.pumpAndSettle();
      expect(oneUiTextPayloadValue(tester), contains('data-variant=title'));
    });

    testWidgetsAllPlatforms('JioType suppresses italic; underline/strike apply',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'decorated',
            italic: true,
            underline: true,
            strikethrough: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final style = tester.widget<Text>(find.text('decorated')).style!;
      expect(style.fontStyle, FontStyle.normal);
      expect(
          style.decoration,
          TextDecoration.combine([
            TextDecoration.underline,
            TextDecoration.lineThrough,
          ]));
      expect(style.decorationThickness, closeTo(2.1, 0.1));
      final payload = oneUiTextPayloadValue(tester);
      expect(payload, contains('data-italic=true'));
      expect(payload, contains('data-underline=true'));
      expect(payload, contains('data-strikethrough=true'));
    });

    testWidgetsAllPlatforms('underline thickness increases with weight',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const Row(
            children: [
              OneUiText(
                text: 'low',
                weight: OneUiTextWeight.low,
                underline: true,
              ),
              OneUiText(
                text: 'high',
                weight: OneUiTextWeight.high,
                underline: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final low =
          tester.widget<Text>(find.text('low')).style!.decorationThickness!;
      final high =
          tester.widget<Text>(find.text('high')).style!.decorationThickness!;
      expect(high, greaterThan(low));
    });

    testWidgetsAllPlatforms('plain text has no decoration styles',
        (tester) async {
      await tester.pumpWidget(pumpTextApp(const OneUiText(text: 'plain')));
      await tester.pumpAndSettle();
      final style = tester.widget<Text>(find.text('plain')).style!;
      expect(style.fontStyle, FontStyle.normal);
      expect(style.decoration, isNull);
    });

    testWidgetsAllPlatforms('maxLines enables ellipsis overflow',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const SizedBox(
            width: 120,
            child: OneUiText(
              maxLines: 1,
              text: 'truncated paragraph that wraps across multiple lines',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final text = tester.widget<Text>(find.textContaining('truncated'));
      expect(text.maxLines, 1);
      expect(text.overflow, TextOverflow.ellipsis);
    });

    testWidgetsAllPlatforms('renders text prop when provided', (tester) async {
      await tester.pumpWidget(pumpTextApp(const OneUiText(text: 'from prop')));
      await tester.pumpAndSettle();
      expect(find.text('from prop'), findsOneWidget);
    });

    testWidgetsAllPlatforms('body 3XS clamps to 2XS in payload',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(
            variant: OneUiTextVariant.body, size: '3XS', text: 'tiny')),
      );
      await tester.pumpAndSettle();
      expect(oneUiTextPayloadValue(tester), contains('data-size=2XS'));
    });

    testWidgetsAllPlatforms('center and right textAlign inside bounded width',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const SizedBox(
            width: 240,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                OneUiText(
                  textAlign: OneUiTextAlign.left,
                  text: 'Left-aligned paragraph.',
                ),
                OneUiText(
                  textAlign: OneUiTextAlign.center,
                  text: 'Centred paragraph.',
                ),
                OneUiText(
                  textAlign: OneUiTextAlign.right,
                  text: 'Right-aligned paragraph.',
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        tester.widget<Text>(find.text('Centred paragraph.')).textAlign,
        TextAlign.center,
      );
      expect(
        tester.widget<Text>(find.text('Right-aligned paragraph.')).textAlign,
        TextAlign.right,
      );
    });

    testWidgetsAllPlatforms('lang and script encoded on payload key',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(lang: 'hi', text: 'नमस्ते')),
      );
      await tester.pumpAndSettle();
      final payload = oneUiTextPayloadValue(tester);
      expect(payload, contains('lang=hi'));
      expect(payload, contains('data-script=devanagari'));
    });

    testWidgetsAllPlatforms('shows gap card without typography snapshot',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
            home: Scaffold(body: Center(child: OneUiText(text: 'x')))),
      );
      expect(find.byType(ConvexGapCard), findsOneWidget);
    });
  });

  // ---------------------------------------------------------------------------
  // textA11y.test.ts — widget semantics (mobile + web)
  // ---------------------------------------------------------------------------
  group('React parity — textA11y.test.ts widget semantics', () {
    testWidgetsAllPlatforms('visible copy is exposed to assistive tech',
        (tester) async {
      await tester.pumpWidget(pumpTextApp(const OneUiText(text: 'hello')));
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('hello'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('promotes header for headline variant',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            variant: OneUiTextVariant.headline,
            text: 'Section',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Section'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('promotes header for display variant',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            variant: OneUiTextVariant.display,
            size: 'L',
            text: 'Page title',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Page title'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('promotes link when onPressed is supplied',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(OneUiText(text: 'docs', onPressed: () {})),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('docs'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('promotes link when href is set', (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'link',
            href: 'https://example.com',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('link'))
            .getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('forwards aria-label via semanticsLabel',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'Hi',
            semanticsLabel: 'Greeting',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Greeting'), findsOneWidget);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('hides from a11y when ariaHidden is true',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'decorative',
            ariaHidden: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('decorative'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('excludeFromSemantics hides from assistive tech',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'Hidden',
            excludeFromSemantics: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('forwards accessibilityHint on wrapper',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(
            text: 'hi',
            semanticsHint: 'Read aloud',
          ),
        ),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data =
            tester.getSemantics(find.bySemanticsLabel('hi')).getSemanticsData();
        expect(data.hint, 'Read aloud');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('testId attaches ValueKey', (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(text: 'ref test', testId: 'text-root')),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('text-root')), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[TXT-DEB-001] testId exposed via Semantics.identifier',
        (tester) async {
      await tester.pumpWidget(
        pumpTextApp(const OneUiText(text: 'Label', testId: 'qa-text')),
      );
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Label'))
            .getSemanticsData();
        expect(data.identifier, 'qa-text');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('href wires GestureDetector onTap', (tester) async {
      await tester.pumpWidget(
        pumpTextApp(
          const OneUiText(text: 'link', href: 'https://example.com'),
        ),
      );
      await tester.pumpAndSettle();
      final detector = tester.widget<GestureDetector>(
        find.descendant(
          of: find.byType(OneUiText),
          matching: find.byType(GestureDetector),
        ),
      );
      expect(detector.onTap, isNotNull);
    });
  });
}
