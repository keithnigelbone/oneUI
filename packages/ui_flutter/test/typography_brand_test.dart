import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/tokens/typography_scale.dart';

void main() {
  group('getTypographyEntriesForBrand', () {
    test('defaults match getAllTypographyEntries when config null', () {
      final a = getAllTypographyEntries();
      final b = getTypographyEntriesForBrand(null);
      expect(b.length, a.length);
      for (var i = 0; i < a.length; i++) {
        expect(b[i].role, a[i].role);
        expect(b[i].size, a[i].size);
        expect(b[i].fontSizeStep, a[i].fontSizeStep);
        expect(b[i].lineHeightStep, a[i].lineHeightStep);
      }
    });

    test('display f-step overrides from brand config', () {
      final cfg = <String, dynamic>{
        'displayFSteps': {'L': 'f6', 'M': 'f5', 'S': 'f4'},
      };
      final entries = getTypographyEntriesForBrand(cfg);
      final l = entries.firstWhere((e) => e.role == 'display' && e.size == 'L');
      expect(l.fontSizeStep, 'f6');
    });
  });

  group('resolveFontSlots', () {
    test('empty config uses Storybook contrasting slot labels', () {
      final s = resolveFontSlots(null, null);
      expect(s.bodyText, 'Inter');
      expect(s.displayHeading, 'Playfair Display');
      expect(s.code, 'JetBrains Mono');
      expect(s.script, 'Noto Sans');
    });
  });

  group('resolveFontSlotIds', () {
    test('null typography matches Storybook defaults', () {
      final ids = resolveFontSlotIds(null, null);
      expect(ids.textFontId, 'inter');
      expect(ids.headingFontId, 'playfair-display');
      expect(ids.codeFontId, 'jetbrains-mono');
      expect(ids.scriptFontId, 'noto-sans');
    });
  });

  group('curatedFontIdForTypographyRole', () {
    test('no foundation: display/headline use text slot (web primary default)',
        () {
      final ids = resolveFontSlotIds(null, null);
      expect(curatedFontIdForTypographyRole('display', ids, null), 'inter');
      expect(curatedFontIdForTypographyRole('headline', ids, null), 'inter');
      expect(curatedFontIdForTypographyRole('title', ids, null), 'inter');
    });

    test('roleFontSlots secondary uses heading curated id', () {
      final ids = resolveFontSlotIds(null, null);
      final cfg = <String, dynamic>{
        'roleFontSlots': {'display': 'secondary'},
      };
      expect(curatedFontIdForTypographyRole('display', ids, cfg),
          'playfair-display');
      expect(curatedFontIdForTypographyRole('headline', ids, cfg), 'inter');
    });
  });
}
