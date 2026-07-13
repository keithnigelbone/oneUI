import 'package:flutter/material.dart';

import 'circular_progress_indicator_motion_demo.dart';

/// Web `Interactive` story — tracking / jumping / indeterminate side by side.
class CircularProgressIndicatorInteractiveStoryPage extends StatelessWidget {
  const CircularProgressIndicatorInteractiveStoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(48),
        child: CpiAnimatedProgressRow(),
      ),
    );
  }
}
