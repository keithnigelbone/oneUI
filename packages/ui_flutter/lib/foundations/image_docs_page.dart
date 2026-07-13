import 'package:flutter/material.dart';

import 'image_showcase.dart';
import 'image_story_catalog.dart';

/// Web `Image` **Docs** — merged stories (autodocs-style scroll).
class ImageDocsPage extends StatelessWidget {
  const ImageDocsPage({super.key});

  static const _componentDescription =
      'Displays visual content with optional aspect ratio presets (including tall 9:21 '
      'and wide 21:9), BoxFit modes aligned with CSS object-fit, and optional interactive '
      'mode. Tokens: `--Image-borderRadius`, `--Image-fallbackBackground`, '
      '`--Image-stateLayerHover`, focus halo, and `--Image-objectFit`.';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Image',
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
                child: imageDefaultSection(),
              ),
            ),
          ),
          const SizedBox(height: 32),
          for (final story in kImageStoryNavOrder)
            if (story != ImageFoundationStory.docs) ...[
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

  final ImageFoundationStory story;

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
              alignment: story == ImageFoundationStory.responsive
                  ? Alignment.centerLeft
                  : Alignment.center,
              child: story.buildSection(context),
            ),
          ),
        ),
      ],
    );
  }
}
