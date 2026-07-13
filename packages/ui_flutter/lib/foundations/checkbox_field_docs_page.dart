import 'package:flutter/material.dart';

import 'checkbox_field_showcase.dart';
import 'checkbox_field_story_catalog.dart';

class CheckboxFieldDocsPage extends StatelessWidget {
  const CheckboxFieldDocsPage({super.key});

  static const _componentDescription =
      'Field shell aligned with InputField. Integrated single (no children): implicit lone Checkbox '
      'beside field label / description; use checked / defaultChecked / onCheckedChange. '
      'Two or more Checkbox children: field header above the group; feedback and dynamic row after options.';

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
            'CheckboxField',
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
                alignment: Alignment.centerLeft,
                child: Builder(builder: buildCheckboxFieldDefaultSection),
              ),
            ),
          ),
          const SizedBox(height: 32),
          for (final story in kCheckboxFieldStoryNavOrder)
            if (story != CheckboxFieldFoundationStory.docs) ...[
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

  final CheckboxFieldFoundationStory story;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          story.sidebarTitle,
          style:
              theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
        ),
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
