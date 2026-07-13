import 'package:flutter/material.dart';

/// Storybook default pages use [Expanded] — they need a bounded height parent.
class QaStoryCanvas extends StatelessWidget {
  const QaStoryCanvas({
    required this.child,
    this.minHeight = 520,
    super.key,
  });

  final Widget child;
  final double minHeight;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: minHeight,
          width: double.infinity,
          child: child,
        ),
      ),
    );
  }
}
