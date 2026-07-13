import 'package:flutter/material.dart';

import 'icon_contained_story_catalog.dart';

class IconContainedDocsPage extends StatelessWidget {
  const IconContainedDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'IconContained',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Circular token-backed icon container: 5 sizes, high/medium attention, '
            '9 appearance roles. Parity with `packages/ui/src/components/IconContained`.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildIconContainedDocsMerged(context),
        ],
      ),
    );
  }
}
