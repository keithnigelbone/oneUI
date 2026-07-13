import 'package:flutter/material.dart';

import '../engine/role_root_surface_fill.dart';
import 'checkbox_brand_bind.dart';
import '../widgets/one_ui_checkbox.dart';

/// Web `Motion` story — tap scale + subtle-motion toggle.
class CheckboxMotionStoryPage extends StatefulWidget {
  const CheckboxMotionStoryPage({super.key});

  @override
  State<CheckboxMotionStoryPage> createState() =>
      _CheckboxMotionStoryPageState();
}

class _CheckboxMotionStoryPageState extends State<CheckboxMotionStoryPage> {
  bool _subtleMotion = false;
  bool _indeterminate = false;

  @override
  Widget build(BuildContext context) {
    bindCheckboxBrandScope(context);
    final brandKey = checkboxBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final roles = radioStoryRoles(context, kRadioStoryAccentRoles);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Click and hold any checkbox to see the scale-up tap animation. '
                  'Toggle Subtle motion to compare reduced-motion behaviour.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                Wrap(
                  spacing: 20,
                  runSpacing: 16,
                  children: [
                    for (final role in roles)
                      OneUiCheckbox(
                        key: ValueKey(
                            'motion-checked-$brandKey-$role-$_subtleMotion'),
                        size: 'l',
                        appearance: role,
                        defaultChecked: true,
                        suppressTapScale: _subtleMotion,
                        label: role[0].toUpperCase() + role.substring(1),
                      ),
                    OneUiCheckbox(
                      key: ValueKey(
                          'motion-indeterminate-$brandKey-$_subtleMotion'),
                      size: 'l',
                      appearance: 'primary',
                      indeterminate: true,
                      suppressTapScale: _subtleMotion,
                      label: 'Indeterminate',
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Wrap(
                  spacing: 20,
                  runSpacing: 16,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    for (final role in roles)
                      OneUiCheckbox(
                        key: ValueKey(
                            'motion-toggle-$brandKey-$role-$_indeterminate'),
                        size: 'l',
                        appearance: role,
                        checked: !_indeterminate,
                        indeterminate: _indeterminate,
                        suppressTapScale: _subtleMotion,
                        label: role[0].toUpperCase() + role.substring(1),
                      ),
                    FilledButton.tonal(
                      onPressed: () =>
                          setState(() => _indeterminate = !_indeterminate),
                      child: Text(
                        _indeterminate
                            ? 'Switch to checked'
                            : 'Switch to indeterminate',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Subtle motion'),
              subtitle: const Text(
                'Disables press scale (reduced-motion parity).',
              ),
              value: _subtleMotion,
              onChanged: (v) => setState(() => _subtleMotion = v),
            ),
          ),
        ),
      ],
    );
  }
}
