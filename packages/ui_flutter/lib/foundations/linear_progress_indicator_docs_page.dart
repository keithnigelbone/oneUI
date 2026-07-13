import 'package:flutter/material.dart';

import 'linear_progress_indicator_interactive_story.dart';

class LinearProgressIndicatorDocsPage extends StatelessWidget {
  const LinearProgressIndicatorDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const LinearProgressIndicatorInteractiveStory(
      showHeader: true,
      showPropsTable: true,
      fillHeight: false,
    );
  }
}
