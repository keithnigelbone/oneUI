/// SelectableIconButton showcase — `SelectableIconButton.stories.tsx` sections.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_selectable_icon_button.dart';
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

Widget _sib(
  BuildContext context, {
  String icon = 'heart',
  OneUiSelectableIconButtonAttention attention =
      OneUiSelectableIconButtonAttention.high,
  int size = 10,
  String? sizeAlias,
  String appearance = 'auto',
  bool condensed = false,
  OneUiSelectableIconButtonShape shape =
      OneUiSelectableIconButtonShape.square,
  bool contained = true,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  bool? selected,
  bool defaultSelected = false,
  bool forceFocusRing = false,
  ValueChanged<bool>? onSelectedChange,
  required String semanticsLabel,
}) {
  return OneUiSelectableIconButton(
    icon: icon,
    attention: attention,
    size: size,
    sizeAlias: sizeAlias,
    appearance: appearance,
    condensed: condensed,
    shape: shape,
    contained: contained,
    fullWidth: fullWidth,
    disabled: disabled,
    loading: loading,
    selected: selected,
    defaultSelected: defaultSelected,
    onSelectedChange: onSelectedChange,
    forceFocusRing: forceFocusRing,
    semanticsLabel: semanticsLabel,
  );
}

Widget buildSelectableIconButtonDefaultPreview(BuildContext context) {
  return Center(
    child: _sib(
      context,
      defaultSelected: true,
      semanticsLabel: 'Like',
    ),
  );
}

Widget buildSelectableIconButtonFocusStateSection(BuildContext context) {
  Widget cell(
    OneUiSelectableIconButtonAttention attention,
    bool selected,
  ) {
    return _sib(
      context,
      attention: attention,
      defaultSelected: selected,
      forceFocusRing: selected,
      semanticsLabel: selected ? 'Selected' : 'Unselected',
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Selected'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          cell(OneUiSelectableIconButtonAttention.high, true),
          cell(OneUiSelectableIconButtonAttention.medium, true),
          cell(OneUiSelectableIconButtonAttention.low, true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Unselected'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          cell(OneUiSelectableIconButtonAttention.high, false),
          cell(OneUiSelectableIconButtonAttention.medium, false),
          cell(OneUiSelectableIconButtonAttention.low, false),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Selected'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.high,
              defaultSelected: true,
              semanticsLabel: 'High attention selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              defaultSelected: true,
              semanticsLabel: 'Medium attention selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.low,
              defaultSelected: true,
              semanticsLabel: 'Low attention selected'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Unselected (always muted ghost)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.high,
              semanticsLabel: 'High attention unselected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              semanticsLabel: 'Medium attention unselected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.low,
              semanticsLabel: 'Low attention unselected'),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonSelectedUnselectedSection(BuildContext context) {
  Widget row(OneUiSelectableIconButtonAttention attention) {
    return Padding(
      padding: EdgeInsets.only(bottom: _gap(context, '5')),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _label(context, '${attention.name} attention'),
          SizedBox(height: _gap(context, '3')),
          Wrap(
            spacing: _gap(context),
            children: [
              _sib(context,
                  attention: attention,
                  defaultSelected: true,
                  semanticsLabel: '${attention.name} selected'),
              _sib(context,
                  attention: attention,
                  semanticsLabel: '${attention.name} unselected'),
            ],
          ),
        ],
      ),
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      row(OneUiSelectableIconButtonAttention.high),
      row(OneUiSelectableIconButtonAttention.medium),
      row(OneUiSelectableIconButtonAttention.low),
    ],
  );
}

Widget buildSelectableIconButtonSizesSection(BuildContext context) {
  const labels = ['2XS', 'XS', 'S', 'M', 'L', 'XL'];
  const sizes = [4, 6, 8, 10, 12, 14];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < labels.length; i++)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Row(
            children: [
              SizedBox(
                width: _gap(context, '8'),
                child: _label(context, labels[i]),
              ),
              SizedBox(width: _gap(context)),
              _sib(context,
                  size: sizes[i],
                  defaultSelected: true,
                  semanticsLabel: '${labels[i]} selected'),
              SizedBox(width: _gap(context)),
              _sib(context,
                  size: sizes[i],
                  semanticsLabel: '${labels[i]} unselected'),
            ],
          ),
        ),
    ],
  );
}

Widget buildSelectableIconButtonShapesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, '1:1 (square, default)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              defaultSelected: true, semanticsLabel: '1:1 selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              icon: 'star',
              defaultSelected: true,
              semanticsLabel: '1:1 medium selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.low,
              icon: 'bookmark',
              defaultSelected: true,
              semanticsLabel: '1:1 low selected'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, '2:3 (wide rectangle)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              shape: OneUiSelectableIconButtonShape.wide,
              defaultSelected: true,
              semanticsLabel: '2:3 selected'),
          _sib(context,
              shape: OneUiSelectableIconButtonShape.wide,
              attention: OneUiSelectableIconButtonAttention.medium,
              icon: 'star',
              defaultSelected: true,
              semanticsLabel: '2:3 medium selected'),
          _sib(context,
              shape: OneUiSelectableIconButtonShape.wide,
              attention: OneUiSelectableIconButtonAttention.low,
              icon: 'bookmark',
              defaultSelected: true,
              semanticsLabel: '2:3 low selected'),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonContainedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Contained (default)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              contained: true,
              defaultSelected: true,
              semanticsLabel: 'Contained selected'),
          _sib(context,
              contained: true,
              semanticsLabel: 'Contained unselected'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Uncontained (icon only)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              contained: false,
              defaultSelected: true,
              semanticsLabel: 'Uncontained selected'),
          _sib(context,
              contained: false,
              semanticsLabel: 'Uncontained unselected'),
          _sib(context,
              contained: false,
              attention: OneUiSelectableIconButtonAttention.medium,
              icon: 'star',
              defaultSelected: true,
              semanticsLabel: 'Uncontained medium'),
          _sib(context,
              contained: false,
              attention: OneUiSelectableIconButtonAttention.low,
              icon: 'bookmark',
              defaultSelected: true,
              semanticsLabel: 'Uncontained low'),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonFullWidthSection(BuildContext context) {
  final w = _gap(context, '40');
  return SizedBox(
    width: w,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _sib(context,
            fullWidth: true,
            defaultSelected: true,
            semanticsLabel: 'Full width selected'),
        SizedBox(height: _gap(context, '4-5')),
        _sib(context,
            fullWidth: true,
            semanticsLabel: 'Full width unselected'),
        SizedBox(height: _gap(context, '4-5')),
        _sib(context,
            fullWidth: true,
            attention: OneUiSelectableIconButtonAttention.medium,
            icon: 'star',
            defaultSelected: true,
            semanticsLabel: 'Full width medium'),
      ],
    ),
  );
}

