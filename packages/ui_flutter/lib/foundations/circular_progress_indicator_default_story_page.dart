import 'package:flutter/material.dart';

import 'circular_progress_indicator_interactive_story.dart';

/// Web `Default` story + Controls panel (`CircularProgressIndicator.stories.tsx`).
class CircularProgressIndicatorDefaultStoryPage extends StatelessWidget {
  const CircularProgressIndicatorDefaultStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Storybook canvas is an [Expanded] > [Stack] shell — force a bounded flex
    // subtree so inner [Expanded] preview + controls layout like Chip/Text Default.
    return const SizedBox.expand(
      child: CircularProgressIndicatorInteractiveStory(
        fillHeight: true,
      ),
    );
  }
}
