/// Pure a11y resolver tests — RN `textA11y.test.ts` (no widget binding).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/one_ui_text_script.dart';
import 'package:ui_flutter/widgets/one_ui_text_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

void main() {
  group('oneUiScriptIdFromLang', () {
    test('maps hi to devanagari', () {
      expect(oneUiScriptIdFromLang('hi'), 'devanagari');
      expect(oneUiScriptIdFromLang('hi-IN'), 'devanagari');
    });

    test('returns null for unknown lang', () {
      expect(oneUiScriptIdFromLang('en'), isNull);
      expect(oneUiScriptIdFromLang(null), isNull);
    });
  });

  group('resolveOneUiTextAccessibilityLabel', () {
    test('prefers semanticsLabel when present', () {
      expect(
        resolveOneUiTextAccessibilityLabel(
          semanticsLabel: 'Important',
          text: 'hi',
        ),
        'Important',
      );
    });

    test('falls back to text prop', () {
      expect(
        resolveOneUiTextAccessibilityLabel(text: 'hello'),
        'hello',
      );
    });

    test('falls back to child string', () {
      expect(
        resolveOneUiTextAccessibilityLabel(childString: 'child copy'),
        'child copy',
      );
    });

    test('returns null when no string content', () {
      expect(resolveOneUiTextAccessibilityLabel(), isNull);
    });
  });

  group('resolveOneUiTextSemantics', () {
    test('plain body does not require Semantics wrapper', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Hello world',
        variant: OneUiTextVariant.body,
        isInteractive: false,
      );
      expect(cfg.exposed, isFalse);
      expect(cfg.hidden, isFalse);
      expect(cfg.isHeader, isFalse);
      expect(cfg.isLink, isFalse);
    });

    test('headline variant exposes header wrapper', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Section',
        variant: OneUiTextVariant.headline,
        isInteractive: false,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.isHeader, isTrue);
      expect(cfg.isLink, isFalse);
      expect(cfg.label, 'Section');
    });

    test('display variant exposes header wrapper', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Page title',
        variant: OneUiTextVariant.display,
        isInteractive: false,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.isHeader, isTrue);
    });

    test('onPress promotes link semantics', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'docs',
        variant: OneUiTextVariant.body,
        isInteractive: true,
      );
      expect(cfg.isLink, isTrue);
      expect(cfg.isHeader, isFalse);
      expect(cfg.exposed, isTrue);
    });

    test('explicit semanticsLabel forces wrapper', () {
      final cfg = resolveOneUiTextSemantics(
        semanticsLabel: 'Important',
        visibleText: 'Hi',
        variant: OneUiTextVariant.body,
        isInteractive: false,
      );
      expect(cfg.exposed, isTrue);
      expect(cfg.label, 'Important');
    });

    test('ariaHidden hides from tree', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'decorative',
        variant: OneUiTextVariant.body,
        ariaHidden: true,
        isInteractive: false,
      );
      expect(cfg.hidden, isTrue);
      expect(cfg.exposed, isFalse);
    });

    test('excludeFromSemantics matches ariaHidden hidden state', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'x',
        variant: OneUiTextVariant.body,
        excludeFromSemantics: true,
        isInteractive: false,
      );
      expect(cfg.hidden, isTrue);
      expect(cfg.exposed, isFalse);
    });

    test('forwards semanticsHint', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'hi',
        semanticsHint: 'Read aloud',
        variant: OneUiTextVariant.body,
        isInteractive: false,
      );
      expect(cfg.hint, 'Read aloud');
      expect(cfg.exposed, isTrue);
    });

    test('header loses to link when interactive', () {
      final cfg = resolveOneUiTextSemantics(
        visibleText: 'Go',
        variant: OneUiTextVariant.display,
        isInteractive: true,
      );
      expect(cfg.isLink, isTrue);
      expect(cfg.isHeader, isFalse);
    });
  });

  group('resolveOneUiTextState script', () {
    test('lang infers devanagari script', () {
      final s = resolveOneUiTextState(lang: 'hi');
      expect(s.resolvedScript, 'devanagari');
      expect(s.dataScript, 'devanagari');
    });

    test('explicit script overrides lang inference', () {
      final s = resolveOneUiTextState(lang: 'hi', script: 'tamil');
      expect(s.resolvedScript, 'tamil');
    });

    test('reading scriptMode emits data-script-mode', () {
      final s = resolveOneUiTextState(
        script: 'devanagari',
        scriptMode: OneUiTextScriptMode.reading,
      );
      expect(s.dataScriptMode, 'reading');
    });

    test('legacy language others preserved', () {
      final s = resolveOneUiTextState(language: OneUiTextLanguage.others);
      expect(s.resolvedLanguage, OneUiTextLanguage.others);
      expect(s.dataLanguage, 'others');
    });
  });
}
