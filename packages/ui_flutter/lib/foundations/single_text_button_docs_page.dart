import 'package:flutter/material.dart';

import 'single_text_button_story_catalog.dart';

class SingleTextButtonDocsPage extends StatelessWidget {
  const SingleTextButtonDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SingleTextButton',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Circular single-text action button (max 2 characters). Attention drives the visual: '
            'high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L). Shape customisable per brand.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildSingleTextButtonDocsMerged(context),
        ],
      ),
    );
  }
}
