import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Default person silhouette — web `DefaultPersonIcon` / Figma IcProfile.
class OneUiAvatarDefaultPersonIcon extends StatelessWidget {
  const OneUiAvatarDefaultPersonIcon(
      {super.key, required this.size, required this.color});

  final double size;
  final Color color;

  static const String _svg = '''
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
    d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"/>
</svg>''';

  @override
  Widget build(BuildContext context) {
    return SvgPicture.string(
      _svg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
