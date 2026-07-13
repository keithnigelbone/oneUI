import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import 'input_internals_brand_bind.dart';
import '../widgets/one_ui_icon.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';

/// Mirrors `InputFeedback.stories.tsx` Default + Controls.
class InputFeedbackDefaultStoryPage extends StatefulWidget {
  const InputFeedbackDefaultStoryPage({super.key});

  @override
  State<InputFeedbackDefaultStoryPage> createState() =>
      _InputFeedbackDefaultStoryPageState();
}

class _InputFeedbackDefaultStoryPageState
    extends State<InputFeedbackDefaultStoryPage>
    with SingleTickerProviderStateMixin {
  static const _demoWidth = 348.0;

  late final TabController _tabController;
  late final TextEditingController _messageController;
  late final TextEditingController _ariaLabelController;
  late final TextEditingController _accessibilityHintController;
  late final TextEditingController _testIdController;

  OneUiInputFeedbackVariant _variant = OneUiInputFeedbackVariant.negative;
  OneUiInputFeedbackAttention _attention = OneUiInputFeedbackAttention.low;
  OneUiInputFeedbackSize _size = OneUiInputFeedbackSize.m;
  OneUiInputFeedbackRole? _role;
  String? _customIconName;
  bool _ariaHidden = false;

  static const _customIconOptions = <String?>[
    null,
    'help',
    'lock',
    'check',
    'error',
    'info',
    'warning',
    'checkCircle',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _messageController = TextEditingController(
      text: 'Password must be at least 8 characters.',
    );
    _ariaLabelController = TextEditingController();
    _accessibilityHintController = TextEditingController();
    _testIdController = TextEditingController();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _messageController.dispose();
    _ariaLabelController.dispose();
    _accessibilityHintController.dispose();
    _testIdController.dispose();
    super.dispose();
  }

  Widget? _customIcon() {
    final name = _customIconName;
    if (name == null) return null;
    return OneUiIcon(icon: name, size: '4', excludeFromSemantics: true);
  }

  @override
  Widget build(BuildContext context) {
    bindInputInternalsBrandScope(context);
    final brandKey = inputInternalsBrandScopeKey(context);
    final load = OneUiBrandLoadState.maybeOf(context);

    final preview = SizedBox(
      width: _demoWidth,
      child: OneUiInputFeedback(
        key: ValueKey(
          'default-$brandKey-${_variant.name}-${_attention.name}-${_size.wireValue}-$_role',
        ),
        variant: _variant,
        attention: _attention,
        size: _size,
        feedbackMessage: _messageController.text,
        customIcon: _customIcon(),
        role: _role,
        ariaLabel: _ariaLabelController.text.trim().isEmpty
            ? null
            : _ariaLabelController.text.trim(),
        ariaHidden: _ariaHidden,
        accessibilityHint: _accessibilityHintController.text.trim().isEmpty
            ? null
            : _accessibilityHintController.text.trim(),
        testId: _testIdController.text.trim().isEmpty
            ? null
            : _testIdController.text.trim(),
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Align(
              alignment: Alignment.topLeft,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  preview,
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
          child: Column(
            children: [
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Controls'),
                  Tab(text: 'Actions'),
                ],
              ),
              SizedBox(
                height: 320,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        DropdownButtonFormField<OneUiInputFeedbackVariant>(
                          value: _variant,
                          decoration:
                              const InputDecoration(labelText: 'variant'),
                          items: kOneUiInputFeedbackVariants
                              .map(
                                (v) => DropdownMenuItem(
                                  value: v,
                                  child: Text(v.name),
                                ),
                              )
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _variant = v ?? _variant),
                        ),
                        DropdownButtonFormField<OneUiInputFeedbackAttention>(
                          value: _attention,
                          decoration:
                              const InputDecoration(labelText: 'attention'),
                          items: kOneUiInputFeedbackAttentions
                              .map(
                                (a) => DropdownMenuItem(
                                  value: a,
                                  child: Text(a.name),
                                ),
                              )
                              .toList(),
                          onChanged: (v) =>
                              setState(() => _attention = v ?? _attention),
                        ),
                        DropdownButtonFormField<OneUiInputFeedbackSize>(
                          value: _size,
                          decoration: const InputDecoration(labelText: 'size'),
                          items: kOneUiInputFeedbackSizes
                              .map(
                                (s) => DropdownMenuItem(
                                  value: s,
                                  child: Text(s.wireValue),
                                ),
                              )
                              .toList(),
                          onChanged: (v) => setState(() => _size = v ?? _size),
                        ),
                        TextField(
                          controller: _messageController,
                          decoration: const InputDecoration(
                              labelText: 'feedback_message'),
                          onChanged: (_) => setState(() {}),
                        ),
                        DropdownButtonFormField<String?>(
                          value: _customIconName,
                          decoration:
                              const InputDecoration(labelText: 'customIcon'),
                          items: _customIconOptions
                              .map(
                                (name) => DropdownMenuItem(
                                  value: name,
                                  child: Text(name ?? '(default)'),
                                ),
                              )
                              .toList(),
                          onChanged: (v) => setState(() => _customIconName = v),
                        ),
                        DropdownButtonFormField<OneUiInputFeedbackRole?>(
                          value: _role,
                          decoration: const InputDecoration(
                              labelText: 'role (override)'),
                          items: const [
                            DropdownMenuItem(
                                value: null, child: Text('(variant default)')),
                            DropdownMenuItem(
                              value: OneUiInputFeedbackRole.alert,
                              child: Text('alert'),
                            ),
                            DropdownMenuItem(
                              value: OneUiInputFeedbackRole.status,
                              child: Text('status'),
                            ),
                            DropdownMenuItem(
                              value: OneUiInputFeedbackRole.none,
                              child: Text('none'),
                            ),
                          ],
                          onChanged: (v) => setState(() => _role = v),
                        ),
                        TextField(
                          controller: _ariaLabelController,
                          decoration:
                              const InputDecoration(labelText: 'aria-label'),
                          onChanged: (_) => setState(() {}),
                        ),
                        SwitchListTile(
                          title: const Text('aria-hidden'),
                          value: _ariaHidden,
                          onChanged: (v) => setState(() => _ariaHidden = v),
                        ),
                        TextField(
                          controller: _accessibilityHintController,
                          decoration: const InputDecoration(
                              labelText: 'accessibilityHint'),
                          onChanged: (_) => setState(() {}),
                        ),
                        TextField(
                          controller: _testIdController,
                          decoration:
                              const InputDecoration(labelText: 'testId'),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text(
                          'Default role: negative → alert (assertive); others → status (polite). '
                          'See Roles story for side-by-side examples.',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
