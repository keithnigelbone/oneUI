import 'package:flutter/material.dart';

import 'checkbox_brand_bind.dart';
import 'checkbox_story_catalog.dart';

class CheckboxFoundationsPage extends StatelessWidget {
  const CheckboxFoundationsPage({required this.story, super.key});

  final CheckboxFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindCheckboxBrandScope(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            story.title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(story.description,
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 24),
          story.buildSection(context),
        ],
      ),
    );
  }
}
