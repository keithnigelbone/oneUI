/// IconButton showcase — `IconButton.stories.tsx` sections.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_icon_button.dart';
import '../widgets/one_ui_icon_button_types.dart';
import '../widgets/one_ui_surface.dart';

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
  return typo?.emphasisStyle('label', 'XS', emphasis: 'low') ??
      Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
}

Widget _label(BuildContext context, String text) {
  return Text(text, style: _caption(context));
}

Widget _addButton(
  BuildContext context, {
  OneUiIconButtonAttention? attention,
  OneUiIconButtonVariant? variant,
  int size = 10,
  String? sizeAlias,
  String appearance = 'auto',
  bool condensed = false,
  bool contained = true,
  OneUiIconButtonLayout layout = OneUiIconButtonLayout.square,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  bool autofocus = false,
  bool forceFocusRing = false,
  required String semanticsLabel,
}) {
  return OneUiIconButton(
    icon: 'add',
    attention: attention,
    variant: variant,
    size: size,
    sizeAlias: sizeAlias,
    appearance: appearance,
    condensed: condensed,
    contained: contained,
    layout: layout,
    fullWidth: fullWidth,
    disabled: disabled,
    loading: loading,
    autofocus: autofocus,
    forceFocusRing: forceFocusRing,
    semanticsLabel: semanticsLabel,
    onPressed: disabled || loading ? null : () {},
  );
}

Widget buildIconButtonDefaultPreview(BuildContext context) {
  return Center(
    child: _addButton(context, semanticsLabel: 'Add item'),
  );
}

Widget buildIconButtonAttentionLevelsSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '3-5'),
    children: [
      _addButton(context,
          attention: OneUiIconButtonAttention.high, semanticsLabel: 'High'),
      _addButton(context,
          attention: OneUiIconButtonAttention.medium, semanticsLabel: 'Medium'),
      _addButton(context,
          attention: OneUiIconButtonAttention.low, semanticsLabel: 'Low'),
    ],
  );
}

Widget buildIconButtonSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '3-5'),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final entry in kOneUiIconButtonSizeAliases.entries)
        if (['2xs', 'xs', 's', 'm', 'l', 'xl'].contains(entry.key))
          _addButton(
            context,
            sizeAlias: entry.key,
            semanticsLabel: entry.key.toUpperCase(),
          ),
    ],
  );
}

Widget buildIconButtonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Normal'),
      Wrap(
        spacing: _gap(context, '3-5'),
        children: [
          _addButton(context, sizeAlias: 's', semanticsLabel: 'S'),
          _addButton(context, sizeAlias: 'm', semanticsLabel: 'M'),
          _addButton(context, sizeAlias: 'l', semanticsLabel: 'L'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Condensed (same icon size, reduced container)'),
      Wrap(
        spacing: _gap(context, '3-5'),
        children: [
          _addButton(context,
              sizeAlias: 's', condensed: true, semanticsLabel: 'S condensed'),
          _addButton(context,
              sizeAlias: 'm', condensed: true, semanticsLabel: 'M condensed'),
          _addButton(context,
              sizeAlias: 'l', condensed: true, semanticsLabel: 'L condensed'),
        ],
      ),
    ],
  );
}

Widget buildIconButtonStatesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '3-5'),
    children: [
      _addButton(context, semanticsLabel: 'Default'),
      _addButton(context, disabled: true, semanticsLabel: 'Disabled'),
      _addButton(context, loading: true, semanticsLabel: 'Loading'),
    ],
  );
}

Widget buildIconButtonFocusStateSection(BuildContext context) {
  final gap = _gap(context);
  final gapLarge = _gap(context, '5');

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(
        context,
        'Idle vs keyboard focus — ring mirrors web `:focus-visible` (inner gap '
        '`--Stroke-XL` / `--Surface-Halo-Gap`, outer `--Focus-Outline`). '
        'Use Tab to move focus; Enter or Space activates the control. '
        'The Focus column uses `forceFocusRing` like web `data-force-state="focus"`.',
      ),
      SizedBox(height: gap),
      Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(gap),
                child: _addButton(context, semanticsLabel: 'Idle'),
              ),
              SizedBox(height: _gap(context, '3')),
              _label(context, 'Idle'),
            ],
          ),
          SizedBox(width: gapLarge),
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(gap),
                child: _addButton(
                  context,
                  forceFocusRing: true,
                  semanticsLabel: 'Focused',
                ),
              ),
              SizedBox(height: _gap(context, '3')),
              _label(context, 'Focus (forceFocusRing)'),
            ],
          ),
        ],
      ),
      SizedBox(height: gapLarge),
      _label(context, 'Keyboard traversal (Tab → Enter / Space)'),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _addButton(
            context,
            autofocus: true,
            semanticsLabel: 'First (autofocus)',
          ),
          _addButton(context, semanticsLabel: 'Second'),
          _addButton(
            context,
            attention: OneUiIconButtonAttention.medium,
            semanticsLabel: 'Third',
          ),
          _addButton(
            context,
            attention: OneUiIconButtonAttention.low,
            semanticsLabel: 'Low attention',
          ),
        ],
      ),
    ],
  );
}

