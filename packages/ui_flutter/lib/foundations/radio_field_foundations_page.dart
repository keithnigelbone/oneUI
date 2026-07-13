import 'package:flutter/material.dart';

import 'radio_field_brand_bind.dart';
import 'radio_field_story_catalog.dart';

class RadioFieldFoundationsPage extends StatelessWidget {
  const RadioFieldFoundationsPage({super.key, required this.story});

  final RadioFieldFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindRadioFieldBrandScope(context);
    final brandKey = radioFieldBrandScopeKey(context);
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
            child: KeyedSubtree(
              key: ValueKey('radio-field-${story.name}-$brandKey'),
              child: story.buildSection(context),
            ),
          ),
        ],
      ),
    );
  }
}
