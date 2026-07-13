/// Cross-platform semantics tree checks (buttons with names, labelled images).
///
/// Mirrors a subset of **axe-core** behaviours that exist in Flutter's semantics protocol;
/// **`color-contrast`**, **`aria-*`**, and many DOM-only rules remain **Flutter web axe** territory.
library;

import 'package:flutter/rendering.dart';

import 'storybook_a11y_report.dart';

/// Lightweight checks over the live semantics tree (`PipelineOwner`).
///
/// Call after layout (post-frame).
StorybookSemanticsScanSummary scanSemanticsTree() {
  final violations = <StorybookA11yItem>[];
  final passes = <StorybookA11yItem>[];
  final notes = <String>[];

  SemanticsOwner? owner;
  try {
    owner = RendererBinding.instance.pipelineOwner.semanticsOwner;
  } catch (_) {
    notes.add('Semantics owner unavailable — render pipeline not attached.');
    return StorybookSemanticsScanSummary(
      violations: violations,
      passes: passes,
      notes: notes,
    );
  }

  if (owner == null) {
    notes.add(
      'No semantics owner yet — enable semantics overlay or interact with UI, then rerun.',
    );
    return StorybookSemanticsScanSummary(
      violations: violations,
      passes: passes,
      notes: notes,
    );
  }

  var buttonsOk = 0;
  var buttonsBad = 0;
  var imagesOk = 0;
  var imagesBad = 0;

  final root = owner.rootSemanticsNode;
  if (root == null) {
    notes.add('Root semantics node unavailable — rerun after semantics attach.');
    return StorybookSemanticsScanSummary(
      violations: violations,
      passes: passes,
      notes: notes,
    );
  }

  void visit(SemanticsNode node) {
    final data = node.getSemanticsData();
    if (data.hasFlag(SemanticsFlag.isHidden)) return;

    final hasName = data.label.trim().isNotEmpty ||
        data.value.trim().isNotEmpty ||
        data.hint.trim().isNotEmpty;

    if (data.hasFlag(SemanticsFlag.isTextField)) {
      // Text fields are excluded from button/image name checks.
    } else if (data.hasFlag(SemanticsFlag.isButton)) {
      if (hasName) {
        buttonsOk++;
      } else {
        buttonsBad++;
      }
    } else if (data.hasFlag(SemanticsFlag.isImage)) {
      if (hasName) {
        imagesOk++;
      } else {
        imagesBad++;
      }
    }

    node.visitChildren((SemanticsNode child) {
      visit(child);
      return true;
    });
  }

  visit(root);

  if (buttonsOk > 0) {
    passes.add(
      StorybookA11yItem(
        ruleId: 'button-name',
        help: 'Every button exposes a discernible name (Semantics label/value/hint).',
        instanceCount: buttonsOk,
        engine: StorybookA11yEngine.semantics,
      ),
    );
  }
  if (buttonsBad > 0) {
    violations.add(
      StorybookA11yItem(
        ruleId: 'semantics/button-name',
        help: 'Semantics button without discernible label',
        description:
            'Found $buttonsBad Semantics(button) nodes with empty label, value, and hint '
            '(enable Semantics Debugger to locate). WCAG-aligned with axe `button-name`.',
        instanceCount: buttonsBad,
        engine: StorybookA11yEngine.semantics,
      ),
    );
  }

  if (imagesOk > 0) {
    passes.add(
      StorybookA11yItem(
        ruleId: 'image-alt',
        help: 'Semantics images carry alternative text.',
        instanceCount: imagesOk,
        engine: StorybookA11yEngine.semantics,
      ),
    );
  }
  if (imagesBad > 0) {
    violations.add(
      StorybookA11yItem(
        ruleId: 'semantics/image-alt',
        help: 'Semantics imageRole without alternate text',
        description:
            'Found $imagesBad image semantics nodes lacking label/value/hint.',
        instanceCount: imagesBad,
        engine: StorybookA11yEngine.semantics,
      ),
    );
  }

  if (buttonsOk == 0 && buttonsBad == 0) {
    notes.add(
      'No Semantics(button) leaf nodes scanned (story may omit buttons or scopes hide subtree).',
    );
  }

  return StorybookSemanticsScanSummary(
    violations: violations,
    passes: passes,
    notes: notes,
  );
}

final class StorybookSemanticsScanSummary {
  const StorybookSemanticsScanSummary({
    required this.violations,
    required this.passes,
    required this.notes,
  });

  final List<StorybookA11yItem> violations;
  final List<StorybookA11yItem> passes;
  final List<String> notes;
}
