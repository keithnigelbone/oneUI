import 'package:flutter/material.dart';

import 'indicator_badge_story_catalog.dart';

class IndicatorBadgeDocsPage extends StatelessWidget {
  const IndicatorBadgeDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'IndicatorBadge',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Non-interactive status/presence indicator dot. Supports multi-accent '
            'appearance roles and five sizes (XS/S/M/L/XL).',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildIndicatorBadgeDocsMerged(context),
        ],
      ),
    );
  }
}
