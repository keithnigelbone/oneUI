import 'package:flutter/material.dart';

import 'chip_group_story_catalog.dart';

class ChipGroupFoundationsPage extends StatelessWidget {
  const ChipGroupFoundationsPage({required this.story, super.key});

  final ChipGroupFoundationStory story;

  @override
  Widget build(BuildContext context) {
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
