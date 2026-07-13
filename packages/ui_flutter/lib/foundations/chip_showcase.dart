/// Chip showcase — `Chip.showcase.tsx` / `Chip.stories.tsx`.
library;

import 'package:flutter/material.dart';

import '../engine/surface_engine.dart';
import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_root_surface_scope.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_avatar.dart';
import '../widgets/one_ui_avatar_types.dart';
import '../widgets/one_ui_chip.dart';
import '../widgets/one_ui_chip_types.dart';
import '../widgets/one_ui_counter_badge.dart';
import '../widgets/one_ui_indicator_badge.dart';
import '../widgets/one_ui_surface.dart';
import 'chip_default_story_page.dart';

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

/// Root-only secondary fill — web `SECONDARY_SURFACE_BG` / `--Secondary-Fill-*`.
Color _secondarySurfaceFill(BuildContext context, String mode) {
  final root = OneUiRootSurfaceScope.of(context);
  final role = root.resolvedRoles['secondary'] ?? root.resolvedRoles['neutral'];
  if (role == null) {
    return Theme.of(context).colorScheme.surface;
  }
  final hex = role.surfaces[mode] ?? role.surfaces[kSurfaceDefault];
  return oneUiHexColor(hex ?? '#FFFFFF');
}

Widget _chip(
  BuildContext context, {
  String label = 'Chip',
  OneUiChipAttention attention = 'high',
  OneUiChipSize size = 'm',
  OneUiChipAppearance? appearance,
  bool selected = false,
  bool disabled = false,
  bool autofocus = false,
  bool forceFocusRing = false,
  Widget? start,
  Widget? end,
}) {
  return OneUiChip(
    size: size,
    attention: attention,
    appearance: appearance,
    defaultSelected: selected,
    disabled: disabled,
    autofocus: autofocus,
    forceFocusRing: forceFocusRing,
    start: start,
    end: end,
    semanticsLabel: label,
    child: label,
  );
}

Widget buildChipDefaultPreview(BuildContext context) {
  return Center(child: _chip(context, label: 'Filter', selected: true));
}

Widget buildChipAttentionLevelsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final attention in ['high', 'medium', 'low'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Wrap(
            spacing: _gap(context, '4'),
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(
                  width: 72, child: Text(attention, style: _caption(context))),
              _chip(context,
                  label: attention, attention: attention, selected: true),
              _chip(context, label: attention, attention: attention),
            ],
          ),
        ),
    ],
  );
}

Widget buildChipSizesSection(BuildContext context) {
  return Wrap(
    spacing: _gap(context, '4'),
    runSpacing: _gap(context, '3'),
    children: [
      for (final size in kOneUiChipSizes) ...[
        _chip(context, label: size.toUpperCase(), size: size, selected: true),
        _chip(context, label: size.toUpperCase(), size: size),
      ],
    ],
  );
}

Widget buildChipStatesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _chip(context, label: 'Default (unselected)'),
      SizedBox(height: _gap(context, '3')),
      _chip(context, label: 'Selected', selected: true),
      SizedBox(height: _gap(context, '3')),
      _chip(context, label: 'Disabled', disabled: true),
      SizedBox(height: _gap(context, '3')),
      _chip(context,
          label: 'Disabled selected', selected: true, disabled: true),
    ],
  );
}

