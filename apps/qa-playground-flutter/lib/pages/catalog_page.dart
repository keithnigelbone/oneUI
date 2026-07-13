import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../catalog/qa_catalog.dart';
import '../catalog/qa_catalog_meta.dart';
import '../qa/component_test_stability.dart';
import '../qa/use_catalog_test_stability.dart';
import '../shell/qa_web_link.dart';
import '../widgets/qa_catalog_tokens.dart';
import '../widgets/qa_component_card.dart';

class CatalogPage extends StatefulWidget {
  const CatalogPage({required this.onOpenComponent, super.key});

  final ValueChanged<String> onOpenComponent;

  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  final _searchController = TextEditingController();
  final _searchFocus = FocusNode();
  String _query = '';
  QaComponentCategory? _category;
  QaTestStability? _stability;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() => _query = _searchController.text));
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  Map<String, QaTestStability> _filterStabilityMap(
    Map<String, QaComponentTestStability> raw,
  ) {
    return {for (final e in raw.entries) e.key: e.value.catalogFilter};
  }

  Map<QaComponentCategory, int> _countByCategory() {
    final map = <QaComponentCategory, int>{};
    for (final e in kQaCatalogEntries) {
      map[e.category] = (map[e.category] ?? 0) + 1;
    }
    return map;
  }

  bool get _hasActiveFilters =>
      _query.trim().isNotEmpty || _category != null || _stability != null;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);
    final stabilityController = CatalogTestStabilityScope.of(context);
    final stabilityBySlug = stabilityController.stabilityBySlug;
    final counts = stabilityController.counts;
    final filterMap = _filterStabilityMap(stabilityBySlug);
    final countByCategory = _countByCategory();

    final filtered = filterQaCatalog(
      query: _query,
      category: _category,
      stability: _stability,
      stabilityBySlug: filterMap,
    );
    final grouped = groupQaCatalogByCategory(filtered);

    final pagePadding = tokens.edgeInsets(
      horizontal: tokens.spacing('5'),
      vertical: tokens.spacing('6'),
    );

    return Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.keyK, meta: true): _FocusSearchIntent(),
        SingleActivator(LogicalKeyboardKey.keyK, control: true): _FocusSearchIntent(),
      },
      child: Actions(
        actions: {
          _FocusSearchIntent: CallbackAction<_FocusSearchIntent>(
            onInvoke: (_) {
              FocusScope.of(context).requestFocus(_searchFocus);
              return null;
            },
          ),
        },
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Padding(
              padding: pagePadding,
              child: _HeroPanel(
                componentCount: kQaCatalogEntries.length,
                categoryCount: kQaCategoryOrder.length,
                stableCount: counts.stable,
                unstableCount: counts.unstable,
                underDevelopmentCount: counts.underDevelopment,
                loadingStability: stabilityController.loading,
                onRefreshStability: stabilityController.refresh,
                searchController: _searchController,
                searchFocus: _searchFocus,
                query: _query,
                onClearSearch: () => _searchController.clear(),
              ),
            ),
            _FilterPanel(
              categoryValue: qaCategoryFilterValue(_category),
              stabilityValue: qaStabilityFilterValue(_stability),
              totalCount: counts.total,
              countByCategory: countByCategory,
              stabilityCounts: counts,
              onCategoryChanged: (v) =>
                  setState(() => _category = qaCategoryFromFilterValue(v)),
              onStabilityChanged: (v) =>
                  setState(() => _stability = qaStabilityFromFilterValue(v)),
            ),
            if (_hasActiveFilters)
              Padding(
                padding: EdgeInsets.fromLTRB(
                  tokens.spacing('5'),
                  tokens.spacing('4'),
                  tokens.spacing('5'),
                  0,
                ),
                child: OneUiSurface(
                  mode: 'elevated',
                  padding: tokens.edgeInsets(
                    horizontal: tokens.spacing('4'),
                    vertical: tokens.spacing('3-5'),
                  ),
                  child: OneUiText(
                    text: _query.trim().isNotEmpty
                        ? 'Showing ${filtered.length} of ${kQaCatalogEntries.length} components matching "${_query.trim()}"'
                        : 'Showing ${filtered.length} of ${kQaCatalogEntries.length} components',
                    variant: OneUiTextVariant.body,
                    size: 's',
                    weight: OneUiTextWeight.low,
                    attention: OneUiTextAttention.medium,
                  ),
                ),
              ),
            if (filtered.isEmpty)
              Padding(
                padding: EdgeInsets.all(tokens.spacing('5')),
                child: _EmptyState(onReset: _resetFilters),
              )
            else
              for (final category in kQaCategoryOrder)
                if (grouped.containsKey(category))
                  ..._categorySection(
                    category: category,
                    entries: grouped[category]!,
                    stabilityBySlug: stabilityBySlug,
                  ),
            SizedBox(height: tokens.spacing('12')),
          ],
        ),
      ),
    );
  }

  void _resetFilters() {
    setState(() {
      _category = null;
      _stability = null;
      _searchController.clear();
    });
  }

  List<Widget> _categorySection({
    required QaComponentCategory category,
    required List<QaCatalogEntry> entries,
    required Map<String, QaComponentTestStability> stabilityBySlug,
  }) {
    final tokens = QaCatalogTokens.of(context);
    final blurb = kQaCategoryBlurbs[category] ?? '';
    final accentRole = kQaCategoryAccentRole[category] ?? 'primary';

    return [
      Padding(
        padding: EdgeInsets.fromLTRB(
          tokens.spacing('5'),
          tokens.spacing('10'),
          tokens.spacing('5'),
          tokens.spacing('5'),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OneUiSurface(
                    mode: 'bold',
                    appearance: accentRole,
                    padding: EdgeInsets.zero,
                    child: SizedBox(
                      width: tokens.spacing('1'),
                      height: tokens.f('f6'),
                    ),
                  ),
                  SizedBox(width: tokens.spacing('4')),
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        OneUiText(
                          text: category.label,
                          variant: OneUiTextVariant.headline,
                          size: 's',
                          weight: OneUiTextWeight.high,
                        ),
                        if (blurb.isNotEmpty) ...[
                          SizedBox(height: tokens.spacing('2')),
                          OneUiText(
                            text: blurb,
                            variant: OneUiTextVariant.body,
                            size: 's',
                            weight: OneUiTextWeight.low,
                            attention: OneUiTextAttention.medium,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            OneUiBadge(
              size: 's',
              attention: 'medium',
              appearance: 'neutral',
              child:
                  '${entries.length} ${entries.length == 1 ? 'component' : 'components'}',
            ),
          ],
        ),
      ),
      Padding(
        padding: EdgeInsets.symmetric(horizontal: tokens.spacing('5')),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final gap = tokens.spacing('5');
            final maxCardWidth = tokens.f('f16');
            final cols = ((constraints.maxWidth + gap) / (maxCardWidth + gap))
                .floor()
                .clamp(1, 8);
            final cardWidth = (constraints.maxWidth - gap * (cols - 1)) / cols;
            return Wrap(
              spacing: gap,
              runSpacing: gap,
              children: [
                for (final entry in entries)
                  SizedBox(
                    width: cardWidth,
                    child: QaComponentCard(
                      entry: entry,
                      stability: resolveCatalogEntryStability(
                        entry.slug,
                        stabilityBySlug,
                      ),
                      onTap: () => widget.onOpenComponent(entry.slug),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    ];
  }
}

class _FocusSearchIntent extends Intent {
  const _FocusSearchIntent();
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({
    required this.componentCount,
    required this.categoryCount,
    required this.stableCount,
    required this.unstableCount,
    required this.underDevelopmentCount,
    required this.loadingStability,
    required this.onRefreshStability,
    required this.searchController,
    required this.searchFocus,
    required this.query,
    required this.onClearSearch,
  });

  final int componentCount;
  final int categoryCount;
  final int stableCount;
  final int unstableCount;
  final int underDevelopmentCount;
  final bool loadingStability;
  final VoidCallback onRefreshStability;
  final TextEditingController searchController;
  final FocusNode searchFocus;
  final String query;
  final VoidCallback onClearSearch;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);

    final titles = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const OneUiText(
          text: 'QA PLAYGROUND · FLUTTER',
          variant: OneUiTextVariant.label,
          size: 'xs',
          weight: OneUiTextWeight.medium,
          appearance: 'primary',
        ),
        SizedBox(height: tokens.spacing('3')),
        const OneUiText(
          text: 'OneUI Components',
          variant: OneUiTextVariant.display,
          size: 's',
          weight: OneUiTextWeight.high,
        ),
        SizedBox(height: tokens.spacing('3')),
        const OneUiText(
          text:
              'Explore Flutter components with live previews, flutter_test suites, and HTML reports — parity with React QA Playground.',
          variant: OneUiTextVariant.body,
          size: 'm',
          weight: OneUiTextWeight.low,
          attention: OneUiTextAttention.medium,
        ),
      ],
    );

    final actions = Wrap(
      spacing: tokens.spacing('2-5'),
      runSpacing: tokens.spacing('2-5'),
      children: [
        OneUiButton(
          label: 'Full test report',
          sizeAlias: 's',
          variant: OneUiButtonVariant.bold,
          onPressed: () => qaOpenInNewTab('qa-reports/flutter-report.html'),
        ),
        OneUiButton(
          label: 'React QA',
          sizeAlias: 's',
          variant: OneUiButtonVariant.subtle,
          onPressed: () => qaOpenInNewTab('http://localhost:5180/'),
        ),
        OneUiButton(
          label: 'Flutter Sample App',
          sizeAlias: 's',
          variant: OneUiButtonVariant.ghost,
          onPressed: () => qaOpenInNewTab('http://localhost:5200/'),
        ),
        OneUiButton(
          label: loadingStability ? 'Refreshing…' : 'Refresh status',
          sizeAlias: 's',
          variant: OneUiButtonVariant.ghost,
          onPressed: loadingStability ? null : onRefreshStability,
        ),
      ],
    );

    return OneUiSurface(
      mode: 'elevated',
      padding: tokens.edgeInsets(
        horizontal: tokens.spacing('6'),
        vertical: tokens.spacing('6'),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              // Below ~640dp the buttons' intrinsic width starves the title
              // column, causing per-character text wrap + horizontal overflow.
              // Stack title above buttons on narrow viewports.
              if (constraints.maxWidth < 640) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    titles,
                    SizedBox(height: tokens.spacing('4')),
                    actions,
                  ],
                );
              }
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: titles),
                  SizedBox(width: tokens.spacing('4')),
                  Flexible(child: actions),
                ],
              );
            },
          ),
          SizedBox(height: tokens.spacing('5')),
          LayoutBuilder(
            builder: (context, constraints) {
              final cols = constraints.maxWidth > 720 ? 5 : (constraints.maxWidth > 480 ? 3 : 2);
              final gap = tokens.spacing('3');
              final tileWidth = (constraints.maxWidth - gap * (cols - 1)) / cols;
              final stats = [
                _StatTile(value: '$componentCount', label: 'Components'),
                _StatTile(value: '$categoryCount', label: 'Categories'),
                _StatTile(value: '$stableCount', label: 'Stable'),
                _StatTile(value: '$unstableCount', label: 'Unstable'),
                _StatTile(value: '$underDevelopmentCount', label: 'Under development'),
              ];
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  for (final tile in stats)
                    SizedBox(width: tileWidth, child: tile),
                ],
              );
            },
          ),
          SizedBox(height: tokens.spacing('5')),
          Row(
            children: [
              Expanded(
                child: OneUiInput(
                  controller: searchController,
                  focusNode: searchFocus,
                  size: 12,
                  shape: OneUiInputShape.pill,
                  attention: OneUiInputAttention.medium,
                  appearance: OneUiInputAppearance.secondary,
                  placeholder: 'Search components by name or slug…',
                  start: const OneUiIcon(
                    icon: 'search',
                    size: '4',
                    emphasis: OneUiIconEmphasis.low,
                  ),
                  end: query.isNotEmpty
                      ? OneUiIconButton(
                          icon: 'close',
                          semanticsLabel: 'Clear search',
                          variant: OneUiIconButtonVariant.ghost,
                          size: 10,
                          appearance: 'secondary',
                          onPressed: onClearSearch,
                        )
                      : null,
                ),
              ),
              SizedBox(width: tokens.spacing('3')),
              OneUiSurface(
                mode: 'minimal',
                padding: tokens.edgeInsets(
                  horizontal: tokens.spacing('3-5'),
                  vertical: tokens.spacing('2-5'),
                ),
                child: const OneUiText(
                  text: '⌘K',
                  variant: OneUiTextVariant.label,
                  size: 'xs',
                  weight: OneUiTextWeight.low,
                  attention: OneUiTextAttention.low,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);

    return OneUiSurface(
      mode: 'minimal',
      borderRadius: BorderRadius.circular(tokens.f('f4')),
      padding: tokens.edgeInsets(
        horizontal: tokens.spacing('4-5'),
        vertical: tokens.spacing('4'),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          OneUiText(
            text: value,
            variant: OneUiTextVariant.title,
            size: 'm',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: tokens.spacing('1')),
          OneUiText(
            text: label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.low,
            attention: OneUiTextAttention.medium,
          ),
        ],
      ),
    );
  }
}

