import 'package:flutter/material.dart';

import 'divider_brand_bind.dart';
import '../widgets/one_ui_divider.dart';
import '../widgets/one_ui_icon.dart';

/// Web Default story + Controls — mirrors `Divider.stories.tsx` argTypes.
class DividerDefaultStoryPage extends StatefulWidget {
  const DividerDefaultStoryPage({super.key});

  @override
  State<DividerDefaultStoryPage> createState() =>
      _DividerDefaultStoryPageState();
}

class _DividerDefaultStoryPageState extends State<DividerDefaultStoryPage> {
  String _orientation = kOneUiDividerHorizontal;
  String _size = kOneUiDividerSizeM;
  String _content = kOneUiDividerContentNone;
  String _contentAlign = kOneUiDividerAlignCenter;
  String _attention = 'low';
  String _appearance = 'auto';
  bool _roundCaps = kOneUiDividerRoundCapsDefault;
  late final TextEditingController _childrenController;

  static const _orientations = [kOneUiDividerHorizontal, kOneUiDividerVertical];
  static const _sizes = [
    kOneUiDividerSizeS,
    kOneUiDividerSizeM,
    kOneUiDividerSizeL
  ];
  static const _contents = [
    kOneUiDividerContentNone,
    kOneUiDividerContentIcon,
    kOneUiDividerContentLabel,
  ];
  static const _aligns = [
    kOneUiDividerAlignCenter,
    kOneUiDividerAlignStart,
    kOneUiDividerAlignEnd,
  ];
  static const _attentions = ['high', 'medium', 'low'];
  static const _appearances = [
    'auto',
    'primary',
    'secondary',
    'neutral',
    'sparkle',
    'positive',
    'negative',
    'warning',
    'informative',
  ];

  @override
  void initState() {
    super.initState();
    _childrenController = TextEditingController(text: 'Section');
  }

  @override
  void dispose() {
    _childrenController.dispose();
    super.dispose();
  }

  Object? _previewChild() {
    if (_content == kOneUiDividerContentNone) return null;
    if (_content == kOneUiDividerContentIcon) {
      return const OneUiIcon(icon: 'star', excludeFromSemantics: true);
    }
    final text = _childrenController.text.trim();
    return text.isEmpty ? null : text;
  }

  @override
  Widget build(BuildContext context) {
    bindDividerBrandScope(context);
    final brandKey = dividerBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isVertical = _orientation == kOneUiDividerVertical;
    final previewChild = _previewChild();

    final preview = KeyedSubtree(
      key: ValueKey(
        'divider-preview|$brandKey|$_orientation|$_size|$_content|$_contentAlign|'
        '$_attention|$_appearance|$_roundCaps|${_childrenController.text}',
      ),
      child: SizedBox(
        height: isVertical ? 160 : null,
        width: double.infinity,
        child: Align(
          alignment: isVertical ? Alignment.center : Alignment.centerLeft,
          child: OneUiDivider(
            orientation: _orientation,
            size: _size,
            content: _content,
            contentAlign: _contentAlign,
            attention: _attention,
            appearance: _appearance,
            roundCaps: _roundCaps,
            child: previewChild,
            testId: 'divider-root',
          ),
        ),
      ),
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Default', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: scheme.outlineVariant),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: preview,
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 16,
            runSpacing: 12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _dropdown(
                label: 'orientation',
                value: _orientation,
                items: _orientations,
                onChanged: (v) => setState(() => _orientation = v!),
              ),
              _dropdown(
                label: 'size',
                value: _size,
                items: _sizes,
                onChanged: (v) => setState(() => _size = v!),
              ),
              _dropdown(
                label: 'content',
                value: _content,
                items: _contents,
                onChanged: (v) => setState(() => _content = v!),
              ),
              _dropdown(
                label: 'contentAlign',
                value: _contentAlign,
                items: _aligns,
                onChanged: (v) => setState(() => _contentAlign = v!),
              ),
              _dropdown(
                label: 'attention',
                value: _attention,
                items: _attentions,
                onChanged: (v) => setState(() => _attention = v!),
              ),
              _dropdown(
                label: 'appearance',
                value: _appearance,
                items: _appearances,
                onChanged: (v) => setState(() => _appearance = v!),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Checkbox(
                    value: _roundCaps,
                    onChanged: (v) => setState(() => _roundCaps = v ?? false),
                  ),
                  const Text('roundCaps'),
                ],
              ),
            ],
          ),
          if (_content == kOneUiDividerContentLabel) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: 280,
              child: TextField(
                controller: _childrenController,
                decoration: const InputDecoration(
                  labelText: 'children (text)',
                  isDense: true,
                ),
                onChanged: (_) => setState(() {}),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _dropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelSmall),
        DropdownButton<String>(
          value: value,
          items: [
            for (final item in items)
              DropdownMenuItem(value: item, child: Text(item)),
          ],
          onChanged: onChanged,
        ),
      ],
    );
  }
}
