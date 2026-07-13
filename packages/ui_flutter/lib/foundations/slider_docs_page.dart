import 'package:flutter/material.dart';

import 'slider_interactive_story.dart';

/// Web autodocs — description, centered canvas, props table with Controls column.
class SliderDocsPage extends StatelessWidget {
  const SliderDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SliderInteractiveStory(
      showHeader: true,
      showPropsTable: true,
      fillHeight: false,
    );
  }
}
