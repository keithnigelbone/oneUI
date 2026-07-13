/// Checkbox showcase — `Checkbox.showcase.tsx` / `Checkbox.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/checkbox_size_resolve.dart';
import '../engine/role_root_surface_fill.dart';
import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import 'checkbox_brand_bind.dart';
import 'checkbox_responsive_story_page.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../widgets/one_ui_checkbox.dart';
import '../widgets/one_ui_checkbox_types.dart';
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

Map<int, TableColumnWidth> _checkboxTableColumns(
  BuildContext context, {
  required double labelWidth,
  int dataColumns = 2,
}) {
  final cell = _gap(context, '14');
  return {
    0: FixedColumnWidth(labelWidth),
    for (var i = 1; i <= dataColumns; i++) i: FixedColumnWidth(cell),
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

Widget _checkbox({
  Key? key,
  OneUiCheckboxSize size = 'm',
  String appearance = 'auto',
  bool checked = false,
  bool indeterminate = false,
  bool disabled = false,
  bool readOnly = false,
  bool forceFocusRing = false,
  bool suppressTapScale = false,
  String? label,
  String? ariaLabel,
}) {
  return OneUiCheckbox(
    key: key,
    size: size,
    appearance: appearance,
    checked: checked,
    indeterminate: indeterminate,
    disabled: disabled,
    readOnly: readOnly,
    forceFocusRing: forceFocusRing,
    suppressTapScale: suppressTapScale,
    label: label,
    ariaLabel: ariaLabel,
  );
}

Widget _secondarySurfaceShell(
  BuildContext context, {
  required String mode,
  required Widget child,
}) {
  // Web `<Surface>` at root uses primary appearance; `--Surface-Self-Color` wins
  // over story Secondary-Fill overrides. Paint primary rootRoles + keep secondary
  // checkboxes inside for accent parity.
  final fill = checkboxStorySurfaceFill(context, mode: mode);
  return OneUiSurface(
    mode: mode,
    appearance: kCheckboxStorySurfaceAppearance,
    transparentBackground: true,
    padding: EdgeInsets.zero,
    child: DecoratedBox(
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(_gap(context, '4')),
      ),
      child: child,
    ),
  );
}

/// Surface Context — labelled checked / unchecked / indeterminate (`CheckboxSurfaceContext`).
Widget _secondarySurfaceDemo(
  BuildContext context, {
  required String mode,
  required String brandKey,
}) {
  return _secondarySurfaceShell(
    context,
    mode: mode,
    child: Padding(
      padding: EdgeInsets.all(_gap(context, '4-5')),
      child: Wrap(
        spacing: _gap(context, '3-5'),
        runSpacing: _gap(context, '3-5'),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _checkbox(
            appearance: 'secondary',
            checked: true,
            label: 'Checked',
            ariaLabel: '$mode surface, checked',
          ),
          _checkbox(
            appearance: 'secondary',
            label: 'Unchecked',
            ariaLabel: '$mode surface, unchecked',
          ),
          _checkbox(
            appearance: 'secondary',
            indeterminate: true,
            label: 'Indeterminate',
            ariaLabel: '$mode surface, indeterminate',
          ),
        ],
      ),
    ),
  );
}

/// Themes — web `Checkbox.stories.tsx` Themes: icon-only + labelled rows.
Widget _themesSurfaceDemo(
  BuildContext context, {
  required String mode,
}) {
  return _secondarySurfaceShell(
    context,
    mode: mode,
    child: Padding(
      padding: EdgeInsets.all(_gap(context, '4-5')),
      child: Wrap(
        spacing: _gap(context, '3-5'),
        runSpacing: _gap(context, '3-5'),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _checkbox(
            appearance: 'secondary',
            ariaLabel: '$mode surface, unchecked',
          ),
          _checkbox(
            appearance: 'secondary',
            checked: true,
            ariaLabel: '$mode surface, checked',
          ),
          _checkbox(
            appearance: 'secondary',
            indeterminate: true,
            ariaLabel: '$mode surface, indeterminate',
          ),
          _checkbox(appearance: 'secondary', label: 'Label'),
          _checkbox(appearance: 'secondary', checked: true, label: 'Label'),
          _checkbox(
              appearance: 'secondary', indeterminate: true, label: 'Label'),
        ],
      ),
    ),
  );
}

