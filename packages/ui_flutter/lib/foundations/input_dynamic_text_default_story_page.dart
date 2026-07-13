import 'package:flutter/material.dart';

import '../brand/one_ui_brand_scope.dart';
import 'input_internals_brand_bind.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_input_dynamic_text_types.dart';

/// Mirrors `InputDynamicText.stories.tsx` Default + Controls.
class InputDynamicTextDefaultStoryPage extends StatefulWidget {
  const InputDynamicTextDefaultStoryPage({super.key});

  @override
  State<InputDynamicTextDefaultStoryPage> createState() =>
      _InputDynamicTextDefaultStoryPageState();
}

class _InputDynamicTextDefaultStoryPageState
    extends State<InputDynamicTextDefaultStoryPage>
    with SingleTickerProviderStateMixin {
  static const _demoWidth = 348.0;

  late final TabController _tabController;
  late final TextEditingController _contentController;
  late final TextEditingController _endController;
  late final TextEditingController _endAriaLabelController;
  late final TextEditingController _accessibilityHintController;
  late final TextEditingController _testIdController;

  OneUiInputLabelSize _size = OneUiInputLabelSize.m;
  bool _disabled = false;
  OneUiInputDynamicTextAriaLive? _ariaLive;
  final List<String> _actionLog = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _contentController = TextEditingController(text: '0 / 280 characters');
    _endController = TextEditingController(text: 'Helper Button');
    _endAriaLabelController = TextEditingController();
    _accessibilityHintController = TextEditingController();
    _testIdController = TextEditingController();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _contentController.dispose();
    _endController.dispose();
    _endAriaLabelController.dispose();
    _accessibilityHintController.dispose();
    _testIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bindInputInternalsBrandScope(context);
    final brandKey = inputInternalsBrandScopeKey(context);
    final load = OneUiBrandLoadState.maybeOf(context);

    final preview = SizedBox(
      width: _demoWidth,
      child: OneUiInputDynamicText(
        key: ValueKey('default-$brandKey-$_size-$_disabled-$_ariaLive'),
        size: _size,
        content: _contentController.text,
        end: _endController.text,
        disabled: _disabled,
        ariaLive: _ariaLive,
        onEndClick: () => setState(() => _actionLog.add('onEndClick')),
        endAriaLabel: _endAriaLabelController.text.trim().isEmpty
            ? null
            : _endAriaLabelController.text.trim(),
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
                height: 280,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        DropdownButtonFormField<OneUiInputLabelSize>(
                          value: _size,
                          decoration: const InputDecoration(labelText: 'size'),
                          items: OneUiInputLabelSize.values
                              .map(
                                (s) => DropdownMenuItem(
                                  value: s,
                                  child: Text(s.name),
                                ),
                              )
                              .toList(),
                          onChanged: (v) => setState(() => _size = v ?? _size),
                        ),
                        TextField(
                          controller: _contentController,
                          decoration:
                              const InputDecoration(labelText: 'content'),
                          onChanged: (_) => setState(() {}),
                        ),
                        TextField(
                          controller: _endController,
                          decoration: const InputDecoration(labelText: 'end'),
                          onChanged: (_) => setState(() {}),
                        ),
                        SwitchListTile(
                          title: const Text('disabled'),
                          value: _disabled,
                          onChanged: (v) => setState(() => _disabled = v),
                        ),
                        DropdownButtonFormField<OneUiInputDynamicTextAriaLive?>(
                          value: _ariaLive,
                          decoration:
                              const InputDecoration(labelText: 'aria-live'),
                          items: const [
                            DropdownMenuItem(
                                value: null, child: Text('(none)')),
                            DropdownMenuItem(
                              value: OneUiInputDynamicTextAriaLive.polite,
                              child: Text('polite'),
                            ),
                            DropdownMenuItem(
                              value: OneUiInputDynamicTextAriaLive.assertive,
                              child: Text('assertive'),
                            ),
                          ],
                          onChanged: (v) => setState(() => _ariaLive = v),
                        ),
                        TextField(
                          controller: _endAriaLabelController,
                          decoration:
                              const InputDecoration(labelText: 'endAriaLabel'),
                          onChanged: (_) => setState(() {}),
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
                    ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        const Text('onEndClick log:',
                            style: TextStyle(fontWeight: FontWeight.w600)),
                        if (_actionLog.isEmpty)
                          const Text('(tap Helper Button)')
                        else
                          ..._actionLog.map((e) => Text(e)),
                      ],
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
