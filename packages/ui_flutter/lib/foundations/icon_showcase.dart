import 'package:flutter/material.dart';

import '../engine/icon_color_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_icon_remote.dart';
import '../widgets/one_ui_icon_types.dart';
import '../widgets/one_ui_surface.dart';

// ─── Shared CDN URLs (jsDelivr — CORS-friendly on Flutter web) ───────────────

const kOneUiIconTablerCdnBase =
    'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons';
const kOneUiIconMaterialCdnBase =
    'https://cdn.jsdelivr.net/npm/@material-design-icons/svg@0.14.13/filled';
const kOneUiIconTwemojiCdnBase =
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

/// Preset remote SVG URLs for Storybook controls and examples.
const List<(String label, String url)> kOneUiIconRemoteUrlPresets = [
  ('Tabler heart', '$kOneUiIconTablerCdnBase/heart.svg'),
  ('Tabler star', '$kOneUiIconTablerCdnBase/star.svg'),
  ('Tabler link', '$kOneUiIconTablerCdnBase/link.svg'),
  ('Tabler settings', '$kOneUiIconTablerCdnBase/settings.svg'),
  ('Tabler shopping-cart', '$kOneUiIconTablerCdnBase/shopping-cart.svg'),
  ('Tabler bell', '$kOneUiIconTablerCdnBase/bell.svg'),
  ('Tabler user', '$kOneUiIconTablerCdnBase/user.svg'),
  ('Tabler mail', '$kOneUiIconTablerCdnBase/mail.svg'),
  ('Tabler lock', '$kOneUiIconTablerCdnBase/lock.svg'),
  ('Tabler photo', '$kOneUiIconTablerCdnBase/photo.svg'),
  ('Material search', '$kOneUiIconMaterialCdnBase/search.svg'),
  ('Material home', '$kOneUiIconMaterialCdnBase/home.svg'),
  ('Twemoji heart PNG', '$kOneUiIconTwemojiCdnBase/2764.png'),
  ('Twemoji star PNG', '$kOneUiIconTwemojiCdnBase/2b50.png'),
];

/// Common Jio semantic names for Storybook controls.
const List<String> kOneUiIconSemanticPresets = [
  'heart',
  'star',
  'check',
  'search',
  'settings',
  'home',
  'add',
  'close',
  'edit',
  'delete',
  'download',
  'upload',
  'share',
  'link',
  'user',
  'lock',
  'warning',
  'error',
  'info',
  'bookmark',
  'calendar',
  'mail',
  'phone',
  'image',
  'video',
  'microphone',
  'chevronDown',
  'arrowRight',
  'externalLink',
  'loading',
];

TextStyle _captionStyle(BuildContext context) {
  final theme = Theme.of(context);
  return theme.textTheme.labelSmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
      ) ??
      TextStyle(fontSize: 12, color: theme.colorScheme.onSurfaceVariant);
}

Widget _sizeLabel(BuildContext context, String text) {
  return Text(text, style: _captionStyle(context));
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

Widget _iconShowcaseCell(
  BuildContext context, {
  required Widget icon,
  required String label,
}) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      icon,
      SizedBox(height: _layoutSpacing(context, '2')),
      _sizeLabel(context, label),
    ],
  );
}

Widget _iconShowcaseSubsection(
  BuildContext context, {
  required String title,
  String? subtitle,
  required List<Widget> children,
}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        title,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
      if (subtitle != null) ...[
        SizedBox(height: _layoutSpacing(context, '1')),
        Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
      ],
      SizedBox(height: _layoutSpacing(context, '2')),
      Wrap(
        spacing: _layoutSpacing(context, '5'),
        runSpacing: _layoutSpacing(context, '3'),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: children,
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
    ],
  );
}

Widget _iconUsageSnippet(BuildContext context, String code) {
  final scheme = Theme.of(context).colorScheme;
  return Container(
    width: double.infinity,
    padding: EdgeInsets.all(_layoutSpacing(context, '3')),
    decoration: BoxDecoration(
      color: scheme.surfaceContainerHighest.withValues(alpha: 0.6),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: scheme.outlineVariant),
    ),
    child: SelectableText(
      code,
      style: Theme.of(context).textTheme.bodySmall?.copyWith(
            fontFamily: 'monospace',
            fontSize: 11,
            height: 1.45,
          ),
    ),
  );
}

