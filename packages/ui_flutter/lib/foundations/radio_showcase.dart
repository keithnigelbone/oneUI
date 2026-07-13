/// Radio showcase — `Radio.showcase.tsx` / `Radio.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/role_root_surface_fill.dart';
import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import 'radio_brand_bind.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_group.dart';
import '../widgets/one_ui_radio_types.dart';
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

Map<int, TableColumnWidth> _radioTableColumns(
  BuildContext context, {
  required double labelWidth,
}) {
  final cell = _gap(context, '14');
  return {
    0: FixedColumnWidth(labelWidth),
    1: FixedColumnWidth(cell),
    2: FixedColumnWidth(cell),
  };
}

Widget _appearanceLabel(BuildContext context, String role) {
  return Text(
    role,
    style: _caption(context),
    softWrap: false,
    overflow: TextOverflow.visible,
  );
}

Widget _tableCell(BuildContext context, Widget child, {bool center = false}) {
  return Padding(
    padding: EdgeInsets.symmetric(
      horizontal: _gap(context, '3'),
      vertical: _gap(context, '3-5'),
    ),
    child: center ? Center(child: child) : child,
  );
}

Widget _secondarySurfaceDemo(
  BuildContext context, {
  required String mode,
  required String brandKey,
  required String ariaLabel,
}) {
  final useNativeSurface = mode == 'default' || mode == 'elevated';
  final child = Padding(
    padding: EdgeInsets.all(_gap(context, '4-5')),
    child: OneUiRadioGroup(
      key: ValueKey('surface-demo-$brandKey-$mode'),
      defaultValue: 'a',
      orientation: 'horizontal',
      ariaLabel: ariaLabel,
      children: [
        OneUiRadio(
          value: 'a',
          appearance: 'secondary',
          child: 'Checked',
        ),
        OneUiRadio(
          value: 'b',
          appearance: 'secondary',
          child: 'Unchecked',
        ),
      ],
    ),
  );

  if (useNativeSurface) {
    return OneUiSurface(
      mode: mode,
      appearance: kCheckboxStorySurfaceAppearance,
      padding: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(_gap(context, '4')),
      child: child,
    );
  }

  return OneUiSurface(
    mode: mode,
    appearance: kCheckboxStorySurfaceAppearance,
    transparentBackground: true,
    child: DecoratedBox(
      decoration: BoxDecoration(
        color: checkboxStorySurfaceFill(context, mode: mode),
        borderRadius: BorderRadius.circular(_gap(context, '4')),
      ),
      child: child,
    ),
  );
}

Widget _radioInGroup(
  BuildContext context, {
  required String groupValue,
  required String radioValue,
  OneUiRadioSize size = 'm',
  String appearance = 'auto',
  bool disabled = false,
  bool readOnly = false,
  String? label,
  String? ariaLabel,
}) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  return OneUiRadioGroup(
    key: ValueKey('rg-$brandKey-$groupValue-$radioValue-$size-$appearance'),
    value: groupValue,
    disabled: disabled,
    readOnly: readOnly,
    ariaLabel: ariaLabel,
    children: [
      OneUiRadio(
        value: radioValue,
        size: size,
        appearance: appearance,
        label: label,
        child: label,
      ),
    ],
  );
}

Widget buildRadioDefaultPreview(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  return Center(
    child: OneUiRadioGroup(
      key: ValueKey('preview-default-$brandKey'),
      defaultValue: 'a',
      ariaLabel: 'Default example',
      children: [
        OneUiRadio(value: 'a', child: 'Option A'),
        OneUiRadio(value: 'b', child: 'Option B'),
        OneUiRadio(value: 'c', child: 'Option C'),
      ],
    ),
  );
}

