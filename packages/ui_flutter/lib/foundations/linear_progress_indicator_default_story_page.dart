import 'package:flutter/material.dart';

import 'linear_progress_indicator_interactive_story.dart';

class LinearProgressIndicatorDefaultStoryPage extends StatelessWidget {
  const LinearProgressIndicatorDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox.expand(
      child: LinearProgressIndicatorInteractiveStory(
        showHeader: false,
        showPropsTable: true,
        fillHeight: true,
      ),
    );
  }
}