Widget buildChipFocusStateSection(BuildContext context) {
  final gap = _gap(context);
  final gapLarge = _gap(context, '6');

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Idle vs keyboard focus — ring mirrors web `:focus-visible` (inner gap '
        '`--Stroke-XL` / chip fill, outer `--Focus-Outline`). '
        'Use Tab to move focus; Enter or Space toggles selection. '
        'The Focus column uses `forceFocusRing` like web `data-force-state="focus"`.',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(gap),
                child: _chip(context, label: 'Filter'),
              ),
              SizedBox(height: _gap(context, '3')),
              Text('Idle', style: _caption(context)),
            ],
          ),
          SizedBox(width: gapLarge),
          Column(
            children: [
              Padding(
                padding: EdgeInsets.all(gap),
                child: _chip(context, label: 'Filter', forceFocusRing: true),
              ),
              SizedBox(height: _gap(context, '3')),
              Text('Focus (forceFocusRing)', style: _caption(context)),
            ],
          ),
        ],
      ),
      SizedBox(height: gapLarge),
      Text('Keyboard traversal (Tab → Enter / Space)',
          style: _caption(context)),
      SizedBox(height: gap),
      Wrap(
        spacing: gap,
        runSpacing: gap,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _chip(
            context,
            label: 'First (autofocus)',
            autofocus: true,
          ),
          _chip(context, label: 'Second'),
          _chip(context, label: 'Third', selected: true),
        ],
      ),
    ],
  );
}

