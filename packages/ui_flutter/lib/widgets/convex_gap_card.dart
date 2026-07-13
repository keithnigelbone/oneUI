import 'package:flutter/material.dart';

/// Visible when Convex / scope prerequisites are missing or token chains break.
class ConvexGapCard extends StatelessWidget {
  const ConvexGapCard({required this.gaps, super.key});

  final List<String> gaps;

  @override
  Widget build(BuildContext context) {
    return ConvexGapCardImpl(gaps: gaps);
  }
}

@visibleForTesting
class ConvexGapCardImpl extends StatelessWidget {
  const ConvexGapCardImpl({required this.gaps, super.key});

  final List<String> gaps;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.deepOrange, width: 2),
        color: Colors.deepOrange.withValues(alpha: 0.08),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Convex / designSystem gaps (${gaps.length})',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            ),
            for (final g in gaps)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(g, style: const TextStyle(fontSize: 12)),
              ),
          ],
        ),
      ),
    );
  }
}
