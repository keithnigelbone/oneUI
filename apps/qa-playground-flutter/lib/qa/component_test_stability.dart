import '../catalog/qa_catalog.dart';
import '../reports/qa_report_summary.dart';
import 'qa_flutter_test_slugs.dart';

/// Mirrors React `componentTestStability.ts` — derived from ingested test reports.
enum QaComponentTestStability {
  stable,
  unstable,
  underDevelopment;

  String get badgeLabel => switch (this) {
        QaComponentTestStability.stable => 'Stable',
        QaComponentTestStability.unstable => 'Unstable',
        QaComponentTestStability.underDevelopment => 'Not Ready',
      };

  String get filterLabel => switch (this) {
        QaComponentTestStability.stable => 'Stable',
        QaComponentTestStability.unstable => 'Unstable',
        QaComponentTestStability.underDevelopment => 'Under development',
      };

  /// Maps to [QaTestStability] for catalog filter compatibility.
  QaTestStability get catalogFilter => switch (this) {
        QaComponentTestStability.stable => QaTestStability.stable,
        QaComponentTestStability.unstable => QaTestStability.unstable,
        QaComponentTestStability.underDevelopment => QaTestStability.underDevelopment,
      };
}

bool isComponentScopedSummary(QaReportSummary summary, String slug) {
  return summary.slug == slug;
}

int getTotalTestCountForComponent(QaReportSummary? summary, String slug) {
  if (summary == null) return 0;

  // Per-component summary — count case rows (functional includes [fn] + [smoke] after normalize).
  if (isComponentScopedSummary(summary, slug)) {
    return summary.functional.cases.length +
        summary.accessibility.cases.length +
        summary.visual.cases.length +
        summary.e2e.cases.length;
  }

  final cases = summary.casesForComponent(slug);
  return cases.where((c) => _stabilityTiers.contains(c.tier)).length;
}

int _failedCaseCount(Iterable<QaReportCase> cases) =>
    cases.where((c) => !c.passed && c.status != 'skipped').length;

/// Tiers that gate the Stable / Unstable catalog badge (fn/a11y/smoke + visual/e2e).
const _stabilityTiers = {'fn', 'a11y', 'smoke', 'visual', 'e2e'};

int getTotalFailedTestsForComponent(QaReportSummary? summary, String slug) {
  if (summary == null) return 0;

  if (isComponentScopedSummary(summary, slug)) {
    return _failedCaseCount(summary.functional.cases) +
        _failedCaseCount(summary.accessibility.cases) +
        _failedCaseCount(summary.visual.cases) +
        _failedCaseCount(summary.e2e.cases);
  }

  return summary
      .casesForComponent(slug)
      .where((c) => _stabilityTiers.contains(c.tier) && !c.passed && c.status != 'skipped')
      .length;
}

bool hasFlutterTestCoverage(QaReportSummary? summary, String slug) {
  if (!isQaFlutterTestSlug(slug)) return false;
  return getTotalTestCountForComponent(summary, slug) > 0;
}

QaComponentTestStability getComponentTestStability(
  String slug,
  QaReportSummary? summary,
) {
  if (!hasFlutterTestCoverage(summary, slug)) {
    return QaComponentTestStability.underDevelopment;
  }
  return getTotalFailedTestsForComponent(summary, slug) > 0
      ? QaComponentTestStability.unstable
      : QaComponentTestStability.stable;
}

QaComponentTestStability resolveCatalogEntryStability(
  String slug,
  Map<String, QaComponentTestStability> stabilityBySlug,
) {
  if (!isQaFlutterTestSlug(slug)) {
    return QaComponentTestStability.underDevelopment;
  }
  return stabilityBySlug[slug] ?? QaComponentTestStability.underDevelopment;
}

({int stable, int unstable, int underDevelopment, int total}) countCatalogByTestStability(
  List<String> slugs,
  Map<String, QaComponentTestStability> stabilityBySlug,
) {
  var stable = 0;
  var unstable = 0;
  var underDevelopment = 0;
  for (final slug in slugs) {
    final s = resolveCatalogEntryStability(slug, stabilityBySlug);
    switch (s) {
      case QaComponentTestStability.unstable:
        unstable++;
      case QaComponentTestStability.underDevelopment:
        underDevelopment++;
      case QaComponentTestStability.stable:
        stable++;
    }
  }
  return (
    stable: stable,
    unstable: unstable,
    underDevelopment: underDevelopment,
    total: slugs.length,
  );
}

/// Builds per-slug stability from a full-suite [QaReportSummary].
Map<String, QaComponentTestStability> buildStabilityIndexFromSummary(
  QaReportSummary? summary,
  Iterable<String> slugs,
) {
  return {
    for (final slug in slugs) slug: getComponentTestStability(slug, summary),
  };
}
