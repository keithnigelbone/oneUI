import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import '../widgets/one_ui_icon_contained.dart';
import '../widgets/one_ui_icon_contained_types.dart';
import '../widgets/one_ui_surface.dart';

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

/// 1. Default preview.
Widget buildIconContainedDefaultPreview(BuildContext context) {
  return const Center(
    child: OneUiIconContained(
      icon: 'heart',
      semanticsLabel: 'Heart',
    ),
  );
}

/// 2. Attention levels.
Widget buildIconContainedAttentionLevelsSection(BuildContext context) {
  return Wrap(
    spacing: _layoutSpacing(context, '4-5'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final attention in OneUiIconContainedAttention.values)
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiIconContained(
              icon: 'heart',
              attention: attention,
              semanticsLabel: attention.name,
            ),
            SizedBox(height: _layoutSpacing(context, '3')),
            _sizeLabel(context, attention.name),
          ],
        ),
    ],
  );
}

/// 3. Sizes table (both attention levels).
Widget buildIconContainedSizesSection(BuildContext context) {
  return Table(
    defaultVerticalAlignment: TableCellVerticalAlignment.middle,
    columnWidths: {
      0: const IntrinsicColumnWidth(),
      for (var i = 1; i <= kOneUiIconContainedSizes.length; i++)
        i: const FlexColumnWidth(),
    },
    children: [
      TableRow(
        children: [
          _sizeLabel(context, 'Attention'),
          for (final size in kOneUiIconContainedSizes)
            Center(child: _sizeLabel(context, size.toUpperCase())),
        ],
      ),
      for (final attention in OneUiIconContainedAttention.values)
        TableRow(
          children: [
            Padding(
              padding: EdgeInsets.only(right: _layoutSpacing(context, '4')),
              child: _sizeLabel(context, attention.name),
            ),
            for (final size in kOneUiIconContainedSizes)
              Padding(
                padding: EdgeInsets.all(_layoutSpacing(context, '2')),
                child: Center(
                  child: OneUiIconContained(
                    icon: 'home',
                    attention: attention,
                    size: size,
                    semanticsLabel: '${attention.name} $size',
                  ),
                ),
              ),
          ],
        ),
    ],
  );
}

/// 4. States — enabled / disabled × attention.
Widget buildIconContainedStatesSection(BuildContext context) {
  return Wrap(
    spacing: _layoutSpacing(context, '5'),
    runSpacing: _layoutSpacing(context, '3'),
    children: [
      for (final (attention, disabled, label) in [
        (OneUiIconContainedAttention.high, false, 'High'),
        (OneUiIconContainedAttention.high, true, 'High Disabled'),
        (OneUiIconContainedAttention.medium, false, 'Medium'),
        (OneUiIconContainedAttention.medium, true, 'Medium Disabled'),
      ])
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            OneUiIconContained(
              icon: 'home',
              attention: attention,
              disabled: disabled,
              semanticsLabel: label,
            ),
            SizedBox(height: _layoutSpacing(context, '3')),
            _sizeLabel(context, label),
          ],
        ),
    ],
  );
}

/// 5. With icons.
Widget buildIconContainedWithIconsSection(BuildContext context) {
  const names = ['heart', 'check', 'star'];
  return Wrap(
    spacing: _layoutSpacing(context, '4-5'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final name in names) ...[
        OneUiIconContained(icon: name, semanticsLabel: name),
        OneUiIconContained(
          icon: name,
          attention: OneUiIconContainedAttention.medium,
          semanticsLabel: '$name medium',
        ),
      ],
    ],
  );
}

/// 7. Surface context.
Widget buildIconContainedSurfaceContextSection(BuildContext context) {
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
              _sizeLabel(context, '$mode — $desc'),
              SizedBox(height: _layoutSpacing(context, '3')),
              OneUiSurface(
                mode: mode,
                padding: EdgeInsets.all(_layoutSpacing(context, '4-5')),
                child: Wrap(
                  spacing: _layoutSpacing(context, '3-5'),
                  children: [
                    const OneUiIconContained(
                      icon: 'heart',
                      attention: OneUiIconContainedAttention.high,
                      semanticsLabel: 'High',
                    ),
                    const OneUiIconContained(
                      icon: 'heart',
                      attention: OneUiIconContainedAttention.medium,
                      semanticsLabel: 'Medium',
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

/// 8. Appearances — 9 roles × high / medium.
Widget buildIconContainedAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in OneUiIconContainedAttention.values)
        Padding(
          padding: EdgeInsets.only(bottom: _layoutSpacing(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 72,
                child: _sizeLabel(context, attention.name),
              ),
              Expanded(
                child: Wrap(
                  spacing: _layoutSpacing(context, '3-5'),
                  runSpacing: _layoutSpacing(context, '2'),
                  children: [
                    for (final app in kOneUiIconContainedAppearances)
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          OneUiIconContained(
                            icon: 'heart',
                            attention: attention,
                            appearance: app,
                            semanticsLabel: '${attention.name} $app',
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
