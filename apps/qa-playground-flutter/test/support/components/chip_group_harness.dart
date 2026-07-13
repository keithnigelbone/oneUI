/// ChipGroup harness — extends [chip_harness.dart] with group-level finders.
///
/// Re-exports the chip harness (which pumps any widget on the synthetic
/// measurement DS or the Jio fixture) and adds finders for the group layout
/// (Wrap / inline Row / Column) and the group Semantics node.
library;

export 'chip_harness.dart';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

Finder chipGroupFinder() => find.byType(OneUiChipGroup);

/// The wrapping layout used for a horizontal, wrapping group.
Finder chipGroupWrapFinder() => find.descendant(
      of: chipGroupFinder(),
      matching: find.byType(Wrap),
    );

/// The horizontal-scroll viewport used for an inline (`wrap:false`) group.
Finder chipGroupInlineScrollFinder() => find.descendant(
      of: chipGroupFinder(),
      matching: find.byType(SingleChildScrollView),
    );

/// The column used for a vertical group.
Finder chipGroupColumnFinder() => find.descendant(
      of: chipGroupFinder(),
      matching: find.byType(Column),
    );

/// The group container Semantics node (only present when the group is labelled).
Finder chipGroupSemanticsLabel(String label) {
  return find.descendant(
    of: chipGroupFinder(),
    matching: find.byWidgetPredicate((widget) {
      if (widget is! Semantics) return false;
      return widget.container == true && widget.properties.label == label;
    }),
  );
}

SemanticsData chipGroupSemanticsData(WidgetTester tester, String label) {
  final finder = chipGroupSemanticsLabel(label);
  expect(finder, findsWidgets, reason: 'no group container semantics for "$label"');
  return tester.getSemantics(finder.first).getSemanticsData();
}
