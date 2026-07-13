import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';

void main() {
  test('opaque #RRGGBB', () {
    expect(oneUiHexColor('#FF0000'), const Color(0xFFFF0000));
    expect(oneUiHexColor('00FF40'), const Color(0xFF00FF40));
  });

  test('CSS #RGB expands', () {
    expect(oneUiHexColor('#F0A'), const Color(0xFFFF00AA));
  });

  /// Convex / native theme often stores **`#AARRGGBB`** Flutter words (opaque red).
  test(
      'Flutter-packed #FFE62828 is opaque brand red — not translucent CSS RRGG',
      () {
    expect(oneUiHexColor('#FFE62828'), const Color(0xFFE62828));
  });

  /// High “CSS alpha misread” (blue channel ≥ 0x40) — must stay ARGB, not CSS (#0053c8).
  test('Flutter-packed opaque blue #FF0053C8 (Jio / Reliance palettes)', () {
    expect(oneUiHexColor('#FF0053C8'), const Color(0xFF0053C8));
  });

  /// CSS opaque must still append alpha FF.
  test('CSS suffix opaque #RRGGBBAA', () {
    expect(oneUiHexColor('#E62828FF'), const Color(0xFFE62828));
  });

  /// Real CSS translucent stays RRGGBBAA order (`a Css` ≥ typical “misread ARGB”).
  test('CSS translucent mid-alpha #FFEEDD80', () {
    final c = oneUiHexColor('#FFEEDD80');
    expect(c.alpha, 0x80);
    expect(c.red, 0xFF);
    expect(c.green, 0xEE);
    expect(c.blue, 0xDD);
  });

  /// Near-white translucent must not collapse to Flutter word.
  test('CSS translucent white-ish #FFFFFF3F', () {
    final c = oneUiHexColor('#FFFFFF3F');
    expect(c.alpha, 0x3F);
    expect(c.red, 0xFF);
    expect(c.green, 0xFF);
    expect(c.blue, 0xFF);
  });
}
