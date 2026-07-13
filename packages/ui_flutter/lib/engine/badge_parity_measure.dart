import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// Live geometry from a laid-out [OneUiBadge] — mirrors React `ParityInspector`
/// (`offsetHeight`, `getComputedStyle` on `[role="status"]`).
class BadgeLiveMetrics {
  const BadgeLiveMetrics({
    required this.height,
    required this.padLeft,
    required this.padRight,
    required this.gap,
    required this.borderRadius,
    required this.fontSize,
  });

  final double height;
  final double padLeft;
  final double padRight;
  final double gap;
  final double borderRadius;
  final double fontSize;
}

/// Badge paint shell: outer [DecoratedBox] on the token-backed badge (inline-flex).
RenderBox? _badgeShellBox(RenderObject? root) {
  if (root == null) return null;

  RenderDecoratedBox? shell;
  void findShell(RenderObject ro) {
    if (shell != null) return;
    if (ro is RenderDecoratedBox) {
      shell = ro;
      return;
    }
    ro.visitChildren(findShell);
  }

  findShell(root);
  return shell;
}

/// Walks the badge subtree and reads painted layout values.
BadgeLiveMetrics? measureBadgeLiveMetrics(RenderObject? root) {
  final shell = _badgeShellBox(root);
  if (shell == null || !shell.hasSize) return null;

  double padLeft = 0;
  double padRight = 0;
  double borderRadius = 0;
  double fontSize = 0;
  double gap = 0;

  void visit(RenderObject ro) {
    if (ro is RenderPadding) {
      final resolved = ro.padding.resolve(TextDirection.ltr);
      if (resolved.horizontal > 0) {
        padLeft = resolved.left;
        padRight = resolved.right;
      }
    }
    if (ro is RenderDecoratedBox) {
      final decoration = ro.decoration;
      if (decoration is BoxDecoration) {
        final radius = decoration.borderRadius;
        if (radius is BorderRadius) {
          borderRadius = radius.topLeft.x;
        }
      }
    }
    if (ro is RenderFlex && ro.spacing > 0) {
      gap = ro.spacing;
    }
    if (ro is RenderParagraph) {
      final fs = ro.text.style?.fontSize;
      if (fs != null && fs > fontSize) fontSize = fs;
    }
    ro.visitChildren(visit);
  }

  visit(shell);

  return BadgeLiveMetrics(
    height: shell.size.height,
    padLeft: padLeft,
    padRight: padRight,
    gap: gap,
    borderRadius: borderRadius,
    fontSize: fontSize,
  );
}
