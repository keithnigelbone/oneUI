import 'package:flutter/material.dart';

import '../widgets/one_ui_avatar.dart';
import '../widgets/one_ui_avatar_types.dart';

/// Web Default story + Controls — mirrors `Avatar.stories.tsx` argTypes.
class AvatarDefaultStoryPage extends StatefulWidget {
  const AvatarDefaultStoryPage({super.key});

  @override
  State<AvatarDefaultStoryPage> createState() => _AvatarDefaultStoryPageState();
}

class _AvatarDefaultStoryPageState extends State<AvatarDefaultStoryPage> {
  OneUiAvatarContent _content = OneUiAvatarContent.image;
  String _size = 'm';
  OneUiAvatarAttention _attention = OneUiAvatarAttention.high;
  String _appearance = 'auto';
  bool _disabled = false;
  bool _useCustomIcon = false;
  bool _useCustomFallback = false;
  double? _customSize;

  late final TextEditingController _srcController;
  late final TextEditingController _altController;
  late final TextEditingController _customSizeController;

  static const _appearances = [
    'auto',
    'primary',
    'neutral',
    'secondary',
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
    _srcController = TextEditingController(text: kOneUiAvatarSampleImageUrl);
    _altController = TextEditingController(text: 'John Doe');
    _customSizeController = TextEditingController();
  }

  @override
  void dispose() {
    _srcController.dispose();
    _altController.dispose();
    _customSizeController.dispose();
    super.dispose();
  }

  String get _resolvedAppearance =>
      _appearance == 'auto' ? 'primary' : _appearance;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final customIcon = _useCustomIcon
        ? const Text('U', key: ValueKey('storybook-user-icon'))
        : null;
    final customFallback = _useCustomFallback
        ? const Text('!', key: ValueKey('storybook-custom-fallback'))
        : null;

    final preview = OneUiAvatar(
      content: _content,
      size: _size,
      attention: _attention,
      appearance: _appearance,
      src: _content == OneUiAvatarContent.image ? _srcController.text : null,
      alt: _altController.text,
      customSize: _size == 'custom' ? _customSize : null,
      disabled: _disabled,
      icon: _content == OneUiAvatarContent.icon ? customIcon : null,
      fallback: customFallback,
    );

    // Adapt to the parent's bounding behaviour. In QaStoryCanvas the parent
    // height is bounded → Expanded lets the preview area absorb the leftover
    // space and the Controls panel never overflows. In AvatarFoundationsPage
    // the parent SingleChildScrollView is unbounded → we use a fixed-height
    // preview because Expanded inside an infinite-height Column throws
    // (was the root cause of the qa-playground:flutter blank-page bug).
    final previewArea = SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(child: preview),
    );
    return LayoutBuilder(
      builder: (context, constraints) {
        final bounded = constraints.maxHeight.isFinite;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: bounded ? MainAxisSize.max : MainAxisSize.min,
          children: [
            if (bounded)
              Expanded(child: previewArea)
            else
              SizedBox(height: 360, child: previewArea),
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
                    Wrap(
                      spacing: 16,
                      runSpacing: 12,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        SegmentedButton<OneUiAvatarContent>(
                          segments: const [
                            ButtonSegment(
                                value: OneUiAvatarContent.image,
                                label: Text('image')),
                            ButtonSegment(
                                value: OneUiAvatarContent.icon,
                                label: Text('icon')),
                            ButtonSegment(
                                value: OneUiAvatarContent.text,
                                label: Text('text')),
                          ],
                          selected: {_content},
                          onSelectionChanged: (s) =>
                              setState(() => _content = s.first),
                        ),
                        SizedBox(
                          width: 280,
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'src',
                              isDense: true,
                              border: OutlineInputBorder(),
                            ),
                            controller: _srcController,
                            enabled: _content == OneUiAvatarContent.image,
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        SizedBox(
                          width: 200,
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'alt',
                              isDense: true,
                              border: OutlineInputBorder(),
                            ),
                            controller: _altController,
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        DropdownMenu<String>(
                          label: const Text('size'),
                          initialSelection: _size,
                          dropdownMenuEntries: [
                            for (final s in kOneUiAvatarSizes)
                              DropdownMenuEntry(value: s, label: s),
                          ],
                          onSelected: (v) {
                            if (v != null) setState(() => _size = v);
                          },
                        ),
                        if (_size == 'custom')
                          SizedBox(
                            width: 120,
                            child: TextField(
                              decoration: const InputDecoration(
                                labelText: 'customSize',
                                isDense: true,
                                border: OutlineInputBorder(),
                              ),
                              controller: _customSizeController,
                              keyboardType: TextInputType.number,
                              onChanged: (v) => setState(() {
                                _customSize = double.tryParse(v);
                              }),
                            ),
                          ),
                        SegmentedButton<OneUiAvatarAttention>(
                          segments: [
                            for (final a in OneUiAvatarAttention.values)
                              ButtonSegment(value: a, label: Text(a.name)),
                          ],
                          selected: {_attention},
                          onSelectionChanged: (s) =>
                              setState(() => _attention = s.first),
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
                        FilterChip(
                          label: const Text('disabled'),
                          selected: _disabled,
                          onSelected: (v) => setState(() => _disabled = v),
                        ),
                        FilterChip(
                          label: const Text('custom icon'),
                          selected: _useCustomIcon,
                          onSelected: _content == OneUiAvatarContent.icon
                              ? (v) => setState(() => _useCustomIcon = v)
                              : null,
                        ),
                        FilterChip(
                          label: const Text('custom fallback'),
                          selected: _useCustomFallback,
                          onSelected: (v) =>
                              setState(() => _useCustomFallback = v),
                        ),
                      ],
                    ),
                    if (_content != OneUiAvatarContent.icon && _useCustomIcon)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          'Enable icon content to use custom icon.',
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                    const SizedBox(height: 8),
                    Text(
                      'Resolved appearance: $_resolvedAppearance',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
