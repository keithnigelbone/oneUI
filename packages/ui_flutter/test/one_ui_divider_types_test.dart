library;

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider_types.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

void main() {
  group('oneUiDividerHasChildren', () {
    test('returns false for null and empty string', () {
      expect(oneUiDividerHasChildren(null), isFalse);
      expect(oneUiDividerHasChildren(''), isFalse);
      expect(oneUiDividerHasChildren('   '), isFalse);
    });

    test('returns true for non-empty string and numbers', () {
      expect(oneUiDividerHasChildren('Section'), isTrue);
      expect(oneUiDividerHasChildren(42), isTrue);
    });
  });

  group('resolveDividerSize — Figma s/m/l', () {
    test('invalid size falls back to m', () {
      expect(resolveDividerSize('xl'), kOneUiDividerSizeM);
      expect(resolveDividerSize(''), kOneUiDividerSizeM);
      expect(resolveDividerSize(null), kOneUiDividerSizeM);
    });

    test('accepts Figma sizes', () {
      for (final size in kOneUiDividerFigmaSizes) {
        expect(resolveDividerSize(size), size);
      }
    });
  });

  group('normalizeOneUiDividerContent — Figma slot values', () {
    test('defaults to none', () {
      expect(normalizeOneUiDividerContent(null), kOneUiDividerContentNone);
      expect(normalizeOneUiDividerContent(''), kOneUiDividerContentNone);
    });

    test('Figma label is canonical', () {
      expect(normalizeOneUiDividerContent(kOneUiDividerContentLabel),
          kOneUiDividerContentLabel);
    });

    test('web text alias normalises to label', () {
      expect(normalizeOneUiDividerContent(kOneUiDividerContentText),
          kOneUiDividerContentLabel);
    });

    test('unknown slot falls back to none', () {
      expect(normalizeOneUiDividerContent('bogus'), kOneUiDividerContentNone);
    });
  });

  group('resolveOneUiDividerState — Figma API defaults', () {
    test('defaults match Figma table', () {
      final state = resolveOneUiDividerState();
      expect(state.orientation, kOneUiDividerHorizontal);
      expect(state.size, kOneUiDividerSizeM);
      expect(state.content, kOneUiDividerContentNone);
      expect(state.contentAlign, kOneUiDividerAlignCenter);
      expect(state.attention, 'low');
      expect(state.resolvedAppearance, 'neutral');
      expect(state.roundCaps, isTrue);
      expect(state.hasContent, isFalse);
    });

    test('slot none ignores children (Figma default)', () {
      expect(
        resolveOneUiDividerState(child: 'Section').hasContent,
        isFalse,
      );
      expect(
        resolveOneUiDividerState(child: 'Section').content,
        kOneUiDividerContentNone,
      );
    });

    test('auto appearance resolves to neutral', () {
      expect(resolveOneUiDividerState(appearance: 'auto').resolvedAppearance,
          'neutral');
    });

    test('slot label requires non-empty child', () {
      expect(
        resolveOneUiDividerState(
                content: kOneUiDividerContentLabel, child: 'OR')
            .hasContent,
        isTrue,
      );
      expect(
        resolveOneUiDividerState(content: kOneUiDividerContentLabel, child: '')
            .hasContent,
        isFalse,
      );
    });

    test('web text alias activates label slot', () {
      final state = resolveOneUiDividerState(
        content: kOneUiDividerContentText,
        child: 'OR',
      );
      expect(state.content, kOneUiDividerContentLabel);
      expect(state.hasContent, isTrue);
    });

    test('slot icon requires child widget', () {
      expect(
        resolveOneUiDividerState(
          content: kOneUiDividerContentIcon,
          child: null,
        ).hasContent,
        isFalse,
      );
    });

    test('preserves size and attention props', () {
      final state = resolveOneUiDividerState(
        size: kOneUiDividerSizeL,
        attention: 'high',
        contentAlign: kOneUiDividerAlignEnd,
        roundCaps: false,
      );
      expect(state.size, kOneUiDividerSizeL);
      expect(state.attention, 'high');
      expect(state.contentAlign, kOneUiDividerAlignEnd);
      expect(state.roundCaps, isFalse);
    });

    test('invalid size resolves to m in state', () {
      expect(resolveOneUiDividerState(size: 'bogus').size, kOneUiDividerSizeM);
    });

    test(
        '[DIV-DEB-001] invalid appearance asserts in debug and falls back to neutral',
        () {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        final state = resolveOneUiDividerState(appearance: 'destructive');
        expect(state.resolvedAppearance, 'neutral');
        expect(captured, isNotNull);
      } finally {
        FlutterError.onError = prev;
      }
    });

    test('dataAttrs mirror Figma props', () {
      final state = resolveOneUiDividerState(
        orientation: kOneUiDividerVertical,
        size: kOneUiDividerSizeL,
        attention: 'high',
        content: kOneUiDividerContentLabel,
        child: 'OR',
        roundCaps: true,
      );
      expect(state.dataAttrs, {
        'data-orientation': kOneUiDividerVertical,
        'data-size': kOneUiDividerSizeL,
        'data-attention': 'high',
        'data-content': kOneUiDividerContentLabel,
        'data-round-caps': 'true',
      });
    });

    test('dataPayloadKey encodes Figma-aligned attrs', () {
      final state = resolveOneUiDividerState();
      expect(state.dataPayloadKey, contains('oneui-divider'));
      expect(state.dataPayloadKey, contains('data-size=m'));
      expect(state.dataPayloadKey, contains('data-attention=low'));
      expect(state.dataPayloadKey, contains('data-content=none'));
      expect(state.dataPayloadKey, contains('data-round-caps=true'));
    });
  });

  group('kOneUiDividerFigmaSlots — Figma API table', () {
    test('lists none / icon / label', () {
      expect(kOneUiDividerFigmaSlots, kOneUiDividerFigmaSlots);
      expect(kOneUiDividerFigmaSlots, contains('none'));
      expect(kOneUiDividerFigmaSlots, contains('icon'));
      expect(kOneUiDividerFigmaSlots, contains('label'));
    });
  });

  group('kOneUiDividerAppearances — Figma API table', () {
    test('lists all OneUI plugin appearance roles', () {
      expect(kOneUiDividerAppearances, contains('auto'));
      expect(kOneUiDividerAppearances, contains('sparkle'));
      expect(kOneUiDividerAppearances, contains('informative'));
      expect(kOneUiDividerAppearances.length, 9);
    });
  });

  group('attention mapping', () {
    test('maps attention to icon emphasis names', () {
      expect(oneUiDividerAttentionToIconEmphasis('high'), 'high');
      expect(oneUiDividerAttentionToIconEmphasis('medium'), 'medium');
      expect(oneUiDividerAttentionToIconEmphasis('low'), 'low');
    });

    test('maps attention to text attention tokens', () {
      expect(
        oneUiDividerAttentionToTextAttention('high'),
        OneUiTextAttention.high,
      );
      expect(
        oneUiDividerAttentionToTextAttention('medium'),
        OneUiTextAttention.medium,
      );
      expect(
        oneUiDividerAttentionToTextAttention('low'),
        OneUiTextAttention.low,
      );
    });
  });
}
