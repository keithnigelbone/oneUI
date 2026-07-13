import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// SVG glyphs for Avatar icon slot — `currentColor` via [IconTheme] (web PersonIcon / star / check).
abstract final class OneUiAvatarGlyphs {
  static const String person = '''
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
    d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"/>
</svg>''';

  static const String star = '''
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor"
    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
</svg>''';

  static const String check = '''
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor"
    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
</svg>''';
}

/// Inherits [IconTheme] colour — use as [OneUiAvatar.icon] (not hard-coded Material colours).
class OneUiAvatarSvgGlyph extends StatelessWidget {
  const OneUiAvatarSvgGlyph({super.key, required this.svg});

  final String svg;

  const OneUiAvatarSvgGlyph.person({super.key})
      : svg = OneUiAvatarGlyphs.person;
  const OneUiAvatarSvgGlyph.star({super.key}) : svg = OneUiAvatarGlyphs.star;
  const OneUiAvatarSvgGlyph.check({super.key}) : svg = OneUiAvatarGlyphs.check;

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    final size = theme.size ?? 24;
    final color = theme.color ?? Colors.white;
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
