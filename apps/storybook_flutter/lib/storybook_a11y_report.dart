/// Structured accessibility report aligned with **`@storybook/addon-a11y`** summaries
/// (violations / passes / incomplete) plus Flutter-only semantics checks on all targets.
library;

/// One automated check row (axe or semantics scanner).
final class StorybookA11yItem {
  const StorybookA11yItem({
    required this.ruleId,
    required this.help,
    this.description,
    this.instanceCount = 1,
    this.engine = StorybookA11yEngine.semantics,
  });

  /// Axe rule id (e.g. `button-name`) or internal id (`semantics/button-name`).
  final String ruleId;
  final String help;
  final String? description;
  final int instanceCount;
  final StorybookA11yEngine engine;
}

enum StorybookA11yEngine {
  axe,
  semantics,
}

/// Full dashboard payload for the Storybook Accessibility panel.
final class StorybookA11yAuditResult {
  const StorybookA11yAuditResult({
    required this.violations,
    required this.passes,
    required this.incomplete,
    required this.semanticsNotes,
    this.axeUnavailableReason,
    this.scanError,
  });

  final List<StorybookA11yItem> violations;
  final List<StorybookA11yItem> passes;
  final List<StorybookA11yItem> incomplete;
  final List<String> semanticsNotes;
  /// Set on non-web (no DOM): explains why axe was not executed.
  final String? axeUnavailableReason;
  final String? scanError;

  int get violationCount =>
      violations.fold<int>(0, (s, i) => s + i.instanceCount);
  int get passCount => passes.fold<int>(0, (s, i) => s + i.instanceCount);
  int get incompleteCount =>
      incomplete.fold<int>(0, (s, i) => s + i.instanceCount);

  static StorybookA11yAuditResult error(String message) {
    return StorybookA11yAuditResult(
      violations: [],
      passes: [],
      incomplete: [],
      semanticsNotes: [],
      scanError: message,
    );
  }
}

/// Raw axe-core response mapped into [StorybookA11yItem] lists.
final class AxeAuditBundle {
  const AxeAuditBundle({
    required this.violations,
    required this.passes,
    required this.incomplete,
    this.axeUnavailableReason,
    this.scriptError,
  });

  final List<StorybookA11yItem> violations;
  final List<StorybookA11yItem> passes;
  final List<StorybookA11yItem> incomplete;
  final String? axeUnavailableReason;
  final String? scriptError;
}
