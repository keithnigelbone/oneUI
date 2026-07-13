import 'package:flutter/material.dart';

import 'circular_progress_indicator_story_catalog.dart';

class CircularProgressIndicatorFoundationsPage extends StatelessWidget {
  const CircularProgressIndicatorFoundationsPage({
    super.key,
    required this.story,
  });

  final CircularProgressIndicatorFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            story.title,
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            story.description,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          story.buildSection(context),
        ],
      ),
    );
  }
}
