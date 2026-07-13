import 'package:flutter/material.dart';

import 'badge_story_catalog.dart';

class BadgeDocsPage extends StatelessWidget {
  const BadgeDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Badge',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Non-interactive display component used to highlight status, provide notifications, '
            'or categorize content. Supports start/end slots for icons, avatars, counter badges, '
            'and indicator badges.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildBadgeDocsMerged(context),
        ],
      ),
    );
  }
}
