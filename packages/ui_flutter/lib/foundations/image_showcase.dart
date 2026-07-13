import 'package:flutter/material.dart';

import '../widgets/one_ui_image.dart';
import '../widgets/one_ui_image_types.dart';

const _sample =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&h=360&fit=crop&q=85';
const _portrait =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=85';
const _badUrl = 'https://invalid.example/does-not-exist.png';

TextStyle _imageStoryLabelStyle(BuildContext context) {
  final theme = Theme.of(context);
  return theme.textTheme.labelSmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
        fontWeight: FontWeight.w500,
      ) ??
      const TextStyle(fontSize: 12);
}

Widget _imageStoryLabel(BuildContext context, String text) {
  return Text(text, style: _imageStoryLabelStyle(context));
}

double _widthForRatio(OneUiImageAspectRatio ratio) {
  return switch (ratio) {
    OneUiImageAspectRatio.auto => 120,
    OneUiImageAspectRatio.r9x21 => 72,
    OneUiImageAspectRatio.r21x9 => 160,
    _ => 100,
  };
}

double? _heightForRatio(OneUiImageAspectRatio ratio) {
  return ratio == OneUiImageAspectRatio.auto ? 80 : null;
}

Widget imageDefaultSection() {
  return OneUiImage(
    src: _sample,
    alt: 'Mountain landscape',
    aspectRatio: OneUiImageAspectRatio.r16x9,
    width: 320,
  );
}

Widget imageAspectRatiosSection() {
  const ratios = OneUiImageAspectRatio.values;
  return Wrap(
    spacing: 16,
    runSpacing: 16,
    children: [
      for (final ratio in ratios)
        Builder(
          builder: (context) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiImage(
                src: ratio == OneUiImageAspectRatio.r9x16 ? _portrait : _sample,
                alt: ratio.wireValue,
                aspectRatio: ratio,
                width: _widthForRatio(ratio),
                height: _heightForRatio(ratio),
              ),
              const SizedBox(height: 8),
              _imageStoryLabel(context, ratio.wireValue),
            ],
          ),
        ),
    ],
  );
}

Widget _objectFitCell(
  BuildContext context, {
  required String label,
  required OneUiImageObjectFit fit,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      DecoratedBox(
        decoration: BoxDecoration(
          border:
              Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: SizedBox(
          width: 150,
          height: 150,
          child: OneUiImage(
            src: _portrait,
            alt: label,
            objectFit: fit,
            aspectRatio: OneUiImageAspectRatio.r1x1,
          ),
        ),
      ),
      const SizedBox(height: 8),
      _imageStoryLabel(context, label),
    ],
  );
}

Widget imageObjectFitSection() {
  const baseline = [
    OneUiImageObjectFit.cover,
    OneUiImageObjectFit.contain,
    OneUiImageObjectFit.fill,
    OneUiImageObjectFit.none,
  ];
  const extended = [
    OneUiImageObjectFit.scaleDown,
    OneUiImageObjectFit.cover, // inherit
    OneUiImageObjectFit.cover, // initial
    OneUiImageObjectFit.cover, // revert
    OneUiImageObjectFit.cover, // revert-layer
    OneUiImageObjectFit.cover, // unset
  ];
  const extendedLabels = [
    'scale-down',
    'inherit',
    'initial',
    'revert',
    'revert-layer',
    'unset',
  ];

  return Builder(
    builder: (context) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _imageStoryLabel(context, 'Common'),
        const SizedBox(height: 12),
        Wrap(
          spacing: 18,
          runSpacing: 16,
          children: [
            for (final mode in baseline)
              _objectFitCell(context, label: mode.name, fit: mode),
          ],
        ),
        const SizedBox(height: 24),
        _imageStoryLabel(context, 'Extended keywords'),
        const SizedBox(height: 12),
        Wrap(
          spacing: 18,
          runSpacing: 16,
          children: [
            for (var i = 0; i < extended.length; i++)
              _objectFitCell(context,
                  label: extendedLabels[i], fit: extended[i]),
          ],
        ),
      ],
    ),
  );
}

Widget imageStatesSection() {
  return Wrap(
    spacing: 24,
    runSpacing: 16,
    crossAxisAlignment: WrapCrossAlignment.start,
    children: [
      _stateColumn(
          'Default',
          OneUiImage(
              src: _sample,
              alt: 'Default',
              width: 120,
              aspectRatio: OneUiImageAspectRatio.r1x1)),
      _stateColumn(
        'Interactive',
        OneUiImage(
          src: _sample,
          alt: 'Interactive image',
          interactive: true,
          onPress: () {},
          width: 120,
          aspectRatio: OneUiImageAspectRatio.r1x1,
        ),
      ),
      _stateColumn(
        'Disabled',
        OneUiImage(
          src: _sample,
          alt: 'Disabled',
          disabled: true,
          width: 120,
          aspectRatio: OneUiImageAspectRatio.r1x1,
        ),
      ),
      _stateColumn(
        'Error fallback',
        OneUiImage(
            src: _badUrl,
            alt: 'Broken',
            width: 120,
            aspectRatio: OneUiImageAspectRatio.r1x1),
      ),
    ],
  );
}

