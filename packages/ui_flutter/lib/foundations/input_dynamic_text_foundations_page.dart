import 'package:flutter/material.dart';

import 'input_internals_brand_bind.dart';
import 'input_internals_story_catalog.dart';

class InputDynamicTextFoundationsPage extends StatelessWidget {
  const InputDynamicTextFoundationsPage({super.key, required this.story});

  final InputDynamicTextFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindInputInternalsBrandScope(context);
    final theme = Theme.of(context);
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
          Align(
            alignment: Alignment.centerLeft,
            child: story.buildSection(context),
          ),
        ],
      ),
    );
  }
}
