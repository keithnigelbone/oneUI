/// Avatar showcase — `Avatar.showcase.tsx` / `Avatar.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/convex_design_system_guard.dart';
import '../widgets/one_ui_avatar.dart';
import '../widgets/one_ui_avatar_glyphs.dart';
import '../widgets/one_ui_avatar_types.dart';
import '../widgets/one_ui_surface.dart';

/// Same set as web `Avatar.stories.tsx` `DEFAULT_APPEARANCE_ROLES`.
const List<String> kAvatarAppearancesStoryRoles = [
  'primary',
  'neutral',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
];

const _kContentModes = [
  (OneUiAvatarContent.image, 'image'),
  (OneUiAvatarContent.icon, 'icon'),
  (OneUiAvatarContent.text, 'text'),
];

const _kSizePresets = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'];

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

TextStyle? _caption(BuildContext context, {String sizeKey = 'XS'}) {
  final typo = OneUiScope.nativeTypographyOf(context);
  return typo?.emphasisStyle('label', sizeKey, emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _label(BuildContext context, String text, {String sizeKey = 'XS'}) {
  return Text(text, style: _caption(context, sizeKey: sizeKey));
}

Widget _rowLabel(BuildContext context, String text) {
  return SizedBox(
    width: _gap(context, '9'),
    child: Text(
      text,
      style: _caption(context)?.copyWith(fontWeight: FontWeight.w500),
    ),
  );
}

Widget _labeledColumn(BuildContext context, Widget child, String caption) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      child,
      SizedBox(height: _gap(context, '3')),
      _label(context, caption),
    ],
  );
}

Widget _avatar(
  BuildContext context, {
  OneUiAvatarContent content = OneUiAvatarContent.image,
  String size = 'xl',
  OneUiAvatarAttention attention = OneUiAvatarAttention.high,
  String appearance = 'primary',
  String? src,
  String alt = 'John Smith',
  Widget? icon,
  Widget? fallback,
  double? customSize,
  bool disabled = false,
}) {
  return OneUiAvatar(
    content: content,
    size: size,
    attention: attention,
    appearance: appearance,
    src: src,
    alt: alt,
    icon: icon,
    fallback: fallback,
    customSize: customSize,
    disabled: disabled,
  );
}

Widget? _iconFor(OneUiAvatarContent content) {
  if (content == OneUiAvatarContent.icon) {
    return const OneUiAvatarSvgGlyph.person();
  }
  return null;
}

String? _srcFor(OneUiAvatarContent content) {
  if (content == OneUiAvatarContent.image) {
    return kOneUiAvatarSampleImageUrl;
  }
  return null;
}

Widget buildAvatarDefaultPreview(BuildContext context) {
  return Center(
    child: _avatar(
      context,
      content: OneUiAvatarContent.image,
      size: 'm',
      src: kOneUiAvatarSampleImageUrl,
      alt: 'John Doe',
    ),
  );
}

/// Three display content modes: image, icon, and text (initials).
Widget buildAvatarVariantsSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4-5'),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      for (final (mode, label) in _kContentModes)
        _labeledColumn(
          context,
          _avatar(
            context,
            content: mode,
            size: 'xl',
            src: _srcFor(mode),
            icon: _iconFor(mode),
          ),
          label[0].toUpperCase() + label.substring(1),
        ),
    ],
  );
}

/// High / medium / low × image, icon, text — `AvatarAttentionLevels`.
Widget buildAvatarAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, label) in _kContentModes) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _rowLabel(context, label),
            SizedBox(width: _gap(context, '4')),
            Wrap(
              spacing: _gap(context, '4'),
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final a in OneUiAvatarAttention.values)
                  _avatar(
                    context,
                    content: mode,
                    size: 'xl',
                    attention: a,
                    src: _srcFor(mode),
                    icon: _iconFor(mode),
                  ),
              ],
            ),
          ],
        ),
        if (mode != OneUiAvatarContent.text)
          SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

