import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Keyboard intents — Base UI ToggleGroup arrow navigation.
class OneUiChipGroupNextFocusIntent extends Intent {
  const OneUiChipGroupNextFocusIntent();
}

class OneUiChipGroupPreviousFocusIntent extends Intent {
  const OneUiChipGroupPreviousFocusIntent();
}

/// Roving focus registry — chips register [FocusNode]s in child order.
class OneUiChipGroupFocusController {
  OneUiChipGroupFocusController({
    bool loopFocus = true,
    bool horizontal = true,
    bool enabled = true,
  })  : loopFocus = loopFocus,
        horizontal = horizontal,
        enabled = enabled;

  bool loopFocus;
  bool horizontal;
  bool enabled;

  final List<FocusNode> _nodes = <FocusNode>[];

  void register(FocusNode node) {
    if (!_nodes.contains(node)) {
      _nodes.add(node);
    }
  }

  void unregister(FocusNode node) {
    _nodes.remove(node);
  }

  List<FocusNode> get focusableNodes =>
      _nodes.where((n) => n.canRequestFocus).toList(growable: false);

  void moveFocus(int delta) {
    if (!enabled) return;
    final nodes = focusableNodes;
    if (nodes.isEmpty) return;

    final primary = FocusManager.instance.primaryFocus;
    var index = primary != null ? nodes.indexOf(primary) : -1;

    if (index < 0) {
      (delta >= 0 ? nodes.first : nodes.last).requestFocus();
      return;
    }

    var nextIndex = index + delta;
    if (loopFocus) {
      final len = nodes.length;
      nextIndex = ((nextIndex % len) + len) % len;
    } else {
      if (nextIndex < 0 || nextIndex >= nodes.length) return;
    }

    if (nextIndex != index) {
      nodes[nextIndex].requestFocus();
    }
  }

  void moveNext() => moveFocus(1);

  void movePrevious() => moveFocus(-1);

  void dispose() {
    _nodes.clear();
  }
}

/// Supplies [OneUiChipGroupFocusController] to chips inside a group.
class OneUiChipGroupFocusScope extends InheritedWidget {
  const OneUiChipGroupFocusScope({
    required this.controller,
    required this.textDirection,
    required super.child,
    super.key,
  });

  final OneUiChipGroupFocusController controller;
  final TextDirection textDirection;

  static OneUiChipGroupFocusController? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiChipGroupFocusScope>()
        ?.controller;
  }

  @override
  bool updateShouldNotify(OneUiChipGroupFocusScope oldWidget) {
    return controller != oldWidget.controller ||
        textDirection != oldWidget.textDirection;
  }
}

Map<ShortcutActivator, Intent> chipGroupArrowShortcuts({
  required OneUiChipGroupFocusController controller,
  required TextDirection textDirection,
}) {
  if (!controller.enabled) return const {};
  if (controller.horizontal) {
    final nextKey = textDirection == TextDirection.ltr
        ? LogicalKeyboardKey.arrowRight
        : LogicalKeyboardKey.arrowLeft;
    final prevKey = textDirection == TextDirection.ltr
        ? LogicalKeyboardKey.arrowLeft
        : LogicalKeyboardKey.arrowRight;
    return {
      SingleActivator(nextKey): const OneUiChipGroupNextFocusIntent(),
      SingleActivator(prevKey): const OneUiChipGroupPreviousFocusIntent(),
    };
  }
  return {
    SingleActivator(LogicalKeyboardKey.arrowDown):
        const OneUiChipGroupNextFocusIntent(),
    SingleActivator(LogicalKeyboardKey.arrowUp):
        const OneUiChipGroupPreviousFocusIntent(),
  };
}

/// Arrow-key roving focus — wraps the chip group layout.
class OneUiChipGroupFocusKeyboardScope extends StatelessWidget {
  const OneUiChipGroupFocusKeyboardScope({
    required this.controller,
    required this.textDirection,
    required this.child,
    super.key,
  });

  final OneUiChipGroupFocusController controller;
  final TextDirection textDirection;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return OneUiChipGroupFocusScope(
      controller: controller,
      textDirection: textDirection,
      child: Shortcuts(
        shortcuts: chipGroupArrowShortcuts(
          controller: controller,
          textDirection: textDirection,
        ),
        child: Actions(
          actions: <Type, Action<Intent>>{
            OneUiChipGroupNextFocusIntent:
                CallbackAction<OneUiChipGroupNextFocusIntent>(
              onInvoke: (_) {
                controller.moveNext();
                return null;
              },
            ),
            OneUiChipGroupPreviousFocusIntent:
                CallbackAction<OneUiChipGroupPreviousFocusIntent>(
              onInvoke: (_) {
                controller.movePrevious();
                return null;
              },
            ),
          },
          child: FocusTraversalGroup(
            policy: OrderedTraversalPolicy(),
            child: child,
          ),
        ),
      ),
    );
  }
}
