/// Text showcase — `Text.showcase.tsx` / `Text.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/one_ui_text.dart';
import '../widgets/one_ui_text_types.dart';

const kTextAppearancesStoryRoles = [
  'primary',
  'neutral',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
];

const _kFox = 'The quick brown fox jumps over the lazy dog';

double _gap(BuildContext context, [String tail = '4']) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: tail,
  );
}

TextStyle? _caption(BuildContext context) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', 'XS', emphasis: 'low');
}

Widget _label(BuildContext context, String text, {double? minWidth}) {
  final style = _caption(context);
  return SizedBox(
    width: minWidth,
    child: Text(text, style: style?.copyWith(fontWeight: FontWeight.w500)),
  );
}

Widget buildTextDefaultPreview(BuildContext context) {
  return const Center(
    child: OneUiText(
      variant: OneUiTextVariant.body,
      size: 'M',
      text: _kFox,
    ),
  );
}

Widget buildTextVariantsSection(BuildContext context) {
  const samples = {
    OneUiTextVariant.display: 'Display headline copy',
    OneUiTextVariant.headline: 'Headline section title',
    OneUiTextVariant.title: 'Title for a card',
    OneUiTextVariant.body:
        'Body paragraph copy that wraps across multiple lines and reads comfortably.',
    OneUiTextVariant.label: 'Label / caption',
    OneUiTextVariant.code: 'const example = true;',
  };
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final v in kOneUiTextVariants) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _label(context, v.name, minWidth: _gap(context, '12')),
            SizedBox(width: _gap(context, '4-5')),
            Expanded(
              child: OneUiText(variant: v, text: samples[v]!),
            ),
          ],
        ),
        SizedBox(height: _gap(context, '3')),
      ],
    ],
  );
}

Widget buildTextSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final sz in kOneUiTextBodySizes) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            _label(context, sz, minWidth: _gap(context, '9')),
            SizedBox(width: _gap(context, '4')),
            OneUiText(variant: OneUiTextVariant.body, size: sz, text: _kFox),
          ],
        ),
        if (sz != kOneUiTextBodySizes.last)
          SizedBox(height: _gap(context, '3')),
      ],
      Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          _label(context, '3XS (invalid → 2XS)', minWidth: _gap(context, '9')),
          SizedBox(width: _gap(context, '4')),
          const OneUiText(
              variant: OneUiTextVariant.body, size: '3XS', text: _kFox),
        ],
      ),
    ],
  );
}

Widget buildTextAttentionAndWeightSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final a in kOneUiTextAttentions) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            _label(context, a.name, minWidth: _gap(context, '10')),
            SizedBox(width: _gap(context, '4')),
            Wrap(
              spacing: _gap(context, '4-5'),
              children: [
                for (final w in kOneUiTextWeights)
                  OneUiText(
                    variant: OneUiTextVariant.body,
                    size: 'M',
                    attention: a,
                    weight: w,
                    text:
                        '${w.name[0].toUpperCase()}${w.name.substring(1)} weight',
                  ),
              ],
            ),
          ],
        ),
        if (a != kOneUiTextAttentions.last)
          SizedBox(height: _gap(context, '3')),
      ],
    ],
  );
}

Widget buildTextAppearancesSection(BuildContext context) {
  const attentions = [OneUiTextAttention.high, OneUiTextAttention.tintedA11y];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final a in attentions) ...[
        Text('attention = ${a.name}', style: _caption(context)),
        SizedBox(height: _gap(context, '3')),
        Wrap(
          spacing: _gap(context, '4-5'),
          runSpacing: _gap(context, '3'),
          children: [
            for (final role in kTextAppearancesStoryRoles)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  OneUiText(
                    variant: OneUiTextVariant.title,
                    size: 'M',
                    appearance: role,
                    attention: a,
                    text: role,
                  ),
                  SizedBox(height: _gap(context, '2')),
                  Text(role, style: _caption(context)),
                ],
              ),
          ],
        ),
        SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

