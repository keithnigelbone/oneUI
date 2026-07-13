import 'package:flutter/material.dart';

import '../engine/native_design_system_payload.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../tokens/typography_scale.dart';
import '../utils/storybook_google_fonts.dart';
import 'typography_preview_utils.dart';

/// Parity with React story `AllRoles` — `Foundations/Typography`.
class TypographyAllRolesPage extends StatelessWidget {
  const TypographyAllRolesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = OneUiScope.of(context);
    final cfg = scope.typographyConfig;
    final slotIds = resolveFontSlotIds(cfg, scope.customFonts);
    final entries = getTypographyEntriesForBrand(cfg);
    final metaStyle = Theme.of(context).textTheme.bodySmall?.copyWith(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        );

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Live resolution uses platform ${scope.platformId}, density ${scope.density}. '
          'Sizes and line heights follow brand typography foundations when a brand is selected. '
          'Fonts load via google_fonts (Storybook) — uploaded fonts use Convex familyName.',
          style: metaStyle,
        ),
        if (scope.nativeTypography != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Convex `getNativeThemeSnapshot.typography` is wired — same resolved px / lineHeight / '
              'fontWeight / fontFamily as `buildNativeTypography` (RN parity) for this brand + toolbar platform + density.',
              style: metaStyle,
            ),
          ),
        const SizedBox(height: 16),
        for (final role in typographyRoles) ...[
          _RoleBlock(
            role: role,
            entries: entries.where((e) => e.role == role).toList(),
            slotIds: slotIds,
            customFonts: scope.customFonts,
            platform: scope.platformId,
            density: scope.density,
            platformsConfig: scope.platformsFoundationConfig,
            typographyConfig: cfg,
            designSystem: scope.designSystem,
          ),
          const SizedBox(height: 24),
        ],
      ],
    );
  }
}

class _RoleBlock extends StatelessWidget {
  const _RoleBlock({
    required this.role,
    required this.entries,
    required this.slotIds,
    required this.customFonts,
    required this.platform,
    required this.density,
    required this.platformsConfig,
    required this.typographyConfig,
    required this.designSystem,
  });

  final String role;
  final List<TypographyEntry> entries;
  final ResolvedFontSlotIds slotIds;
  final List<Map<String, dynamic>>? customFonts;
  final String platform;
  final String density;
  final PlatformsFoundationConfig? platformsConfig;
  final Map<String, dynamic>? typographyConfig;
  final NativeDesignSystemPayload? designSystem;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final lhOff = defaultLineHeightOffsets[role]!;
    final fontId =
        curatedFontIdForTypographyRole(role, slotIds, typographyConfig);
    final uploaded = uploadedFamilyForFontId(fontId, customFonts);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          roleTitleLabel(role),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: scheme.onSurface,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${kTypographyRoleDescriptions[role]} Line-height offset: $lhOff.',
          style: theme.textTheme.bodySmall
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 12),
        Divider(color: scheme.outlineVariant.withValues(alpha: 0.5)),
        const SizedBox(height: 8),
        for (final e in entries) ...[
          LayoutBuilder(
            builder: (context, c) {
              const sampleEmphasis = 'high';
              final px = resolveTypographyEntryPx(
                entry: e,
                platform: platform,
                density: density,
                emphasis:
                    role == 'display' || role == 'headline' || role == 'title'
                        ? 'low'
                        : sampleEmphasis,
                platformsConfig: platformsConfig,
                typographyConfig: typographyConfig,
                designSystem: designSystem,
              );
              final fAssign = e.fontSizeStep;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 140,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${e.role}.${e.size}',
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontFamily: 'monospace',
                              color: scheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${e.tokenName}-FontSize',
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontFamily: 'monospace',
                              color: scheme.onSurfaceVariant
                                  .withValues(alpha: 0.7),
                              fontSize: 11,
                            ),
                          ),
                          Text(
                            '→ $fAssign',
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontFamily: 'monospace',
                              color: scheme.onSurfaceVariant
                                  .withValues(alpha: 0.7),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Text(
                        role == 'code'
                            ? 'const { tokens } = useDesignSystem();'
                            : '${roleTitleLabel(role)} ${e.size} — the quick brown fox',
                        style: storybookLoadedTextStyle(
                          fontId: fontId,
                          uploadedFamilyName: uploaded,
                          fontSize: px.fontSize,
                          lineHeightPx: px.lineHeight,
                          fontWeight: foundationFontWeight(px.fontWeight),
                          color: scheme.onSurface,
                        ),
                      ),
                    ),
                    if (c.maxWidth > 400)
                      Text(
                        '${px.fontSize.toStringAsFixed(2)} / ${px.lineHeight.toStringAsFixed(2)} px',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: scheme.onSurfaceVariant,
                          fontFamily: 'monospace',
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ],
      ],
    );
  }
}
