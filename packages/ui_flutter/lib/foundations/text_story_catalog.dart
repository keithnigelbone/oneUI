import 'package:flutter/material.dart';

import 'text_default_story_page.dart';
import 'text_showcase.dart';

enum TextFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  attentionAndWeight,
  appearances,
  decorations,
  surfaceContext,
  truncationAlignmentLink,
}

const List<TextFoundationStory> kTextStoryNavOrder = [
  TextFoundationStory.docs,
  TextFoundationStory.defaultStory,
  TextFoundationStory.variants,
  TextFoundationStory.sizes,
  TextFoundationStory.attentionAndWeight,
  TextFoundationStory.appearances,
  TextFoundationStory.decorations,
  TextFoundationStory.surfaceContext,
  TextFoundationStory.truncationAlignmentLink,
];

extension TextFoundationStoryMeta on TextFoundationStory {
  String get title => switch (this) {
        TextFoundationStory.docs => 'Docs',
        TextFoundationStory.defaultStory => 'Default',
        TextFoundationStory.variants => 'Variants',
        TextFoundationStory.sizes => 'Sizes',
        TextFoundationStory.attentionAndWeight => 'Attention & Weight',
        TextFoundationStory.appearances => 'Appearances',
        TextFoundationStory.decorations => 'Decorations',
        TextFoundationStory.surfaceContext => 'Surface Context',
        TextFoundationStory.truncationAlignmentLink =>
          'Truncation, Alignment & Link',
      };

  String get description => switch (this) {
        TextFoundationStory.docs =>
          'Merged documentation — web Text autodocs parity.',
        TextFoundationStory.defaultStory =>
          'Body M, high weight — toolbar controls mirror React argTypes.',
        TextFoundationStory.variants =>
          'All six typography roles at default size.',
        TextFoundationStory.sizes =>
          'Body sizes 2XS–2XL plus invalid 3XS clamp.',
        TextFoundationStory.attentionAndWeight =>
          'Attention levels × high / medium / low weight.',
        TextFoundationStory.appearances =>
          'Nine roles at high and tintedA11y attention.',
        TextFoundationStory.decorations =>
          'Italic, underline, strikethrough, combined.',
        TextFoundationStory.surfaceContext =>
          'Automatic on-colour adaptation inside Surface modes.',
        TextFoundationStory.truncationAlignmentLink =>
          'Truncation, alignment, display heading, inline link.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        TextFoundationStory.docs => buildTextDocsMerged(context),
        TextFoundationStory.defaultStory => buildTextDefaultPreview(context),
        TextFoundationStory.variants => buildTextVariantsSection(context),
        TextFoundationStory.sizes => buildTextSizesSection(context),
        TextFoundationStory.attentionAndWeight =>
          buildTextAttentionAndWeightSection(context),
        TextFoundationStory.appearances => buildTextAppearancesSection(context),
        TextFoundationStory.decorations => buildTextDecorationsSection(context),
        TextFoundationStory.surfaceContext =>
          buildTextSurfaceContextSection(context),
        TextFoundationStory.truncationAlignmentLink =>
          buildTextTruncationAlignmentLinkSection(context),
      };
}

Widget buildTextDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kTextStoryNavOrder)
        if (story != TextFoundationStory.docs &&
            story != TextFoundationStory.defaultStory)
          Padding(
            padding: const EdgeInsets.only(bottom: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  story.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 8),
                Text(story.description,
                    style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
