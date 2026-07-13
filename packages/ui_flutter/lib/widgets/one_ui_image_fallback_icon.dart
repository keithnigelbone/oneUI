import 'package:flutter/material.dart';

/// Default landscape icon — web `DefaultImageIcon` in `Image.tsx`.
class OneUiImageFallbackIcon extends StatelessWidget {
  const OneUiImageFallbackIcon(
      {super.key, required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Icon(
      Icons.image_outlined,
      color: color,
      size: size,
      semanticLabel: '',
    );
  }
}
