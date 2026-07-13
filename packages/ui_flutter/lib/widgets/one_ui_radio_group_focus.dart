import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Keyboard intents — web/Base UI RadioGroup arrow navigation.
class OneUiRadioGroupNextFocusIntent extends Intent {
  const OneUiRadioGroupNextFocusIntent();
}

class OneUiRadioGroupPreviousFocusIntent extends Intent {
  const OneUiRadioGroupPreviousFocusIntent();
}

class _OneUiRadioGroupFocusEntry {
  _OneUiRadioGroupFocusEntry({
    required this.node,
    required this.value,
    required this.canSelect,
    required this.onSelect,
  });

  final FocusNode node;
  String value;
  bool canSelect;
  VoidCallback onSelect;
}

/// Roving focus + selection registry for [OneUiRadioGroup].
class OneUiRadioGroupFocusController {
  OneUiRadioGroupFocusController({
    this.loopFocus = true,
    bool horizontal = false,
    this.enabled = true,
  }) : horizontal = horizontal;

  bool loopFocus;
  bool horizontal;
  bool enabled;

  final List<_OneUiRadioGroupFocusEntry> _entries =
      <_OneUiRadioGroupFocusEntry>[];

  void register({
    required FocusNode node,
    required String value,
    required bool canSelect,
    required VoidCallback onSelect,
  }) {
    final existing = _entries.indexWhere((e) => e.node == node);
    if (existing >= 0) {
      final entry = _entries[existing];
      entry.value = value;
      entry.canSelect = canSelect;
      entry.onSelect = onSelect;
      return;
    }
    _entries.add(
      _OneUiRadioGroupFocusEntry(
        node: node,
        value: value,
        canSelect: canSelect,
        onSelect: onSelect,
      ),
    );
  }

  void unregister(FocusNode node) {
    _entries.removeWhere((e) => e.node == node);
  }

  List<_OneUiRadioGroupFocusEntry> get _focusableEntries =>
      _entries.where((e) => e.node.canRequestFocus).toList(growable: false);

  void moveFocus(int delta) {
    if (!enabled) return;
    final entries = _focusableEntries;
    if (entries.isEmpty) return;

    final primary = FocusManager.instance.primaryFocus;
    var index =
        primary != null ? entries.indexWhere((e) => e.node == primary) : -1;

    if (index < 0) {
      final target = delta >= 0 ? entries.first : entries.last;
      target.node.requestFocus();
      if (target.canSelect && target.value.isNotEmpty) {
        target.onSelect();
      }
      return;
    }

    var nextIndex = index + delta;
    if (loopFocus) {
      final len = entries.length;
      nextIndex = ((nextIndex % len) + len) % len;
    } else {
      if (nextIndex < 0 || nextIndex >= entries.length) return;
    }

    if (nextIndex != index) {
      final target = entries[nextIndex];
      target.node.requestFocus();
      if (target.canSelect && target.value.isNotEmpty) {
        target.onSelect();
      }
    }
  }

  void moveNext() => moveFocus(1);

  void movePrevious() => moveFocus(-1);

  void dispose() {
    _entries.clear();
  }
}

/// Supplies [OneUiRadioGroupFocusController] to [OneUiRadio] options.
class OneUiRadioGroupFocusScope extends InheritedWidget {
  const OneUiRadioGroupFocusScope({
    required this.controller,
    required this.textDirection,
    required super.child,
    super.key,
  });

  final OneUiRadioGroupFocusController controller;
  final TextDirection textDirection;

  static OneUiRadioGroupFocusController? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<OneUiRadioGroupFocusScope>()
        ?.controller;
  }

  @override
  bool updateShouldNotify(OneUiRadioGroupFocusScope oldWidget) {
    return controller != oldWidget.controller ||
        textDirection != oldWidget.textDirection;
  }
}

Map<ShortcutActivator, Intent> radioGroupArrowShortcuts({
  required OneUiRadioGroupFocusController controller,
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
      SingleActivator(nextKey): const OneUiRadioGroupNextFocusIntent(),
      SingleActivator(prevKey): const OneUiRadioGroupPreviousFocusIntent(),
    };
  }
  return {
    const SingleActivator(LogicalKeyboardKey.arrowDown):
        const OneUiRadioGroupNextFocusIntent(),
    const SingleActivator(LogicalKeyboardKey.arrowUp):
        const OneUiRadioGroupPreviousFocusIntent(),
  };
}

/// Arrow-key roving focus + selection — wraps [OneUiRadioGroup] content.
class OneUiRadioGroupFocusKeyboardScope extends StatelessWidget {
  const OneUiRadioGroupFocusKeyboardScope({
    required this.controller,
    required this.textDirection,
    required this.child,
    super.key,
  });

  final OneUiRadioGroupFocusController controller;
  final TextDirection textDirection;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return OneUiRadioGroupFocusScope(
      controller: controller,
      textDirection: textDirection,
      child: Shortcuts(
        shortcuts: radioGroupArrowShortcuts(
          controller: controller,
          textDirection: textDirection,
        ),
        child: Actions(
          actions: <Type, Action<Intent>>{
            OneUiRadioGroupNextFocusIntent:
                CallbackAction<OneUiRadioGroupNextFocusIntent>(
              onInvoke: (_) {
                controller.moveNext();
                return null;
              },
            ),
            OneUiRadioGroupPreviousFocusIntent:
                CallbackAction<OneUiRadioGroupPreviousFocusIntent>(
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
