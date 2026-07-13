import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/logo_svg_recolor.dart';

void main() {
  test(
      'recolorLogoSvgToCurrentColor replaces explicit fills but keeps gradients',
      () {
    const input = '''
<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
  <path fill="#FFFFFF" d="M0 0h10v10z"/>
  <path fill="url(#gold)" d="M1 1h8v8z"/>
</svg>''';
    final out = recolorLogoSvgToCurrentColor(input);
    expect(out, contains('fill="currentColor"'));
    expect(out, contains('fill="url(#gold)"'));
    expect(out, isNot(contains('#FFFFFF')));
  });

  test('prepareLogoSvgForRender preserves gradient brand marks (Swadesh)', () {
    const input = '''
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="swadesh-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8C872"/>
      <stop offset="100%" stop-color="#8B5A2B"/>
    </linearGradient>
  </defs>
  <rect fill="url(#swadesh-gold)" width="40" height="40"/>
</svg>''';
    final out = prepareLogoSvgForRender(input);
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isFalse);
    expect(out.svg, contains('url(#swadesh-gold)'));
    expect(out.svg, contains('linearGradient'));
  });

  test('prepareLogoSvgForRender preserves baked gold reliance mark', () {
    const input = '''
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle fill="#C4A052" cx="20" cy="20" r="18"/>
  <path fill="#FFFFFF" d="M12 28 L20 10 L28 28 Z"/>
</svg>''';
    final out = prepareLogoSvgForRender(input);
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isFalse);
    expect(out.svg, contains('#C4A052'));
    expect(out.svg, contains('#FFFFFF'));
  });

  test('prepareLogoSvgForRender preserves single baked gold (evenodd cutout)',
      () {
    const input = '''
<svg viewBox="0 0 40 40"><circle fill="#C4A052" cx="20" cy="20" r="18"/></svg>''';
    final out = prepareLogoSvgForRender(input);
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isFalse);
    expect(out.svg, contains('#C4A052'));
  });

  test('prepareLogoSvgForRender recolors when brand sets --Logo-color override',
      () {
    const input = '''
<svg viewBox="0 0 10 10"><rect fill="#0046AD" width="10" height="10"/></svg>''';
    final out = prepareLogoSvgForRender(input, hasLogoColorOverride: true);
    expect(out.recolored, isTrue);
    expect(out.applyCurrentColorTheme, isTrue);
    expect(out.svg, contains('fill="currentColor"'));
  });

  test('prepareLogoSvgForRender leaves currentColor SVG unchanged', () {
    const input = '''
<svg viewBox="0 0 10 10"><circle fill="currentColor" r="5"/></svg>''';
    final out = prepareLogoSvgForRender(input);
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isTrue);
    expect(out.svg, input);
  });

  test(
      'prepareLogoSvgForRender recolors monochrome red on matching bold surface',
      () {
    const input = '''
<svg viewBox="0 0 40 40"><path fill="#E62828" d="M8 8h24v24z"/></svg>''';
    final out = prepareLogoSvgForRender(
      input,
      nestedSurfaceBackgroundHex: '#E62828',
    );
    expect(out.recolored, isTrue);
    expect(out.applyCurrentColorTheme, isTrue);
    expect(out.svg, contains('fill="currentColor"'));
    expect(out.svg, isNot(contains('#E62828')));
  });

  test('prepareLogoSvgForRender handles Flutter-packed hex on bold surface',
      () {
    const input = '''
<svg viewBox="0 0 40 40"><path fill="#FFE62828" d="M8 8h24v24z"/></svg>''';
    final out = prepareLogoSvgForRender(
      input,
      nestedSurfaceBackgroundHex: '#E62828',
    );
    expect(out.recolored, isTrue);
    expect(out.applyCurrentColorTheme, isTrue);
  });

  test('prepareLogoSvgForRender preserves multicolour reliance on bold surface',
      () {
    const input = '''
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle fill="#C4A052" cx="20" cy="20" r="18"/>
  <path fill="#FFFFFF" d="M12 28 L20 10 L28 28 Z"/>
</svg>''';
    final out = prepareLogoSvgForRender(
      input,
      nestedSurfaceBackgroundHex: '#0046AD',
    );
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isFalse);
    expect(out.svg, contains('#C4A052'));
    expect(out.svg, contains('#FFFFFF'));
  });

  test(
      'prepareLogoSvgForRender recolors fill=black on dark bold surface (One UI Theme)',
      () {
    const input = '''
<svg viewBox="0 0 32 32" fill="none"><path fill="black" d="M8 8h16v16z"/></svg>''';
    final out = prepareLogoSvgForRender(
      input,
      nestedSurfaceBackgroundHex: '#080900',
    );
    expect(out.recolored, isTrue);
    expect(out.applyCurrentColorTheme, isTrue);
    expect(out.svg, contains('fill="currentColor"'));
  });

  test('prepareLogoSvgForRender preserves gold on contrasting bold surface',
      () {
    const input = '''
<svg viewBox="0 0 40 40"><circle fill="#C4A052" cx="20" cy="20" r="18"/></svg>''';
    final out = prepareLogoSvgForRender(
      input,
      nestedSurfaceBackgroundHex: '#0046AD',
    );
    expect(out.recolored, isFalse);
    expect(out.applyCurrentColorTheme, isFalse);
    expect(out.svg, contains('#C4A052'));
  });
}
