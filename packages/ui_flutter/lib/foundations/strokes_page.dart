import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/stroke_tokens.dart';

/// Grid gaps/columns — parity with web `Strokes.stories.tsx`
/// (`180px 220px 80px 80px 1fr 260px` + `gap: var(--Spacing-L)` ≈ 16px).
const _kStrokeColGap = 16.0;
const _kTokenColWidth = 180.0;
const _kCssVarColWidth = 220.0;
const _kNumericColWidth = 80.0;
const _kTypicalUseMinWidth = 220.0;

/// Which Strokes foundation story — matches web `Strokes.stories.tsx` exports.
enum StrokesFoundationStory {
  staticStrokes,
  dynamicStrokes,
  allStrokes,
}

/// Foundations / Strokes — parity with `Strokes.stories.tsx` (Static / Dynamic / All).
class StrokesFoundationsPage extends StatelessWidget {
  const StrokesFoundationsPage({super.key, required this.story});

  final StrokesFoundationStory story;

  @override
  Widget build(BuildContext context) {
    switch (story) {
      case StrokesFoundationStory.staticStrokes:
        return const _StrokesStoryScaffold(
          title: 'Static strokes',
          description:
              'Fixed pixel values pinned for crisp rendering at all densities. '
              'Sub-pixel values (0.5px / 1.5px) are deliberate — they give '
              'hairlines their thin, technical feel. Static strokes do NOT change '
              'with platform or density toggles (preview bar colour still follows '
              'the selected brand).',
          rows: staticStrokeRows,
        );
      case StrokesFoundationStory.dynamicStrokes:
        return const _StrokesStoryScaffold(
          title: 'Dynamic strokes',
          description:
              'Aliased to --Dimension-f{N} so they scale with platform and density '
              'like spacing and typography. Toggle platform or density in the toolbar '
              'and watch every row update. Values resolve from Convex '
              'dimensionContexts, then brand platforms config, then static tables.',
          rows: dynamicStrokeRows,
        );
      case StrokesFoundationStory.allStrokes:
        return const _StrokesAllStoryBody();
    }
  }
}

class _StrokesAllStoryBody extends StatelessWidget {
  const _StrokesAllStoryBody();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Stroke token system',
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Complete reference of every stroke token in the design system. '
            'Static tier stays pinned at all densities; dynamic tier shifts '
            'with the f-scale cascade. Change platform or density in the '
            'toolbar to watch the dynamic rows respond.',
            style: theme.textTheme.bodySmall
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          Text(
            'Static tier',
            style: theme.textTheme.titleSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const _StrokesTable(rows: staticStrokeRows),
          const SizedBox(height: 32),
          Text(
            'Dynamic tier',
            style: theme.textTheme.titleSmall
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const _StrokesTable(rows: dynamicStrokeRows),
        ],
      ),
    );
  }
}

class _StrokesStoryScaffold extends StatelessWidget {
  const _StrokesStoryScaffold({
    required this.title,
    required this.description,
    required this.rows,
  });

  final String title;
  final String description;
  final List<StrokeRow> rows;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          _StrokesTable(rows: rows),
        ],
      ),
    );
  }
}

class _StrokesTable extends StatelessWidget {
  const _StrokesTable({required this.rows});

  final List<StrokeRow> rows;

  static const _mono = TextStyle(fontFamily: 'monospace', fontSize: 11);
  static const _monoBold = TextStyle(
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: FontWeight.w600,
  );

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final scheme = Theme.of(context).colorScheme;
    final dividerColor = scheme.onSurfaceVariant.withValues(alpha: 0.35);
    final hairline = resolveStrokeWidth(
      staticStrokeRows[1],
      platform: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      designSystem: scope.designSystem,
    ).clamp(0.5, 2.0);

    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 900;
        if (!wide) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final row in rows)
                _StrokeCard(
                  row: row,
                  scope: scope,
                ),
            ],
          );
        }

        final tableMinWidth = _kTokenColWidth +
            _kCssVarColWidth +
            _kNumericColWidth * 2 +
            _kTypicalUseMinWidth +
            _kStrokeColGap * 5 +
            140;

        // Finite width required — horizontal scroll gives unbounded max width.
        final tableWidth = constraints.maxWidth >= tableMinWidth
            ? constraints.maxWidth
            : tableMinWidth;

        final table = SizedBox(
          width: tableWidth,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _StrokesTableRow(
                children: [
                  _headerLabel('Token'),
                  _headerLabel('CSS variable'),
                  _headerLabel('Nominal', align: TextAlign.right),
                  _headerLabel('Resolved', align: TextAlign.right),
                  _headerLabel('Preview'),
                  _headerLabel('Typical use'),
                ],
              ),
              for (var i = 0; i < rows.length; i++)
                _StrokeDataRow(
                  row: rows[i],
                  scope: scope,
                  hairline: hairline,
                  showBottomBorder: i < rows.length - 1,
                  dividerColor: dividerColor,
                ),
            ],
          ),
        );

        if (constraints.maxWidth >= tableMinWidth) {
          return table;
        }

        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: table,
        );
      },
    );
  }

  Widget _headerLabel(String label, {TextAlign align = TextAlign.left}) {
    return Text(
      label,
      textAlign: align,
      style: _mono.copyWith(color: Colors.grey.shade600),
    );
  }
}

