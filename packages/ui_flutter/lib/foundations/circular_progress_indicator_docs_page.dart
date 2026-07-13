import 'package:flutter/material.dart';

import 'circular_progress_indicator_interactive_story.dart';

/// Web autodocs — description, centered canvas, props table with Controls column.
class CircularProgressIndicatorDocsPage extends StatelessWidget {
  const CircularProgressIndicatorDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CircularProgressIndicatorInteractiveStory(
      showHeader: true,
      showPropsTable: true,
      fillHeight: false,
    );
  }
}