Widget _iconUsageCard(
  BuildContext context, {
  required String title,
  required String snippet,
  required Widget preview,
}) {
  return SizedBox(
    width: 280,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        SizedBox(height: _layoutSpacing(context, '3')),
        Center(child: preview),
        SizedBox(height: _layoutSpacing(context, '3')),
        _iconUsageSnippet(context, snippet),
      ],
    ),
  );
}

/// 1. Default — web `Default` story.
Widget buildIconDefaultPreview(BuildContext context) {
  return const Center(
    child: OneUiIcon(
      icon: 'heart',
      size: '5',
      semanticsLabel: 'Heart',
    ),
  );
}

/// 2. Unified `icon` prop — semantic names, remote URLs, custom Widget.
Widget buildIconPropOverviewSection(BuildContext context) {
  const tablerHeart = '$kOneUiIconTablerCdnBase/heart.svg';
  const tablerLink = '$kOneUiIconTablerCdnBase/link.svg';
  const twemojiHeart = '$kOneUiIconTwemojiCdnBase/2764.png';

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'One prop: `icon`',
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
      SizedBox(height: _layoutSpacing(context, '2')),
      Text(
        'Strings starting with `http://` or `https://` load from the network. '
        'All other strings resolve through the bundled Jio semantic catalog. '
        'Pass a [Widget] for a fully custom glyph.',
        style: Theme.of(context).textTheme.bodySmall,
      ),
      SizedBox(height: _layoutSpacing(context, '5')),
      Wrap(
        spacing: _layoutSpacing(context, '6'),
        runSpacing: _layoutSpacing(context, '6'),
        children: [
          _iconUsageCard(
            context,
            title: 'Jio semantic name',
            snippet:
                "OneUiIcon(\n  icon: 'heart',\n  size: '8',\n  appearance: 'primary',\n)",
            preview: const OneUiIcon(
              icon: 'heart',
              size: '10',
              appearance: 'primary',
              semanticsLabel: 'heart',
            ),
          ),
          _iconUsageCard(
            context,
            title: 'Remote SVG URL',
            snippet:
                "OneUiIcon(\n  icon: '$tablerHeart',\n  size: '8',\n  appearance: 'secondary',\n)",
            preview: const OneUiIcon(
              icon: tablerHeart,
              size: '10',
              appearance: 'secondary',
              semanticsLabel: 'tabler heart',
            ),
          ),
          _iconUsageCard(
            context,
            title: 'Remote PNG (`tintRaster`)',
            snippet:
                "OneUiIcon(\n  icon: '$twemojiHeart',\n  size: '8',\n  tintRaster: true,\n  appearance: 'negative',\n)",
            preview: const OneUiIcon(
              icon: twemojiHeart,
              size: '10',
              appearance: 'negative',
              tintRaster: true,
              semanticsLabel: 'tinted emoji heart',
            ),
          ),
        ],
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
      _iconShowcaseSubsection(
        context,
        title: 'Same concept — Jio name vs Tabler URL',
        subtitle:
            'Both use `icon:`; appearance × emphasis tints SVG and semantic glyphs.',
        children: [
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: 'link', size: '8', appearance: 'informative'),
            label: "icon: 'link'",
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: tablerLink, size: '8', appearance: 'informative'),
            label: 'icon: Tabler link.svg',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: 'heart', size: '8', appearance: 'negative'),
            label: "icon: 'heart'",
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: tablerHeart, size: '8', appearance: 'negative'),
            label: 'icon: Tabler heart.svg',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(icon: 'search', size: '8'),
            label: "icon: 'search'",
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: '$kOneUiIconMaterialCdnBase/search.svg',
              size: '8',
            ),
            label: 'icon: Material search.svg',
          ),
        ],
      ),
      _iconUsageSnippet(
        context,
        '// Detection (internal):\n'
        "isOneUiIconNetworkSrc('https://…/heart.svg') → remote\n"
        "isOneUiIconNetworkSrc('heart') → Jio semantic catalog",
      ),
    ],
  );
}

