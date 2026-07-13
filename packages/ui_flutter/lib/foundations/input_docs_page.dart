import 'package:flutter/material.dart';

import 'input_showcase.dart';
import 'input_story_catalog.dart';

class InputDocsPage extends StatelessWidget {
  const InputDocsPage({super.key});

  static const _componentDescription =
      'Text input control with optional label and description, bordered 4-slot shell, '
      'multi-accent appearance, medium/high attention, and Convex `--Input-*` tokens.';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Input',
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
              child: Align(
                alignment: Alignment.center,
                child:
                    Builder(builder: (context) => inputDefaultSection(context)),
              ),
            ),
          ),
          const SizedBox(height: 32),
          for (final story in kInputStoryNavOrder)
            if (story != InputFoundationStory.docs) ...[
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

  final InputFoundationStory story;

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
        Text(
          story.description,
          style: theme.textTheme.bodySmall
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 16),
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: scheme.outlineVariant),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Align(
                alignment: Alignment.centerLeft,
                child: story.buildSection(context)),
          ),
        ),
      ],
    );
  }
}
