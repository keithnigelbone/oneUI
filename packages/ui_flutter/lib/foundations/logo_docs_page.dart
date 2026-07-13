import 'package:flutter/material.dart';

import 'logo_showcase.dart';
import 'logo_story_catalog.dart';

Widget _buildLogoDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kLogoStoryNavOrder)
        if (story != LogoFoundationStory.docs) ...[
          Text(
            story.sidebarTitle,
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.center,
            child: story.buildSection(context),
          ),
          const SizedBox(height: 32),
        ],
    ],
  );
}

class LogoDocsPage extends StatelessWidget {
  const LogoDocsPage({super.key});

  static const _componentDescription =
      'Brand identity mark — transparent size container. SVG content controls shape and fill; '
      'the component handles sizing and accessibility. Token sizes map to Spacing-3 … Spacing-8 '
      '(xs–xl). Color defaults to `--Logo-color` / `--Primary-Bold` for `currentColor` SVGs.';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Logo',
              style: theme.textTheme.headlineMedium
                  ?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            _componentDescription,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: scheme.outlineVariant),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: logoDefaultSection(context),
            ),
          ),
          const SizedBox(height: 32),
          _buildLogoDocsMerged(context),
        ],
      ),
    );
  }
}
