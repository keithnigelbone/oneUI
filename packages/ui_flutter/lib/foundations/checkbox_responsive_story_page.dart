import 'package:flutter/material.dart';

import '../engine/checkbox_size_resolve.dart';
import 'checkbox_brand_bind.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_checkbox.dart';
import '../widgets/one_ui_checkbox_types.dart';

/// Web `Responsive` story — S / M / L rows, each checkbox independently toggleable.
class CheckboxResponsiveStoryPage extends StatefulWidget {
  const CheckboxResponsiveStoryPage({super.key});

  @override
  State<CheckboxResponsiveStoryPage> createState() =>
      _CheckboxResponsiveStoryPageState();
}

class _CheckboxResponsiveStoryPageState
    extends State<CheckboxResponsiveStoryPage> {
  /// Independent state per row — unchecked and checked rows for the same size
  /// can diverge after interaction (web Storybook controlled preview parity).
  final Map<String, bool> _checked = {
    for (final size in kOneUiCheckboxSizes) ...{
      '$size-unchecked': false,
      '$size-checked': true,
    },
  };

  void _onChanged(String key, bool value) {
    setState(() => _checked[key] = value);
  }

  @override
  Widget build(BuildContext context) {
    bindCheckboxBrandScope(context);
    final scope = OneUiScope.of(context);
    final ds = scope.designSystem;
    final brandKey = checkboxBrandScopeKey(context);

    String boxPx(OneUiCheckboxSize size) {
      if (ds == null) return '?';
      final m = resolveCheckboxMetrics(context, ds, size: size);
      return '${m.boxSize.toStringAsFixed(0)}px';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Platform ${scope.platformId} · density ${scope.density}. '
          'Resize the story column (toolbar → Responsive) to change '
          '`--Checkbox-boxSize-*` like web viewport → `[data-Breakpoint]`.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        for (final size in kOneUiCheckboxSizes) ...[
          OneUiCheckbox(
            key: ValueKey('responsive-$brandKey-$size-unchecked'),
            size: size,
            label: 'Unchecked $size (${boxPx(size)} box)',
            checked: _checked['$size-unchecked'] ?? false,
            onCheckedChange: (v) => _onChanged('$size-unchecked', v),
          ),
          const SizedBox(height: 14),
          OneUiCheckbox(
            key: ValueKey('responsive-$brandKey-$size-checked'),
            size: size,
            label: 'Checked $size (${boxPx(size)} box)',
            checked: _checked['$size-checked'] ?? true,
            onCheckedChange: (v) => _onChanged('$size-checked', v),
          ),
          if (size != kOneUiCheckboxSizes.last) const SizedBox(height: 16),
        ],
      ],
    );
  }
}
