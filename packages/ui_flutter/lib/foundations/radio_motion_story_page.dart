import 'package:flutter/material.dart';

import '../engine/role_root_surface_fill.dart';
import 'radio_brand_bind.dart';
import '../widgets/one_ui_radio.dart';
import '../widgets/one_ui_radio_group.dart';

/// Web `Motion` story — tap scale + subtle-motion toggle.
class RadioMotionStoryPage extends StatefulWidget {
  const RadioMotionStoryPage({super.key});

  @override
  State<RadioMotionStoryPage> createState() => _RadioMotionStoryPageState();
}

class _RadioMotionStoryPageState extends State<RadioMotionStoryPage> {
  bool _subtleMotion = false;

  @override
  Widget build(BuildContext context) {
    bindRadioBrandScope(context);
    final brandKey = radioBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

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
                  'Click and hold any radio to see the scale-up tap animation. '
                  'Toggle Subtle motion to compare reduced-motion behaviour.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: scheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                OneUiRadioGroup(
                  key: ValueKey('motion-on-$brandKey-$_subtleMotion'),
                  defaultValue: 'primary',
                  orientation: 'horizontal',
                  ariaLabel: 'Motion demo',
                  children: [
                    for (final role
                        in radioStoryRoles(context, kRadioStoryAccentRoles))
                      OneUiRadio(
                        value: role,
                        size: 'l',
                        appearance: role,
                        suppressTapScale: _subtleMotion,
                        child: Text(role[0].toUpperCase() + role.substring(1)),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                OneUiRadioGroup(
                  key: ValueKey('motion-off-$brandKey-$_subtleMotion'),
                  defaultValue: '',
                  orientation: 'horizontal',
                  ariaLabel: 'Motion demo unchecked',
                  children: [
                    for (final role
                        in radioStoryRoles(context, kRadioStoryAccentRoles))
                      OneUiRadio(
                        value: role,
                        size: 'l',
                        appearance: role,
                        suppressTapScale: _subtleMotion,
                        child: Text(role[0].toUpperCase() + role.substring(1)),
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
                'Disables press scale and knob burst (reduced-motion parity).',
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
