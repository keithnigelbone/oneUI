import 'package:flutter/material.dart';

import 'selectable_button_story_catalog.dart';

class SelectableButtonDocsPage extends StatelessWidget {
  const SelectableButtonDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SelectableButton',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Toggle button that stays selected after click. Unselected state is always '
            'muted ghost. Selected appearance is driven by attention: high=bold fill, '
            'medium=subtle fill, low=ghost with accent border.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          buildSelectableButtonDocsMerged(context),
        ],
      ),
    );
  }
}
