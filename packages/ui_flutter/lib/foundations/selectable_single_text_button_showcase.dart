/// SelectableSingleTextButton showcase — `SelectableSingleTextButton.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_root_surface_scope.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_selectable_single_text_button.dart';
import '../widgets/one_ui_surface.dart';
import '../widgets/convex_design_system_guard.dart';
import '../utils/one_ui_hex_color.dart';

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

Color _secondarySurfaceFill(BuildContext context, String mode) {
  final root = OneUiRootSurfaceScope.of(context);
  final role = root.resolvedRoles['secondary'] ?? root.resolvedRoles['neutral'];
  if (role == null) {
    return Theme.of(context).colorScheme.surface;
  }
  final hex = role.surfaces[mode] ?? role.surfaces[kSurfaceDefault];
  return oneUiHexColor(hex ?? '#FFFFFF');
}

Widget _sstb(
  BuildContext context, {
  String label = 'Ag',
  OneUiSelectableSingleTextButtonAttention attention =
      OneUiSelectableSingleTextButtonAttention.high,
  String size = 'm',
  String appearance = 'auto',
  bool condensed = false,
  bool fullWidth = false,
  bool selected = false,
  bool defaultSelected = false,
  bool disabled = false,
  bool loading = false,
  bool autofocus = false,
  bool forceFocusRing = false,
  ValueChanged<bool>? onSelectedChange,
}) {
  return OneUiSelectableSingleTextButton(
    label: label,
    attention: attention,
    size: size,
    appearance: appearance,
    condensed: condensed,
    fullWidth: fullWidth,
    selected: selected ? true : null,
    defaultSelected: defaultSelected || selected,
    disabled: disabled,
    loading: loading,
    autofocus: autofocus,
    forceFocusRing: forceFocusRing,
    onSelectedChange: onSelectedChange,
    semanticsLabel: label,
  );
}

Widget buildSelectableSingleTextButtonDefaultPreview(BuildContext context) {
  return Center(
    child: _sstb(context, defaultSelected: true),
  );
}

Widget buildSelectableSingleTextButtonFocusStateSection(BuildContext context) {
  const columns = [
    (label: 'Idle', selected: false, focus: false),
    (label: 'Focus', selected: false, focus: true),
    (label: 'Idle selected', selected: true, focus: false),
    (label: 'Focus selected', selected: true, focus: true),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(
        context,
        'Idle vs keyboard focus — mirrors web `FocusStateGrid` / `data-force-state="focus"`.',
      ),
      for (final attention in OneUiSelectableSingleTextButtonAttention.values) ...[
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                attention.name,
                style: _caption(context),
              ),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context, '5'),
                runSpacing: _gap(context, '4'),
                crossAxisAlignment: WrapCrossAlignment.end,
                children: [
                  for (final col in columns)
                    Column(
                      children: [
                        Padding(
                          padding: EdgeInsets.all(_gap(context)),
                          child: _sstb(
                            context,
                            attention: attention,
                            defaultSelected: col.selected,
                            forceFocusRing: col.focus,
                          ),
                        ),
                        SizedBox(height: _gap(context, '3')),
                        Text(col.label, style: _caption(context)),
                      ],
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    ],
  );
}

Widget buildSelectableSingleTextButtonAttentionLevelsSection(
    BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Selected'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.high,
              defaultSelected: true),
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.medium,
              defaultSelected: true),
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.low,
              defaultSelected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Unselected (always muted ghost)'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.high),
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.medium),
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.low),
        ],
      ),
    ],
  );
}

Widget buildSelectableSingleTextButtonSelectedUnselectedSection(
    BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in OneUiSelectableSingleTextButtonAttention.values)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${attention.name} attention', style: _caption(context)),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context),
                children: [
                  _sstb(context, attention: attention, defaultSelected: true),
                  _sstb(context, attention: attention),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSelectableSingleTextButtonSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Selected'),
      Wrap(
        spacing: _gap(context),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final sz in kOneUiSelectableSingleTextButtonSizes)
            _sstb(context, size: sz, defaultSelected: true, label: 'Ag'),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Unselected'),
      Wrap(
        spacing: _gap(context),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final sz in kOneUiSelectableSingleTextButtonSizes)
            _sstb(context, size: sz, label: 'Ag'),
        ],
      ),
    ],
  );
}