Widget _stateColumn(String label, Widget image) {
  return Builder(
    builder: (context) => Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        _imageStoryLabel(context, label),
        const SizedBox(height: 8),
        image,
      ],
    ),
  );
}

Widget imageWithFallbackSection() {
  return Wrap(
    spacing: 24,
    runSpacing: 16,
    children: [
      _stateColumn(
          'Valid Image',
          OneUiImage(
              src: _sample,
              alt: 'Valid',
              width: 200,
              aspectRatio: OneUiImageAspectRatio.r16x9)),
      _stateColumn(
          'Default icon',
          OneUiImage(
              src: _badUrl,
              alt: 'Default fallback',
              width: 200,
              aspectRatio: OneUiImageAspectRatio.r16x9)),
      _stateColumn(
        'Custom fallback',
        OneUiImage(
          src: _badUrl,
          alt: 'Custom fallback',
          width: 200,
          aspectRatio: OneUiImageAspectRatio.r16x9,
          fallback: const Icon(Icons.broken_image_outlined, size: 32),
        ),
      ),
      _stateColumn(
        'fallbackSrc',
        OneUiImage(
          src: _badUrl,
          alt: 'URL fallback',
          width: 200,
          aspectRatio: OneUiImageAspectRatio.r16x9,
          fallbackSrc: _sample,
        ),
      ),
    ],
  );
}

Widget imageInteractiveSection() {
  return OneUiImage(
    src: _sample,
    alt: 'Clickable image',
    interactive: true,
    onPress: () {},
    width: 320,
    aspectRatio: OneUiImageAspectRatio.r16x9,
    testId: 'image-interactive-demo',
  );
}

Widget imageResponsiveSection() {
  return LayoutBuilder(
    builder: (context, constraints) {
      final maxW = constraints.maxWidth.isFinite && constraints.maxWidth > 0
          ? constraints.maxWidth
          : 640.0;
      const entries = [
        (1.0, 'Full width'),
        (0.75, '75%'),
        (0.5, '50%'),
      ];
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final (factor, label) in entries) ...[
            _imageStoryLabel(context, label),
            const SizedBox(height: 8),
            SizedBox(
              width: maxW * factor,
              child: OneUiImage(
                src: _sample,
                alt: '$label image',
                aspectRatio: OneUiImageAspectRatio.r16x9,
              ),
            ),
            const SizedBox(height: 16),
          ],
        ],
      );
    },
  );
}

const _cornerRadiusShapes = [
  ('--Shape-0-5', '1 · 6XS'),
  ('--Shape-1', '2 · 5XS'),
  ('--Shape-1-5', '3 · 4XS'),
  ('--Shape-2', '4 · 3XS'),
  ('--Shape-3', '6 · XS'),
  ('--Shape-3-5', '7 · S'),
  ('--Shape-4', '8 · M'),
];

Widget _cornerRadiusRow(
  BuildContext context, {
  required String aspectLabel,
  required OneUiImageAspectRatio aspectRatio,
  required double width,
}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _imageStoryLabel(context, aspectLabel),
      const SizedBox(height: 12),
      Wrap(
        spacing: 18,
        runSpacing: 16,
        children: [
          for (final (token, label) in _cornerRadiusShapes)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                OneUiImage(
                  src: _sample,
                  alt: label,
                  aspectRatio: aspectRatio,
                  width: width,
                  borderRadiusToken: token,
                ),
                const SizedBox(height: 8),
                _imageStoryLabel(context, label),
              ],
            ),
        ],
      ),
    ],
  );
}

Widget imageCornerRadiusSection() {
  return Builder(
    builder: (context) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _cornerRadiusRow(
          context,
          aspectLabel: '1:1',
          aspectRatio: OneUiImageAspectRatio.r1x1,
          width: 120,
        ),
        const SizedBox(height: 24),
        _cornerRadiusRow(
          context,
          aspectLabel: '16:9',
          aspectRatio: OneUiImageAspectRatio.r16x9,
          width: 180,
        ),
        const SizedBox(height: 24),
        _cornerRadiusRow(
          context,
          aspectLabel: '4:3',
          aspectRatio: OneUiImageAspectRatio.r4x3,
          width: 160,
        ),
      ],
    ),
  );
}
