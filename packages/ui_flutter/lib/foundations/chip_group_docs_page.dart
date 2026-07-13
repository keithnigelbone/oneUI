import 'package:flutter/material.dart';

import 'chip_group_story_catalog.dart';

class ChipGroupDocsPage extends StatelessWidget {
  const ChipGroupDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ChipGroup',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Groups multiple Chip components with shared selection state and keyboard '
            'navigation. Layout-only container — chips own visual styling via tokens.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildChipGroupDocsMerged(context),
        ],
      ),
    );
  }
}
