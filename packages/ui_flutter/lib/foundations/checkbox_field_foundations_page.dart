import 'package:flutter/material.dart';

import 'checkbox_field_brand_bind.dart';
import 'checkbox_field_story_catalog.dart';

class CheckboxFieldFoundationsPage extends StatelessWidget {
  const CheckboxFieldFoundationsPage({super.key, required this.story});

  final CheckboxFieldFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindCheckboxFieldBrandScope(context);
    final brandKey = checkboxFieldBrandScopeKey(context);
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            story.sidebarTitle,
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
          Align(
            alignment: Alignment.centerLeft,
            child: KeyedSubtree(
              key: ValueKey('checkbox-field-${story.name}-$brandKey'),
              child: story.buildSection(context),
            ),
          ),
        ],
      ),
    );
  }
}
