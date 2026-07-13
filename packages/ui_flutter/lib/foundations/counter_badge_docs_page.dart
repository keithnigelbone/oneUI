import 'package:flutter/material.dart';

import 'counter_badge_story_catalog.dart';

class CounterBadgeDocsPage extends StatelessWidget {
  const CounterBadgeDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CounterBadge',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Non-interactive display component showing a numeric count (e.g., unread '
            'notifications). Supports attention levels, multi-accent roles, and four sizes.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildCounterBadgeDocsMerged(context),
        ],
      ),
    );
  }
}
