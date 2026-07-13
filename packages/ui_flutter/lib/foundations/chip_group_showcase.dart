/// ChipGroup showcase — `ChipGroup.stories.tsx` / `ChipGroup.showcase.native.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_root_surface_scope.dart';
import '../theme/one_ui_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_chip.dart';
import '../widgets/one_ui_chip_group.dart';
import '../widgets/one_ui_chip_types.dart';
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

Color _secondarySurfaceFill(BuildContext context, String mode) {
  final root = OneUiRootSurfaceScope.of(context);
  final role = root.resolvedRoles['secondary'] ?? root.resolvedRoles['neutral'];
  if (role == null) {
    return Theme.of(context).colorScheme.surface;
  }
  final hex = role.surfaces[mode] ?? role.surfaces[kSurfaceDefault];
  return oneUiHexColor(hex ?? '#FFFFFF');
}

OneUiChip _chip(
  String value,
  String label, {
  OneUiChipAttention attention = 'high',
  bool disabled = false,
  Widget? start,
  Widget? end,
}) {
  return OneUiChip(
    value: value,
    attention: attention,
    disabled: disabled,
    start: start,
    end: end,
    semanticsLabel: label,
    child: label,
  );
}

/// Default story preview — All / News / Sport / Tech / Culture.
Widget buildChipGroupDefaultPreview(BuildContext context) {
  return Center(
    child: OneUiChipGroup(
      size: 'm',
      semanticsLabel: 'Content categories',
      children: [
        _chip('all', 'All'),
        _chip('news', 'News'),
        _chip('sport', 'Sport'),
        _chip('tech', 'Tech'),
        _chip('culture', 'Culture'),
      ],
    ),
  );
}

Widget buildChipGroupVariantsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: _gap(context, '4'),
    children: [
      OneUiChipGroup(
        defaultValue: const ['react'],
        variant: 'ghost',
        children: [
          _chip('react', 'React'),
          _chip('vue', 'Vue'),
          _chip('angular', 'Angular'),
        ],
      ),
      OneUiChipGroup(
        defaultValue: const ['react'],
        variant: 'subtle',
        children: [
          _chip('react', 'React'),
          _chip('vue', 'Vue'),
          _chip('angular', 'Angular'),
        ],
      ),
      OneUiChipGroup(
        defaultValue: const ['react'],
        variant: 'bold',
        children: [
          _chip('react', 'React'),
          _chip('vue', 'Vue'),
          _chip('angular', 'Angular'),
        ],
      ),
    ],
  );
}

Widget buildChipGroupSizesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: _gap(context, '4'),
    children: [
      for (final size in ['s', 'm', 'l'])
        OneUiChipGroup(
          size: size,
          defaultValue: const ['news'],
          children: [
            _chip('news', 'News', attention: 'high'),
            _chip('sport', 'Sport', attention: 'high'),
            _chip('tech', 'Tech', attention: 'high'),
          ],
        ),
    ],
  );
}

Widget buildChipGroupStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: _gap(context, '4'),
    children: [
      _sectionLabel(context, 'Disabled group'),
      OneUiChipGroup(
        disabled: true,
        defaultValue: const ['sport'],
        children: [
          _chip('news', 'News'),
          _chip('sport', 'Sport'),
          _chip('tech', 'Tech'),
        ],
      ),
      _sectionLabel(context, 'Required — last chip cannot be deselected'),
      OneUiChipGroup(
        required: true,
        defaultValue: const ['news'],
        children: [
          _chip('news', 'News (required)'),
          _chip('sport', 'Sport'),
          _chip('tech', 'Tech'),
        ],
      ),
      _sectionLabel(context, 'Individual chip disabled'),
      OneUiChipGroup(
        children: [
          _chip('news', 'News'),
          _chip('sport', 'Sport', disabled: true),
          _chip('tech', 'Tech'),
        ],
      ),
    ],
  );
}

/// Controlled multi-select with selection caption — `MultiSelect` story.
class _ChipGroupMultiSelectDemo extends StatefulWidget {
  const _ChipGroupMultiSelectDemo({super.key});

  @override
  State<_ChipGroupMultiSelectDemo> createState() =>
      _ChipGroupMultiSelectDemoState();
}

class _ChipGroupMultiSelectDemoState extends State<_ChipGroupMultiSelectDemo> {
  List<String> _selected = const ['react', 'vue'];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _gap(context, '2'),
      children: [
        OneUiChipGroup(
          multiple: true,
          value: _selected,
          onValueChange: (next) => setState(() => _selected = next),
          children: [
            _chip('react', 'React'),
            _chip('vue', 'Vue'),
            _chip('angular', 'Angular'),
            _chip('svelte', 'Svelte'),
            _chip('solid', 'Solid'),
          ],
        ),
        Text(
          'Selected: ${_selected.isEmpty ? 'none' : _selected.join(', ')}',
          style: _caption(context),
        ),
      ],
    );
  }
}

Widget buildChipGroupMultiSelectSection(BuildContext context) {
  return const _ChipGroupMultiSelectDemo();
}

Widget buildChipGroupInteractiveSection(BuildContext context) {
  return OneUiChipGroup(
    multiple: true,
    maxSelections: 2,
    defaultValue: const ['news'],
    children: [
      _chip('news', 'News'),
      _chip('sport', 'Sport'),
      _chip('tech', 'Tech'),
      _chip('culture', 'Culture'),
    ],
  );
}

Widget buildChipGroupResponsiveSection(BuildContext context) {
  const labels = [
    'Breaking News',
    'Technology',
    'Sports',
    'Culture',
    'Science',
    'Health',
    'Travel',
    'Food',
  ];

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: _gap(context, '4'),
    children: [
      _sectionLabel(context, 'containerType: wrap'),
      OneUiChipGroup(
        containerType: 'wrap',
        children: [
          for (final label in labels)
            _chip(
              label.toLowerCase().replaceAll(' ', '-'),
              label,
            ),
        ],
      ),
      _sectionLabel(context, 'containerType: inline'),
      SizedBox(
        width: 320,
        child: OneUiChipGroup(
          containerType: 'inline',
          children: [
            for (final label in labels.take(7))
              _chip(
                label.toLowerCase().replaceAll(' ', '-'),
                label,
              ),
          ],
        ),
      ),
    ],
  );
}

/// ChipGroup for surface rows — new instance per row (Flutter cannot reuse one widget).
Widget _chipGroupSurfaceContextDemo() {
  return OneUiChipGroup(
    multiple: true,
    defaultValue: const ['all', 'tech'],
    children: [
      _chip('all', 'All', attention: 'high'),
      _chip('news', 'News', attention: 'medium'),
      _chip(
        'tech',
        'Tech',
        attention: 'high',
        start: const OneUiChipSlotIcon(name: 'check', size: '4'),
      ),
      _chip(
        'sport',
        'Sport',
        attention: 'low',
        end: const OneUiChipSlotIcon(name: 'close', size: '4'),
      ),
    ],
  );
}

Widget buildChipGroupSurfaceContextSection(BuildContext context) {
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
              padding: EdgeInsets.all(_gap(context, '4-5')),
              child: _chipGroupSurfaceContextDemo(),
            ),
          ),
        ),
        SizedBox(height: _gap(context, '4-5')),
      ],
    ],
  );
}