Widget buildIconButtonAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in OneUiSurfaceScope.appearanceRolesForBrand(context))
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(context, role),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context, '3-5'),
                children: [
                  _addButton(
                    context,
                    appearance: role,
                    attention: OneUiIconButtonAttention.high,
                    semanticsLabel: '$role high',
                  ),
                  _addButton(
                    context,
                    appearance: role,
                    attention: OneUiIconButtonAttention.medium,
                    semanticsLabel: '$role medium',
                  ),
                  _addButton(
                    context,
                    appearance: role,
                    attention: OneUiIconButtonAttention.low,
                    semanticsLabel: '$role low',
                  ),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildIconButtonShapeLayoutsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, '1:1 (square, default)'),
      Wrap(
        spacing: _gap(context, '3-5'),
        children: [
          for (final a in OneUiIconButtonAttention.values)
            _addButton(
              context,
              layout: OneUiIconButtonLayout.square,
              attention: a,
              semanticsLabel: '1:1 ${a.name}',
            ),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, '3:2 (wide rectangle)'),
      Wrap(
        spacing: _gap(context, '3-5'),
        children: [
          for (final a in OneUiIconButtonAttention.values)
            _addButton(
              context,
              layout: OneUiIconButtonLayout.wide,
              attention: a,
              semanticsLabel: '3:2 ${a.name}',
            ),
        ],
      ),
    ],
  );
}

Widget buildIconButtonFullWidthSection(BuildContext context) {
  return SizedBox(
    width: 320,
    child: Column(
      children: [
        for (final a in OneUiIconButtonAttention.values)
          Padding(
            padding: EdgeInsets.only(bottom: _gap(context, '3-5')),
            child: _addButton(
              context,
              fullWidth: true,
              attention: a,
              semanticsLabel: 'Full width ${a.name}',
            ),
          ),
      ],
    ),
  );
}

Widget buildIconButtonResponsiveSection(BuildContext context) {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      _addButton(context, semanticsLabel: 'Menu'),
      _addButton(context, semanticsLabel: 'Search'),
      _addButton(context, semanticsLabel: 'Notifications'),
      _addButton(context, semanticsLabel: 'Profile'),
    ],
  );
}

Widget buildIconButtonThemesSection(BuildContext context) {
  const modes = [
    ('default', 'default'),
    ('minimal', 'minimal'),
    ('subtle', 'subtle'),
    ('elevated', 'elevated'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (mode, label) in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(width: 90, child: _label(context, label)),
              Expanded(
                child: OneUiSurface(
                  mode: mode,
                  padding: EdgeInsets.all(_gap(context, '4-5')),
                  child: Wrap(
                    spacing: _gap(context, '4'),
                    children: [
                      for (final a in OneUiIconButtonAttention.values)
                        _addButton(
                          context,
                          attention: a,
                          semanticsLabel: '$label ${a.name}',
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

Widget buildIconButtonSurfaceContextSection(BuildContext context) {
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
                  spacing: _gap(context, '4'),
                  children: [
                    for (final a in OneUiIconButtonAttention.values)
                      _addButton(
                        context,
                        attention: a,
                        semanticsLabel: '$mode ${a.name}',
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

Widget buildIconButtonDensitySection(BuildContext context) {
  final parent = OneUiScope.of(context);
  const densities = ['compact', 'default', 'open'];
  const sizes = ['s', 'm', 'l'];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(
        context,
        'Three density columns (compact / default / open). Toolbar density still applies to the page; each column uses its own [OneUiScope.density] like web `data-6-Density`.',
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
                      right:
                          i == densities.length - 1 ? 0 : _gap(context, '2')),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _label(context, densities[i]),
                      SizedBox(height: _gap(context, '3')),
                      for (var j = 0; j < sizes.length; j++) ...[
                        if (j > 0) SizedBox(height: _gap(context, '3-5')),
                        _addButton(
                          context,
                          sizeAlias: sizes[j],
                          semanticsLabel:
                              '${densities[i]} ${sizes[j].toUpperCase()}',
                        ),
                      ],
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

Widget buildIconButtonLoadingStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: _gap(context, '3-5'),
        children: [
          for (final a in OneUiIconButtonAttention.values)
            _addButton(
              context,
              loading: true,
              attention: a,
              semanticsLabel: 'Loading ${a.name}',
            ),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      Wrap(
        spacing: _gap(context, '3-5'),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final entry in kOneUiIconButtonSizeAliases.entries)
            if (['2xs', 'xs', 's', 'm', 'l', 'xl'].contains(entry.key))
              _addButton(
                context,
                loading: true,
                sizeAlias: entry.key,
                semanticsLabel: 'Loading ${entry.key}',
              ),
        ],
      ),
    ],
  );
}

Widget buildIconButtonMotionSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context,
          'Press and hold to see tap scale + surface colour transition.'),
      SizedBox(height: _gap(context, '4')),
      for (final a in OneUiIconButtonAttention.values)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '3-5')),
          child: _addButton(
            context,
            attention: a,
            semanticsLabel: '${a.name} icon button',
          ),
        ),
    ],
  );
}