Widget buildChipWithSlotsSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Start — Icon'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final size in kOneUiChipSizes)
            _chip(
              context,
              label: size.toUpperCase(),
              size: size,
              selected: true,
              start: OneUiChipSlotIcon(
                name: 'check',
                size: chipSlotIconSizeForChip(size),
              ),
            ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'Start — Avatar'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            start: const OneUiAvatar(
                size: 'xs', appearance: 'secondary', alt: 'JD'),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            start: const OneUiAvatar(
                size: 's', appearance: 'secondary', alt: 'JD'),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            start: const OneUiAvatar(
                size: 'm', appearance: 'secondary', alt: 'JD'),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'Start — CounterBadge'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            start: const OneUiCounterBadge(
              value: 3,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            start: const OneUiCounterBadge(
              value: 3,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            start: const OneUiCounterBadge(
              value: 3,
              size: 's',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'Start — IndicatorBadge'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            start: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            start: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            start: const OneUiIndicatorBadge(
              size: 'l',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'End — Icon'),
      Wrap(
        spacing: _gap(context),
        children: [
          for (final size in kOneUiChipSizes)
            _chip(
              context,
              label: size.toUpperCase(),
              size: size,
              selected: true,
              end: OneUiChipSlotIcon(
                name: 'close',
                size: chipSlotIconSizeForChip(size),
              ),
            ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'End — Avatar'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            end: const OneUiAvatar(
                size: 'xs', appearance: 'secondary', alt: 'JD'),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            end: const OneUiAvatar(
                size: 's', appearance: 'secondary', alt: 'JD'),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            end: const OneUiAvatar(
                size: 'm', appearance: 'secondary', alt: 'JD'),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'End — CounterBadge'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            end: const OneUiCounterBadge(
              value: 3,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            end: const OneUiCounterBadge(
              value: 3,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            end: const OneUiCounterBadge(
              value: 3,
              size: 's',
              appearance: 'negative',
              semanticsLabel: '3',
            ),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'End — IndicatorBadge'),
      Wrap(
        spacing: _gap(context),
        children: [
          _chip(
            context,
            label: 'S',
            size: 's',
            selected: true,
            end: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Active',
            ),
          ),
          _chip(
            context,
            label: 'M',
            size: 'm',
            selected: true,
            end: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Active',
            ),
          ),
          _chip(
            context,
            label: 'L',
            size: 'l',
            selected: true,
            end: const OneUiIndicatorBadge(
              size: 'l',
              appearance: 'positive',
              semanticsLabel: 'Active',
            ),
          ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'Both slots (M)'),
      Wrap(
        spacing: _gap(context),
        runSpacing: _gap(context, '3'),
        children: [
          _chip(
            context,
            label: 'Icon + Icon',
            selected: true,
            start: const OneUiChipSlotIcon(name: 'check', size: '4'),
            end: const OneUiChipSlotIcon(name: 'close', size: '4'),
          ),
          _chip(
            context,
            label: 'Avatar + Icon',
            selected: true,
            start: const OneUiAvatar(
                size: 's', appearance: 'secondary', alt: 'JD'),
            end: const OneUiChipSlotIcon(name: 'close', size: '4'),
          ),
          _chip(
            context,
            label: 'Indicator + Counter',
            selected: true,
            start: const OneUiIndicatorBadge(
              size: 's',
              appearance: 'positive',
              semanticsLabel: 'Status',
            ),
            end: const OneUiCounterBadge(
              value: 7,
              size: 'xs',
              appearance: 'negative',
              semanticsLabel: '7',
            ),
          ),
        ],
      ),
    ],
  );
}

Widget buildChipAppearancesSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionLabel(context, 'Selected (High Attention)'),
      Wrap(
        spacing: _gap(context, '3'),
        runSpacing: _gap(context, '3'),
        children: [
          for (final role in OneUiSurfaceScope.appearanceRolesForBrand(context))
            _chip(
              context,
              label: role,
              appearance: role,
              attention: 'high',
              selected: true,
            ),
        ],
      ),
      SizedBox(height: _gap(context, '5')),
      _sectionLabel(context, 'Unselected (Low Attention)'),
      Wrap(
        spacing: _gap(context, '3'),
        runSpacing: _gap(context, '3'),
        children: [
          for (final role in OneUiSurfaceScope.appearanceRolesForBrand(context))
            _chip(context, label: role, appearance: role, attention: 'low'),
        ],
      ),
    ],
  );
}

Widget buildChipSurfaceContextSection(BuildContext context) {
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
              child: Wrap(
                spacing: _gap(context),
                runSpacing: _gap(context, '3'),
                children: [
                  _chip(context, label: 'Selected', selected: true),
                  _chip(
                    context,
                    label: 'Icon',
                    selected: true,
                    start: const OneUiChipSlotIcon(name: 'check', size: '4'),
                  ),
                  _chip(
                    context,
                    label: 'Avatar',
                    selected: true,
                    start: const OneUiAvatar(
                      size: 's',
                      content: OneUiAvatarContent.icon,
                      appearance: 'secondary',
                      alt: 'Profile',
                    ),
                  ),
                  _chip(
                    context,
                    label: 'Indicator',
                    selected: true,
                    start: const OneUiIndicatorBadge(
                      size: 's',
                      appearance: 'positive',
                      semanticsLabel: 'Online',
                    ),
                  ),
                  _chip(
                    context,
                    label: 'Counter',
                    selected: true,
                    end: const OneUiCounterBadge(
                      value: 5,
                      size: 'xs',
                      appearance: 'negative',
                      semanticsLabel: '5 alerts',
                    ),
                  ),
                  _chip(context,
                      label: 'Medium', attention: 'medium', selected: true),
                  _chip(
                    context,
                    label: 'Medium Icon',
                    attention: 'medium',
                    selected: true,
                    start: const OneUiChipSlotIcon(name: 'check', size: '4'),
                  ),
                  _chip(context, label: 'Low', attention: 'low'),
                  _chip(
                    context,
                    label: 'Low Icon',
                    attention: 'low',
                    start: const OneUiChipSlotIcon(name: 'check', size: '4'),
                  ),
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

Widget buildChipMotionSection(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Tap scale + colour transitions use --Motion-Duration-M and '
        '--Motion-Easing-Transition-Moderate (toggle or press to see motion).',
        style: _caption(context),
      ),
      SizedBox(height: _gap(context, '4')),
      for (final attention in ['high', 'medium', 'low'])
        Padding(
          padding: EdgeInsets.only(bottom: _gap(context, '4')),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(attention, style: _caption(context)),
              SizedBox(height: _gap(context, '2')),
              Wrap(
                spacing: _gap(context, '3-5'),
                children: [
                  _chip(
                    context,
                    label: 'Selected',
                    attention: attention,
                    selected: true,
                  ),
                  _chip(context, label: 'Unselected', attention: attention),
                ],
              ),
            ],
          ),
        ),
    ],
  );
}

Widget buildChipInteractiveSection(BuildContext context) {
  return const ChipDefaultStoryPage();
}
