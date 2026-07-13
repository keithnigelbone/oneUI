import 'package:flutter/material.dart';

import '../catalog/qa_catalog.dart';
import '../qa/component_test_stability.dart';
import '../qa/use_catalog_test_stability.dart';
import '../reports/qa_report_summary.dart';
import '../shell/qa_web_link.dart';
import '../showcases/qa_component_figma.dart';
import '../showcases/qa_component_scenarios.dart';
import '../showcases/qa_scenario_categories.dart';
import '../widgets/qa_report_dashboard.dart';
import '../widgets/qa_report_load_panel.dart';
import '../widgets/qa_stability_badge.dart';

enum QaDetailTab { scenarios, figma, accessibility, functional, visual, e2e }

class ComponentDetailPage extends StatefulWidget {
  const ComponentDetailPage({
    required this.slug,
    required this.onBack,
    this.onToggleTheme,
    this.isDark = false,
    super.key,
  });

  final String slug;
  final VoidCallback onBack;
  final VoidCallback? onToggleTheme;
  final bool isDark;

  @override
  State<ComponentDetailPage> createState() => _ComponentDetailPageState();
}

class _ComponentDetailPageState extends State<ComponentDetailPage> {
  QaDetailTab _tab = QaDetailTab.scenarios;
  QaReportSummary? _summary;
  bool _loadingReport = false;
  bool _loadedOnce = false;

  QaCatalogEntry? get _entry => qaCatalogEntryForSlug(widget.slug);

  @override
  void initState() {
    super.initState();
    _loadReport(silent: true);
  }

  Future<void> _loadReport({bool silent = false}) async {
    if (!silent) setState(() => _loadingReport = true);
    final summary = await QaReportSummary.loadFromAssets(componentSlug: widget.slug);
    if (!mounted) return;
    setState(() {
      _summary = summary;
      _loadingReport = false;
      _loadedOnce = true;
    });
    if (summary != null) {
      CatalogTestStabilityScope.of(context).refresh();
    }
  }

  void _handleBack() {
    qaPopToCatalog();
    widget.onBack();
  }

  QaComponentTestStability _resolveStability() {
    // Prefer the loaded report — it may be newer than the catalog poll index.
    if (_summary != null) {
      return getComponentTestStability(widget.slug, _summary);
    }
    final controller = CatalogTestStabilityScope.of(context);
    return resolveCatalogEntryStability(widget.slug, controller.stabilityBySlug);
  }

  @override
  Widget build(BuildContext context) {
    final entry = _entry;
    if (entry == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Unknown component: ${widget.slug}'),
            const SizedBox(height: 12),
            FilledButton(onPressed: _handleBack, child: const Text('Back to catalog')),
          ],
        ),
      );
    }

    final tabs = _tabsFor(entry);
    if (!tabs.contains(_tab)) {
      _tab = tabs.first;
    }

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: _DetailHeader(
            entry: entry,
            stability: _resolveStability(),
            onBack: _handleBack,
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: QaReportLoadPanel(
              componentName: entry.name,
              loading: _loadingReport,
              summary: _summary,
              hasTests: entry.hasFunctionalTests || entry.hasA11yTests,
              onLoad: () => _loadReport(),
              onOpenFullReport: () {
                qaOpenInNewTab('qa-reports/components/${entry.slug}-report.html');
              },
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: _DetailTabBar(
              tabs: tabs,
              selected: _tab,
              onSelected: (t) => setState(() => _tab = t),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 48),
          sliver: SliverToBoxAdapter(child: _tabContent(entry, tabs)),
        ),
      ],
    );
  }

  List<QaDetailTab> _tabsFor(QaCatalogEntry entry) {
    final tabs = <QaDetailTab>[QaDetailTab.scenarios];
    if (qaHasFigmaValidationTab(entry.slug)) {
      tabs.add(QaDetailTab.figma);
    }
    tabs.addAll([QaDetailTab.accessibility, QaDetailTab.functional]);
    // Visual Tests only when [golden] cases exist for this slug.
    if ((_summary?.visual.cases ?? const []).isNotEmpty) {
      tabs.add(QaDetailTab.visual);
    }
    // E2E only when integration_test results actually exist for this slug —
    // most components don't have an `integration_test/<slug>_e2e_test.dart`
    // and would otherwise see an empty tab.
    if ((_summary?.e2e.cases ?? const []).isNotEmpty) {
      tabs.add(QaDetailTab.e2e);
    }
    return tabs;
  }

  Widget _tabContent(QaCatalogEntry entry, List<QaDetailTab> tabs) {
    final tab = tabs.contains(_tab) ? _tab : tabs.first;
    switch (tab) {
      case QaDetailTab.scenarios:
        return _ScenariosTab(entry: entry);
      case QaDetailTab.figma:
        return _FigmaTab(entry: entry);
      case QaDetailTab.accessibility:
        return QaReportDashboard(
          title: 'Accessibility',
          variant: 'accessibility',
          generatedAt: _summary?.generatedAt,
          cases: _summary?.accessibility.cases ?? const [],
          emptyHint: entry.hasA11yTests
              ? (_loadedOnce && _summary == null
                  ? 'No accessibility results yet — run pnpm qa:flutter:component -- <slug> and load the report.'
                  : 'No [a11y] cases found for this component in the last run.')
              : 'Accessibility tests planned — copy test/components/checkbox/checkbox_a11y_test.dart pattern.',
        );
      case QaDetailTab.functional:
        return QaReportDashboard(
          title: 'Functional Tests',
          variant: 'functional',
          generatedAt: _summary?.generatedAt,
          cases: _summary?.functional.cases ?? const [],
          emptyHint: entry.hasFunctionalTests
              ? (_loadedOnce && _summary == null
                  ? 'No functional results yet — run pnpm qa:flutter:component -- <slug> and load the report.'
                  : 'No [fn] / [smoke] cases found for this component in the last run.')
              : 'Functional tests planned — copy test/components/checkbox/checkbox_functional_test.dart pattern.',
        );
      case QaDetailTab.visual:
        return QaReportDashboard(
          title: 'Visual Tests',
          variant: 'visual',
          generatedAt: _summary?.generatedAt,
          cases: _summary?.visual.cases ?? const [],
          emptyHint: _loadedOnce && _summary == null
              ? 'No visual results yet — run pnpm qa:flutter:visual -- ${entry.slug} and load the report.'
              : 'No [golden] cases found for this component in the last run.',
        );
      case QaDetailTab.e2e:
        return QaReportDashboard(
          title: 'E2E (on-device)',
          variant: 'e2e',
          generatedAt: _summary?.generatedAt,
          cases: _summary?.e2e.cases ?? const [],
          emptyHint: _loadedOnce && _summary == null
              ? 'No e2e results yet — run bash scripts/run_e2e_with_report.sh <device> ${entry.slug} and load the report.'
              : 'No [e2e] cases found for this component in the last run.',
        );
    }
  }
}

