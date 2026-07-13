import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_counter_badge.dart';
import '../widgets/one_ui_counter_badge_types.dart';

/// Default + Interactive — `CounterBadge.stories.tsx` argTypes.
class CounterBadgeDefaultStoryPage extends StatefulWidget {
  const CounterBadgeDefaultStoryPage({super.key});

  @override
  State<CounterBadgeDefaultStoryPage> createState() =>
      _CounterBadgeDefaultStoryPageState();
}

class _CounterBadgeDefaultStoryPageState
    extends State<CounterBadgeDefaultStoryPage> {
  int _value = 5;
  int _max = 99;
  bool _showZero = false;
  OneUiCounterBadgeAttention _attention = 'high';
  OneUiCounterBadgeSize _size = 'm';
  String _appearance = 'auto';

  late final TextEditingController _labelController;
  late final TextEditingController _valueController;
  late final TextEditingController _maxController;

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
    _labelController = TextEditingController(text: '5 notifications');
    _valueController = TextEditingController(text: '$_value');
    _maxController = TextEditingController(text: '$_max');
  }

  @override
  void dispose() {
    _labelController.dispose();
    _valueController.dispose();
    _maxController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = Center(
      child: OneUiCounterBadge(
        value: _value,
        max: _max,
        showZero: _showZero,
        attention: _attention,
        size: _size,
        appearance: _appearance,
        semanticsLabel: _labelController.text.trim().isEmpty
            ? null
            : _labelController.text.trim(),
      ),
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Center(child: preview),
            ),
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: (constraints.maxHeight * 0.52).clamp(120.0, 420.0),
              ),
              child: SingleChildScrollView(
                child: Material(
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
                        Wrap(
                          spacing: 16,
                          runSpacing: 12,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            SizedBox(
                              width: 100,
                              child: TextField(
                                decoration: const InputDecoration(
                                  labelText: 'value',
                                  isDense: true,
                                  border: OutlineInputBorder(),
                                ),
                                keyboardType: TextInputType.number,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly
                                ],
                                controller: _valueController,
                                onChanged: (v) {
                                  final n = int.tryParse(v);
                                  if (n != null) setState(() => _value = n);
                                },
                              ),
                            ),
                            SizedBox(
                              width: 100,
                              child: TextField(
                                decoration: const InputDecoration(
                                  labelText: 'max',
                                  isDense: true,
                                  border: OutlineInputBorder(),
                                ),
                                keyboardType: TextInputType.number,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly
                                ],
                                controller: _maxController,
                                onChanged: (v) {
                                  final n = int.tryParse(v);
                                  if (n != null) setState(() => _max = n);
                                },
                              ),
                            ),
                            FilterChip(
                              label: const Text('showZero'),
                              selected: _showZero,
                              onSelected: (v) => setState(() => _showZero = v),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text('attention', style: theme.textTheme.labelMedium),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            for (final a in ['high', 'medium', 'low'])
                              ChoiceChip(
                                label: Text(a),
                                selected: _attention == a,
                                onSelected: (_) =>
                                    setState(() => _attention = a),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text('size', style: theme.textTheme.labelMedium),
                        const SizedBox(height: 8),
                        DropdownButton<OneUiCounterBadgeSize>(
                          value: _size,
                          isExpanded: true,
                          items: [
                            for (final s in kOneUiCounterBadgeSizes)
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
                          isExpanded: true,
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
                            labelText: 'aria-label',
                            isDense: true,
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
