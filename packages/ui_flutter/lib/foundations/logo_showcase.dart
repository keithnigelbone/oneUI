import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../brand/one_ui_brand_scope.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_brand_logo.dart';
import '../widgets/one_ui_logo.dart';
import '../widgets/one_ui_logo_types.dart';
import '../widgets/one_ui_surface.dart';
import 'logo_brand_bind.dart';

/// Fallback when no brand `logoSvg` is loaded — mirrors web `FALLBACK_SVG`.
const String kOneUiLogoFallbackSvg = '''
<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">?</text>
</svg>''';

const String kOneUiLogoSampleDataUri =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white'/%3E%3C/svg%3E";

const String kOneUiLogoChildrenSvg = '''
<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>''';

String _brandLogoSvg(BuildContext context) {
  final load = OneUiBrandLoadState.maybeOf(context);
  final raw = load?.logoSvg;
  if (raw == null || raw.trim().isEmpty) return kOneUiLogoFallbackSvg;
  return raw;
}

String _brandLogoAlt(BuildContext context) {
  final load = OneUiBrandLoadState.maybeOf(context);
  return load?.brandName ?? 'Brand Logo';
}

TextStyle _logoStoryLabelStyle(BuildContext context) {
  final theme = Theme.of(context);
  return theme.textTheme.labelSmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
        fontWeight: FontWeight.w500,
      ) ??
      TextStyle(fontSize: 12, color: theme.colorScheme.onSurfaceVariant);
}

Widget _logoStoryLabel(BuildContext context, String text) {
  return Text(text, style: _logoStoryLabelStyle(context));
}

double _layoutSpacing(BuildContext context, String tail) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: tail,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

Widget _logoStoryColumn(BuildContext context,
    {required Widget logo, required String label}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      logo,
      SizedBox(height: _layoutSpacing(context, '3')),
      _logoStoryLabel(context, label),
    ],
  );
}

/// React Storybook `display: flex; align-items: center; gap: …` row layout.
Widget _logoStoryRow(
  BuildContext context, {
  required List<Widget> children,
  required String gapToken,
}) {
  final gap = _layoutSpacing(context, gapToken);
  return Row(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      for (var i = 0; i < children.length; i++) ...[
        if (i > 0) SizedBox(width: gap),
        children[i],
      ],
    ],
  );
}

Widget logoDefaultSection(BuildContext context) {
  return const Center(child: OneUiBrandLogo(size: OneUiLogoSize.m));
}

Widget logoVariantsSection(BuildContext context) {
  return _logoStoryRow(
    context,
    gapToken: '6',
    children: [
      for (final variant in OneUiLogoVariant.values)
        _logoStoryColumn(
          context,
          logo: OneUiBrandLogo(variant: variant, size: OneUiLogoSize.xl),
          label: variant.name,
        ),
    ],
  );
}

Widget logoSizesSection(BuildContext context) {
  const sizes = [
    OneUiLogoSize.xs,
    OneUiLogoSize.s,
    OneUiLogoSize.m,
    OneUiLogoSize.l,
    OneUiLogoSize.xl,
  ];
  const labels = ['xs', 's', 'm', 'l', 'xl'];

  return _logoStoryRow(
    context,
    gapToken: '4-5',
    children: [
      for (var i = 0; i < sizes.length; i++)
        _logoStoryColumn(
          context,
          logo: OneUiBrandLogo(size: sizes[i]),
          label: labels[i].toUpperCase(),
        ),
      _logoStoryColumn(
        context,
        logo: const OneUiBrandLogo(size: OneUiLogoSize.custom, customSize: 48),
        label: 'custom (48px)',
      ),
    ],
  );
}

Widget logoContentSourcesSection(BuildContext context) {
  final svg = _brandLogoSvg(context);
  return _logoStoryRow(
    context,
    gapToken: '6',
    children: [
      _logoStoryColumn(
        context,
        logo: OneUiLogo(
          alt: 'Children',
          size: OneUiLogoSize.xl,
          child: SvgPicture.string(
            kOneUiLogoChildrenSvg,
            fit: BoxFit.contain,
          ),
        ),
        label: 'children (widget)',
      ),
      _logoStoryColumn(
        context,
        logo: OneUiLogo(
            alt: 'SVG Content', size: OneUiLogoSize.xl, svgContent: svg),
        label: 'svgContent',
      ),
      _logoStoryColumn(
        context,
        logo: const OneUiLogo(
          alt: 'External Image',
          size: OneUiLogoSize.xl,
          src: kOneUiLogoSampleDataUri,
        ),
        label: 'src (image)',
      ),
    ],
  );
}

Widget logoSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent colour'),
    ('elevated', 'floating card / popover'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _layoutSpacing(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _logoStoryLabel(context, '$mode — $desc'),
              SizedBox(height: _layoutSpacing(context, '3')),
              OneUiSurface(
                mode: mode,
                padding: EdgeInsets.all(_layoutSpacing(context, '4-5')),
                child: Wrap(
                  spacing: _layoutSpacing(context, '3-5'),
                  children: const [
                    OneUiBrandLogo(size: OneUiLogoSize.l),
                    OneUiBrandLogo(size: OneUiLogoSize.xl),
                  ],
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget logoImageFallbackSection(BuildContext context) {
  return Wrap(
    spacing: _layoutSpacing(context, '6'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiLogo(
            alt: 'With Fallback',
            size: OneUiLogoSize.xl,
            src: 'https://invalid.example/broken.png',
            fallback: SvgPicture.string(
              '''<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
</svg>''',
              width: 24,
              height: 24,
            ),
          ),
          SizedBox(height: _layoutSpacing(context, '3')),
          _logoStoryLabel(context, 'broken src + fallback'),
        ],
      ),
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          OneUiLogo(
            alt: 'No content',
            size: OneUiLogoSize.xl,
            fallback: Text('?', style: _logoStoryLabelStyle(context)),
          ),
          SizedBox(height: _layoutSpacing(context, '3')),
          _logoStoryLabel(context, 'empty + fallback'),
        ],
      ),
    ],
  );
}

Widget logoInteractiveSection(BuildContext context) {
  return Center(
    child: OneUiBrandLogo(
      size: OneUiLogoSize.m,
      interactive: true,
      onPress: () {},
      alt: _brandLogoAlt(context),
    ),
  );
}

Widget logoThemesSection(BuildContext context) {
  const sizes = [
    OneUiLogoSize.xs,
    OneUiLogoSize.s,
    OneUiLogoSize.m,
    OneUiLogoSize.l,
    OneUiLogoSize.xl,
  ];

  return _logoStoryRow(
    context,
    gapToken: '6',
    children: [
      Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _logoStoryLabel(context, 'All sizes'),
          SizedBox(height: _layoutSpacing(context, '4-5')),
          _logoStoryRow(
            context,
            gapToken: '4',
            children: [for (final size in sizes) OneUiBrandLogo(size: size)],
          ),
        ],
      ),
      Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _logoStoryLabel(context, 'On bold surface'),
          SizedBox(height: _layoutSpacing(context, '4-5')),
          OneUiSurface(
            mode: 'bold',
            padding: EdgeInsets.all(_layoutSpacing(context, '4-5')),
            child: _logoStoryRow(
              context,
              gapToken: '4',
              children: [for (final size in sizes) OneUiBrandLogo(size: size)],
            ),
          ),
        ],
      ),
    ],
  );
}
