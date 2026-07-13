import 'package:flutter/material.dart';

import 'input_internals_brand_bind.dart';
import '../widgets/one_ui_input_feedback.dart';
import '../widgets/one_ui_input_feedback_types.dart';

class InputFeedbackDocsPage extends StatelessWidget {
  const InputFeedbackDocsPage({super.key});

  static const _description =
      'Semantic feedback region for errors and contextual messages. Supports four variants '
      '(negative, positive, warning, informative), three attention levels (low / medium / high), '
      'and S/M/L sizing. Use `feedback_message` for string copy. `customIcon` overrides the default '
      'semantic icon. Negative messages default to an assertive alert live region; other variants '
      'use polite status semantics.';

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
            'InputFeedback',
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
                child: OneUiInputFeedback(
                  key: ValueKey('docs-$brandKey'),
                  feedbackMessage: 'Password must be at least 8 characters.',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
