import 'package:flutter/material.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../reports/qa_report_date_format.dart';
import '../reports/qa_report_paths.dart';
import '../reports/qa_report_summary.dart';

enum _CaseFilter { all, passed, failed }

/// Brand-recognizable colors for the three Flutter test target platforms.
/// `debugDefaultTargetPlatformOverride` writes these names into the test
/// description suffix (e.g. `(android)`), and the report parser extracts them
/// into `QaReportCase.platform`. The dashboard tints badges + filter chips so
/// scanning a long list reveals the platform split at a glance.
class _PlatformStyle {
  const _PlatformStyle({required this.color, required this.icon, required this.label});
  final Color color;
  final IconData icon;
  final String label;
}

const Map<String, _PlatformStyle> _kPlatformStyles = {
  // Android logo green.
  'android': _PlatformStyle(
    color: Color(0xFF34A853),
    icon: Icons.android,
    label: 'Android',
  ),
  // iOS system blue.
  'ios': _PlatformStyle(
    color: Color(0xFF007AFF),
    icon: Icons.phone_iphone,
    label: 'iOS',
  ),
  // `TargetPlatform.linux` is the Flutter framework value used by
  // `testWidgetsAllPlatforms` to exercise the desktop/keyboard-mouse code
  // path (desktop scroll physics, hover, no swipe-to-go-back). The tests do
  // NOT require Linux to run — they run in the same headless test binding
  // on macOS / Windows / CI. Surface this honestly as "Desktop" so users
  // don't think they need a Linux box. JSON key stays `linux` for parser
  // stability with existing reports.
  'linux': _PlatformStyle(
    color: Color(0xFFE95420),
    icon: Icons.desktop_windows,
    label: 'Desktop',
  ),
};

_PlatformStyle? _platformStyleFor(String? raw) {
  if (raw == null) return null;
  return _kPlatformStyles[raw.trim().toLowerCase()];
}

class QaReportDashboard extends StatefulWidget {
  const QaReportDashboard({
    required this.title,
    required this.variant,
    required this.cases,
    required this.emptyHint,
    this.generatedAt,
    super.key,
  });

  final String title;
  final String variant;
  final List<QaReportCase> cases;
  final String emptyHint;
  final String? generatedAt;

  @override
  State<QaReportDashboard> createState() => _QaReportDashboardState();
}

class _QaReportDashboardState extends State<QaReportDashboard> {
  _CaseFilter _filter = _CaseFilter.all;
  String _search = '';

  /// Selected platforms. Empty set = show all platforms (no filter). When a
  /// platform isn't present in any test case (e.g. older reports without the
  /// `platform` field), the chip is hidden and the filter degrades cleanly.
  final Set<String> _selectedPlatforms = <String>{};

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final passed = widget.cases.where((c) => c.passed).length;
    final failed = widget.cases.where((c) => !c.passed).length;
    final total = widget.cases.length;
    final passRate = total > 0 ? (passed / total * 100).round() : 0;

    if (widget.cases.isEmpty) {
      return _EmptyPanel(message: widget.emptyHint);
    }

    // Per-platform counts for the filter chip labels. Computed against the
    // unfiltered list so chips always show "true" totals, not what's visible
    // after the current filter (which would be confusing as it'd change as
    // you select).
    final platformCounts = <String, int>{};
    for (final c in widget.cases) {
      final key = c.platform?.trim().toLowerCase();
      if (key == null || key.isEmpty) continue;
      platformCounts[key] = (platformCounts[key] ?? 0) + 1;
    }
    final orderedPlatforms = _kPlatformStyles.keys
        .where(platformCounts.containsKey)
        .toList();

