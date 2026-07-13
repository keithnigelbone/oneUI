import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import 'input_field_brand_bind.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_input_field.dart';
import '../widgets/one_ui_input_types.dart';

/// Web `Default` story + **Controls** / **Actions** tabs (`InputField.stories.tsx` argTypes).
class InputFieldDefaultStoryPage extends StatefulWidget {
  const InputFieldDefaultStoryPage({super.key});

  @override
  State<InputFieldDefaultStoryPage> createState() =>
      _InputFieldDefaultStoryPageState();
}

class _InputFieldDefaultStoryPageState extends State<InputFieldDefaultStoryPage>
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
  late final TextEditingController _errorController;
  late final TextEditingController _dynamicTextController;

  String _size = 'm';
  String _appearance = 'auto';
  OneUiInputShape _shape = OneUiInputShape.defaultShape;
  OneUiInputAttention _attention = OneUiInputAttention.medium;
  String _type = 'text';
  bool _start = false;
  bool _end = false;
  bool _disabled = false;
  bool _readOnly = false;
  bool _required = false;
  final List<String> _actionLog = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _placeholderController = TextEditingController(text: 'Placeholder');
    _labelController = TextEditingController(text: 'Label');
    _descriptionController = TextEditingController();
    _errorController = TextEditingController();
    _dynamicTextController = TextEditingController();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _placeholderController.dispose();
    _labelController.dispose();
    _descriptionController.dispose();
    _errorController.dispose();
    _dynamicTextController.dispose();
    super.dispose();
  }

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

  String? _trimOrNull(String text) {
    final t = text.trim();
    return t.isEmpty ? null : t;
  }

  Widget _slotIcon() =>
      const OneUiIcon(icon: 'search', size: '5', appearance: 'secondary');

  Widget _buildPreview(BuildContext context) {
    final brandKey = inputFieldBrandScopeKey(context);
    return SizedBox(
      width: _demoWidth,
      child: OneUiInputField(
        key: ValueKey(
          'input-field-$brandKey-$_size-$_appearance-$_shape-$_attention-$_type-'
          '$_disabled-$_readOnly-$_required-$_start-$_end',
        ),
        label: _trimOrNull(_labelController.text),
        description: _trimOrNull(_descriptionController.text),
        placeholder: _trimOrNull(_placeholderController.text),
        size: _size,
        appearance: _resolvedAppearance,
        shape: _shape,
        attention: _attention,
        type: _type,
        start: _start ? _slotIcon() : null,
        end: _end ? const OneUiIcon(icon: 'close', size: '5') : null,
        disabled: _disabled,
        readOnly: _readOnly,
        required: _required,
        error: _trimOrNull(_errorController.text),
        dynamicText: _trimOrNull(_dynamicTextController.text),
        onChanged: (v) => _logAction('onChanged', v),
        onFocus: () => _logAction('onFocus'),
        onBlur: () => _logAction('onBlur'),
        onHelperPressed: () => _logAction('onHelperPressed'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    bindInputFieldBrandScope(context);
    final scheme = Theme.of(context).colorScheme;
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
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TabBar(
                controller: _tabController,
                tabs: [
                  Tab(text: 'Controls ($_controlCount)'),
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

  int get _controlCount => 16;

  Widget _buildControlsPanel(BuildContext context) {
    return Wrap(
      spacing: 16,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        _textControl('placeholder', _placeholderController, width: 200),
        _textControl('label', _labelController, width: 200),
        _textControl('description', _descriptionController, width: 260),
        _textControl('error', _errorController, width: 200),
        _textControl('dynamicText', _dynamicTextController, width: 200),
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
        _switchRow('start', _start, (v) => setState(() => _start = v)),
        _switchRow('end', _end, (v) => setState(() => _end = v)),
        _switchRow('disabled', _disabled, (v) => setState(() => _disabled = v)),
        _switchRow('readOnly', _readOnly, (v) => setState(() => _readOnly = v)),
        _switchRow('required', _required, (v) => setState(() => _required = v)),
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
            'Interact with the field — events appear here (onChanged, onFocus, onBlur, onHelperPressed).',
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
          child: Text(
            _actionLog[index],
            style: theme.textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
          ),
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
