import 'package:flutter/material.dart';

import 'radio_field_props_table.dart';
import 'radio_field_showcase.dart';
import 'radio_field_story_catalog.dart';

class RadioFieldDocsPage extends StatelessWidget {
  const RadioFieldDocsPage({super.key});

  static const _componentDescription =
      'Field shell aligned with InputField and CheckboxField. Integrated single (no children): '
      'implicit lone Radio beside field label / description; use checked / defaultChecked / '
      'onCheckedChange or value / defaultValue with singleOptionValue (default on). '
      'Two or more Radio children: field header above the group; feedback and dynamic row after options.';

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
            'RadioField',
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
                child: Builder(builder: buildRadioFieldDefaultSection),
              ),
            ),
          ),
          const SizedBox(height: 32),
          for (final story in kRadioFieldStoryNavOrder)
            if (story != RadioFieldFoundationStory.docs) ...[
              _DocsStoryBlock(story: story),
              const SizedBox(height: 32),
            ],
          const RadioFieldPropsTable(),
        ],
      ),
    );
  }
}

class _DocsStoryBlock extends StatelessWidget {
  const _DocsStoryBlock({required this.story});

  final RadioFieldFoundationStory story;

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
