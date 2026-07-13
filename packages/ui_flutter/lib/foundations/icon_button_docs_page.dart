import 'package:flutter/material.dart';

import 'icon_button_story_catalog.dart';

class IconButtonDocsPage extends StatelessWidget {
  const IconButtonDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'IconButton',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Icon-only control: 6 sizes, condensed mode, 1:1 and 3:2 layouts, nine appearance roles. '
            'Colours and geometry from Convex `--IconButton-*` (parity with web/RN).',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildIconButtonDocsMerged(context),
        ],
      ),
    );
  }
}
