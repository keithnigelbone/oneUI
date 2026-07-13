import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/button_decoration.dart';
import 'package:ui_flutter/engine/ornament_svg.dart';

void main() {
  test(
      'svgCssColorHex keeps alpha — transparent stays transparent (not opaque black)',
      () {
    expect(svgCssColorHex(const Color(0x00000000)), '#00000000');
    expect(svgCssColorHex(Colors.red), '#FF0000');
    expect(svgCssColorHex(const Color(0x80FF0000)), '#FF000080');
  });

  test('getOrnamentOpenStrokePath strips closing Z', () {
    const svg =
        '<svg viewBox="0 0 10 20"><path d="M0 0 L10 0 L10 20 L0 20 Z" /></svg>';
    expect(getOrnamentOpenStrokePath(svg), 'M0 0 L10 0 L10 20 L0 20');
  });

  test('extractOrnamentSvgContent strips paint attributes', () {
    const svg = '''
<svg viewBox="0 0 10 20">
  <path fill="none" stroke="#c00" stroke-width="2" d="M0 0H10V20H0Z" />
</svg>
''';
    final ex = extractOrnamentSvgContent(svg);
    expect(ex, isNotNull);
    expect(ex!.innerMarkup, contains('d="M0 0H10V20H0Z"'));
    expect(ex.innerMarkup, isNot(contains('fill=')));
    expect(ex.innerMarkup, isNot(contains('stroke=')));
  });

  /// Default call (no ornament stroke params) — fill-only, matching Convex without
  /// `--Button-cssDecorationInsetStrokeWidth-*` parity (or zero width).
  test(
      'resolveButtonOrnamentLayers builds fill-only side XML when stroke not passed',
      () {
    const svg =
        '<svg viewBox="0 0 8 40"><path d="M8 0 C0 12 0 28 8 40" fill="none" stroke="#111" /></svg>';
    final cfg = ButtonOrnamentConfig(
      svgContent: svg,
      aspectRatio: 0.25,
      mirror: false,
      placement: 'edges',
    );
    final layers = resolveButtonOrnamentLayers(
      ornament: cfg,
      bodyFill: Colors.red.shade700,
    );
    expect(layers.left, isNotNull);
    expect(layers.right, isNotNull);
    final r = layers.right!;
    expect(r.fillXml, contains('preserveAspectRatio="none"'));
    expect(r.fillXml, contains('fill="#'));
    expect(r.strokeXml, isNull);
  });

  test(
      'resolveButtonOrnamentLayers emits stroke SVG when stroke width and colour supplied',
      () {
    const svg =
        '<svg viewBox="0 0 8 40"><path d="M8 0 C0 12 0 28 8 40" fill="none" stroke="#111" /></svg>';
    final cfg = ButtonOrnamentConfig(
      svgContent: svg,
      aspectRatio: 0.25,
      mirror: false,
      placement: 'edges',
    );
    final layers = resolveButtonOrnamentLayers(
      ornament: cfg,
      bodyFill: Colors.blue,
      ornamentStrokeColor: const Color(0xFF121212),
      ornamentStrokeWidthPx: 2,
    );
    expect(layers.right, isNotNull);
    expect(layers.right!.strokeXml, isNotNull);
    expect(layers.right!.strokeXml!, contains('fill="none"'));
    expect(layers.right!.strokeXml!, contains('stroke="#'));
    expect(layers.right!.strokeXml!, contains('stroke-width="2'));
  });

  test(
      'resolveButtonOrnamentLayers applies horizontal mirror to left when mirror is true',
      () {
    const svg =
        '<svg viewBox="0 0 8 40"><path d="M8 0 C0 12 0 28 8 40" fill="none" stroke="#111" /></svg>';
    final cfg = ButtonOrnamentConfig(
      svgContent: svg,
      aspectRatio: 0.25,
      mirror: true,
      placement: 'edges',
    );
    final layers = resolveButtonOrnamentLayers(
      ornament: cfg,
      bodyFill: Colors.red,
    );
    expect(layers.left, isNotNull);
    expect(layers.right, isNotNull);
    expect(
      layers.left!.fillXml,
      matches(RegExp(
          r'translate\(\s*8(?:\.0)?\s*,\s*0\s*\)\s*scale\(\s*-1\s*,\s*1\s*\)')),
    );
    expect(layers.right!.fillXml, isNot(contains('scale(-1,1)')));
  });
}
