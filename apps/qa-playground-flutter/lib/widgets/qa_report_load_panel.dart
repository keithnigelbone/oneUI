import 'package:flutter/material.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../reports/qa_report_date_format.dart';
import '../reports/qa_report_summary.dart';

class QaReportLoadPanel extends StatelessWidget {
  const QaReportLoadPanel({
    required this.componentName,
    required this.loading,
    required this.summary,
    required this.hasTests,
    required this.onLoad,
    required this.onOpenFullReport,
    super.key,
  });

  final String componentName;
  final bool loading;
  final QaReportSummary? summary;
  final bool hasTests;
  final VoidCallback onLoad;
  final VoidCallback onOpenFullReport;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final hasData = summary != null;
    final allPass = summary?.ok == true;
    final hasFailures = hasData && summary!.ok == false;
    final failureBannerMessage = summary == null
        ? null
        : _failureReviewMessage(summary!);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            scheme.primaryContainer.withValues(alpha: 0.22),
            scheme.surfaceContainerLow,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.primary.withValues(alpha: 0.12)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OneUiText(
            text: hasTests
                ? 'View the latest accessibility and functional results for $componentName.'
                : 'Connect flutter_test suites for $componentName to populate report tabs.',
            variant: OneUiTextVariant.body,
            size: 'm',
            weight: OneUiTextWeight.low,
            attention: OneUiTextAttention.medium,
          ),
          if (hasData) ...[
            const SizedBox(height: 16),
            _SummaryStrip(summary: summary!),
          ],
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              FilledButton.icon(
                onPressed: loading ? null : onLoad,
                icon: loading
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: scheme.onPrimary,
                        ),
                      )
                    : const Icon(Icons.refresh, size: 18),
                label: Text(loading ? 'Loading…' : 'Load flutter_test report'),
              ),
              OutlinedButton.icon(
                onPressed: hasData ? onOpenFullReport : null,
                icon: const Icon(Icons.open_in_new, size: 18),
                label: const Text('Open HTML report'),
              ),
            ],
          ),
          if (hasData && allPass) ...[
            const SizedBox(height: 12),
            _Banner(
              color: const Color(0xFFDCFCE7),
              textColor: const Color(0xFF166534),
              icon: Icons.check_circle_outline,
              message: 'Report loaded — all tests passed. Open tabs below for details.',
            ),
          ],
          if (hasFailures) ...[
            const SizedBox(height: 12),
            _Banner(
              color: const Color(0xFFFEE2E2),
              textColor: const Color(0xFF991B1B),
              icon: Icons.error_outline,
              message: failureBannerMessage ??
                  'Report loaded with failures. Review the test tabs below.',
            ),
          ],
          if (!hasData && !loading && hasTests) ...[
            const SizedBox(height: 12),
            _Banner(
              color: scheme.surfaceContainerHighest,
              textColor: scheme.onSurfaceVariant,
              icon: Icons.info_outline,
              message:
                  'No report yet. Run: pnpm qa:flutter:component -- <slug> (or pnpm qa:flutter:report), then tap Load flutter_test report.',
            ),
          ],
        ],
      ),
    );
  }
}

class _SummaryStrip extends StatelessWidget {
  const _SummaryStrip({required this.summary});

  final QaReportSummary summary;

  @override
  Widget build(BuildContext context) {
    // Count from case rows — metadata `passed` on raw JSON can omit [smoke] tier.
    final fnCases = summary.functional.cases;
    final a11yCases = summary.accessibility.cases;
    final e2eCases = summary.e2e.cases;
    final visualCases = summary.visual.cases;
    final fnPassed = fnCases.where((c) => c.passed).length;
    final fnFailed = fnCases.where((c) => !c.passed && c.status != 'skipped').length;
    final a11yPassed = a11yCases.where((c) => c.passed).length;
    final a11yFailed = a11yCases.where((c) => !c.passed && c.status != 'skipped').length;
    final e2ePassed = e2eCases.where((c) => c.passed).length;
    final e2eFailed = e2eCases.where((c) => !c.passed && c.status != 'skipped').length;
    final visualPassed = visualCases.where((c) => c.passed).length;
    final visualFailed =
        visualCases.where((c) => !c.passed && c.status != 'skipped').length;
    final hasE2e = e2eCases.isNotEmpty;
    final hasVisual = visualCases.isNotEmpty;
    final totalPassed = fnPassed + a11yPassed + e2ePassed + visualPassed;
    final totalFailed = fnFailed + a11yFailed + e2eFailed + visualFailed;
    final total = totalPassed + totalFailed;

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        _MiniStat(label: 'Functional', passed: fnPassed, failed: fnFailed),
        _MiniStat(label: 'Accessibility', passed: a11yPassed, failed: a11yFailed),
        if (hasVisual)
          _MiniStat(
            label: 'Visual',
            passed: visualPassed,
            failed: visualFailed,
          ),
        if (hasE2e)
          _MiniStat(
            label: 'E2E (on-device)',
            passed: e2ePassed,
            failed: e2eFailed,
          ),
        _MiniStat(
          label: 'Overall',
          passed: totalPassed,
          failed: totalFailed,
          highlight: true,
          passRate: total > 0 ? (totalPassed / total * 100).round() : 0,
        ),
        if (summary.generatedAt.isNotEmpty)
          Chip(
            label: Text(formatQaReportTimestamp(summary.generatedAt)),
            visualDensity: VisualDensity.compact,
          ),
      ],
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.label,
    required this.passed,
    required this.failed,
    this.highlight = false,
    this.passRate,
  });

  final String label;
  final int passed;
  final int failed;
  final bool highlight;
  final int? passRate;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final ok = failed == 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: highlight
            ? (ok ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2))
            : scheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: highlight
              ? (ok ? const Color(0xFF86EFAC) : const Color(0xFFFCA5A5))
              : scheme.outlineVariant,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(
            passRate != null ? '$passRate% · $passed passed' : '$passed passed · $failed failed',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: highlight
                  ? (ok ? const Color(0xFF166534) : const Color(0xFF991B1B))
                  : scheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}

String _failureReviewMessage(QaReportSummary summary) {
  final tabs = <String>[];
  if (summary.functional.cases.any((c) => !c.passed && c.status != 'skipped')) {
    tabs.add('Functional');
  }
  if (summary.accessibility.cases.any((c) => !c.passed && c.status != 'skipped')) {
    tabs.add('Accessibility');
  }
  if (summary.visual.cases.any((c) => !c.passed && c.status != 'skipped')) {
    tabs.add('Visual');
  }
  if (summary.e2e.cases.any((c) => !c.passed && c.status != 'skipped')) {
    tabs.add('E2E');
  }
  if (tabs.isEmpty) {
    return 'Report loaded with failures. Review the test tabs below.';
  }
  final joined = tabs.length == 1
      ? '${tabs.first} Tests'
      : '${tabs.sublist(0, tabs.length - 1).join(', ')} and ${tabs.last} Tests';
  return 'Report loaded with failures. Review $joined tabs.';
}

class _Banner extends StatelessWidget {
  const _Banner({
    required this.color,
    required this.textColor,
    required this.icon,
    required this.message,
  });

  final Color color;
  final Color textColor;
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: textColor, height: 1.45),
            ),
          ),
        ],
      ),
    );
  }
}
