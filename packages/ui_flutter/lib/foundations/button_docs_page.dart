import 'package:flutter/material.dart';

import 'button_showcase.dart';
import 'button_story_catalog.dart';

/// Web `Button` **Docs** — all stories merged (autodocs-style scroll).
class ButtonDocsPage extends StatelessWidget {
  const ButtonDocsPage({super.key});

  static const _componentDescription =
      'Primary interactive element for triggering actions. Uses Attention levels '
      '(High/Medium/Low) aligned with Figma. Supports multi-accent appearance roles '
      'and f-step sizing.';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Button',
              style: theme.textTheme.headlineMedium
                  ?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            _componentDescription,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          buttonConvexCoverageSection(context),
          const SizedBox(height: 32),
          for (final story in kButtonStoryNavOrder)
            if (story != ButtonFoundationStory.docs) ...[
              _DocsStoryBlock(story: story),
              const SizedBox(height: 32),
            ],
        ],
      ),
    );
  }
}

class _DocsStoryBlock extends StatelessWidget {
  const _DocsStoryBlock({required this.story});

  final ButtonFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(story.title,
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Align(
              alignment: Alignment.center,
              child: story.buildSection(context),
            ),
          ),
        ),
      ],
    );
  }
}