Widget buildRadioSizesSection(BuildContext context) {
  bindRadioBrandScope(context);
  return Table(
    columnWidths: _radioTableColumns(context, labelWidth: _gap(context, '8')),
    defaultVerticalAlignment: TableCellVerticalAlignment.middle,
    children: [
      TableRow(
        children: [
          _tableCell(context, _sectionLabel(context, 'Size')),
          _tableCell(
            context,
            Center(child: Text('Unchecked', style: _caption(context))),
            center: true,
          ),
          _tableCell(
            context,
            Center(child: Text('Checked', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final size in kOneUiRadioSizes)
        TableRow(
          children: [
            _tableCell(
              context,
              Text(size.toUpperCase(), style: _caption(context)),
            ),
            _tableCell(
              context,
              _radioInGroup(context,
                  groupValue: '', radioValue: 'x', size: size),
              center: true,
            ),
            _tableCell(
              context,
              _radioInGroup(context,
                  groupValue: 'x', radioValue: 'x', size: size),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildRadioStatesSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  final rows = <(String, Widget)>[
    (
      'Unchecked',
      _radioInGroup(context, groupValue: '', radioValue: 'x', label: 'Label')
    ),
    (
      'Checked',
      _radioInGroup(context, groupValue: 'x', radioValue: 'x', label: 'Label')
    ),
    (
      'Disabled (unchecked)',
      OneUiRadioGroup(
        key: ValueKey('states-disabled-off-$brandKey'),
        value: '',
        disabled: true,
        children: [OneUiRadio(value: 'x', child: 'Label')],
      ),
    ),
    (
      'Disabled (checked)',
      OneUiRadioGroup(
        key: ValueKey('states-disabled-on-$brandKey'),
        value: 'x',
        disabled: true,
        children: [OneUiRadio(value: 'x', child: 'Label')],
      ),
    ),
    (
      'Read-only (unchecked)',
      OneUiRadioGroup(
        key: ValueKey('states-ro-off-$brandKey'),
        value: '',
        readOnly: true,
        children: [OneUiRadio(value: 'x', child: 'Label')],
      ),
    ),
    (
      'Read-only (checked)',
      OneUiRadioGroup(
        key: ValueKey('states-ro-on-$brandKey'),
        value: 'x',
        readOnly: true,
        children: [OneUiRadio(value: 'x', child: 'Label')],
      ),
    ),
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final (title, preview) in rows)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                  width: 160, child: Text(title, style: _caption(context))),
              Expanded(child: preview),
            ],
          ),
        ),
    ],
  );
}

Widget buildRadioAppearancesSection(BuildContext context) {
  bindRadioBrandScope(context);
  final roles = radioStoryRoles(context, kRadioStoryAppearanceRoles);
  return Table(
    columnWidths: _radioTableColumns(context, labelWidth: _gap(context, '16')),
    defaultVerticalAlignment: TableCellVerticalAlignment.middle,
    children: [
      TableRow(
        children: [
          _tableCell(context, _sectionLabel(context, 'Appearance')),
          _tableCell(
            context,
            Center(child: Text('Unchecked', style: _caption(context))),
            center: true,
          ),
          _tableCell(
            context,
            Center(child: Text('Checked', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final role in roles)
        TableRow(
          children: [
            _tableCell(context, _appearanceLabel(context, role)),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: '',
                radioValue: 'x',
                appearance: role,
              ),
              center: true,
            ),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: 'x',
                radioValue: 'x',
                appearance: role,
              ),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildRadioAccentsSection(BuildContext context) {
  bindRadioBrandScope(context);
  final roles = radioStoryRoles(context, kRadioStoryAccentRoles);
  return Table(
    columnWidths: _radioTableColumns(context, labelWidth: _gap(context, '16')),
    defaultVerticalAlignment: TableCellVerticalAlignment.middle,
    children: [
      TableRow(
        children: [
          _tableCell(context, _sectionLabel(context, 'Appearance')),
          _tableCell(
            context,
            Center(child: Text('Unchecked', style: _caption(context))),
            center: true,
          ),
          _tableCell(
            context,
            Center(child: Text('Checked', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final role in roles)
        TableRow(
          children: [
            _tableCell(context, _appearanceLabel(context, role)),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: '',
                radioValue: 'x',
                appearance: role,
              ),
              center: true,
            ),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: 'x',
                radioValue: 'x',
                appearance: role,
              ),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildRadioReadOnlySection(BuildContext context) {
  bindRadioBrandScope(context);
  return Table(
    columnWidths: _radioTableColumns(context, labelWidth: _gap(context, '8')),
    defaultVerticalAlignment: TableCellVerticalAlignment.middle,
    children: [
      TableRow(
        children: [
          _tableCell(context, _sectionLabel(context, 'Size')),
          _tableCell(
            context,
            Center(child: Text('Unchecked', style: _caption(context))),
            center: true,
          ),
          _tableCell(
            context,
            Center(child: Text('Checked', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final size in kOneUiRadioSizes)
        TableRow(
          children: [
            _tableCell(
              context,
              Text(size.toUpperCase(), style: _caption(context)),
            ),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: '',
                radioValue: 'x',
                size: size,
                readOnly: true,
              ),
              center: true,
            ),
            _tableCell(
              context,
              _radioInGroup(
                context,
                groupValue: 'x',
                radioValue: 'x',
                size: size,
                readOnly: true,
              ),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildRadioSurfaceContextSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
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
              Text('$mode — $desc', style: _caption(context)),
              SizedBox(height: _gap(context, '3')),
              _secondarySurfaceDemo(
                context,
                mode: mode,
                brandKey: brandKey,
                ariaLabel: '$mode surface',
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildRadioThemesSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  const modes = ['default', 'minimal', 'subtle', 'bold', 'elevated'];
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final mode in modes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 80,
                child: Text(mode, style: _caption(context)),
              ),
              Expanded(
                child: _secondarySurfaceDemo(
                  context,
                  mode: mode,
                  brandKey: brandKey,
                  ariaLabel: '$mode surface',
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildRadioFocusStateSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  Widget cell({
    required String groupValue,
    required String caption,
    required bool forceFocus,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        OneUiRadioGroup(
          key: ValueKey('focus-$brandKey-$groupValue-$forceFocus'),
          value: groupValue,
          children: [
            OneUiRadio(
              value: 'x',
              forceFocusRing: forceFocus,
            ),
          ],
        ),
        SizedBox(height: _gap(context, '3')),
        Text(caption, style: _caption(context)),
      ],
    );
  }

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Idle has no halo. Focus shows Informative-Bold ring with inner '
        '--Surface-Halo-Gap (web data-force-state="focus").',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      Wrap(
        spacing: _gap(context, '5'),
        runSpacing: _gap(context, '4'),
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          cell(groupValue: '', caption: 'Idle unchecked', forceFocus: false),
          cell(groupValue: 'x', caption: 'Idle checked', forceFocus: false),
          cell(groupValue: '', caption: 'Focus unchecked', forceFocus: true),
          cell(groupValue: 'x', caption: 'Focus checked', forceFocus: true),
        ],
      ),
    ],
  );
}

Widget buildRadioWithLabelSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  return SizedBox(
    width: 420,
    child: OneUiRadioGroup(
      key: ValueKey('with-label-group-$brandKey'),
      defaultValue: 'terms',
      ariaLabel: 'Label examples',
      children: [
        OneUiRadio(value: 'terms', child: 'Accept terms and conditions'),
        OneUiRadio(
            value: 'updates', child: 'Subscribe to weekly product updates'),
        OneUiRadio(
          value: 'marketing',
          child: 'Receive marketing communications and offers',
        ),
      ],
    ),
  );
}

Widget buildRadioResponsiveSection(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final size in kOneUiRadioSizes)
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: OneUiRadioGroup(
            key: ValueKey('responsive-$brandKey-$size'),
            defaultValue: 'on',
            ariaLabel: 'Responsive $size',
            children: [
              OneUiRadio(
                value: 'off',
                size: size,
                child: 'Unchecked ${size.toUpperCase()}',
              ),
              OneUiRadio(
                value: 'on',
                size: size,
                child: 'Checked ${size.toUpperCase()}',
              ),
            ],
          ),
        ),
    ],
  );
}

/// Static preview for docs merge — full Motion story uses [RadioMotionStoryPage].
Widget buildRadioMotionPreview(BuildContext context) {
  bindRadioBrandScope(context);
  final brandKey = radioBrandScopeKey(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Click and hold any radio to see tap scale (100% → 107%). Toggle '
        'Subtle motion on the Motion story for reduced-motion parity.',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      OneUiRadioGroup(
        key: ValueKey('motion-checked-$brandKey'),
        defaultValue: 'primary',
        orientation: 'horizontal',
        ariaLabel: 'Motion demo checked',
        children: [
          for (final role in radioStoryRoles(context, kRadioStoryAccentRoles))
            OneUiRadio(
              value: role,
              size: 'l',
              appearance: role,
              child: Text(role[0].toUpperCase() + role.substring(1)),
            ),
        ],
      ),
      SizedBox(height: _gap(context, '4')),
      OneUiRadioGroup(
        key: ValueKey('motion-unchecked-$brandKey'),
        defaultValue: '',
        orientation: 'horizontal',
        ariaLabel: 'Motion demo unchecked',
        children: [
          for (final role in radioStoryRoles(context, kRadioStoryAccentRoles))
            OneUiRadio(
              value: role,
              size: 'l',
              appearance: role,
              child: Text(role[0].toUpperCase() + role.substring(1)),
            ),
        ],
      ),
    ],
  );
}