/// All size presets × image, icon, text — `AvatarSizes`.
Widget buildAvatarSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, label) in _kContentModes) ...[
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _rowLabel(context, label),
            SizedBox(width: _gap(context, '4')),
            Expanded(
              child: Wrap(
                spacing: _gap(context, '4'),
                runSpacing: _gap(context, '2'),
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  for (final s in _kSizePresets)
                    _labeledColumn(
                      context,
                      _avatar(
                        context,
                        content: mode,
                        size: s,
                        src: _srcFor(mode),
                        icon: _iconFor(mode),
                      ),
                      s.toUpperCase(),
                    ),
                  _labeledColumn(
                    context,
                    _avatar(
                      context,
                      content: mode,
                      size: 'custom',
                      customSize: 48,
                      src: _srcFor(mode),
                      icon: _iconFor(mode),
                    ),
                    'Custom',
                  ),
                ],
              ),
            ),
          ],
        ),
        if (mode != OneUiAvatarContent.text)
          SizedBox(height: _gap(context, '4')),
      ],
    ],
  );
}

Widget buildAvatarAppearancesSection(BuildContext context) {
  final configured = OneUiSurfaceScope.configuredRoleKeys(context);
  final roles = kAvatarAppearancesStoryRoles
      .where(configured.contains)
      .toList(growable: false);
  if (roles.isEmpty) {
    return oneUiConvexGapPlaceholder(
      ['No configured appearance roles on themeConfig.appearances'],
    );
  }
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in roles)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(width: 100, child: _label(context, role)),
              Expanded(
                child: Wrap(
                  spacing: _gap(context, '3-5'),
                  runSpacing: _gap(context, '3'),
                  children: [
                    for (final a in OneUiAvatarAttention.values)
                      _avatar(
                        context,
                        content: OneUiAvatarContent.icon,
                        appearance: role,
                        attention: a,
                        icon: _iconFor(OneUiAvatarContent.icon),
                      ),
                    for (final a in OneUiAvatarAttention.values)
                      _avatar(
                        context,
                        content: OneUiAvatarContent.text,
                        appearance: role,
                        attention: a,
                        alt: 'JS',
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildAvatarThemesSection(BuildContext context) {
  const modes = ['default', 'minimal', 'subtle', 'elevated'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(width: 80, child: _label(context, mode)),
              Expanded(
                child: OneUiSurface(
                  mode: mode,
                  padding: EdgeInsets.all(_gap(context, '4-5')),
                  child: Wrap(
                    spacing: _gap(context, '3-5'),
                    children: [
                      for (final a in OneUiAvatarAttention.values)
                        _avatar(
                          context,
                          content: OneUiAvatarContent.icon,
                          attention: a,
                          icon: _iconFor(OneUiAvatarContent.icon),
                        ),
                      for (final a in OneUiAvatarAttention.values)
                        _avatar(
                          context,
                          content: OneUiAvatarContent.text,
                          attention: a,
                          alt: 'JS',
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildAvatarSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent'),
    ('elevated', 'floating'),
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(context, '$mode — $desc'),
              SizedBox(height: _gap(context, '3')),
              OneUiSurface(
                mode: mode,
                padding: EdgeInsets.all(_gap(context, '4-5')),
                child: Wrap(
                  spacing: _gap(context, '3-5'),
                  children: [
                    _avatar(
                      context,
                      content: OneUiAvatarContent.image,
                      src: kOneUiAvatarSampleImageUrl,
                      alt: 'User',
                    ),
                    for (final a in OneUiAvatarAttention.values)
                      _avatar(
                        context,
                        content: OneUiAvatarContent.icon,
                        attention: a,
                        icon: _iconFor(OneUiAvatarContent.icon),
                      ),
                    for (final a in OneUiAvatarAttention.values)
                      _avatar(
                        context,
                        content: OneUiAvatarContent.text,
                        attention: a,
                        alt: 'JS',
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

/// Default and disabled for icon, text, and image at 2XL — `AvatarStates`.
Widget buildAvatarStatesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '5'),
    runSpacing: _gap(context, '3'),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.icon,
          size: '2xl',
          icon: _iconFor(OneUiAvatarContent.icon),
          alt: 'User',
        ),
        'Default',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.icon,
          size: '2xl',
          disabled: true,
          icon: _iconFor(OneUiAvatarContent.icon),
          alt: 'User',
        ),
        'Disabled',
      ),
      _labeledColumn(
        context,
        _avatar(context,
            content: OneUiAvatarContent.text, size: '2xl', alt: 'JS'),
        'Default',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.text,
          size: '2xl',
          alt: 'JS',
          disabled: true,
        ),
        'Disabled',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.image,
          size: '2xl',
          src: kOneUiAvatarSampleImageUrl,
          alt: 'User',
        ),
        'Default',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.image,
          size: '2xl',
          src: kOneUiAvatarSampleImageUrl,
          alt: 'User',
          disabled: true,
        ),
        'Disabled',
      ),
    ],
  );
}

/// Valid image, broken URL, custom fallback — `AvatarImageFallback`.
Widget buildAvatarImageFallbackSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '5'),
    runSpacing: _gap(context, '3'),
    crossAxisAlignment: WrapCrossAlignment.end,
    children: [
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.image,
          src: kOneUiAvatarSampleImageUrl,
          alt: 'John Doe',
          size: 'xl',
        ),
        'Valid Image',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.image,
          src: 'https://invalid.example/broken.jpg',
          alt: 'Jane Smith',
          size: 'xl',
        ),
        'Broken → Icon',
      ),
      _labeledColumn(
        context,
        _avatar(
          context,
          content: OneUiAvatarContent.image,
          src: 'https://invalid.example/broken.jpg',
          alt: 'User',
          size: 'xl',
          fallback: const OneUiAvatarSvgGlyph.person(),
        ),
        'Custom Fallback',
      ),
    ],
  );
}