/// Six-column row with fixed gaps (web Storybook `gap: --Spacing-L`).
class _StrokesTableRow extends StatelessWidget {
  const _StrokesTableRow({required this.children, this.padding});

  final List<Widget> children;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    assert(children.length == 6);
    return Padding(
      padding: padding ?? const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(width: _kTokenColWidth, child: children[0]),
          const SizedBox(width: _kStrokeColGap),
          SizedBox(width: _kCssVarColWidth, child: children[1]),
          const SizedBox(width: _kStrokeColGap),
          SizedBox(width: _kNumericColWidth, child: children[2]),
          const SizedBox(width: _kStrokeColGap),
          SizedBox(width: _kNumericColWidth, child: children[3]),
          const SizedBox(width: _kStrokeColGap),
          Expanded(flex: 14, child: children[4]),
          const SizedBox(width: _kStrokeColGap),
          Expanded(
            flex: 26,
            child: ConstrainedBox(
              constraints: const BoxConstraints(minWidth: _kTypicalUseMinWidth),
              child: children[5],
            ),
          ),
        ],
      ),
    );
  }
}

class _StrokeDataRow extends StatelessWidget {
  const _StrokeDataRow({
    required this.row,
    required this.scope,
    required this.hairline,
    required this.showBottomBorder,
    required this.dividerColor,
  });

  final StrokeRow row;
  final OneUiScope scope;
  final double hairline;
  final bool showBottomBorder;
  final Color dividerColor;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveStrokeWidth(
      row,
      platform: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      designSystem: scope.designSystem,
    );
    final previewColor = OneUiSurfaceScope.primaryBoldBarColor(context);
    final resolvedLabel = '${formatStrokePx(resolved)}px';
    final previewHeight = resolved <= 0 ? 0.0 : (resolved < 1 ? 1.0 : resolved);

    return Container(
      decoration: BoxDecoration(
        border: showBottomBorder
            ? Border(bottom: BorderSide(color: dividerColor, width: hairline))
            : null,
      ),
      child: _StrokesTableRow(
        children: [
          Text(row.name, style: _StrokesTable._monoBold),
          Text('var(${row.cssVar})', style: _StrokesTable._mono),
          Text(
            row.nominalLabel,
            textAlign: TextAlign.right,
            style: _StrokesTable._mono,
          ),
          Text(
            resolvedLabel,
            textAlign: TextAlign.right,
            style: _StrokesTable._monoBold,
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: previewHeight <= 0
                ? const SizedBox.shrink()
                : Container(
                    width: double.infinity,
                    height: previewHeight,
                    constraints: const BoxConstraints(minHeight: 1),
                    decoration: BoxDecoration(
                      color: previewColor,
                      borderRadius: BorderRadius.circular(9999),
                    ),
                  ),
          ),
          Text(
            row.use,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _StrokeCard extends StatelessWidget {
  const _StrokeCard({
    required this.row,
    required this.scope,
  });

  final StrokeRow row;
  final OneUiScope scope;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveStrokeWidth(
      row,
      platform: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      designSystem: scope.designSystem,
    );
    final previewColor = OneUiSurfaceScope.primaryBoldBarColor(context);
    final previewHeight = resolved <= 0 ? 0.0 : (resolved < 1 ? 1.0 : resolved);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(row.name, style: _StrokesTable._monoBold),
            const SizedBox(height: 4),
            Text('var(${row.cssVar})', style: _StrokesTable._mono),
            const SizedBox(height: 8),
            Row(
              children: [
                Text('Nominal ${row.nominalLabel}', style: _StrokesTable._mono),
                const Spacer(),
                Text(
                  'Resolved ${formatStrokePx(resolved)}px',
                  style: _StrokesTable._monoBold,
                ),
              ],
            ),
            if (previewHeight > 0) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                height: previewHeight,
                decoration: BoxDecoration(
                  color: previewColor,
                  borderRadius: BorderRadius.circular(9999),
                ),
              ),
            ],
            const SizedBox(height: 8),
            Text(row.use, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
