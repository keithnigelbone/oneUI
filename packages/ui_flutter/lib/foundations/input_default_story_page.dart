import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_input.dart';
import '../widgets/one_ui_input_types.dart';
import '../widgets/one_ui_text_types.dart';

/// Preset args — mirrors React `Input.stories.tsx` story exports.
enum InputStoryPreset {
  defaultStory,
  withLabelAndDescription,
  withExternalLabel,
}

/// Web `Default` / `With Label And Description` / `With external label (a11y)` +
/// **Controls** + **Actions** tabs (`Input.stories.tsx` argTypes).
class InputDefaultStoryPage extends StatefulWidget {
  const InputDefaultStoryPage(
      {super.key, this.preset = InputStoryPreset.defaultStory});

  final InputStoryPreset preset;

  @override
  State<InputDefaultStoryPage> createState() => _InputDefaultStoryPageState();
}

class _InputDefaultStoryPageState extends State<InputDefaultStoryPage>
    with SingleTickerProviderStateMixin {
  static const _demoWidth = 348.0;
  static const _sizes = ['s', 'm', 'l'];
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
  static const _types = [
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search'
  ];

  late final TabController _tabController;
  late final TextEditingController _placeholderController;
  late final TextEditingController _labelController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _valueController;
  late final TextEditingController _defaultValueController;
  late final TextEditingController _idController;

  String _size = 'm';
  String _appearance = 'auto';
  OneUiInputShape _shape = OneUiInputShape.defaultShape;
  OneUiInputAttention _attention = OneUiInputAttention.medium;
  String _type = 'text';
  bool _start = false;
  bool _end = false;
  bool _start2 = false;
  bool _end2 = false;
  bool _disabled = false;
  bool _readOnly = false;
  bool _errorHighlight = false;
  bool _useControlledValue = false;
  final List<String> _actionLog = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    var placeholder = 'Placeholder';
    var label = '';
    var description = '';
    var id = 'input-with-label-demo';

    switch (widget.preset) {
      case InputStoryPreset.defaultStory:
        id = '';
        break;
      case InputStoryPreset.withLabelAndDescription:
        label = 'Email';
        description = 'We will never share your address.';
        placeholder = 'you@example.com';
        break;
      case InputStoryPreset.withExternalLabel:
        label = 'Search';
        id = 'input-with-label-demo';
        break;
    }

    _placeholderController = TextEditingController(text: placeholder);
    _labelController = TextEditingController(text: label);
    _descriptionController = TextEditingController(text: description);
    _valueController = TextEditingController();
    _defaultValueController = TextEditingController();
    _idController = TextEditingController(text: id);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _placeholderController.dispose();
    _labelController.dispose();
    _descriptionController.dispose();
    _valueController.dispose();
    _defaultValueController.dispose();
    _idController.dispose();
    super.dispose();
  }

  bool get _externalLabelMode =>
      widget.preset == InputStoryPreset.withExternalLabel;

  OneUiInputAppearance get _resolvedAppearance {
    return OneUiInputAppearance.values.firstWhere(
      (e) => e.wireValue == _appearance,
      orElse: () => OneUiInputAppearance.auto,
    );
  }

  void _logAction(String name, [String? detail]) {
    setState(() {
      final line = detail == null ? name : '$name: $detail';
      _actionLog.insert(0, line);
      if (_actionLog.length > 30) {
        _actionLog.removeRange(30, _actionLog.length);
      }
    });
  }

  Widget _slotIcon() =>
      const OneUiIcon(icon: 'search', size: '5', appearance: 'secondary');

  String _brandScopeKey(BuildContext context) {
    final scope = OneUiScope.of(context);
    final load = OneUiBrandLoadState.maybeOf(context);
    final snap = load?.snapshot;
    return [
      scope.platformId,
      scope.density,
      snap?.brandHash ?? 'unbranded',
      scope.designSystem?.activeDimensionKey ?? '',
      scope.designSystem?.componentCustomProperties.length ?? 0,
      scope.nativeTypography?.fontFamilyPrimary ?? '',
      load?.loading == true ? 'loading' : 'ready',
    ].join('|');
  }

  Widget _buildPreview(BuildContext context) {
    final brandKey = _brandScopeKey(context);
    final input = OneUiInput(
      key: ValueKey(
        'input-$brandKey-$_useControlledValue-${_defaultValueController.text}-$_size-$_appearance-$_shape-$_attention-$_type',
      ),
      placeholder: _placeholderController.text.isEmpty
          ? null
          : _placeholderController.text,
      size: _size,
      appearance: _resolvedAppearance,
      shape: _shape,
      attention: _attention,
      type: _type,
      disabled: _disabled,
      readOnly: _readOnly,
      errorHighlight: _errorHighlight,
      label: _externalLabelMode ? null : _trimOrNull(_labelController.text),
      description:
          _externalLabelMode ? null : _trimOrNull(_descriptionController.text),
      id: _trimOrNull(_idController.text),
      value: _useControlledValue ? _valueController.text : null,
      defaultValue: !_useControlledValue
          ? _trimOrNull(_defaultValueController.text)
          : null,
      start: _start ? _slotIcon() : null,
      end: _end ? _slotIcon() : null,
      start2: _start2 ? const Text('₹') : null,
      end2: _end2 ? const Text('.00') : null,
      onChanged: (v) => _logAction('onChanged', v),
      onFocus: () => _logAction('onFocus'),
      onBlur: () => _logAction('onBlur'),
      onKeyDown: (_) => _logAction('onKeyDown'),
    );

    if (_externalLabelMode) {
      return SizedBox(
        width: _demoWidth,
        child: _ExternalLabelWrapper(
          label: _trimOrNull(_labelController.text) ?? 'Search',
          child: input,
        ),
      );
    }

    return SizedBox(width: _demoWidth, child: input);
  }

  String? _trimOrNull(String text) {
    final t = text.trim();
    return t.isEmpty ? null : t;
  }

  @override
  Widget build(BuildContext context) {
    // Rebuild when toolbar brand / theme / density / platform changes.
    OneUiScope.of(context);
    OneUiBrandLoadState.maybeOf(context);

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final load = OneUiBrandLoadState.maybeOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  _buildPreview(context),
                  if (load?.loading == true)
                    const Positioned.fill(
                      child: ColoredBox(
                        color: Color(0x33FFFFFF),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
        Material(
          color: scheme.surfaceContainerHighest.withOpacity(0.5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TabBar(
                controller: _tabController,
                tabs: [
                  Tab(text: 'Controls (${_controlCount})'),
                  Tab(text: 'Actions (${_actionLog.length})'),
                ],
              ),
              SizedBox(
                height: 300,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                      child: _buildControlsPanel(context),
                    ),
                    _buildActionsPanel(context),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  int get _controlCount => 18;

  Widget _buildControlsPanel(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        _textControl('placeholder', _placeholderController, width: 200),
        _labeled(
          context,
          'size',
          DropdownButton<String>(
            value: _size,
            isDense: true,
            items: [
              for (final s in _sizes) DropdownMenuItem(value: s, child: Text(s))
            ],
            onChanged: (v) {
              if (v != null) setState(() => _size = v);
            },
          ),
        ),
        _labeled(
          context,
          'appearance',
          DropdownButton<String>(
            value: _appearance,
            isDense: true,
            items: [
              for (final a in _appearances)
                DropdownMenuItem(value: a, child: Text(a)),
            ],
            onChanged: (v) {
              if (v != null) setState(() => _appearance = v);
            },
          ),
        ),
        _labeled(
          context,
          'shape',
          SegmentedButton<OneUiInputShape>(
            segments: const [
              ButtonSegment(
                  value: OneUiInputShape.defaultShape, label: Text('default')),
              ButtonSegment(value: OneUiInputShape.pill, label: Text('pill')),
            ],
            selected: {_shape},
            onSelectionChanged: (s) => setState(() => _shape = s.first),
          ),
        ),
        _labeled(
          context,
          'attention',
          SegmentedButton<OneUiInputAttention>(
            segments: const [
              ButtonSegment(
                  value: OneUiInputAttention.medium, label: Text('medium')),
              ButtonSegment(
                  value: OneUiInputAttention.high, label: Text('high')),
            ],
            selected: {_attention},
            onSelectionChanged: (s) => setState(() => _attention = s.first),
          ),
        ),
        _switchRow('start', _start, (v) => setState(() => _start = v)),
        _switchRow('end', _end, (v) => setState(() => _end = v)),
        _switchRow('start2', _start2, (v) => setState(() => _start2 = v)),
        _switchRow('end2', _end2, (v) => setState(() => _end2 = v)),
        _switchRow('disabled', _disabled, (v) => setState(() => _disabled = v)),
        _switchRow('readOnly', _readOnly, (v) => setState(() => _readOnly = v)),
        _switchRow('errorHighlight', _errorHighlight,
            (v) => setState(() => _errorHighlight = v)),
        _labeled(
          context,
          'type',
          DropdownButton<String>(
            value: _type,
            isDense: true,
            items: [
              for (final t in _types) DropdownMenuItem(value: t, child: Text(t))
            ],
            onChanged: (v) {
              if (v != null) setState(() => _type = v);
            },
          ),
        ),
        if (!_externalLabelMode) ...[
          _textControl('label', _labelController, width: 200),
          _textControl('description', _descriptionController, width: 260),
        ] else ...[
          _textControl('label (external)', _labelController, width: 200),
          _textControl('id', _idController, width: 220),
        ],
        _switchRow('controlled value', _useControlledValue,
            (v) => setState(() => _useControlledValue = v)),
        if (_useControlledValue)
          _textControl('value', _valueController, width: 200)
        else
          _textControl('defaultValue', _defaultValueController, width: 200),
        if (!_externalLabelMode) _textControl('id', _idController, width: 200),
      ],
    );
  }

  Widget _buildActionsPanel(BuildContext context) {
    final theme = Theme.of(context);
    if (_actionLog.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'Interact with the input — events appear here (onChanged, onFocus, onBlur, onKeyDown).',
            style: theme.textTheme.bodySmall
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _actionLog.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Text(_actionLog[index],
              style:
                  theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace')),
        );
      },
    );
  }

  Widget _textControl(String name, TextEditingController controller,
      {double width = 180}) {
    return SizedBox(
      width: width,
      child: TextField(
        decoration: InputDecoration(
          labelText: name,
          isDense: true,
          border: const OutlineInputBorder(),
        ),
        controller: controller,
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  Widget _labeled(BuildContext context, String name, Widget control) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(name, style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 4),
        control,
      ],
    );
  }

  Widget _switchRow(String name, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Switch(value: value, onChanged: onChanged),
        Text(name, style: Theme.of(context).textTheme.labelSmall),
      ],
    );
  }
}

/// External `<label htmlFor>` pattern — React `WithExternalLabel` story.
class _ExternalLabelWrapper extends StatelessWidget {
  const _ExternalLabelWrapper({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final labelStyle = resolveOneUiTextTypographyStyle(
      context,
      variant: OneUiTextVariant.label,
      size: 'S',
      weight: OneUiTextWeight.medium,
    );

    return Semantics(
      container: true,
      label: label,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: labelStyle),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}