    final filteredCases = widget.cases.where((c) {
      if (_filter == _CaseFilter.passed && !c.passed) return false;
      if (_filter == _CaseFilter.failed && c.passed) return false;
      if (_selectedPlatforms.isNotEmpty) {
        final key = c.platform?.trim().toLowerCase();
        if (key == null || !_selectedPlatforms.contains(key)) return false;
      }
      if (_search.isNotEmpty &&
          !c.name.toLowerCase().contains(_search.toLowerCase())) {
        return false;
      }
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _DashboardHeader(
          title: widget.title,
          variant: widget.variant,
          passRate: passRate,
          allPassed: failed == 0 && total > 0,
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 640;
            final stats = [
              _StatCard(
                label: 'Passed',
                value: passed,
                helper: total > 0 ? '${(passed / total * 100).round()}% of total' : null,
                tone: _StatTone.pass,
              ),
              _StatCard(
                label: 'Failed',
                value: failed,
                helper: total > 0 ? '${(failed / total * 100).round()}% of total' : null,
                tone: _StatTone.fail,
              ),
              _StatCard(
                label: 'Pass rate',
                value: passRate,
                helper: 'From loaded report',
                tone: _StatTone.primary,
                isPercent: true,
              ),
              _StatCard(
                label: 'Total tests',
                value: total,
                helper: 'In this suite',
                tone: _StatTone.neutral,
              ),
            ];
            if (wide) {
              return Row(
                children: [
                  for (var i = 0; i < stats.length; i++) ...[
                    if (i > 0) const SizedBox(width: 12),
                    Expanded(child: stats[i]),
                  ],
                ],
              );
            }
            return Wrap(spacing: 12, runSpacing: 12, children: stats);
          },
        ),
        if (widget.generatedAt != null && widget.generatedAt!.isNotEmpty) ...[
          const SizedBox(height: 12),
          OneUiText(
            text: 'Last run: ${formatQaReportTimestamp(widget.generatedAt)}',
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.low,
            attention: OneUiTextAttention.low,
          ),
        ],
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search test cases…',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  isDense: true,
                  filled: true,
                  fillColor: scheme.surfaceContainerLow,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                ),
                onChanged: (v) => setState(() => _search = v),
              ),
            ),
            const SizedBox(width: 12),
            SegmentedButton<_CaseFilter>(
              segments: const [
                ButtonSegment(value: _CaseFilter.all, label: Text('All')),
                ButtonSegment(value: _CaseFilter.passed, label: Text('Passed')),
                ButtonSegment(value: _CaseFilter.failed, label: Text('Failed')),
              ],
              selected: {_filter},
              onSelectionChanged: (s) => setState(() => _filter = s.first),
            ),
          ],
        ),
        if (orderedPlatforms.isNotEmpty) ...[
          const SizedBox(height: 12),
          _PlatformFilterRow(
            orderedPlatforms: orderedPlatforms,
            counts: platformCounts,
            selected: _selectedPlatforms,
            onToggle: (key) => setState(() {
              if (_selectedPlatforms.contains(key)) {
                _selectedPlatforms.remove(key);
              } else {
                _selectedPlatforms.add(key);
              }
            }),
            onClear: _selectedPlatforms.isEmpty
                ? null
                : () => setState(_selectedPlatforms.clear),
          ),
        ],
        const SizedBox(height: 16),
        if (failed > 0) ...[
          _SectionTitle(
            title: 'Failed cases',
            count: failed,
            tone: _StatTone.fail,
          ),
          const SizedBox(height: 8),
          ...widget.cases.where((c) => !c.passed).map((c) => _CaseTile(testCase: c)),
          const SizedBox(height: 20),
        ],
        _SectionTitle(
          title: failed > 0 ? 'All cases' : 'Test cases',
          count: filteredCases.length,
          tone: _StatTone.primary,
        ),
        const SizedBox(height: 8),
        if (filteredCases.isEmpty)
          _EmptyPanel(message: widget.emptyHint)
        else
          ...filteredCases.map((c) => _CaseTile(testCase: c)),
      ],
    );
  }

}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader({
    required this.title,
    required this.variant,
    required this.passRate,
    required this.allPassed,
  });

  final String title;
  final String variant;
  final int passRate;
  final bool allPassed;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final icon = switch (variant) {
      'accessibility' => Icons.accessibility_new,
      'e2e' => Icons.phone_iphone,
      'visual' => Icons.image_search,
      _ => Icons.checklist,
    };
    final subtitle = switch (variant) {
      'accessibility' =>
          'Semantics and a11y resolver checks from flutter_test ([a11y] tier).',
      'e2e' =>
          'On-device integration_test runs ([e2e] tier) — real gestures, ripples, and engine paint.',
      'visual' =>
          'Golden / pixel-diff snapshots ([golden] tier). Failures attach expected, actual, and diff PNGs.',
      _ => 'Interaction and rendering checks from flutter_test ([fn] / [smoke] tiers).',
    };

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: scheme.primaryContainer.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: scheme.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: OneUiText(
                        text: title,
                        variant: OneUiTextVariant.title,
                        size: 'm',
                        weight: OneUiTextWeight.high,
                      ),
                    ),
                    _StatusPill(
                      label: allPassed ? 'All passing' : '$passRate% pass rate',
                      passed: allPassed,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                OneUiText(
                  text: subtitle,
                  variant: OneUiTextVariant.body,
                  size: 's',
                  weight: OneUiTextWeight.low,
                  attention: OneUiTextAttention.medium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.passed});

  final String label;
  final bool passed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: passed ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: passed ? const Color(0xFF166534) : const Color(0xFF854D0E),
        ),
      ),
    );
  }
}

