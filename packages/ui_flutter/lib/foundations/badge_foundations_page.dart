import 'package:flutter/material.dart';

import 'badge_story_catalog.dart';

class BadgeFoundationsPage extends StatelessWidget {
  const BadgeFoundationsPage({super.key, required this.story});

  final BadgeFoundationStory story;

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
