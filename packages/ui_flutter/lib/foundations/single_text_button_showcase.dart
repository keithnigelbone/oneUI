/// SingleTextButton showcase — `SingleTextButton.stories.tsx` sections.
library;

import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_single_text_button.dart';
import '../widgets/one_ui_single_text_button_types.dart';
import '../widgets/one_ui_surface.dart';
import 'dimensions_resolve.dart';

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

Widget _stb(
  BuildContext context, {
  String label = 'Ag',
  OneUiSingleTextButtonAttention attention = OneUiSingleTextButtonAttention.high,
  String size = 'm',
  String appearance = 'auto',
  bool condensed = false,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  VoidCallback? onPressed,
}) {
  return OneUiSingleTextButton(
    label: label,
    attention: attention,
    size: size,
    appearance: appearance,
    condensed: condensed,
    fullWidth: fullWidth,
    disabled: disabled,
    loading: loading,
    onPressed: disabled || loading ? null : onPressed ?? () {},
  );
}

Widget buildSingleTextButtonDefaultPreview(BuildContext context) {
  return Center(child: _stb(context));
}

Widget buildSingleTextButtonAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Attention drives the visual'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _stb(context, attention: OneUiSingleTextButtonAttention.high),
          _stb(context, attention: OneUiSingleTextButtonAttention.medium),
          _stb(context, attention: OneUiSingleTextButtonAttention.low),
        ],
      ),
    ],
  );
}

Widget buildSingleTextButtonSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in OneUiSingleTextButtonAttention.values)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(context, '${attention.name} attention'),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context, '4'),
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _stb(context, attention: attention, size: 's'),
                  _stb(context, attention: attention, size: 'm'),
                  _stb(context, attention: attention, size: 'l'),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSingleTextButtonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Normal'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _stb(context, size: 's'),
          _stb(context, size: 'm'),
          _stb(context, size: 'l'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Condensed (same typography, reduced size)'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _stb(context, size: 's', condensed: true),
          _stb(context, size: 'm', condensed: true),
          _stb(context, size: 'l', condensed: true),
        ],
      ),
    ],
  );
}

Widget buildSingleTextButtonAppearancesSection(BuildContext context) {
  const roles = [
    'primary',
    'secondary',
    'tertiary',
    'quaternary',
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
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(context, role),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context, '4'),
                children: [
                  _stb(context, appearance: role, attention: OneUiSingleTextButtonAttention.high),
                  _stb(context, appearance: role, attention: OneUiSingleTextButtonAttention.medium),
                  _stb(context, appearance: role, attention: OneUiSingleTextButtonAttention.low),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSingleTextButtonStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label(context, 'Disabled'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _stb(context, attention: OneUiSingleTextButtonAttention.high, disabled: true),
          _stb(context, attention: OneUiSingleTextButtonAttention.medium, disabled: true),
          _stb(context, attention: OneUiSingleTextButtonAttention.low, disabled: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _label(context, 'Loading'),
      SizedBox(height: _gap(context, '3')),
      Wrap(
        spacing: _gap(context, '4'),
        children: [
          _stb(context, attention: OneUiSingleTextButtonAttention.high, loading: true),
          _stb(context, attention: OneUiSingleTextButtonAttention.medium, loading: true),
          _stb(context, attention: OneUiSingleTextButtonAttention.low, loading: true),
        ],
      ),
    ],
  );
}

Widget buildSingleTextButtonSurfaceContextSection(BuildContext context) {
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
                padding: EdgeInsets.all(_gap(context, '5')),
                child: Wrap(
                  spacing: _gap(context, '4'),
                  children: [
                    for (final a in OneUiSingleTextButtonAttention.values)
                      _stb(context, attention: a),
                  ],
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSingleTextButtonRealWorldInitialsRowSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '3'),
    runSpacing: _gap(context, '3'),
    children: [
      _stb(context, attention: OneUiSingleTextButtonAttention.high, appearance: 'primary', label: 'Ak'),
      _stb(context, attention: OneUiSingleTextButtonAttention.medium, appearance: 'secondary', label: 'Mw'),
      _stb(context, attention: OneUiSingleTextButtonAttention.medium, appearance: 'tertiary', label: 'Jp'),
      _stb(context, attention: OneUiSingleTextButtonAttention.medium, appearance: 'positive', label: 'Ra'),
      _stb(context, attention: OneUiSingleTextButtonAttention.low, appearance: 'neutral', label: '+3'),
    ],
  );
}
