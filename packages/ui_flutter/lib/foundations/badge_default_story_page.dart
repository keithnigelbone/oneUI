import 'package:flutter/material.dart';

import '../widgets/one_ui_avatar.dart';
import '../widgets/one_ui_avatar_types.dart';
import '../widgets/one_ui_badge.dart';
import '../widgets/one_ui_badge_types.dart';
import '../widgets/one_ui_icon.dart';

/// Web Default story + Controls — mirrors `Badge.stories.tsx` argTypes.
class BadgeDefaultStoryPage extends StatefulWidget {
  const BadgeDefaultStoryPage({super.key});

  @override
  State<BadgeDefaultStoryPage> createState() => _BadgeDefaultStoryPageState();
}

enum _BadgeSlotOption { none, icon, avatar, counterBadge, indicatorBadge }

class _BadgeDefaultStoryPageState extends State<BadgeDefaultStoryPage> {
  OneUiBadgeAttention _attention = 'high';
  OneUiBadgeSize _size = 'm';
  String _appearance = 'auto';
  _BadgeSlotOption _start = _BadgeSlotOption.none;
  _BadgeSlotOption _end = _BadgeSlotOption.none;

  late final TextEditingController _childrenController;
  late final TextEditingController _semanticsLabelController;

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
    _childrenController = TextEditingController(text: 'Badge');
    _semanticsLabelController = TextEditingController(text: 'Status badge');
  }

  @override
  void dispose() {
    _childrenController.dispose();
    _semanticsLabelController.dispose();
    super.dispose();
  }

  Widget? _slotWidget(_BadgeSlotOption option) {
    return switch (option) {
      _BadgeSlotOption.none => null,
      _BadgeSlotOption.icon =>
        const OneUiIcon(icon: 'user', excludeFromSemantics: true),
      _BadgeSlotOption.avatar => const OneUiAvatar(
          content: OneUiAvatarContent.icon,
          size: 'm',
          alt: '',
          excludeFromSemantics: true,
        ),
      _BadgeSlotOption.counterBadge => const OneUiCounterBadge(
          value: 3,
          appearance: 'negative',
          semanticsLabel: '3 items',
        ),
      _BadgeSlotOption.indicatorBadge => const OneUiIndicatorBadge(
          appearance: 'negative',
          semanticsLabel: 'Unread',
        ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = KeyedSubtree(
      key: ValueKey(
        'badge-preview|$_attention|$_size|$_appearance|$_start|$_end|'
        '${_childrenController.text}|${_semanticsLabelController.text}',
      ),
      child: OneUiBadge(
        attention: _attention,
        size: _size,
        appearance: _appearance,
        start: _slotWidget(_start),
        end: _slotWidget(_end),
        semanticsLabel: _semanticsLabelController.text.trim().isEmpty
            ? null
            : _semanticsLabelController.text.trim(),
        child: _childrenController.text,
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(child: preview),
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
                Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: _childrenController,
                        decoration: const InputDecoration(
                          labelText: 'children',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    SegmentedButton<OneUiBadgeAttention>(
                      segments: const [
                        ButtonSegment(value: 'high', label: Text('high')),
                        ButtonSegment(value: 'medium', label: Text('medium')),
                        ButtonSegment(value: 'low', label: Text('low')),
                      ],
                      selected: {_attention},
                      onSelectionChanged: (s) =>
                          setState(() => _attention = s.first),
                    ),
                    DropdownMenu<OneUiBadgeSize>(
                      label: const Text('size'),
                      initialSelection: _size,
                      dropdownMenuEntries: [
                        for (final s in kOneUiBadgeSizes)
                          DropdownMenuEntry(value: s, label: s),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                    ),
                    DropdownMenu<String>(
                      label: const Text('appearance'),
                      initialSelection: _appearance,
                      dropdownMenuEntries: [
                        for (final a in _appearances)
                          DropdownMenuEntry(value: a, label: a),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _appearance = v);
                      },
                    ),
                    DropdownMenu<_BadgeSlotOption>(
                      label: const Text('start'),
                      initialSelection: _start,
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.none, label: 'none'),
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.icon, label: 'icon'),
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.avatar, label: 'avatar'),
                        DropdownMenuEntry(
                          value: _BadgeSlotOption.counterBadge,
                          label: 'counter-badge',
                        ),
                        DropdownMenuEntry(
                          value: _BadgeSlotOption.indicatorBadge,
                          label: 'indicator-badge',
                        ),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _start = v);
                      },
                    ),
                    DropdownMenu<_BadgeSlotOption>(
                      label: const Text('end'),
                      initialSelection: _end,
                      dropdownMenuEntries: const [
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.none, label: 'none'),
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.icon, label: 'icon'),
                        DropdownMenuEntry(
                            value: _BadgeSlotOption.avatar, label: 'avatar'),
                        DropdownMenuEntry(
                          value: _BadgeSlotOption.counterBadge,
                          label: 'counter-badge',
                        ),
                        DropdownMenuEntry(
                          value: _BadgeSlotOption.indicatorBadge,
                          label: 'indicator-badge',
                        ),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _end = v);
                      },
                    ),
                    SizedBox(
                      width: 220,
                      child: TextField(
                        controller: _semanticsLabelController,
                        decoration: const InputDecoration(
                          labelText: 'aria-label',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
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
}
