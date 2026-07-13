import 'package:flutter/material.dart';

import '../engine/text_style_resolve.dart';
import '../theme/one_ui_scope.dart';

class OneUiSliderValueTooltip extends StatelessWidget {
  const OneUiSliderValueTooltip({
    super.key,
    required this.text,
    required this.visible,
  });

  final String text;
  final bool visible;

  @override
  Widget build(BuildContext context) {
    if (!visible) return const SizedBox.shrink();

    final typo = OneUiScope.nativeTypographyOf(context);
    final style = typo?.emphasisStyle('label', 'XS', emphasis: 'medium') ??
        Theme.of(context).textTheme.labelSmall;

    return Material(
      key: const ValueKey('oneui-slider-tooltip'),
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.inverseSurface,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          style: style?.copyWith(
            color: Theme.of(context).colorScheme.onInverseSurface,
          ),
        ),
      ),
    );
  }
}
