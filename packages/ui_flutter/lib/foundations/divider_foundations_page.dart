import 'package:flutter/material.dart';

import 'divider_brand_bind.dart';
import 'divider_story_catalog.dart';

class DividerFoundationsPage extends StatelessWidget {
  const DividerFoundationsPage({super.key, required this.story});

  final DividerFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindDividerBrandScope(context);
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
          dividerBrandKeyed(
            context,
            instanceKey: story.name,
            child: story.buildSection(context),
          ),
        ],
      ),
    );
  }
}
