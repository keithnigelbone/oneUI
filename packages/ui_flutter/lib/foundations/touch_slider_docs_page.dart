import 'package:flutter/material.dart';

import 'touch_slider_interactive_story.dart';

/// Web autodocs — description, centered canvas, props table with Controls column.
class TouchSliderDocsPage extends StatelessWidget {
  const TouchSliderDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const TouchSliderInteractiveStory(
      showHeader: true,
      showPropsTable: true,
      fillHeight: false,
    );
  }
}