Widget buildTextDecorationsSection(BuildContext context) {
  const rows = [
    ('plain', false, false, false),
    ('italic', true, false, false),
    ('underline', false, true, false),
    ('strikethrough', false, false, true),
    ('combined', true, true, true),
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (name, it, ul, st) in rows) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            _label(context, name, minWidth: _gap(context, '12')),
            SizedBox(width: _gap(context, '4')),
            OneUiText(
              italic: it,
              underline: ul,
              strikethrough: st,
              text: _kFox,
            ),
          ],
        ),
        if (name != 'combined') SizedBox(height: _gap(context, '3')),
      ],
    ],
  );
}

Widget buildTextSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent fill'),
    ('elevated', 'floating panel'),
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes) ...[
        Text('$mode — $desc', style: _caption(context)),
        SizedBox(height: _gap(context, '3')),
        OneUiSurface(
          mode: mode,
          padding: EdgeInsets.all(_gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const OneUiText(
                variant: OneUiTextVariant.title,
                size: 'M',
                attention: OneUiTextAttention.high,
                text: 'Title — high attention',
              ),
              SizedBox(height: _gap(context, '3')),
              const OneUiText(
                variant: OneUiTextVariant.body,
                size: 'M',
                attention: OneUiTextAttention.medium,
                text: 'Body — medium attention',
              ),
              SizedBox(height: _gap(context, '3')),
              const OneUiText(
                variant: OneUiTextVariant.body,
                size: 'S',
                attention: OneUiTextAttention.low,
                text: 'Caption — low attention',
              ),
              SizedBox(height: _gap(context, '3')),
              const OneUiText(
                variant: OneUiTextVariant.label,
                size: 'S',
                appearance: 'primary',
                attention: OneUiTextAttention.tintedA11y,
                text: 'Label — tintedA11y primary',
              ),
            ],
          ),
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

Widget buildTextTruncationAlignmentLinkSection(BuildContext context) {
  final narrow = _gap(context, '40');
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Explicit heading (display L)', style: _caption(context)),
      SizedBox(height: _gap(context, '3-5')),
      const OneUiText(
        variant: OneUiTextVariant.display,
        size: 'L',
        text: 'Semantic page title',
      ),
      SizedBox(height: _gap(context, '6')),
      Text('maxLines = 1', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      SizedBox(
        width: narrow,
        child: const OneUiText(
          maxLines: 1,
          text:
              'This text overflows the container and should truncate with an ellipsis after a single line of content.',
        ),
      ),
      SizedBox(height: _gap(context, '4')),
      Text('maxLines = 3', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      SizedBox(
        width: narrow,
        child: const OneUiText(
          maxLines: 3,
          text:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor '
              'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud '
              'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        ),
      ),
      SizedBox(height: _gap(context, '6')),
      Text('textAlign', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      SizedBox(
        width: narrow,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: const [
            OneUiText(
              textAlign: OneUiTextAlign.left,
              text: 'Left-aligned paragraph.',
            ),
            OneUiText(
              textAlign: OneUiTextAlign.center,
              text: 'Centred paragraph.',
            ),
            OneUiText(
              textAlign: OneUiTextAlign.right,
              text: 'Right-aligned paragraph.',
            ),
          ],
        ),
      ),
      SizedBox(height: _gap(context, '6')),
      Text('link slot', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      OneUiText(
        text: 'Read more in the documentation before continuing.',
        link: 'documentation',
        onLinkPress: () {},
      ),
      SizedBox(height: _gap(context, '6')),
      Text('lang + script', style: _caption(context)),
      SizedBox(height: _gap(context, '3')),
      const OneUiText(
        lang: 'hi',
        text: 'नमस्ते — Devanagari via lang="hi"',
      ),
      SizedBox(height: _gap(context, '3')),
      const OneUiText(
        script: 'tamil',
        text: 'வணக்கம் — explicit script',
      ),
      SizedBox(height: _gap(context, '3')),
      const OneUiText(
        language: OneUiTextLanguage.others,
        text: 'Script slot fallback (language=others)',
      ),
      SizedBox(height: _gap(context, '3')),
      const OneUiText(
        href: '#',
        appearance: 'primary',
        attention: OneUiTextAttention.tintedA11y,
        underline: true,
        text: 'Anchor-style link (href)',
      ),
    ],
  );
}
