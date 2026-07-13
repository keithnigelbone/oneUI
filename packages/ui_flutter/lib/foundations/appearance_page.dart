import 'package:flutter/material.dart';

import '../engine/surface_engine.dart';
import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_button.dart';

/// CSS-style role label for token families (matches `Appearance.stories.tsx`).
String appearanceCssRoleLabel(String role) {
  if (role == 'brand-bg') return 'Brand-Bg';
  return role[0].toUpperCase() + role.substring(1);
}

bool _isVeryLightSurface(String hex) {
  final c = oneUiHexColor(hex);
  final r = c.red / 255.0;
  final g = c.green / 255.0;
  final b = c.blue / 255.0;
  final lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.88;
}

/// Foundations / Appearance / Background grid — parity with `BackgroundGrid` story.
///
/// Swatches read Convex `rootRoles` at page root (same as RN `theme.rootRoles` /
/// web `var(--{Role}-Minimal|Subtle|Bold)` after brand CSS injection).
class AppearanceBackgroundGridPage extends StatelessWidget {
  const AppearanceBackgroundGridPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final configured = OneUiSurfaceScope.configuredRoleKeys(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Background surfaces by role',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'Container background tokens for each appearance role. Switch '
          'Brand / Theme in the toolbar to see the cascade react. Values come '
          'from Convex `getNativeThemeSnapshot.rootRoles` (TS `buildNativeTheme`).',
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        if (configured.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            'Configured for this brand: ${configured.join(', ')}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontFamily: 'monospace',
                  color: scheme.onSurfaceVariant,
                ),
          ),
        ],
        const SizedBox(height: 20),
        const _BackgroundGridTable(),
      ],
    );
  }
}

class _BackgroundGridTable extends StatelessWidget {
  const _BackgroundGridTable();

  static const _headers = ['Minimal', 'Subtle', 'Bold'];
  static const _surfaceKeys = [kSurfaceMinimal, kSurfaceSubtle, kSurfaceBold];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    Widget swatchForRole(String role, String surfaceKey) {
      final t = OneUiSurfaceScope.tokensMaybe(context, role);
      if (t == null) {
        return Padding(
          padding: const EdgeInsets.all(4),
          child: Container(
            height: 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Text(
              '—',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: scheme.onSurfaceVariant,
                    fontFamily: 'monospace',
                  ),
            ),
          ),
        );
      }
      final hex = t.surfaces[surfaceKey];
      if (hex == null) {
        return Padding(
          padding: const EdgeInsets.all(4),
          child: Container(
            height: 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Text('?',
                style: TextStyle(color: scheme.onSurfaceVariant, fontSize: 11)),
          ),
        );
      }
      final light = _isVeryLightSurface(hex);
      final cssVar =
          '--${appearanceCssRoleLabel(role)}-${_cssSurfaceSuffix(surfaceKey)}';
      return Padding(
        padding: const EdgeInsets.all(4),
        child: Tooltip(
          message: '$cssVar → $hex',
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              color: oneUiHexColor(hex),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: light
                    ? scheme.outlineVariant
                    : scheme.outline.withValues(alpha: 0.35),
              ),
            ),
          ),
        ),
      );
    }

    return Table(
      columnWidths: const {
        0: IntrinsicColumnWidth(),
        1: FlexColumnWidth(1),
        2: FlexColumnWidth(1),
        3: FlexColumnWidth(1),
      },
      defaultVerticalAlignment: TableCellVerticalAlignment.middle,
      children: [
        TableRow(
          children: [
            const SizedBox(height: 28),
            for (final h in _headers)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  h,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontFamily: 'monospace',
                        color: scheme.onSurfaceVariant,
                      ),
                ),
              ),
          ],
        ),
        for (final role in appearanceRoles)
          TableRow(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                child: Text(
                  role,
                  style: Theme.of(context)
                      .textTheme
                      .labelSmall
                      ?.copyWith(fontFamily: 'monospace'),
                ),
              ),
              for (final key in _surfaceKeys) swatchForRole(role, key),
            ],
          ),
      ],
    );
  }

  static String _cssSurfaceSuffix(String surfaceKey) {
    return switch (surfaceKey) {
      kSurfaceMinimal => 'Minimal',
      kSurfaceSubtle => 'Subtle',
      kSurfaceBold => 'Bold',
      _ => surfaceKey,
    };
  }
}

/// Foundations / Appearance / Buttons by role — parity with `ButtonsByRole` story.
class AppearanceButtonsByRolePage extends StatelessWidget {
  const AppearanceButtonsByRolePage({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final labelStyle = Theme.of(context)
        .textTheme
        .labelSmall
        ?.copyWith(fontFamily: 'monospace');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Buttons × appearance',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'The appearance prop drives role token resolution at render time. '
          'Colours use the same Convex `rootRoles` pipeline as the background grid.',
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 20),
        Table(
          columnWidths: const {
            0: IntrinsicColumnWidth(),
            1: FlexColumnWidth(1),
            2: FlexColumnWidth(1),
            3: FlexColumnWidth(1),
          },
          defaultVerticalAlignment: TableCellVerticalAlignment.middle,
          children: [
            TableRow(
              children: [
                const SizedBox(height: 28),
                for (final h in ['bold', 'subtle', 'ghost'])
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      h,
                      textAlign: TextAlign.center,
                      style:
                          labelStyle?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ),
              ],
            ),
            for (final role in appearanceRoles)
              TableRow(
                children: [
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                    child: Text(role, style: labelStyle),
                  ),
                  _RoleVariantCell(role: role, variant: 'bold'),
                  _RoleVariantCell(role: role, variant: 'subtle'),
                  _RoleVariantCell(role: role, variant: 'ghost'),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

class _RoleVariantCell extends StatelessWidget {
  const _RoleVariantCell({required this.role, required this.variant});

  final String role;
  final String variant;

  @override
  Widget build(BuildContext context) {
    if (OneUiSurfaceScope.tokensMaybe(context, role) == null) {
      final scheme = Theme.of(context).colorScheme;
      return Padding(
        padding: const EdgeInsets.all(4),
        child: Center(
          child: Text(
            '—',
            style: Theme.of(context)
                .textTheme
                .labelSmall
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
        ),
      );
    }

    final v = switch (variant) {
      'subtle' => OneUiButtonVariant.subtle,
      'ghost' => OneUiButtonVariant.ghost,
      _ => OneUiButtonVariant.bold,
    };

    return Padding(
      padding: const EdgeInsets.all(4),
      child: Center(
        child: OneUiButton(
          label: appearanceCssRoleLabel(role),
          variant: v,
          appearance: role,
          size: 8,
        ),
      ),
    );
  }
}
