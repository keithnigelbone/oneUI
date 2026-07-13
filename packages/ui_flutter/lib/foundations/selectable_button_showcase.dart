/// SelectableButton showcase — `SelectableButton.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_selectable_button.dart';
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

Widget _sectionLabel(BuildContext context, String text) {
  return Padding(
    padding: EdgeInsets.only(bottom: _gap(context, '3')),
    child: Text(text, style: _caption(context)),
  );
}

Widget _heartIcon(String size) => OneUiIcon(
      icon: 'heart',
      size: size,
      excludeFromSemantics: true,
    );

Widget _bookmarkIcon(String size) => OneUiIcon(
      icon: 'bookmark',
      size: size,
      excludeFromSemantics: true,
    );

Widget _sb(
  BuildContext context, {
  String label = 'Like',
  String size = 'm',
  String attention = 'high',
  String appearance = 'auto',
  bool contained = true,
  bool condensed = false,
  bool fullWidth = false,
  bool selected = true,
  bool disabled = false,
  bool loading = false,
  Widget? start,
  Widget? end,
  bool autofocus = false,
  bool forceFocusRing = false,
}) {
  return OneUiSelectableButton(
    label: label,
    size: size,
    attention: attention,
    appearance: appearance,
    contained: contained,
    condensed: condensed,
    fullWidth: fullWidth,
    defaultSelected: selected,
    disabled: disabled,
    loading: loading,
    start: start,
    end: end,
    autofocus: autofocus,
    forceFocusRing: forceFocusRing,
  );
}

Widget buildSelectableButtonDefaultPreview(BuildContext context) {
  return Center(
    child: _sb(context, label: 'Like', selected: true),
  );
}

Widget buildSelectableButtonAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Selected'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context, label: 'High', attention: 'high', selected: true),
          _sb(context, label: 'Medium', attention: 'medium', selected: true),
          _sb(context, label: 'Low', attention: 'low', selected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Unselected (always muted ghost)'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context, label: 'High', attention: 'high', selected: false),
          _sb(context, label: 'Medium', attention: 'medium', selected: false),
          _sb(context, label: 'Low', attention: 'low', selected: false),
        ],
      ),
    ],
  );
}

Widget buildSelectableButtonSelectedUnselectedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in kOneUiSelectableButtonAttentions) ...[
        _sectionLabel(context, '$attention attention'),
        Wrap(
          spacing: _gap(context),
          children: [
            _sb(context, label: 'Selected', attention: attention, selected: true),
            _sb(context, label: 'Unselected', attention: attention, selected: false),
          ],
        ),
        SizedBox(height: _gap(context, '5')),
      ],
    ],
  );
}

Widget buildSelectableButtonSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context),
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      for (final size in kOneUiSelectableButtonSizes)
        _sb(context, label: size.toUpperCase(), size: size, selected: true),
    ],
  );
}

Widget buildSelectableButtonContainedModeSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(
          context, 'contained=true — pill container with background, border, padding'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context,
              label: 'Liked',
              attention: 'high',
              selected: true,
              start: _heartIcon('5')),
          _sb(context, label: 'Following', attention: 'medium', selected: true),
          _sb(context, label: 'Saved', attention: 'low', selected: true),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'contained=false — inline text only (no container)'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context,
              label: 'Liked',
              contained: false,
              attention: 'high',
              selected: true,
              start: _heartIcon('5')),
          _sb(context,
              label: 'Following',
              contained: false,
              attention: 'medium',
              selected: true),
          _sb(context,
              label: 'Saved',
              contained: false,
              attention: 'low',
              selected: true),
        ],
      ),
    ],
  );
}

Widget buildSelectableButtonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Normal'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final size in ['s', 'm', 'l'])
            _sb(context, label: size.toUpperCase(), size: size, selected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Condensed (same typography, reduced height + padding)'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final size in ['s', 'm', 'l'])
            _sb(context,
                label: size.toUpperCase(),
                size: size,
                condensed: true,
                selected: true),
        ],
      ),
    ],
  );
}

Widget buildSelectableButtonWithSlotsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context,
              label: 'Like',
              selected: true,
              start: _heartIcon(selectableButtonSlotIconSize('m'))),
          _sb(context,
              label: 'Save',
              selected: true,
              end: _bookmarkIcon(selectableButtonSlotIconSize('m'))),
          _sb(context,
              label: 'Like & Save',
              selected: true,
              start: _heartIcon(selectableButtonSlotIconSize('m')),
              end: _bookmarkIcon(selectableButtonSlotIconSize('m'))),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context,
              label: 'Like',
              attention: 'medium',
              selected: true,
              start: _heartIcon(selectableButtonSlotIconSize('m'))),
          _sb(context,
              label: 'Bookmark',
              attention: 'low',
              selected: true,
              start: _bookmarkIcon(selectableButtonSlotIconSize('m'))),
        ],
      ),
    ],
  );
}