class _DetailHeader extends StatelessWidget {
  const _DetailHeader({
    required this.entry,
    required this.stability,
    required this.onBack,
  });

  final QaCatalogEntry entry;
  final QaComponentTestStability stability;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextButton.icon(
            onPressed: onBack,
            icon: const Icon(Icons.arrow_back, size: 18),
            label: const Text('Components'),
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              foregroundColor: scheme.primary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            entry.name,
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        QaStabilityBadge(stability: stability),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _MetaChip(label: entry.slug),
                        _MetaChip(label: entry.category.label),
                        if (entry.hasLivePreview) _MetaChip(label: 'Live preview', primary: true),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            entry.description,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: scheme.onSurfaceVariant,
                  height: 1.5,
                ),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label, this.primary = false});

  final String label;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: primary ? scheme.primaryContainer : scheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: primary ? scheme.onPrimaryContainer : scheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _DetailTabBar extends StatelessWidget {
  const _DetailTabBar({
    required this.tabs,
    required this.selected,
    required this.onSelected,
  });

  final List<QaDetailTab> tabs;
  final QaDetailTab selected;
  final ValueChanged<QaDetailTab> onSelected;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: scheme.outlineVariant)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final tab in tabs)
              _TabLink(
                label: _label(tab),
                selected: selected == tab,
                onTap: () => onSelected(tab),
              ),
          ],
        ),
      ),
    );
  }

  String _label(QaDetailTab tab) => switch (tab) {
        QaDetailTab.scenarios => 'Test Scenarios',
        QaDetailTab.figma => 'Figma Validation',
        QaDetailTab.accessibility => 'Accessibility',
        QaDetailTab.functional => 'Functional Tests',
        QaDetailTab.visual => 'Visual Tests',
        QaDetailTab.e2e => 'E2E (on-device)',
      };
}

class _TabLink extends StatelessWidget {
  const _TabLink({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: selected ? scheme.primary : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? scheme.primary : scheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

class _ScenariosTab extends StatelessWidget {
  const _ScenariosTab({required this.entry});

  final QaCatalogEntry entry;

  @override
  Widget build(BuildContext context) {
    final bands = qaScenariosForSlug(entry.slug);
    if (bands.isEmpty) {
      return _PlannedPanel(
        title: 'Test scenarios coming soon',
        body: 'Add scenarios in lib/showcases/qa_component_scenarios.dart for ${entry.slug}.',
      );
    }

    final grouped = <QaScenarioCategory, List<QaScenarioBand>>{};
    for (final band in bands) {
      grouped.putIfAbsent(band.category, () => []).add(band);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final category in kQaScenarioCategoryOrder) ...[
          if (grouped[category]?.isNotEmpty ?? false) ...[
            _ScenarioCategoryHeader(category: category),
            const SizedBox(height: 12),
            for (final band in grouped[category]!) ...[
              _ScenarioSection(band: band),
              const SizedBox(height: 24),
            ],
            const SizedBox(height: 8),
          ],
        ],
      ],
    );
  }
}

class _FigmaTab extends StatelessWidget {
  const _FigmaTab({required this.entry});

  final QaCatalogEntry entry;

  @override
  Widget build(BuildContext context) {
    final bands = qaFigmaValidationForSlug(entry.slug);
    if (bands.isEmpty) {
      return _PlannedPanel(
        title: 'Figma validation coming soon',
        body: 'Wire Figma matrix sections in lib/showcases/qa_component_figma.dart.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Figma variable-mode matrices from ui_flutter Storybook foundations.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 20),
        for (final band in bands) ...[
          _FigmaSection(band: band),
          const SizedBox(height: 32),
        ],
      ],
    );
  }
}

class _ScenarioCategoryHeader extends StatelessWidget {
  const _ScenarioCategoryHeader({required this.category});

  final QaScenarioCategory category;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          category.title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          category.description,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: scheme.onSurfaceVariant,
                height: 1.45,
              ),
        ),
      ],
    );
  }
}

class _ScenarioSection extends StatelessWidget {
  const _ScenarioSection({required this.band});

  final QaScenarioBand band;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          band.title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          band.subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 12),
        band.child,
      ],
    );
  }
}

class _FigmaSection extends StatelessWidget {
  const _FigmaSection({required this.band});

  final QaFigmaBand band;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          band.title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          band.subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 12),
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: Theme.of(context).dividerColor),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: band.child,
          ),
        ),
      ],
    );
  }
}

class _PlannedPanel extends StatelessWidget {
  const _PlannedPanel({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.construction_outlined, size: 48, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(body, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
