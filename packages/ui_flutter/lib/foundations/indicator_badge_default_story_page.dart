import 'package:flutter/material.dart';

import '../widgets/one_ui_indicator_badge.dart';
import '../widgets/one_ui_indicator_badge_types.dart';

/// Default + Interactive — `IndicatorBadge.stories.tsx` argTypes.
class IndicatorBadgeDefaultStoryPage extends StatefulWidget {
  const IndicatorBadgeDefaultStoryPage({super.key});

  @override
  State<IndicatorBadgeDefaultStoryPage> createState() =>
      _IndicatorBadgeDefaultStoryPageState();
}

class _IndicatorBadgeDefaultStoryPageState
    extends State<IndicatorBadgeDefaultStoryPage> {
  OneUiIndicatorBadgeSize _size = 'm';
  String _appearance = 'auto';

  late final TextEditingController _labelController;

  static const _appearances = [
    'auto',
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

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: 'New');
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: OneUiIndicatorBadge(
                size: _size,
                appearance: _appearance,
                semanticsLabel: _labelController.text,
              ),
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withOpacity(0.5),
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
                Text('size', style: theme.textTheme.labelMedium),
                const SizedBox(height: 8),
                DropdownButton<OneUiIndicatorBadgeSize>(
                  value: _size,
                  items: [
                    for (final s in kOneUiIndicatorBadgeSizes)
                      DropdownMenuItem(value: s, child: Text(s)),
                  ],
                  onChanged: (v) {
                    if (v != null) setState(() => _size = v);
                  },
                ),
                const SizedBox(height: 12),
                Text('appearance', style: theme.textTheme.labelMedium),
                const SizedBox(height: 8),
                DropdownButton<String>(
                  value: _appearance,
                  items: [
                    for (final a in _appearances)
                      DropdownMenuItem(value: a, child: Text(a)),
                  ],
                  onChanged: (v) {
                    if (v != null) setState(() => _appearance = v);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _labelController,
                  decoration: const InputDecoration(
                    labelText: 'aria-label *',
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
