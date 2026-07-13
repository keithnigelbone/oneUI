import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/typography_scale.dart';
import '../utils/storybook_google_fonts.dart';
import 'typography_preview_utils.dart';

/// Parity with React story `FontSlots` — four CSS font slots + samples.
class TypographyFontSlotsPage extends StatelessWidget {
  const TypographyFontSlotsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final cfg = scope.typographyConfig;
    final slots = resolveFontSlots(cfg, scope.customFonts);
    final slotIds = resolveFontSlotIds(cfg, scope.customFonts);
    final all = getTypographyEntriesForBrand(cfg);
    final displayS =
        all.firstWhere((e) => e.role == 'display' && e.size == 'S');
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final displayMetrics = resolveTypographyEntryPx(
      entry: displayS,
      platform: scope.platformId,
      density: scope.density,
      emphasis: 'low',
      platformsConfig: scope.platformsFoundationConfig,
      typographyConfig: cfg,
      designSystem: scope.designSystem,
    );

    final slotRows =
        <({String label, String token, String familyLabel, String fontId})>[
      (
        label: 'Body',
        token: '--Typography-Font-Text',
        familyLabel: slots.bodyText,
        fontId: slotIds.textFontId
      ),
      (
        label: 'Display',
        token: '--Typography-Font-Heading',
        familyLabel: slots.displayHeading,
        fontId: slotIds.headingFontId
      ),
      (
        label: 'Script',
        token: '--Typography-Font-Script',
        familyLabel: slots.script,
        fontId: slotIds.scriptFontId
      ),
      (
        label: 'Code',
        token: '--Typography-Font-Code',
        familyLabel: slots.code,
        fontId: slotIds.codeFontId
      ),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Font slots',
          style: theme.textTheme.titleMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Text(
          'Four font families drive the entire typography system: Body (UI workhorse), '
          'Display (editorial), Script (accent), and Code (monospace). '
          'Preview uses google_fonts so Code is monospace and slots differ visually.',
          style: theme.textTheme.bodySmall
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 20),
        for (final row in slotRows) ...[
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              SizedBox(
                width: 160,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      row.label,
                      style: theme.textTheme.labelSmall
                          ?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'var(${row.token})',
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: scheme.onSurfaceVariant.withValues(alpha: 0.8),
                      ),
                    ),
                    Text(
                      row.familyLabel,
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontSize: 10,
                        color: scheme.onSurfaceVariant.withValues(alpha: 0.65),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Text(
                  'The quick brown fox jumps over the lazy dog',
                  style: storybookLoadedTextStyle(
                    fontId: row.fontId,
                    uploadedFamilyName:
                        uploadedFamilyForFontId(row.fontId, scope.customFonts),
                    fontSize: displayMetrics.fontSize,
                    lineHeightPx: displayMetrics.lineHeight,
                    // React `FontSlots` uses Display S size/line-height only — no `font-weight`,
                    // so samples stay regular (≈400), not role token 900.
                    fontWeight: foundationFontWeight(400),
                    color: scheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
        ],
      ],
    );
  }
}
