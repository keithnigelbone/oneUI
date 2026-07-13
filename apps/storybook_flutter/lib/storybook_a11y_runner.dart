/// Orchestrates **semantics scans** + **axe-core on web**, matching **`preview.ts`**
/// WCAG tagging and `packages/ui` **`test-utils/a11y.ts`** exclusions.
library;

import 'package:flutter/scheduler.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'storybook_a11y_axe_stub.dart'
    if (dart.library.html) 'storybook_a11y_axe_web.dart';

import 'storybook_a11y_report.dart';
import 'storybook_a11y_semantics_scan.dart';

Future<StorybookA11yAuditResult> runStorybookAccessibilityAudit() async {
  final semanticsHandle = SemanticsBinding.instance.ensureSemantics();
  try {
    await SchedulerBinding.instance.endOfFrame;
    final semBundle = scanSemanticsTree();

    final axe = await runAxeWcagAudit();

    final violations = [...semBundle.violations, ...axe.violations];
    final passes = [...semBundle.passes, ...axe.passes];
    final incomplete = [...axe.incomplete];
    final notes = [
      ...semBundle.notes,
      if (axe.scriptError != null) 'axe-core: ${axe.scriptError}',
    ];

    return StorybookA11yAuditResult(
      violations: violations,
      passes: passes,
      incomplete: incomplete,
      semanticsNotes: notes,
      axeUnavailableReason: axe.axeUnavailableReason,
    );
  } catch (e, st) {
    debugPrint('runStorybookAccessibilityAudit: $e\n$st');
    return StorybookA11yAuditResult.error('$e');
  } finally {
    semanticsHandle.dispose();
  }
}