/// 3. Sizes — all 20 spacing indices.
Widget buildIconSizesSection(BuildContext context) {
  return Wrap(
    spacing: _layoutSpacing(context, '4'),
    runSpacing: _layoutSpacing(context, '2'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final size in kOneUiIconSizes)
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiIcon(
              icon: 'heart',
              size: size,
              semanticsLabel: 'Size $size',
            ),
            SizedBox(height: _layoutSpacing(context, '2')),
            _sizeLabel(context, size),
          ],
        ),
    ],
  );
}

/// 4. Emphasis levels — primary appearance, size 8.
Widget buildIconEmphasisLevelsSection(BuildContext context) {
  return Wrap(
    spacing: _layoutSpacing(context, '5'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final emphasis in OneUiIconEmphasis.values)
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiIcon(
              icon: 'heart',
              appearance: 'primary',
              emphasis: emphasis,
              size: '8',
              semanticsLabel: emphasis.name,
            ),
            SizedBox(height: _layoutSpacing(context, '3')),
            _sizeLabel(context, emphasis.name),
          ],
        ),
    ],
  );
}

/// 5. Appearances — 8 roles × high / tinted / tintedA11y.
Widget buildIconAppearancesSection(BuildContext context) {
  const emphasisRows = [
    OneUiIconEmphasis.high,
    OneUiIconEmphasis.tinted,
    OneUiIconEmphasis.tintedA11y,
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final emphasis in emphasisRows)
        Padding(
          padding: EdgeInsets.only(bottom: _layoutSpacing(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 72,
                child: _sizeLabel(context, emphasis.name),
              ),
              Expanded(
                child: Wrap(
                  spacing: _layoutSpacing(context, '4'),
                  runSpacing: _layoutSpacing(context, '2'),
                  children: [
                    for (final app in kOneUiIconAppearances)
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          OneUiIcon(
                            icon: 'heart',
                            appearance: app,
                            emphasis: emphasis,
                            size: '8',
                            semanticsLabel: '${emphasis.name} $app',
                          ),
                          SizedBox(height: _layoutSpacing(context, '2')),
                          _sizeLabel(context, app),
                        ],
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

/// 6. Jio semantic icons — bundled catalog via `icon: 'name'`.
Widget buildIconWithIconsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Pass semantic names — no URL, no network fetch.',
        style: Theme.of(context).textTheme.bodySmall,
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
      _iconShowcaseSubsection(
        context,
        title: 'Actions & navigation',
        children: [
          for (final name in [
            'add',
            'close',
            'edit',
            'delete',
            'search',
            'home',
            'settings',
            'menu',
            'chevronDown',
            'arrowRight',
            'externalLink',
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(icon: name, size: '8', semanticsLabel: name),
              label: name,
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Status & feedback',
        children: [
          for (final name in [
            'check',
            'warning',
            'error',
            'info',
            'help',
            'loading'
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(icon: name, size: '8', semanticsLabel: name),
              label: name,
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Media & social',
        children: [
          for (final name in [
            'heart',
            'star',
            'bookmark',
            'share',
            'link',
            'image',
            'video',
            'microphone',
            'user',
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(icon: name, size: '8', semanticsLabel: name),
              label: name,
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Transfer & security',
        children: [
          for (final name in [
            'download',
            'upload',
            'lock',
            'unlock',
            'eye',
            'eyeOff'
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(icon: name, size: '8', semanticsLabel: name),
              label: name,
            ),
        ],
      ),
      _iconUsageSnippet(
        context,
        "OneUiIcon(icon: 'heart', size: '5', appearance: 'primary')",
      ),
    ],
  );
}

/// 7. Network / Remote icons — CDN URLs via the same `icon` prop.
Widget buildIconNetworkIconsSection(BuildContext context) {
  const tabler = kOneUiIconTablerCdnBase;
  const material = kOneUiIconMaterialCdnBase;
  const emojiHeartPng = '$kOneUiIconTwemojiCdnBase/2764.png';
  const emojiStarPng = '$kOneUiIconTwemojiCdnBase/2b50.png';
  const widgetGlyph = OneUiIcon(icon: 'star', size: '6');

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Remote URL icons',
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
      SizedBox(height: _layoutSpacing(context, '2')),
      Text(
        'Switch brand in the Storybook toolbar — semantic icons, remote SVGs, '
        'and `tintRaster: true` PNGs follow brand tokens. '
        '`tintRaster: false` keeps embedded file colours.',
        style: Theme.of(context).textTheme.bodySmall,
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
      _iconShowcaseSubsection(
        context,
        title: 'Tabler SVG — all appearance roles',
        subtitle: 'Monochrome strokes → tinted via appearance × emphasis.',
        children: [
          for (final (app, file, label) in [
            ('neutral', 'heart.svg', 'heart'),
            ('primary', 'star.svg', 'star'),
            ('secondary', 'shopping-cart.svg', 'cart'),
            ('positive', 'circle-check.svg', 'check'),
            ('negative', 'heart-broken.svg', 'broken'),
            ('warning', 'alert-circle.svg', 'alert'),
            ('informative', 'info-circle.svg', 'info'),
            ('sparkle', 'sparkles.svg', 'sparkle'),
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(
                icon: '$tabler/$file',
                size: '8',
                appearance: app,
                semanticsLabel: '$label $app',
              ),
              label: '$label · $app',
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Tabler SVG — common UI glyphs',
        children: [
          for (final (file, label) in [
            ('link.svg', 'link'),
            ('bell.svg', 'bell'),
            ('settings.svg', 'settings'),
            ('user.svg', 'user'),
            ('mail.svg', 'mail'),
            ('phone.svg', 'phone'),
            ('lock.svg', 'lock'),
            ('photo.svg', 'photo'),
            ('trash.svg', 'trash'),
            ('edit.svg', 'edit'),
            ('upload.svg', 'upload'),
            ('download.svg', 'download'),
            ('share.svg', 'share'),
            ('bookmark.svg', 'bookmark'),
            ('calendar.svg', 'calendar'),
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(
                icon: '$tabler/$file',
                size: '8',
                semanticsLabel: label,
              ),
              label: label,
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Material Design SVG (jsDelivr)',
        children: [
          for (final (file, label) in [
            ('search.svg', 'search'),
            ('home.svg', 'home'),
            ('favorite.svg', 'favorite'),
            ('settings.svg', 'settings'),
            ('person.svg', 'person'),
            ('mail.svg', 'mail'),
            ('lock.svg', 'lock'),
            ('photo.svg', 'photo'),
            ('delete.svg', 'delete'),
            ('share.svg', 'share'),
          ])
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(
                icon: '$material/$file',
                size: '8',
                appearance: 'primary',
                semanticsLabel: 'material $label',
              ),
              label: 'MD $label',
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Semantic vs remote — side by side',
        children: [
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: 'heart', size: '8', semanticsLabel: 'jio heart'),
            label: "Jio 'heart'",
          ),
          _iconShowcaseCell(
            context,
            icon: OneUiIcon(
              icon: '$tabler/heart.svg',
              size: '8',
              semanticsLabel: 'tabler heart',
            ),
            label: 'Tabler heart.svg',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: 'search', size: '8', semanticsLabel: 'jio search'),
            label: "Jio 'search'",
          ),
          _iconShowcaseCell(
            context,
            icon: OneUiIcon(
              icon: '$material/search.svg',
              size: '8',
              semanticsLabel: 'material search',
            ),
            label: 'Material search.svg',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
                icon: 'settings', size: '8', semanticsLabel: 'jio settings'),
            label: "Jio 'settings'",
          ),
          _iconShowcaseCell(
            context,
            icon: OneUiIcon(
              icon: '$tabler/settings.svg',
              size: '8',
              semanticsLabel: 'tabler settings',
            ),
            label: 'Tabler settings.svg',
          ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Raster PNG — `tintRaster: true` (follows brand)',
        children: [
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: emojiHeartPng,
              size: '8',
              appearance: 'primary',
              tintRaster: true,
              semanticsLabel: 'tinted heart png primary',
            ),
            label: 'heart · primary',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: emojiStarPng,
              size: '8',
              appearance: 'sparkle',
              tintRaster: true,
              semanticsLabel: 'tinted star png sparkle',
            ),
            label: 'star · sparkle',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: emojiHeartPng,
              size: '8',
              appearance: 'negative',
              tintRaster: true,
              semanticsLabel: 'tinted heart png negative',
            ),
            label: 'heart · negative',
          ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Raster PNG — `tintRaster: false` (original colours)',
        children: [
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: emojiHeartPng,
              size: '8',
              tintRaster: false,
              semanticsLabel: 'original heart png',
            ),
            label: 'heart original',
          ),
          _iconShowcaseCell(
            context,
            icon: const OneUiIcon(
              icon: emojiStarPng,
              size: '8',
              tintRaster: false,
              semanticsLabel: 'original star png',
            ),
            label: 'star original',
          ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Emphasis on remote SVG',
        children: [
          for (final emphasis in OneUiIconEmphasis.values)
            _iconShowcaseCell(
              context,
              icon: OneUiIcon(
                icon: '$tabler/heart.svg',
                size: '8',
                appearance: 'primary',
                emphasis: emphasis,
                semanticsLabel: emphasis.name,
              ),
              label: emphasis.name,
            ),
        ],
      ),
      _iconShowcaseSubsection(
        context,
        title: 'Other patterns',
        children: [
          _iconShowcaseCell(
            context,
            icon: OneUiIcon(
              icon: '$tabler/bell.svg',
              size: '8',
              semanticsLabel: 'bell url',
            ),
            label: 'URL string',
          ),
          _iconShowcaseCell(
            context,
            icon: OneUiIcon(
              icon: widgetGlyph,
              size: '8',
              semanticsLabel: 'nested widget',
            ),
            label: 'Widget glyph',
          ),
        ],
      ),
      _iconUsageSnippet(
        context,
        "OneUiIcon(\n"
        "  icon: '$tabler/heart.svg',\n"
        "  size: '8',\n"
        "  appearance: 'primary',\n"
        ")\n\n"
        "OneUiIcon(\n"
        "  icon: '$emojiHeartPng',\n"
        "  tintRaster: true,\n"
        "  appearance: 'negative',\n"
        ")",
      ),
    ],
  );
}

/// 8. Surface context — icons on each surface mode.
Widget buildIconSurfaceContextSection(BuildContext context) {
  const modes = [
    ('default', 'page background'),
    ('minimal', 'light tint'),
    ('subtle', 'medium tint'),
    ('moderate', 'heavier tint'),
    ('bold', 'full accent colour'),
    ('elevated', 'floating card / popover'),
  ];

  const iconRow = <(OneUiIconEmphasis, String?)>[
    (OneUiIconEmphasis.high, null),
    (OneUiIconEmphasis.medium, null),
    (OneUiIconEmphasis.low, null),
    (OneUiIconEmphasis.tinted, 'primary'),
    (OneUiIconEmphasis.tintedA11y, 'primary'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, desc) in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _layoutSpacing(context, '4')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sizeLabel(context, '$mode — $desc'),
              SizedBox(height: _layoutSpacing(context, '3')),
              OneUiSurface(
                mode: mode,
                padding: EdgeInsets.all(_layoutSpacing(context, '4')),
                child: Wrap(
                  spacing: _layoutSpacing(context, '3'),
                  children: [
                    for (final (emphasis, app) in iconRow)
                      OneUiIcon(
                        icon: 'heart',
                        emphasis: emphasis,
                        appearance: app,
                        size: '8',
                        semanticsLabel: emphasis.name,
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

/// 9. In context — inline with text.
Widget buildIconInContextSection(BuildContext context) {
  final bodyM = Theme.of(context).textTheme.bodyMedium;
  final bodyS = Theme.of(context).textTheme.bodySmall;
  final labelS = Theme.of(context).textTheme.labelSmall;
  final positiveTint = resolveOneUiIconColor(
    context,
    appearance: 'positive',
    emphasis: OneUiIconEmphasis.tintedA11y,
  );

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiIcon(
            icon: 'heart',
            size: '5',
            appearance: 'negative',
            emphasis: OneUiIconEmphasis.tinted,
          ),
          SizedBox(width: _layoutSpacing(context, '2')),
          Text('Favourited item', style: bodyM),
        ],
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiIcon(
            icon: 'search',
            size: '3.5',
            emphasis: OneUiIconEmphasis.medium,
          ),
          SizedBox(width: _layoutSpacing(context, '2')),
          Text('Search results', style: bodyS),
        ],
      ),
      SizedBox(height: _layoutSpacing(context, '4')),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiIcon(
            icon: 'check',
            size: '3',
            appearance: 'positive',
            emphasis: OneUiIconEmphasis.tintedA11y,
          ),
          SizedBox(width: _layoutSpacing(context, '2')),
          Text('Verified', style: labelS?.copyWith(color: positiveTint)),
        ],
      ),
    ],
  );
}
