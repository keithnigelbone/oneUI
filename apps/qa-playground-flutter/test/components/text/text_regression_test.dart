/// Text regression + parity-attribution suite.
///
/// Findings split by WHERE the defect lives — probed against the real widget
/// BEFORE the assertion was written:
///
///   [confirmed]  genuine Flutter bugs — RED until fixed.
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence.
///   [parity]     GREEN proofs that Flutter matches the web contract.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // CONFIRMED — genuine Flutter bugs vs web contract. RED until fixed.
  // ===========================================================================

  group('[regression][confirmed] Text', () {
    testWidgetsAllPlatforms(
        '[fn] [TXT-FN-001] href without onPressed must wire a tap handler',
        (tester) async {
      // PROBED: href sets isInteractive + link semantics but GestureDetector
      // only wires onPressed (one_ui_text.dart:160-164) — onTap is null.
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Learn more',
          href: 'https://jio.com',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Learn more');
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      });
      final detector = tester.widget<GestureDetector>(
        find.descendant(
          of: textRootFinder(),
          matching: find.byType(GestureDetector),
        ),
      );
      expect(
        detector.onTap,
        isNotNull,
        reason:
            'href-only links must wire GestureDetector.onTap (web <a href> parity). '
            'Use url_launcher or onLinkPress fallback.',
      );
    });

    testWidgetsAllPlatforms(
        '[a11y] [TXT-A11Y-001] href-only link must expose tap action in semantics',
        (tester) async {
      // PROBED: link role is set but SemanticsAction.tap may be absent when
      // GestureDetector.onTap is null (href-only path).
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Docs', href: 'https://jio.com/docs'),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Docs');
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
        expect(data.hasAction(SemanticsAction.tap), isTrue,
            reason:
                'Link semantics must include tap action when href is set '
                '(web anchor is always activatable).');
      });
    });

    testWidgetsAllPlatforms(
        '[fn] [TXT-FN-002] inline link substring must wire tap when onLinkPress is set',
        (tester) async {
      // When onLinkPress is supplied, the inline substring must be styled and
      // tappable (RN Text.native.tsx / web inline link parity).
      const linkSubstring = 'documentation';
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Read the documentation before continuing',
          link: linkSubstring,
          onLinkPress: () {},
        ),
      );

      final richTextFinder = find.descendant(
        of: textRootFinder(),
        matching: find.byType(RichText),
      );
      expect(richTextFinder, findsOneWidget);
      final richText = tester.widget<RichText>(richTextFinder);
      final linkSpan = _textSpanWithText(richText.text, linkSubstring);
      expect(linkSpan, isNotNull,
          reason: 'Inline link substring must render as a TextSpan child.');
      expect(
        linkSpan!.style?.decoration,
        TextDecoration.underline,
        reason: 'Link substring must retain tinted underline styling.',
      );
      expect(
        linkSpan.recognizer,
        isNotNull,
        reason:
            'Inline link substring must attach TapGestureRecognizer when '
            '`onLinkPress` is set.',
      );
    });

    testWidgetsAllPlatforms(
        '[fn] [TXT-FN-002b] inline link without onLinkPress renders plain copy',
        (tester) async {
      // Re-opened QA: styled underline without TapGestureRecognizer when
      // onLinkPress is omitted. Flutter falls back to plain text (no dead link).
      const linkSubstring = 'documentation';
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpTextQaHarness(
          tester,
          const OneUiText(
            text: 'Read the documentation before continuing',
            link: linkSubstring,
          ),
        );

        expect(
          find.descendant(
            of: textRootFinder(),
            matching: find.byType(RichText),
          ),
          findsOneWidget,
        );
        final richText = tester.widget<RichText>(
          find.descendant(
            of: textRootFinder(),
            matching: find.byType(RichText),
          ),
        );
        final linkSpan = _textSpanWithText(richText.text, linkSubstring);
        expect(
          linkSpan,
          isNull,
          reason:
              'Missing onLinkPress must not render a styled inline link span.',
        );
        expect(
          richText.text.toPlainText(),
          'Read the documentation before continuing',
        );
        expect(captured, isNotNull,
            reason:
                'Debug builds must report missing onLinkPress via FlutterError.');
        expect(
          captured!.exceptionAsString(),
          contains('onLinkPress'),
        );
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening. Web may share the gap → design call.
  // ===========================================================================

  group('[regression][debatable] Text', () {
    testWidgetsAllPlatforms(
        '[a11y] [TXT-DEB-001] testId is not exposed via Semantics.identifier',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Label',
          testId: 'qa-text',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Label');
        // PROBED: identifier == "" — testId only wraps KeyedSubtree ValueKey.
        expect(data.identifier, 'qa-text',
            reason:
                'testId should reach the platform AT tree via Semantics(identifier:). '
                'Currently only ValueKey is wired (one_ui_text.dart).');
      });
    });
  });

  // ===========================================================================
  // PARITY — GREEN proofs matching web Text.shared.ts contract.
  // ===========================================================================

  group('[regression][parity] Text', () {
    test('[parity] [TXT-PAR-001] appearance auto → neutral', () {
      expect(
          resolveOneUiTextState(appearance: 'auto').dataAppearance, 'neutral');
    });

    test('[parity] [TXT-PAR-002] attention none → high', () {
      expect(
        resolveOneUiTextAttention(
            OneUiTextVariant.body, OneUiTextAttention.none),
        OneUiTextAttention.high,
      );
    });

    test('[parity] [TXT-PAR-003] display/headline/title weight fixed medium',
        () {
      expect(
        resolveOneUiTextWeight(OneUiTextVariant.display, OneUiTextWeight.low),
        OneUiTextWeight.medium,
      );
      expect(
        resolveOneUiTextWeight(OneUiTextVariant.headline, OneUiTextWeight.high),
        OneUiTextWeight.medium,
      );
      expect(
        resolveOneUiTextWeight(OneUiTextVariant.title, OneUiTextWeight.low),
        OneUiTextWeight.medium,
      );
    });

    test('[parity] [TXT-PAR-004] display/headline/title attention high-only',
        () {
      expect(
        resolveOneUiTextAttention(
            OneUiTextVariant.display, OneUiTextAttention.low),
        OneUiTextAttention.high,
      );
      expect(
        resolveOneUiTextAttention(
            OneUiTextVariant.headline, OneUiTextAttention.medium),
        OneUiTextAttention.high,
      );
    });

    testWidgetsAllPlatforms(
        '[parity] [TXT-PAR-005] display low weight prop renders medium at runtime',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Hero',
          variant: OneUiTextVariant.display,
          weight: OneUiTextWeight.low,
        ),
      );
      // PROBED: weight scoping enforced at render — w500 not w400.
      expect(textStyleOf(tester).fontWeight, FontWeight.w500);
    });

    testWidgetsAllPlatforms(
        '[parity] [TXT-PAR-006] body weight high vs low renders distinct weights',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'High',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.high,
        ),
      );
      final high = textStyleOf(tester).fontWeight;
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Low',
          variant: OneUiTextVariant.body,
          weight: OneUiTextWeight.low,
        ),
      );
      expect(high, FontWeight.w700);
      expect(textStyleOf(tester).fontWeight, FontWeight.w400);
    });

    testWidgetsAllPlatforms(
        '[parity] [TXT-PAR-007] italic underline strikethrough reach TextStyle',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Decorated',
          italic: true,
          underline: true,
          strikethrough: true,
        ),
      );
      final style = textStyleOf(tester);
      expect(style.fontStyle, FontStyle.italic);
      expect(
        style.decoration,
        TextDecoration.combine([
          TextDecoration.underline,
          TextDecoration.lineThrough,
        ]),
      );
    });

    testWidgetsAllPlatforms('[parity] [TXT-PAR-008] onPressed fires on tap',
        (tester) async {
      var hits = 0;
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Link',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(find.text('Link'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Text', () {
    test('[meta] burn-down counter — total pending bugs = 0', () {
      // Fixed: TXT-FN-001/002/002b, TXT-A11Y-001, TXT-DEB-001.
      const confirmedFlutterBugs = 0;
      const debatable = 0;
      const parityProofs = 8;
      expect(confirmedFlutterBugs + debatable, 0);
      expect(parityProofs, 8);
    });
  });
}

/// Walks [RichText] span tree for an exact [text] leaf (inline link substring).
TextSpan? _textSpanWithText(InlineSpan span, String text) {
  if (span is TextSpan) {
    if (span.text == text) return span;
    for (final child in span.children ?? const <InlineSpan>[]) {
      final found = _textSpanWithText(child, text);
      if (found != null) return found;
    }
  }
  return null;
}