Widget buildCheckboxDefaultPreview(BuildContext context) {
  bindCheckboxBrandScope(context);
  return Center(
    child: _checkbox(
      label: 'Accept terms and conditions',
      appearance: 'neutral',
    ),
  );
}

Widget buildCheckboxSizesSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  return Table(
    columnWidths: _checkboxTableColumns(context,
        labelWidth: _gap(context, '8'), dataColumns: 3),
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
          _tableCell(
            context,
            Center(child: Text('Indeterminate', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final size in kOneUiCheckboxSizes)
        TableRow(
          children: [
            _tableCell(
              context,
              Text(size.toUpperCase(), style: _caption(context)),
            ),
            _tableCell(
              context,
              _checkbox(size: size, ariaLabel: '$size size, unchecked'),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                  size: size, checked: true, ariaLabel: '$size size, checked'),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                  size: size,
                  indeterminate: true,
                  ariaLabel: '$size size, indeterminate'),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildCheckboxStatesSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  final rows = <(String, Widget)>[
    ('Unchecked', _checkbox(label: 'Label')),
    ('Checked', _checkbox(checked: true, label: 'Label')),
    ('Indeterminate', _checkbox(indeterminate: true, label: 'Label')),
    ('Disabled (unchecked)', _checkbox(disabled: true, label: 'Label')),
    (
      'Disabled (checked)',
      _checkbox(disabled: true, checked: true, label: 'Label')
    ),
    ('Read-only (unchecked)', _checkbox(readOnly: true, label: 'Label')),
    (
      'Read-only (checked)',
      _checkbox(readOnly: true, checked: true, label: 'Label')
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

Widget buildCheckboxAppearancesSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  final roles = radioStoryRoles(context, kRadioStoryAppearanceRoles);
  return Table(
    columnWidths: _checkboxTableColumns(context,
        labelWidth: _gap(context, '16'), dataColumns: 3),
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
          _tableCell(
            context,
            Center(child: Text('Indeterminate', style: _caption(context))),
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
              _checkbox(appearance: role, ariaLabel: '$role, unchecked'),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                  appearance: role, checked: true, ariaLabel: '$role, checked'),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                  appearance: role,
                  indeterminate: true,
                  ariaLabel: '$role, indeterminate'),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildCheckboxAccentsSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  final roles = radioStoryRoles(context, kRadioStoryAccentRoles);
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < roles.length; i++)
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(
                right: i == roles.length - 1 ? 0 : _gap(context, '4')),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(roles[i], style: _caption(context)),
                SizedBox(height: _gap(context, '3-5')),
                Wrap(
                  spacing: _gap(context, '3-5'),
                  alignment: WrapAlignment.center,
                  children: [
                    _checkbox(
                        appearance: roles[i],
                        ariaLabel: '${roles[i]}, unchecked'),
                    _checkbox(
                        appearance: roles[i],
                        checked: true,
                        ariaLabel: '${roles[i]}, checked'),
                    _checkbox(
                      appearance: roles[i],
                      indeterminate: true,
                      ariaLabel: '${roles[i]}, indeterminate',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
    ],
  );
}

Widget buildCheckboxReadOnlySection(BuildContext context) {
  bindCheckboxBrandScope(context);
  return Table(
    columnWidths: _checkboxTableColumns(context,
        labelWidth: _gap(context, '8'), dataColumns: 3),
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
          _tableCell(
            context,
            Center(child: Text('Indeterminate', style: _caption(context))),
            center: true,
          ),
        ],
      ),
      for (final size in kOneUiCheckboxSizes)
        TableRow(
          children: [
            _tableCell(
              context,
              Text(size.toUpperCase(), style: _caption(context)),
            ),
            _tableCell(
              context,
              _checkbox(
                  size: size,
                  readOnly: true,
                  ariaLabel: '$size read-only, unchecked'),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                size: size,
                readOnly: true,
                checked: true,
                ariaLabel: '$size read-only, checked',
              ),
              center: true,
            ),
            _tableCell(
              context,
              _checkbox(
                size: size,
                readOnly: true,
                indeterminate: true,
                ariaLabel: '$size read-only, indeterminate',
              ),
              center: true,
            ),
          ],
        ),
    ],
  );
}

Widget buildCheckboxSurfaceContextSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  final brandKey = checkboxBrandScopeKey(context);
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
              _secondarySurfaceDemo(context, mode: mode, brandKey: brandKey),
            ],
          ),
        ),
    ],
  );
}

