import 'package:flutter/material.dart';

import 'linear_progress_indicator_interactive_story.dart';

class LinearProgressIndicatorInteractiveStoryPage extends StatelessWidget {
  const LinearProgressIndicatorInteractiveStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: LinearProgressIndicatorInteractiveStory(
        showHeader: true,
        showPropsTable: false,
        fillHeight: true,
      ),
    );
  }
}
