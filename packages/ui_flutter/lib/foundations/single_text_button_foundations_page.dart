import 'package:flutter/material.dart';

import 'single_text_button_story_catalog.dart';

class SingleTextButtonFoundationsPage extends StatelessWidget {
  const SingleTextButtonFoundationsPage({super.key, required this.story});

  final SingleTextButtonFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

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
            style: theme.textTheme.bodySmall
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          story.buildSection(context),
        ],
      ),
    );
  }
}