enum _StatTone { primary, pass, fail, neutral }

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    this.helper,
    required this.tone,
    this.isPercent = false,
  });

  final String label;
  final int value;
  final String? helper;
  final _StatTone tone;
  final bool isPercent;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final (bg, fg) = switch (tone) {
      _StatTone.pass => (const Color(0xFFDCFCE7), const Color(0xFF166534)),
      _StatTone.fail => (const Color(0xFFFEE2E2), const Color(0xFF991B1B)),
      _StatTone.neutral => (scheme.surfaceContainerHighest, scheme.onSurface),
      _StatTone.primary => (scheme.primaryContainer.withValues(alpha: 0.35), scheme.primary),
    };

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: fg.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: fg),
          ),
          const SizedBox(height: 6),
          Text(
            isPercent ? '$value%' : '$value',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: fg),
          ),
          if (helper != null) ...[
            const SizedBox(height: 4),
            Text(
              helper!,
              style: TextStyle(fontSize: 11, color: fg.withValues(alpha: 0.75)),
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    required this.count,
    required this.tone,
  });

  final String title;
  final int count;
  final _StatTone tone;

  @override
  Widget build(BuildContext context) {
    final fg = switch (tone) {
      _StatTone.fail => const Color(0xFF991B1B),
      _StatTone.pass => const Color(0xFF166534),
      _ => Theme.of(context).colorScheme.onSurface,
    };

    return Row(
      children: [
        Text(
          title,
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: fg),
        ),
        const SizedBox(width: 8),
        Text(
          '$count',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: fg.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }
}

class _CaseTile extends StatefulWidget {
  const _CaseTile({required this.testCase});

  final QaReportCase testCase;

  @override
  State<_CaseTile> createState() => _CaseTileState();
}

class _CaseTileState extends State<_CaseTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final ok = widget.testCase.passed;
    final tier = widget.testCase.tier;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: ok
              ? scheme.outlineVariant.withValues(alpha: 0.45)
              : scheme.error.withValues(alpha: 0.35),
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => setState(() => _expanded = !_expanded),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    ok ? Icons.check_circle : Icons.cancel,
                    size: 20,
                    color: ok ? const Color(0xFF16A34A) : scheme.error,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.testCase.name,
                      style: const TextStyle(fontSize: 13, height: 1.4),
                    ),
                  ),
                  if (tier.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        tier.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  if (widget.testCase.platform != null &&
                      widget.testCase.platform!.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    _PlatformBadge(platform: widget.testCase.platform!),
                  ],
                  if (widget.testCase.durationMs != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      '${widget.testCase.durationMs}ms',
                      style: TextStyle(fontSize: 11, color: scheme.onSurfaceVariant),
                    ),
                  ],
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    size: 20,
                    color: scheme.onSurfaceVariant,
                  ),
                ],
              ),
              if (_expanded) ...[
                const SizedBox(height: 10),
                Divider(height: 1, color: scheme.outlineVariant.withValues(alpha: 0.4)),
                const SizedBox(height: 10),
                Text(
                  'Status: ${widget.testCase.status}',
                  style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                ),
                if (widget.testCase.component != null)
                  Text(
                    'Component: ${widget.testCase.component}',
                    style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                  ),
                if (widget.testCase.error != null && widget.testCase.error!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: scheme.errorContainer.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.testCase.error!,
                      style: TextStyle(
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: scheme.onErrorContainer,
                        height: 1.45,
                      ),
                    ),
                  ),
                ],
                if (widget.testCase.visualAssets != null) ...[
                  const SizedBox(height: 12),
                  _VisualDiffGallery(assets: widget.testCase.visualAssets!),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Side-by-side Expected / Actual / Diff renderer for a failed golden test.
/// Each panel labels what it shows, falls back to a placeholder when an asset
/// is missing, and tapping a panel opens the full-resolution PNG in a new tab.
class _VisualDiffGallery extends StatelessWidget {
  const _VisualDiffGallery({required this.assets});

  final QaVisualAssets assets;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final panels = <_VisualDiffPanel>[
      _VisualDiffPanel(label: 'Expected', tint: const Color(0xFF16A34A), path: assets.master),
      _VisualDiffPanel(label: 'Actual', tint: scheme.error, path: assets.test),
      _VisualDiffPanel(
        label: 'Diff (masked)',
        tint: const Color(0xFFB45309),
        path: assets.maskedDiff ?? assets.isolatedDiff,
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        // Three columns on wide screens, two then one as it narrows.
        final w = constraints.maxWidth;
        final cols = w > 720 ? 3 : (w > 480 ? 2 : 1);
        final colWidth = (w - (cols - 1) * 12) / cols;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final p in panels)
              SizedBox(width: colWidth, child: p),
          ],
        );
      },
    );
  }
}

