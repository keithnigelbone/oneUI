import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/dimension_scale.dart';
import '../tokens/typography_scale.dart';
import '../utils/storybook_google_fonts.dart';
import 'dimensions_common.dart';
import 'dimensions_resolve.dart';
import 'typography_preview_utils.dart';

/// Inline note when the brand has no platforms foundation and no Convex dimension contexts.
Widget? _densityStaticDimensionsNote(BuildContext context, OneUiScope scope) {
  final ds = scope.designSystem;
  if (ds != null && ds.dimensionContexts.isNotEmpty) return null;
  final pc = scope.platformsFoundationConfig;
  if (pc != null && pc.platforms.isNotEmpty) return null;
  final theme = Theme.of(context);
  return Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Text(
      'This brand has no platforms foundation — f-steps and typography use static '
      '`scale.css` tables (same as Dimensions pages). Values still update with toolbar '
      'platform and density.',
      style: theme.textTheme.bodySmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
      ),
    ),
  );
}

/// Foundations / Density / Spacing side by side — parity with `SpacingSideBySide` in `Density.stories.tsx`.
class DensitySpacingSideBySidePage extends StatelessWidget {
  const DensitySpacingSideBySidePage({super.key});

  static const _focusSteps = ['f-2', 'f0', 'f2', 'f4', 'f6'];

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final staticNote = _densityStaticDimensionsNote(context, scope);
    final ds = scope.designSystem;
    final accent = OneUiSurfaceScope.primaryBoldBarColor(context);
    final subtleBg = OneUiSurfaceScope.primarySubtleBarColor(context)
        .withValues(alpha: 0.22);
    final shape3xs = resolveFStepPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      step: 'f-4',
    );

    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth >= 720;
        final columns = densityIds.map((density) {
          return _densityColumnCard(
            context: context,
            density: density,
            subtleBg: subtleBg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final step in _focusSteps)
                  _spacingRow(
                    context,
                    scope: scope,
                    step: step,
                    density: density,
                    accent: accent,
                    shape3xs: shape3xs,
                  ),
              ],
            ),
          );
        }).toList();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Spacing — density comparison',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Each column uses platform ${scope.platformId} × one density (compact → default → open), '
                'matching web columns that scope `data-Breakpoint` + `data-6-Density`. '
                'Pixel lengths resolve like web `getComputedStyle` on `--Dimension-*` '
                '(Convex dimensionContexts → brand platforms config → static tables).',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              if (staticNote != null) staticNote,
              const SizedBox(height: 20),
              if (wide)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var i = 0; i < columns.length; i++) ...[
                      if (i > 0) const SizedBox(width: 16),
                      Expanded(child: columns[i]),
                    ],
                  ],
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    for (var i = 0; i < columns.length; i++) ...[
                      if (i > 0) const SizedBox(height: 16),
                      columns[i],
                    ],
                  ],
                ),
            ],
          ),
        );
      },
    );
  }
}

Widget _densityColumnCard({
  required BuildContext context,
  required String density,
  required Color subtleBg,
  required Widget child,
}) {
  final label = densityTitleCase(density);
  final theme = Theme.of(context);
  return Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: subtleBg,
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: theme.textTheme.titleSmall
                ?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text(
          'data-6-Density="$density"',
          style: TextStyle(
            fontFamily: 'monospace',
            fontSize: 11,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        child,
      ],
    ),
  );
}

Widget _spacingRow(
  BuildContext context, {
  required OneUiScope scope,
  required String step,
  required String density,
  required Color accent,
  required double shape3xs,
}) {
  final px = resolveFStepPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: density,
    step: step,
  );
  final side = px.clamp(0.0, 200.0);
  final double show = side < 2 && side > 0 ? 2.0 : side.toDouble();
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 44,
          child: Text(step,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11)),
        ),
        SizedBox(
          width: 64,
          child: Text(
            '${formatDimensionPx(px)}px',
            textAlign: TextAlign.right,
            style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: FontWeight.w600),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Align(
            alignment: Alignment.centerLeft,
            child: Container(
              width: show,
              height: show,
              decoration: BoxDecoration(
                color: accent,
                borderRadius:
                    BorderRadius.circular(shape3xs.clamp(1.0, 16.0).toDouble()),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

/// Same role/size keys as `TYPE_SAMPLES` in `Density.stories.tsx` → `TypographySideBySide`.
const _kDensityTypographySamples = <({
  String role,
  String size,
  String label,
})>[
  (role: 'display', size: 'M', label: 'Display M'),
  (role: 'headline', size: 'M', label: 'Headline M'),
  (role: 'title', size: 'M', label: 'Title M'),
  (role: 'body', size: 'L', label: 'Body L'),
  (role: 'body', size: 'M', label: 'Body M'),
  (role: 'body', size: 'S', label: 'Body S'),
  (role: 'label', size: 'S', label: 'Label S'),
];

/// Foundations / Density / Typography side by side — parity with `TypographySideBySide`.
class DensityTypographySideBySidePage extends StatelessWidget {
  const DensityTypographySideBySidePage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final staticNote = _densityStaticDimensionsNote(context, scope);
    final cfg = scope.typographyConfig;
    final slotIds = resolveFontSlotIds(cfg, scope.customFonts);
    final all = getTypographyEntriesForBrand(cfg);
    final subtleBg = OneUiSurfaceScope.primarySubtleBarColor(context)
        .withValues(alpha: 0.22);
    final scheme = Theme.of(context).colorScheme;

    final samples = <({TypographyEntry entry, String label})>[];
    for (final spec in _kDensityTypographySamples) {
      final entry = all.firstWhere(
        (e) => e.role == spec.role && e.size == spec.size,
      );
      samples.add((entry: entry, label: spec.label));
    }

    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth >= 720;
        final columns = densityIds.map((density) {
          return _densityColumnCard(
            context: context,
            density: density,
            subtleBg: subtleBg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final s in samples) ...[
                  _typographySampleRow(
                    context,
                    scope: scope,
                    density: density,
                    entry: s.entry,
                    label: s.label,
                    slotIds: slotIds,
                    scheme: scheme,
                  ),
                ],
              ],
            ),
          );
        }).toList();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Typography — density comparison',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Same type ladder at each density. Font sizes and line heights use the same f-step '
                'resolution as web (Convex dimensionContexts → brand platforms → static tables).',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: scheme.onSurfaceVariant),
              ),
              if (staticNote != null) staticNote,
              const SizedBox(height: 20),
              if (wide)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var i = 0; i < columns.length; i++) ...[
                      if (i > 0) const SizedBox(width: 16),
                      Expanded(child: columns[i]),
                    ],
                  ],
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    for (var i = 0; i < columns.length; i++) ...[
                      if (i > 0) const SizedBox(height: 16),
                      columns[i],
                    ],
                  ],
                ),
            ],
          ),
        );
      },
    );
  }
}