Widget buildSelectableIconButtonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Normal'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              size: 8, defaultSelected: true, semanticsLabel: 'S normal'),
          _sib(context,
              size: 10, defaultSelected: true, semanticsLabel: 'M normal'),
          _sib(context,
              size: 12, defaultSelected: true, semanticsLabel: 'L normal'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Condensed (same icon, reduced container)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              size: 8,
              condensed: true,
              defaultSelected: true,
              semanticsLabel: 'S condensed'),
          _sib(context,
              size: 10,
              condensed: true,
              defaultSelected: true,
              semanticsLabel: 'M condensed'),
          _sib(context,
              size: 12,
              condensed: true,
              defaultSelected: true,
              semanticsLabel: 'L condensed'),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonAppearancesSection(BuildContext context) {
  const roles = [
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'brand-bg',
    'positive',
    'negative',
    'warning',
    'informative',
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final role in roles)
        if (OneUiSurfaceScope.isAppearanceConfigured(context, role))
          Padding(
            padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label(context, role),
                SizedBox(height: _gap(context, '3')),
                Wrap(
                  spacing: _gap(context),
                  children: [
                    _sib(context,
                        appearance: role,
                        attention: OneUiSelectableIconButtonAttention.high,
                        defaultSelected: true,
                        semanticsLabel: '$role high selected'),
                    _sib(context,
                        appearance: role,
                        attention: OneUiSelectableIconButtonAttention.medium,
                        defaultSelected: true,
                        semanticsLabel: '$role medium selected'),
                    _sib(context,
                        appearance: role,
                        attention: OneUiSelectableIconButtonAttention.low,
                        defaultSelected: true,
                        semanticsLabel: '$role low selected'),
                    _sib(context,
                        appearance: role,
                        semanticsLabel: '$role unselected'),
                  ],
                ),
              ],
            ),
          ),
    ],
  );
}

Widget buildSelectableIconButtonStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Disabled unselected'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.high,
              disabled: true,
              semanticsLabel: 'High disabled'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              disabled: true,
              semanticsLabel: 'Medium disabled'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.low,
              disabled: true,
              semanticsLabel: 'Low disabled'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Disabled selected'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.high,
              disabled: true,
              defaultSelected: true,
              semanticsLabel: 'High disabled selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              disabled: true,
              defaultSelected: true,
              semanticsLabel: 'Medium disabled selected'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.low,
              disabled: true,
              defaultSelected: true,
              semanticsLabel: 'Low disabled selected'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Loading'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.high,
              loading: true,
              semanticsLabel: 'Loading'),
          _sib(context,
              attention: OneUiSelectableIconButtonAttention.medium,
              loading: true,
              defaultSelected: true,
              semanticsLabel: 'Loading selected'),
        ],
      ),
    ],
  );
}

Widget buildSelectableIconButtonSurfaceContextSection(BuildContext context) {
  const modes = [
    'default',
    'minimal',
    'subtle',
    'moderate',
    'bold',
    'elevated',
  ];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(context, mode),
              SizedBox(height: _gap(context, '3')),
              OneUiSurface(
                mode: mode,
                padding: EdgeInsets.all(_gap(context, '5')),
                borderRadius: BorderRadius.circular(_gap(context, '4')),
                child: Wrap(
                  spacing: _gap(context),
                  runSpacing: _gap(context, '3'),
                  children: [
                    _sib(context,
                        attention: OneUiSelectableIconButtonAttention.high,
                        defaultSelected: true,
                        semanticsLabel: 'High selected'),
                    _sib(context,
                        attention: OneUiSelectableIconButtonAttention.medium,
                        defaultSelected: true,
                        semanticsLabel: 'Medium selected'),
                    _sib(context,
                        attention: OneUiSelectableIconButtonAttention.low,
                        defaultSelected: true,
                        semanticsLabel: 'Low selected'),
                    _sib(context, semanticsLabel: 'Unselected'),
                  ],
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSelectableIconButtonRealWorldFavouriteSection(BuildContext context) {
  return _FavouriteDemo();
}

class _FavouriteDemo extends StatefulWidget {
  @override
  State<_FavouriteDemo> createState() => _FavouriteDemoState();
}

class _FavouriteDemoState extends State<_FavouriteDemo> {
  bool _saved = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        OneUiSelectableIconButton(
          icon: 'bookmark',
          attention: OneUiSelectableIconButtonAttention.high,
          selected: _saved,
          onSelectedChange: (v) => setState(() => _saved = v),
          semanticsLabel: _saved ? 'Remove bookmark' : 'Bookmark',
        ),
        SizedBox(height: _gap(context, '3')),
        _label(context, _saved ? 'Saved' : 'Save'),
      ],
    );
  }
}
