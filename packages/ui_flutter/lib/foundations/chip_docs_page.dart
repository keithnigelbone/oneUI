import 'package:flutter/material.dart';

import 'chip_story_catalog.dart';

class ChipDocsPage extends StatelessWidget {
  const ChipDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Chip',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Interactive toggleable pill for filtering, selection, and categorization. '
            'Supports start/end slots and surface-context-aware selected fills.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildChipDocsMerged(context),
        ],
      ),
    );
  }
}