class _VisualDiffPanel extends StatelessWidget {
  const _VisualDiffPanel({
    required this.label,
    required this.tint,
    required this.path,
  });

  final String label;
  final Color tint;

  /// Site-rooted path under `qa-reports/components/<slug>-visual-assets/`,
  /// or null when the run did not produce this artifact (e.g. master missing
  /// on a brand-new test).
  final String? path;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final imageUri = path == null ? null : qaReportWebUri(path!);

    return Container(
      decoration: BoxDecoration(
        color: scheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: tint.withValues(alpha: 0.4)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            color: tint.withValues(alpha: 0.14),
            child: Row(
              children: [
                Icon(Icons.crop_original, size: 14, color: tint),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: tint,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
          AspectRatio(
            aspectRatio: 4 / 3,
            child: imageUri == null
                ? Center(
                    child: Text(
                      'Not produced',
                      style: TextStyle(
                        fontSize: 11,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                  )
                : Image.network(
                    imageUri.toString(),
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => Center(
                      child: Text(
                        'Image unavailable',
                        style: TextStyle(
                          fontSize: 11,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Icon(Icons.assignment_outlined, size: 40, color: scheme.onSurfaceVariant),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: scheme.onSurfaceVariant, height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _PlatformBadge extends StatelessWidget {
  const _PlatformBadge({required this.platform});

  final String platform;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final style = _platformStyleFor(platform);
    // Fallback for unrecognized platforms — keeps the badge but neutral-toned.
    final color = style?.color ?? scheme.onSurfaceVariant;
    final icon = style?.icon ?? Icons.devices_other;
    final label = style?.label ?? platform.toUpperCase();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        border: Border.all(color: color.withValues(alpha: 0.45)),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _PlatformFilterRow extends StatelessWidget {
  const _PlatformFilterRow({
    required this.orderedPlatforms,
    required this.counts,
    required this.selected,
    required this.onToggle,
    required this.onClear,
  });

  final List<String> orderedPlatforms;
  final Map<String, int> counts;
  final Set<String> selected;
  final ValueChanged<String> onToggle;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Text(
            'Platform',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: scheme.onSurfaceVariant,
            ),
          ),
        ),
        for (final key in orderedPlatforms)
          _PlatformChip(
            platform: key,
            count: counts[key] ?? 0,
            isSelected: selected.contains(key),
            onTap: () => onToggle(key),
          ),
        if (onClear != null)
          TextButton.icon(
            onPressed: onClear,
            icon: const Icon(Icons.clear, size: 14),
            label: const Text('Clear', style: TextStyle(fontSize: 12)),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: const Size(0, 32),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
      ],
    );
  }
}

class _PlatformChip extends StatelessWidget {
  const _PlatformChip({
    required this.platform,
    required this.count,
    required this.isSelected,
    required this.onTap,
  });

  final String platform;
  final int count;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final style = _platformStyleFor(platform);
    final color = style?.color ?? scheme.onSurfaceVariant;
    final icon = style?.icon ?? Icons.devices_other;
    final label = style?.label ?? platform.toUpperCase();

    final bg = isSelected ? color.withValues(alpha: 0.16) : scheme.surfaceContainerLow;
    final borderColor = isSelected ? color.withValues(alpha: 0.7) : scheme.outlineVariant;
    final fg = isSelected ? color : scheme.onSurfaceVariant;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: bg,
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isSelected) ...[
                Icon(Icons.check, size: 14, color: color),
                const SizedBox(width: 6),
              ] else ...[
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: fg,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: isSelected ? 0.22 : 0.10),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

