import 'package:flutter/material.dart';

import 'divider_brand_bind.dart';
import 'divider_story_catalog.dart';

/// Docs landing — merged preview + key variant sections.
class DividerDocsPage extends StatelessWidget {
  const DividerDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    bindDividerBrandScope(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Divider',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            DividerFoundationStory.docs.description,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 24),
          dividerBrandKeyed(
            context,
            instanceKey: 'docs-merged',
            child: DividerFoundationStory.docs.buildSection(context),
          ),
        ],
      ),
    );
  }
}
