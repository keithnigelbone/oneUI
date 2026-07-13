import 'package:flutter/material.dart';

import 'circular_progress_indicator_motion_demo.dart';

/// Web `Motion` story — motion mode radio + entry & exit toggle.
class CircularProgressIndicatorMotionStoryPage extends StatefulWidget {
  const CircularProgressIndicatorMotionStoryPage({super.key});

  @override
  State<CircularProgressIndicatorMotionStoryPage> createState() =>
      _CircularProgressIndicatorMotionStoryPageState();
}

class _CircularProgressIndicatorMotionStoryPageState
    extends State<CircularProgressIndicatorMotionStoryPage> {
  CpiMotionMode _mode = CpiMotionMode.indeterminate;
  bool _entryExit = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: scheme.surface,
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Center(
              child: CpiMotionShowcase(
                key: ValueKey('cpi-motion|$_mode|$_entryExit'),
                mode: _mode,
                entryExit: _entryExit,
              ),
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Controls',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                Text('Motion mode', style: theme.textTheme.labelLarge),
                const SizedBox(height: 8),
                SegmentedButton<CpiMotionMode>(
                  segments: const [
                    ButtonSegment(
                      value: CpiMotionMode.indeterminate,
                      label: Text('indeterminate'),
                    ),
                    ButtonSegment(
                      value: CpiMotionMode.jumping,
                      label: Text('determinate - jump'),
                    ),
                    ButtonSegment(
                      value: CpiMotionMode.tracking,
                      label: Text('determinate - tracking'),
                    ),
                  ],
                  selected: {_mode},
                  onSelectionChanged: (s) => setState(() => _mode = s.first),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Entry & exit'),
                  subtitle: const Text(
                    'Entry + exit animation on top of the active motion mode.',
                  ),
                  value: _entryExit,
                  onChanged: (v) => setState(() => _entryExit = v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
