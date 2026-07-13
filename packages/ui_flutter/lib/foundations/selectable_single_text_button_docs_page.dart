import 'package:flutter/material.dart';

import 'selectable_single_text_button_story_catalog.dart';

class SelectableSingleTextButtonDocsPage extends StatelessWidget {
  const SelectableSingleTextButtonDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SelectableSingleTextButton',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Circular single-text toggle button (max 2 characters). Stays selected '
            'after click. Unselected state is always muted ghost. Selected appearance '
            'is driven by attention: high=bold fill, medium=subtle fill, low=ghost '
            'with accent border. 3 sizes (S/M/L). Shape customisable per brand.',
          ),
          const SizedBox(height: 32),
          buildSelectableSingleTextButtonDocsMerged(context),
        ],
      ),
    );
  }
}
