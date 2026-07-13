import 'package:flutter/material.dart';

import 'image_showcase.dart';

class ImageDefaultStoryPage extends StatelessWidget {
  const ImageDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: imageDefaultSection(),
    );
  }
}
