import 'package:flutter/material.dart';

import 'image_story_catalog.dart';

class ImageFoundationsPage extends StatelessWidget {
  const ImageFoundationsPage({super.key, required this.story});

  final ImageFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fullWidth = story == ImageFoundationStory.responsive;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(story.title,
              style: theme.textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            story.description,
            style: theme.textTheme.bodySmall
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          if (fullWidth)
            story.buildSection(context)
          else
            Align(
              alignment: Alignment.center,
              child: story.buildSection(context),
            ),
        ],
      ),
    );
  }
}