Widget buildSelectableButtonAppearancesSection(BuildContext context) {
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
      for (final role in roles) ...[
        _sectionLabel(context, role),
        Wrap(
          spacing: _gap(context),
          children: [
            _sb(context, label: 'High', appearance: role, attention: 'high', selected: true),
            _sb(context, label: 'Medium', appearance: role, attention: 'medium', selected: true),
            _sb(context, label: 'Low', appearance: role, attention: 'low', selected: true),
            _sb(context, label: 'Unselected', appearance: role, attention: 'high', selected: false),
          ],
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

Widget buildSelectableButtonStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Disabled unselected'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context, label: 'High', attention: 'high', disabled: true, selected: false),
          _sb(context, label: 'Medium', attention: 'medium', disabled: true, selected: false),
          _sb(context, label: 'Low', attention: 'low', disabled: true, selected: false),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Disabled selected'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context, label: 'High', attention: 'high', disabled: true, selected: true),
          _sb(context, label: 'Medium', attention: 'medium', disabled: true, selected: true),
          _sb(context, label: 'Low', attention: 'low', disabled: true, selected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Loading'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sb(context, label: 'Loading', attention: 'high', loading: true, selected: false),
          _sb(context, label: 'Loading', attention: 'medium', loading: true, selected: true),
        ],
      ),
    ],
  );
}

Widget buildSelectableButtonSurfaceContextSection(BuildContext context) {
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
      for (final (mode, desc) in modes) ...[
        _sectionLabel(context, '$mode — $desc'),
        OneUiSurface(
          mode: mode,
          child: Padding(
            padding: EdgeInsets.all(_gap(context, '5')),
            child: Wrap(
              spacing: _gap(context),
              runSpacing: _gap(context, '3'),
              children: [
                _sb(context, label: 'High', attention: 'high', selected: true),
                _sb(context, label: 'Medium', attention: 'medium', selected: true),
                _sb(context, label: 'Low', attention: 'low', selected: true),
                _sb(context, label: 'Unselected', attention: 'high', selected: false),
              ],
            ),
          ),
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

Widget buildSelectableButtonFocusStateSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Idle vs keyboard focus — Tab to move; Enter / Space toggles selection.',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      Wrap(
        spacing: _gap(context, '6'),
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(_gap(context)),
                child: _sb(context, label: 'Select'),
              ),
              Text('Idle', style: _caption(context)),
            ],
          ),
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(_gap(context)),
                child: _sb(context, label: 'Select', forceFocusRing: true),
              ),
              Text('Focus (forceFocusRing)', style: _caption(context)),
            ],
          ),
        ],
      ),
    ],
  );
}

class _LikeButtonDemo extends StatefulWidget {
  @override
  State<_LikeButtonDemo> createState() => _LikeButtonDemoState();
}

class _LikeButtonDemoState extends State<_LikeButtonDemo> {
  bool _liked = false;

  @override
  Widget build(BuildContext context) {
    return OneUiSelectableButton(
      attention: 'high',
      selected: _liked,
      onSelectedChange: (v) => setState(() => _liked = v),
      start: _heartIcon(selectableButtonSlotIconSize('m')),
      label: _liked ? 'Liked' : 'Like',
    );
  }
}

Widget buildSelectableButtonRealWorldSection(BuildContext context) {
  return Center(child: _LikeButtonDemo());
}

Widget buildSelectableButtonFullWidthSection(BuildContext context) {
  final width = _gap(context, '40');
  return SizedBox(
    width: width,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final attention in kOneUiSelectableButtonAttentions) ...[
          _sb(context,
              label: 'Liked',
              attention: attention,
              fullWidth: true,
              selected: true,
              start: _heartIcon(selectableButtonSlotIconSize('m'))),
          SizedBox(height: _gap(context, '2')),
          _sb(context,
              label: 'Like',
              attention: attention,
              fullWidth: true,
              selected: false,
              start: _heartIcon(selectableButtonSlotIconSize('m'))),
          SizedBox(height: _gap(context, '4')),
        ],
      ],
    ),
  );
}