class _FilterPanel extends StatelessWidget {
  const _FilterPanel({
    required this.categoryValue,
    required this.stabilityValue,
    required this.totalCount,
    required this.countByCategory,
    required this.stabilityCounts,
    required this.onCategoryChanged,
    required this.onStabilityChanged,
  });

  final String categoryValue;
  final String stabilityValue;
  final int totalCount;
  final Map<QaComponentCategory, int> countByCategory;
  final ({int stable, int unstable, int underDevelopment, int total}) stabilityCounts;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<String> onStabilityChanged;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);

    return OneUiSurface(
      mode: 'elevated',
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: tokens.spacing('5'),
          vertical: tokens.spacing('4'),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _FilterRow(
              label: 'Category',
              child: OneUiChipGroup(
                value: [categoryValue],
                onValueChange: (next) {
                  final v = next.isEmpty ? 'all' : next.last;
                  onCategoryChanged(v);
                },
                children: [
                  OneUiChip(
                    value: 'all',
                    size: 'm',
                    attention: 'medium',
                    child: 'All',
                    end: OneUiCounterBadge(
                      value: totalCount,
                      size: 's',
                      showZero: true,
                    ),
                  ),
                  for (final c in kQaCategoryOrder)
                    OneUiChip(
                      value: c.name,
                      size: 'm',
                      attention: 'medium',
                      child: c.label,
                      end: OneUiCounterBadge(
                        value: countByCategory[c] ?? 0,
                        size: 's',
                        appearance: 'primary',
                        showZero: true,
                      ),
                    ),
                ],
              ),
            ),
            SizedBox(height: tokens.spacing('4')),
            _FilterRow(
              label: 'Component status',
              child: OneUiChipGroup(
                value: [stabilityValue],
                onValueChange: (next) {
                  final v = next.isEmpty ? 'all' : next.last;
                  onStabilityChanged(v);
                },
                children: [
                  OneUiChip(
                    value: 'all',
                    size: 'm',
                    attention: 'medium',
                    child: 'All',
                  ),
                  OneUiChip(
                    value: 'stable',
                    size: 'm',
                    attention: 'medium',
                    child: 'Stable',
                    end: OneUiCounterBadge(
                      value: stabilityCounts.stable,
                      size: 's',
                      appearance: 'positive',
                      showZero: true,
                    ),
                  ),
                  OneUiChip(
                    value: 'unstable',
                    size: 'm',
                    attention: 'medium',
                    child: 'Unstable',
                    end: OneUiCounterBadge(
                      value: stabilityCounts.unstable,
                      size: 's',
                      appearance: 'negative',
                      showZero: true,
                    ),
                  ),
                  OneUiChip(
                    value: 'under-development',
                    size: 'm',
                    attention: 'medium',
                    child: 'Under development',
                    end: OneUiCounterBadge(
                      value: stabilityCounts.underDevelopment,
                      size: 's',
                      appearance: 'warning',
                      showZero: true,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterRow extends StatelessWidget {
  const _FilterRow({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);

    // React `.filterLabel` — min-width f9, no max-width (avoids "Compo/nent" wrapping).
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        ConstrainedBox(
          constraints: BoxConstraints(minWidth: tokens.f('f9')),
          child: OneUiText(
            text: label,
            variant: OneUiTextVariant.label,
            size: 'xs',
            weight: OneUiTextWeight.medium,
            attention: OneUiTextAttention.medium,
          ),
        ),
        SizedBox(width: tokens.spacing('4')),
        Expanded(child: child),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onReset});

  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final tokens = QaCatalogTokens.of(context);

    return OneUiSurface(
      mode: 'elevated',
      padding: tokens.edgeInsets(
        horizontal: tokens.spacing('6'),
        vertical: tokens.spacing('10'),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const OneUiText(
            text: 'No components found',
            variant: OneUiTextVariant.title,
            size: 'm',
            weight: OneUiTextWeight.high,
          ),
          SizedBox(height: tokens.spacing('4')),
          const OneUiText(
            text: 'Adjust your search or filters, or reset to browse the full library.',
            variant: OneUiTextVariant.body,
            size: 'm',
            weight: OneUiTextWeight.low,
            attention: OneUiTextAttention.medium,
            textAlign: OneUiTextAlign.center,
          ),
          SizedBox(height: tokens.spacing('4')),
          OneUiButton(
            label: 'Reset filters',
            sizeAlias: 'm',
            variant: OneUiButtonVariant.subtle,
            onPressed: onReset,
          ),
        ],
      ),
    );
  }
}
