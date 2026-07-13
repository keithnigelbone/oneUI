import 'package:flutter/material.dart';

import '../widgets/one_ui_brand_logo.dart';
import '../widgets/one_ui_logo_types.dart';
import 'logo_showcase.dart';

/// Web `Interactive` — centered preview + Controls panel (Storybook argTypes parity).
class LogoInteractiveStoryPage extends StatefulWidget {
  const LogoInteractiveStoryPage({super.key});

  @override
  State<LogoInteractiveStoryPage> createState() =>
      _LogoInteractiveStoryPageState();
}

class _LogoInteractiveStoryPageState extends State<LogoInteractiveStoryPage> {
  OneUiLogoVariant _variant = OneUiLogoVariant.mark;
  OneUiLogoSize _size = OneUiLogoSize.m;
  double? _customSize = 48;
  bool _interactive = false;
  bool _disabled = false;
  late final TextEditingController _altController;
  late final TextEditingController _customSizeController;

  @override
  void initState() {
    super.initState();
    _altController = TextEditingController(text: 'Brand Logo');
    _customSizeController = TextEditingController(text: '48');
  }

  @override
  void dispose() {
    _altController.dispose();
    _customSizeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final preview = OneUiBrandLogo(
      variant: _variant,
      size: _size,
      customSize: _size == OneUiLogoSize.custom ? _customSize : null,
      alt: _altController.text,
      interactive: _interactive,
      disabled: _disabled,
      onPress: _interactive ? () {} : null,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final controlsMax = constraints.maxHeight * 0.45;
              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                      minHeight: constraints.maxHeight - controlsMax),
                  child: Center(child: preview),
                ),
              );
            },
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
                    DropdownMenu<OneUiLogoVariant>(
                      label: const Text('variant'),
                      initialSelection: _variant,
                      dropdownMenuEntries: [
                        for (final v in OneUiLogoVariant.values)
                          DropdownMenuEntry(value: v, label: v.name),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _variant = v);
                      },
                    ),
                    DropdownMenu<OneUiLogoSize>(
                      label: const Text('size'),
                      initialSelection: _size,
                      dropdownMenuEntries: [
                        for (final s in OneUiLogoSize.values)
                          DropdownMenuEntry(
                              value: s, label: oneUiLogoSizeWire(s)),
                      ],
                      onSelected: (v) {
                        if (v != null) setState(() => _size = v);
                      },
                    ),
                    if (_size == OneUiLogoSize.custom)
                      SizedBox(
                        width: 120,
                        child: TextField(
                          decoration:
                              const InputDecoration(labelText: 'customSize'),
                          keyboardType: TextInputType.number,
                          controller: _customSizeController,
                          onSubmitted: (v) {
                            final n = double.tryParse(v);
                            if (n != null) setState(() => _customSize = n);
                          },
                        ),
                      ),
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: _altController,
                        decoration: const InputDecoration(labelText: 'alt'),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    FilterChip(
                      label: const Text('interactive'),
                      selected: _interactive,
                      onSelected: (v) => setState(() => _interactive = v),
                    ),
                    FilterChip(
                      label: const Text('disabled'),
                      selected: _disabled,
                      onSelected: (v) => setState(() => _disabled = v),
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
