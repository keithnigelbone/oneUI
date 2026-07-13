import 'package:flutter/material.dart';

import 'bottom_navigation_brand_bind.dart';
import 'bottom_navigation_story_catalog.dart';

class BottomNavigationFoundationsPage extends StatelessWidget {
  const BottomNavigationFoundationsPage({required this.story, super.key});

  final BottomNavigationFoundationStory story;

  @override
  Widget build(BuildContext context) {
    bindBottomNavigationBrandScope(context);
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
