import 'package:flutter/material.dart';

import 'icon_story_catalog.dart';

/// Web Icon autodocs — merged sections.
class IconDocsPage extends StatelessWidget {
  const IconDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Icon',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Token-backed glyph shell: 20 sizes, 8 appearance roles, 5 emphasis levels. '
            'Pass Jio semantic names or remote `https://` URLs through the single `icon` prop. '
            'Parity with `packages/ui/src/components/Icon` and RN showcase.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildIconDocsMerged(context),
        ],
      ),
    );
  }
}
