import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/qa/component_test_stability.dart';
import 'package:qa_playground_flutter/reports/qa_report_summary.dart';

QaReportSummary _sampleFullSuite() {
  QaReportCase caseFor(String component, String tier) => QaReportCase(
        name: '[$tier] $component smoke',
        status: 'passed',
        tier: tier,
        component: component,
      );

  final functionalCases = [
    caseFor('checkbox', 'fn'),
    caseFor('button', 'fn'),
  ];
  final a11yCases = [
    caseFor('checkbox', 'a11y'),
    caseFor('button', 'a11y'),
  ];

  return QaReportSummary(
    ok: true,
    slug: 'flutter-all',
    generatedAt: '2026-06-10T00:00:00Z',
    functional: QaReportSuite(
      passed: functionalCases.length,
      failed: 0,
      skipped: 0,
      cases: functionalCases,
    ),
    accessibility: QaReportSuite(
      passed: a11yCases.length,
      failed: 0,
      skipped: 0,
      cases: a11yCases,
    ),
    smoke: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
    catalog: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
    e2e: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
    visual: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
  );
}

void main() {
  group('QaReportSummary.normalizedForComponent', () {
    test('merges fn and smoke into functional for component-scoped JSON', () {
      final smokeCases = List.generate(
        3,
        (i) => QaReportCase(
          name: '[smoke] checkbox-field case $i',
          status: 'passed',
          tier: 'smoke',
          component: 'checkbox_field',
        ),
      );
      final fnCases = List.generate(
        2,
        (i) => QaReportCase(
          name: '[fn] checkbox-field case $i',
          status: 'passed',
          tier: 'fn',
          component: 'checkbox_field',
        ),
      );
      final raw = QaReportSummary(
        ok: true,
        slug: 'checkbox-field',
        generatedAt: '2026-06-10T00:00:00Z',
        functional: QaReportSuite(passed: 2, failed: 0, skipped: 0, cases: fnCases),
        accessibility: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
        smoke: QaReportSuite(passed: 3, failed: 0, skipped: 0, cases: smokeCases),
        catalog: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
        e2e: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
        visual: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
      );

      final normalized = raw.normalizedForComponent('checkbox-field');

      expect(normalized.functional.cases.length, 5);
      expect(normalized.functional.passed, 5);
    });
  });

  group('QaReportSummary.scopedForComponent', () {
    test('returns only cases for the requested slug', () {
      final scoped = _sampleFullSuite().scopedForComponent('checkbox');

      expect(scoped.slug, 'checkbox');
      expect(scoped.functional.passed, 1);
      expect(scoped.accessibility.passed, 1);
      expect(scoped.functional.cases.every((c) => c.component == 'checkbox'), isTrue);
    });

    test('returns empty suites when slug has no matching cases', () {
      final scoped = _sampleFullSuite().scopedForComponent('bottom-navigation');

      expect(scoped.functional.passed, 0);
      expect(scoped.accessibility.passed, 0);
      expect(scoped.functional.cases, isEmpty);
      expect(scoped.accessibility.cases, isEmpty);
    });
  });

  group('getComponentTestStability', () {
    test('not-ready slug stays under development even with full suite loaded', () {
      final stability = getComponentTestStability('bottom-navigation', _sampleFullSuite());
      expect(stability, QaComponentTestStability.underDevelopment);
    });

    test('implemented slug with scoped cases resolves stable', () {
      final scoped = _sampleFullSuite().scopedForComponent('checkbox');
      final stability = getComponentTestStability('checkbox', scoped);
      expect(stability, QaComponentTestStability.stable);
    });

    test('visual-only failures mark component unstable', () {
      final visualCases = List.generate(
        3,
        (i) => QaReportCase(
          name: '[regression][confirmed] CPI [visual] [CPI-VIS-00$i] case',
          status: 'failed',
          tier: 'visual',
          component: 'circular-progress-indicator',
        ),
      );
      final scoped = QaReportSummary(
        ok: false,
        slug: 'circular-progress-indicator',
        generatedAt: '2026-07-01T00:00:00Z',
        functional: QaReportSuite(passed: 69, failed: 0, skipped: 0, cases: const []),
        accessibility: QaReportSuite(passed: 35, failed: 0, skipped: 0, cases: const []),
        smoke: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
        catalog: QaReportSuite(passed: 0, failed: 0, skipped: 0, cases: const []),
        e2e: QaReportSuite(passed: 18, failed: 0, skipped: 0, cases: const []),
        visual: QaReportSuite(passed: 30, failed: 3, skipped: 0, cases: visualCases),
      );

      expect(
        getComponentTestStability('circular-progress-indicator', scoped),
        QaComponentTestStability.unstable,
      );
    });
  });
}
