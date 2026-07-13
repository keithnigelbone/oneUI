import 'package:flutter/material.dart';

import 'linear_progress_indicator_story_catalog.dart';

class LinearProgressIndicatorFoundationsPage extends StatelessWidget {
  const LinearProgressIndicatorFoundationsPage({
    super.key,
    required this.story,
  });

  final LinearProgressIndicatorFoundationStory story;

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