Widget buildCheckboxThemesSection(BuildContext context) {
  bindCheckboxBrandScope(context);
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
                child: _themesSurfaceDemo(context, mode: mode),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildCheckboxFocusStateSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  Widget cell({
    required String caption,
    required bool checked,
    required bool forceFocus,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _checkbox(
          checked: checked,
          forceFocusRing: forceFocus,
          ariaLabel: caption,
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
          cell(caption: 'Idle unchecked', checked: false, forceFocus: false),
          cell(caption: 'Idle checked', checked: true, forceFocus: false),
          cell(caption: 'Focus unchecked', checked: false, forceFocus: true),
          cell(caption: 'Focus checked', checked: true, forceFocus: true),
        ],
      ),
    ],
  );
}

Widget buildCheckboxWithLabelSection(BuildContext context) {
  bindCheckboxBrandScope(context);
  return SizedBox(
    width: 420,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _checkbox(checked: true, label: 'Short label'),
        SizedBox(height: _gap(context, '4-5')),
        _checkbox(label: 'A medium-length label for a checkbox option'),
        SizedBox(height: _gap(context, '4-5')),
        _checkbox(
          checked: true,
          label:
              'A longer label that demonstrates how the checkbox aligns with multi-line text content that wraps to the next line',
        ),
        SizedBox(height: _gap(context, '4-5')),
        _checkbox(size: 's', label: 'Small checkbox with label'),
        SizedBox(height: _gap(context, '4-5')),
        _checkbox(size: 'l', label: 'Large checkbox with label'),
        SizedBox(height: _gap(context, '4-5')),
        OneUiCheckbox(
          size: 's',
          label: 'Small checkbox',
          description: 'Compact body description to verify font size',
        ),
        SizedBox(height: _gap(context, '4-5')),
        OneUiCheckbox(
          size: 'l',
          label: 'Large checkbox',
          description:
              'Inline supplementary description renders below the label.',
        ),
      ],
    ),
  );
}

Widget buildCheckboxResponsiveSection(BuildContext context) {
  return const CheckboxResponsiveStoryPage();
}

Widget buildCheckboxDensitySection(BuildContext context) {
  bindCheckboxBrandScope(context);
  final parent = OneUiScope.of(context);
  const densities = ['compact', 'default', 'open'];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Three density columns (compact / default / open). Each column uses its own '
        'OneUiScope.density like web `data-6-Density`.',
        style: _caption(context),
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
                    right: i == densities.length - 1 ? 0 : _gap(context, '2'),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(densities[i], style: _caption(context)),
                      SizedBox(height: _gap(context, '3')),
                      for (var j = 0; j < kOneUiCheckboxSizes.length; j++) ...[
                        if (j > 0) SizedBox(height: _gap(context, '3')),
                        _checkbox(
                          size: kOneUiCheckboxSizes[j],
                          checked: true,
                          label: switch (kOneUiCheckboxSizes[j]) {
                            's' => 'Small',
                            'm' => 'Medium',
                            _ => 'Large',
                          },
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

/// Static preview for docs merge — full Motion story uses [CheckboxMotionStoryPage].
Widget buildCheckboxMotionPreview(BuildContext context) {
  bindCheckboxBrandScope(context);
  final roles = radioStoryRoles(context, kRadioStoryAccentRoles);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Click and hold any checkbox to see tap scale (100% → 107%). Toggle '
        'Subtle motion on the Motion story for reduced-motion parity.',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      Wrap(
        spacing: _gap(context, '5'),
        runSpacing: _gap(context, '4'),
        children: [
          for (final role in roles)
            _checkbox(
              size: 'l',
              appearance: role,
              checked: true,
              label: role[0].toUpperCase() + role.substring(1),
            ),
          _checkbox(
              size: 'l',
              appearance: 'primary',
              indeterminate: true,
              label: 'Indeterminate'),
        ],
      ),
    ],
  );
}
