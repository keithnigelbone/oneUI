import 'package:flutter/material.dart';

import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../tokens/typography_scale.dart';
import '../utils/storybook_google_fonts.dart';
import 'typography_preview_utils.dart';

/// Parity with React story `Weights` — Body / Label / Code × High / Medium / Low.
class TypographyWeightsPage extends StatelessWidget {
  const TypographyWeightsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final cfg = scope.typographyConfig;
    final slotIds = resolveFontSlotIds(cfg, scope.customFonts);
    final all = getTypographyEntriesForBrand(cfg);
    final bodyL = all.firstWhere((e) => e.role == 'body' && e.size == 'L');
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final metrics = resolveTypographyEntryPx(
      entry: bodyL,
      platform: scope.platformId,
      density: scope.density,
      emphasis: 'medium',
      platformsConfig: scope.platformsFoundationConfig,
      typographyConfig: cfg,
      designSystem: scope.designSystem,
    );

    final rows = <({String role, String emphasis, String sample})>[];
    for (final role in ['Body', 'Label', 'Code']) {
      for (final emphasis in ['High', 'Medium', 'Low']) {
        rows.add((
          role: role,
          emphasis: emphasis,
          sample: role == 'Code'
              ? 'const value = resolveToken(name);'
              : 'The quick brown fox jumps over the lazy dog',
        ));
      }
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Font weights',
          style: theme.textTheme.titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Text(
          'Body / Label / Code roles use High / Medium / Low emphasis '
          'weights, rendered one per row. '
          'Fonts load via google_fonts so 400 / 500 / 700 are visible (especially for Code).',
          style: theme.textTheme.bodySmall
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 16),
        for (final r in rows) ...[
          _WeightRow(
            roleKey: r.role.toLowerCase(),
            emphasisKey: r.emphasis.toLowerCase(),
            label: '${r.role} / ${r.emphasis}',
            sample: r.sample,
            metrics: metrics,
            roleSizeM: all.firstWhere(
                (e) => e.role == r.role.toLowerCase() && e.size == 'M'),
            platform: scope.platformId,
            density: scope.density,
            platformsConfig: scope.platformsFoundationConfig,
            typographyConfig: cfg,
            designSystem: scope.designSystem,
            fontId: r.role == 'Code' ? slotIds.codeFontId : slotIds.textFontId,
            customFonts: scope.customFonts,
          ),
          Divider(color: scheme.outlineVariant.withValues(alpha: 0.35)),
        ],
      ],
    );
  }
}

class _WeightRow extends StatelessWidget {
  const _WeightRow({
    required this.roleKey,
    required this.emphasisKey,
    required this.label,
    required this.sample,
    required this.metrics,
    required this.roleSizeM,
    required this.platform,
    required this.density,
    required this.platformsConfig,
    required this.typographyConfig,
    required this.designSystem,
    required this.fontId,
    required this.customFonts,
  });

  final String roleKey;
  final String emphasisKey;
  final String label;
  final String sample;
  final ({double fontSize, double lineHeight, int fontWeight}) metrics;
  final TypographyEntry roleSizeM;
  final String platform;
  final String density;
  final PlatformsFoundationConfig? platformsConfig;
  final Map<String, dynamic>? typographyConfig;
  final NativeDesignSystemPayload? designSystem;
  final String fontId;
  final List<Map<String, dynamic>>? customFonts;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final w = resolveTypographyEntryPx(
      entry: roleSizeM,
      platform: platform,
      density: density,
      emphasis: emphasisKey,
      platformsConfig: platformsConfig,
      typographyConfig: typographyConfig,
      designSystem: designSystem,
    );

    final sizePx = metrics.fontSize;
    final lhPx = metrics.lineHeight;
    final uploaded = uploadedFamilyForFontId(fontId, customFonts);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          SizedBox(
            width: 160,
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                color: scheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              sample,
              style: storybookLoadedTextStyle(
                fontId: fontId,
                uploadedFamilyName: uploaded,
                fontSize: sizePx,
                lineHeightPx: lhPx,
                fontWeight: foundationFontWeight(w.fontWeight),
                color: scheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
