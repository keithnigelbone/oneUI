import 'package:flutter/material.dart';

import 'input_internals_brand_bind.dart';
import '../widgets/one_ui_input_dynamic_text.dart';
import '../widgets/one_ui_input_dynamic_text_types.dart';

class InputDynamicTextDocsPage extends StatelessWidget {
  const InputDynamicTextDocsPage({super.key});

  static const _description =
      'Figma `.DNA/DynamicText`: optional `content` (Body / Text-Medium) and optional '
      '`end` (same row, rendered with `Button` `attention="low"` + `condensed`, size S/M/L). '
      'Use `aria-live` on the leading copy when it updates (e.g. character counts).';

  @override
  Widget build(BuildContext context) {
    bindInputInternalsBrandScope(context);
    final brandKey = inputInternalsBrandScopeKey(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'InputDynamicText',
            style: theme.textTheme.headlineMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            _description,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: scheme.outlineVariant),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Align(
                alignment: Alignment.centerLeft,
                child: OneUiInputDynamicText(
                  key: ValueKey('docs-$brandKey'),
                  size: OneUiInputLabelSize.m,
                  content: '0 / 280 characters',
                  end: 'Helper Button',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
