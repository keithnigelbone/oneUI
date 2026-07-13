import 'package:flutter/material.dart';

import 'logo_story_catalog.dart';

class LogoFoundationsPage extends StatelessWidget {
  const LogoFoundationsPage({super.key, required this.story});

  final LogoFoundationStory story;

  bool get _fullWidth => switch (story) {
        LogoFoundationStory.surfaceContext => true,
        LogoFoundationStory.themes => true,
        _ => false,
      };

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
            style: theme.textTheme.bodySmall
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          if (_fullWidth)
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