/// Person, star, check icons — `WithIcons` story (primary appearance, currentColor).
Widget buildAvatarWithIconsSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      _avatar(
        context,
        content: OneUiAvatarContent.icon,
        size: 'xl',
        alt: 'User',
        icon: _iconFor(OneUiAvatarContent.icon),
      ),
      _avatar(
        context,
        content: OneUiAvatarContent.icon,
        size: 'xl',
        alt: 'Star',
        icon: const OneUiAvatarSvgGlyph.star(),
      ),
      _avatar(
        context,
        content: OneUiAvatarContent.icon,
        size: 'xl',
        alt: 'Check',
        icon: const OneUiAvatarSvgGlyph.check(),
      ),
    ],
  );
}

/// Compact / default / open × s/m/l/xl icon sizes — web `Density` story.
Widget buildAvatarDensitySection(BuildContext context) {
  final parent = OneUiScope.of(context);
  const densities = ['compact', 'default', 'open'];
  const sizes = ['s', 'm', 'l', 'xl'];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(
        context,
        'Three density columns (compact / default / open). Each column uses its own '
        'OneUiScope.density; avatars are icon content at s / m / l / xl.',
      ),
      SizedBox(height: _gap(context, '4')),
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < densities.length; i++)
            Expanded(
              child: OneUiScope(
                platformId: parent.platformId,
                density: densities[i],
                platformsFoundationConfig: parent.platformsFoundationConfig,
                designSystem: parent.designSystem,
                nativeTypography: parent.nativeTypography,
                buttonOrnament: parent.buttonOrnament,
                typographyConfig: parent.typographyConfig,
                customFonts: parent.customFonts,
                foundationAccentColor: parent.foundationAccentColor,
                child: Padding(
                  padding: EdgeInsets.only(
                    right: i == densities.length - 1 ? 0 : _gap(context, '5'),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label(context, densities[i]),
                      SizedBox(height: _gap(context, '3')),
                      Wrap(
                        spacing: _gap(context, '3'),
                        runSpacing: _gap(context, '3'),
                        children: [
                          for (final sz in sizes)
                            _avatar(
                              context,
                              content: OneUiAvatarContent.icon,
                              size: sz,
                              alt: 'User',
                              icon: _iconFor(OneUiAvatarContent.icon),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    ],
  );
}

/// S / M / L rows × image, icon, text — web `Responsive` story (viewport token scaling).
Widget buildAvatarResponsiveSection(BuildContext context) {
  const sizes = ['s', 'm', 'l'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < sizes.length; i++) ...[
        if (i > 0) SizedBox(height: _gap(context, '4')),
        Wrap(
          spacing: _gap(context, '3-5'),
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _avatar(
              context,
              content: OneUiAvatarContent.image,
              size: sizes[i],
              src: kOneUiAvatarSampleImageUrl,
              alt: 'User',
            ),
            _avatar(
              context,
              content: OneUiAvatarContent.icon,
              size: sizes[i],
              alt: 'User',
              icon: _iconFor(OneUiAvatarContent.icon),
            ),
            _avatar(
              context,
              content: OneUiAvatarContent.text,
              size: sizes[i],
              alt: 'JS',
            ),
          ],
        ),
      ],
    ],
  );
}