Widget _typographySampleRow(
  BuildContext context, {
  required OneUiScope scope,
  required String density,
  required TypographyEntry entry,
  required String label,
  required ResolvedFontSlotIds slotIds,
  required ColorScheme scheme,
}) {
  final emphasis = switch (entry.role) {
    'display' || 'headline' || 'title' => 'low',
    _ => 'low',
  };
  final px = resolveTypographyEntryPx(
    entry: entry,
    platform: scope.platformId,
    density: density,
    emphasis: emphasis,
    platformsConfig: scope.platformsFoundationConfig,
    typographyConfig: scope.typographyConfig,
    designSystem: scope.designSystem,
  );
  final fontId = curatedFontIdForTypographyRole(
      entry.role, slotIds, scope.typographyConfig);
  final uploaded = uploadedFamilyForFontId(fontId, scope.customFonts);

  return Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: DecoratedBox(
      decoration: BoxDecoration(
        border: Border(
          bottom:
              BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.45)),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: scheme.onSurfaceVariant,
                    ),
                  ),
                ),
                Text(
                  '${px.fontSize.toStringAsFixed(2)}px',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: storybookLoadedTextStyle(
                fontId: fontId,
                uploadedFamilyName: uploaded,
                fontSize: px.fontSize,
                lineHeightPx: px.lineHeight,
                fontWeight: foundationFontWeight(px.fontWeight),
                color: scheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

/// Foundations / Density / F-step matrix — parity with `FStepMatrix` in `Density.stories.tsx`.
class DensityFStepMatrixPage extends StatelessWidget {
  const DensityFStepMatrixPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final staticNote = _densityStaticDimensionsNote(context, scope);
    final ds = scope.designSystem;
    final accent = OneUiSurfaceScope.primaryBoldBarColor(context);
    final shape3xs = resolveFStepPx(
      designSystem: ds,
      platformsConfig: scope.platformsFoundationConfig,
      platformId: scope.platformId,
      density: scope.density,
      step: 'f-4',
    );
    final scheme = Theme.of(context).colorScheme;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'F-step × density',
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Every f-step at every density (compact → default → open). '
            'Platform ${scope.platformId}; values resolve via Convex dimensionContexts, '
            'brand platforms config, or static tables.',
            style: theme.textTheme.bodySmall
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
          if (staticNote != null) staticNote,
          const SizedBox(height: 24),
          for (final density in densityIds) ...[
            Text(
              densityTitleCase(density),
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            for (final step in fSteps)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 56,
                      child: Text(
                        step,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 72,
                      child: Text(
                        density,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 72,
                      child: Text(
                        '${formatDimensionPx(resolveFStepPx(
                          designSystem: scope.designSystem,
                          platformsConfig: scope.platformsFoundationConfig,
                          platformId: scope.platformId,
                          density: density,
                          step: step,
                        ))}px',
                        textAlign: TextAlign.right,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _matrixSwatch(
                        scope: scope,
                        step: step,
                        density: density,
                        accent: accent,
                        shape3xs: shape3xs,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }
}

Widget _matrixSwatch({
  required OneUiScope scope,
  required String step,
  required String density,
  required Color accent,
  required double shape3xs,
}) {
  final px = resolveFStepPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: density,
    step: step,
  );
  final side = px.clamp(0.0, 480.0);
  final double show = side < 2 && side > 0 ? 2.0 : side.toDouble();
  return Align(
    alignment: Alignment.centerLeft,
    child: Container(
      width: show,
      height: show,
      decoration: BoxDecoration(
        color: accent,
        borderRadius:
            BorderRadius.circular(shape3xs.clamp(1.0, 20.0).toDouble()),
      ),
    ),
  );
}
