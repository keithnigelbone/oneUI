import 'package:flutter/material.dart';

import 'input_field_props_table.dart';
import 'input_field_showcase.dart';
import 'input_field_story_catalog.dart';

/// Web `InputField` **Docs** (autodocs) — description, live default preview, all stories, props table.
class InputFieldDocsPage extends StatelessWidget {
  const InputFieldDocsPage({super.key});

  static const _componentDescription =
      'Full text field: optional label / labelSlot, bordered input (same DNA as Input), '
      'error / feedback, dynamicText / helperButton / dynamicTextSlot, and field validation. '
      'Stack gap matches Figma `.DNA/InputField` (4298:6330). For the bordered box only '
      '(no label or messages), see Components/Inputs/Input.';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'InputField',
            style: theme.textTheme.headlineMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
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
                child: Builder(builder: inputFieldDefaultSection),
              ),
            ),
          ),
          const SizedBox(height: 32),
          for (final story in kInputFieldStoryNavOrder)
            if (story != InputFieldFoundationStory.docs) ...[
              _DocsStoryBlock(story: story),
              const SizedBox(height: 32),
            ],
          const InputFieldPropsTable(),
        ],
      ),
    );
  }
}

class _DocsStoryBlock extends StatelessWidget {
  const _DocsStoryBlock({required this.story});

  final InputFieldFoundationStory story;

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
              child: story.buildSection(context),
            ),
          ),
        ),
      ],
    );
  }
}