Widget buildSelectableSingleTextButtonCondensedSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Normal'),
      Wrap(
        spacing: _gap(context),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final sz in kOneUiSelectableSingleTextButtonSizes)
            _sstb(context, size: sz, defaultSelected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Condensed (same typography, reduced size)'),
      Wrap(
        spacing: _gap(context),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final sz in kOneUiSelectableSingleTextButtonSizes)
            _sstb(context, size: sz, condensed: true, defaultSelected: true),
        ],
      ),
    ],
  );
}

Widget buildSelectableSingleTextButtonAppearancesSection(BuildContext context) {
  final roles = OneUiSurfaceScope.appearanceRolesForBrand(context);
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
          padding: EdgeInsets.only(bottom: _gap(context, '4-5')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(role, style: _caption(context)),
              SizedBox(height: _gap(context, '3')),
              Wrap(
                spacing: _gap(context),
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _sstb(context,
                      appearance: role,
                      attention: OneUiSelectableSingleTextButtonAttention.high,
                      defaultSelected: true),
                  _sstb(context,
                      appearance: role,
                      attention:
                          OneUiSelectableSingleTextButtonAttention.medium,
                      defaultSelected: true),
                  _sstb(context,
                      appearance: role,
                      attention: OneUiSelectableSingleTextButtonAttention.low,
                      defaultSelected: true),
                  _sstb(context,
                      appearance: role,
                      attention: OneUiSelectableSingleTextButtonAttention.high),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildSelectableSingleTextButtonStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Disabled unselected'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final a in OneUiSelectableSingleTextButtonAttention.values)
            _sstb(context, attention: a, disabled: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Disabled selected'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final a in OneUiSelectableSingleTextButtonAttention.values)
            _sstb(context, attention: a, disabled: true, defaultSelected: true),
        ],
      ),
      SizedBox(height: _gap(context, '4-5')),
      _sectionLabel(context, 'Loading'),
      Wrap(
        spacing: _gap(context),
        children: [
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.high,
              loading: true),
          _sstb(context,
              attention: OneUiSelectableSingleTextButtonAttention.medium,
              loading: true,
              defaultSelected: true),
        ],
      ),
    ],
  );
}

Widget buildSelectableSingleTextButtonSurfaceContextSection(
    BuildContext context) {
  const rows = [
    (mode: 'default', desc: 'page background'),
    (mode: 'minimal', desc: 'light tint'),
    (mode: 'subtle', desc: 'medium tint'),
    (mode: 'moderate', desc: 'heavier tint'),
    (mode: 'bold', desc: 'full accent colour'),
    (mode: 'elevated', desc: 'floating card / popover'),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final row in rows) ...[
        Text('${row.mode} — ${row.desc}', style: _caption(context)),
        SizedBox(height: _gap(context, '3')),
        OneUiSurface(
          mode: row.mode,
          appearance: 'secondary',
          transparentBackground: true,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: _secondarySurfaceFill(context, row.mode),
              borderRadius: BorderRadius.circular(_gap(context, '2')),
            ),
            child: Padding(
              padding: EdgeInsets.all(_gap(context, '5')),
              child: Wrap(
                spacing: _gap(context),
                runSpacing: _gap(context, '3'),
                children: [
                  _sstb(context,
                      attention: OneUiSelectableSingleTextButtonAttention.high,
                      defaultSelected: true),
                  _sstb(context,
                      attention:
                          OneUiSelectableSingleTextButtonAttention.medium,
                      defaultSelected: true),
                  _sstb(context,
                      attention: OneUiSelectableSingleTextButtonAttention.low,
                      defaultSelected: true),
                  _sstb(context,
                      attention: OneUiSelectableSingleTextButtonAttention.high),
                ],
              ),
            ),
          ),
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}

class _LanguageSelectorDemo extends StatefulWidget {
  const _LanguageSelectorDemo();

  @override
  State<_LanguageSelectorDemo> createState() => _LanguageSelectorDemoState();
}

class _LanguageSelectorDemoState extends State<_LanguageSelectorDemo> {
  String _active = 'En';

  @override
  Widget build(BuildContext context) {
    const languages = ['En', 'Hi', 'Ta', 'Mr'];
    return Wrap(
      spacing: _gap(context, '3'),
      children: [
        for (final id in languages)
          _sstb(
            context,
            label: id,
            selected: _active == id,
            onSelectedChange: (sel) {
              if (sel) setState(() => _active = id);
            },
          ),
      ],
    );
  }
}

Widget buildSelectableSingleTextButtonLanguageSelectorSection(
    BuildContext context) {
  return const _LanguageSelectorDemo();
}
