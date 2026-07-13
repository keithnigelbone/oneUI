import 'package:flutter/material.dart';

import 'avatar_story_catalog.dart';

class AvatarDocsPage extends StatelessWidget {
  const AvatarDocsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Avatar',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Visual representation of a user or entity. Supports image, icon, and text (initials) '
            'content modes with multi-accent appearance roles and attention levels. '
            'Colours and geometry from Convex `--Avatar-*` (parity with web/RN).',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          buildAvatarDocsMerged(context),
        ],
      ),
    );
  }
}
