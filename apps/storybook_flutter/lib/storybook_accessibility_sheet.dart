import 'package:flutter/material.dart';
import 'package:ui_flutter/ui_flutter.dart';

import 'storybook_a11y_report.dart';

/// Bottom sheet (**Storybook “Accessibility” addon** layout).
Future<void> showStorybookAccessibilitySheet(
  BuildContext context, {
  required Future<StorybookA11yAuditResult> Function() runAudit,
}) {
  final h = MediaQuery.sizeOf(context).height;
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    useSafeArea: true,
    constraints: BoxConstraints(maxHeight: h * 0.88),
    builder: (ctx) => _StorybookAccessibilitySheetBody(runAudit: runAudit),
  );
}

class _StorybookAccessibilitySheetBody extends StatefulWidget {
  const _StorybookAccessibilitySheetBody({required this.runAudit});

  final Future<StorybookA11yAuditResult> Function() runAudit;

  @override
  State<_StorybookAccessibilitySheetBody> createState() =>
      _StorybookAccessibilitySheetBodyState();
}

class _StorybookAccessibilitySheetBodyState extends State<_StorybookAccessibilitySheetBody>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  StorybookA11yAuditResult? _result;
  bool _loading = true;
  String? _err;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _kick();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _kick() async {
    setState(() {
      _loading = true;
      _err = null;
    });
    try {
      final r = await widget.runAudit();
      if (mounted) setState(() => _result = r);
    } catch (e) {
      if (mounted) setState(() => _err = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Material(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 8, 0),
            child: Row(
              children: [
                Text('Accessibility', style: Theme.of(context).textTheme.titleLarge),
                const Spacer(),
                IconButton(
                  tooltip: 'Rerun audit',
                  onPressed: _loading ? null : _kick,
                  icon: _loading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: OneUiCircularProgressIndicator(
                            variant: 'indeterminate',
                            size: 'XS',
                            appearance: 'primary',
                            ariaHidden: true,
                          ),
                        )
                      : const Icon(Icons.refresh),
                ),
                IconButton(
                  tooltip: 'Close',
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          if (_err != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(_err!, style: TextStyle(color: cs.error)),
            ),
          if (_loading && _result == null)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: Text('Running automated checks…')),
            )
          else if (_result != null) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Wrap(
                spacing: 12,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _pill(context, 'Violations', _result!.violationCount.toString(), cs.error),
                  _pill(context, 'Passes', _result!.passCount.toString(), cs.primary),
                  _pill(context, 'Inconclusive', _result!.incompleteCount.toString(), cs.tertiary),
                ],
              ),
            ),
            Material(
              color: cs.surfaceContainerLow,
              child: TabBar(
                controller: _tabs,
                isScrollable: true,
                tabs: const [
                  Tab(text: 'Violations'),
                  Tab(text: 'Passes'),
                  Tab(text: 'Inconclusive'),
                  Tab(text: 'Notes'),
                ],
              ),
            ),
            SizedBox(
              height: MediaQuery.sizeOf(context).height * 0.45,
              child: TabBarView(
                controller: _tabs,
                children: [
                  _itemList(context, _result!.violations),
                  _itemList(context, _result!.passes),
                  _itemList(context, _result!.incomplete),
                  _notesList(context, _result!),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  static Widget _pill(
    BuildContext context,
    String label,
    String value,
    Color color,
  ) {
    return Chip(
      avatar: CircleAvatar(
        backgroundColor: color.withOpacity(0.2),
        foregroundColor: color,
        child: Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ),
      label: Text('$label — $value'),
    );
  }

  Widget _itemList(BuildContext context, List<StorybookA11yItem> items) {
    if (items.isEmpty) {
      return Center(
        child: Text(
          'None',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).hintColor,
              ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final it = items[i];
        return ExpansionTile(
          title: Text(
            '${it.ruleId} ×${it.instanceCount}',
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
          subtitle: Text(
            it.engine == StorybookA11yEngine.axe ? 'axe-core' : 'Semantics scan',
            style: Theme.of(context).textTheme.labelSmall,
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  it.description != null && it.description!.isNotEmpty
                      ? '${it.help}\n\n${it.description}'
                      : it.help,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _notesList(BuildContext context, StorybookA11yAuditResult r) {
    final lines = <String>[
      if (r.axeUnavailableReason != null) r.axeUnavailableReason!,
      if (r.scanError != null) 'Error: ${r.scanError}',
      ...r.semanticsNotes,
    ];
    if (lines.isEmpty) {
      return const Center(child: Text('No notes.'));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        for (final line in lines)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(line, style: Theme.of(context).textTheme.bodyMedium),
          ),
      ],
    );
  }
}
