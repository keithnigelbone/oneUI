import 'package:flutter/material.dart';

import '../theme/one_ui_root_surface_scope.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'native_theme_snapshot.dart';
import 'surface_engine.dart';

/// Roles shown in React `Radio.stories.tsx` Appearances grid (not every Convex key).
const List<String> kRadioStoryAppearanceRoles = [
  'primary',
  'neutral',
  'secondary',
  'positive',
  'negative',
  'warning',
  'informative',
];

/// React `RadioAccents` / Appearance (fill roles) story subset.
const List<String> kRadioStoryAccentRoles = [
  'primary',
  'secondary',
  'sparkle',
];

/// Roles present on the active brand (`rootRoles` snapshot, else `themeConfig`).
List<String> radioStoryRoles(
  BuildContext context,
  List<String> candidates,
) {
  final root = OneUiRootSurfaceScope.maybeOf(context);
  final onBrand = root != null && root.resolvedRoles.isNotEmpty
      ? root.resolvedRoles.keys.map(normalizeAppearanceRoleKey).toSet()
      : OneUiSurfaceScope.configuredRoleKeys(context);
  return candidates
      .where((r) => onBrand.contains(normalizeAppearanceRoleKey(r)))
      .toList(growable: false);
}

String _fillSuffixForMode(String mode) {
  return switch (mode) {
    'default' => 'Default',
    'minimal' => 'Minimal',
    'subtle' => 'Subtle',
    'moderate' => 'Moderate',
    'bold' => 'Bold',
    'elevated' => 'Elevated',
    'ghost' => 'Ghost',
    _ => mode[0].toUpperCase() + mode.substring(1),
  };
}

/// Web `SECONDARY_SURFACE_BG` / `--Secondary-Fill-{Mode}` at page root.
Color? resolveRoleRootFillColor(
  BuildContext context,
  NativeDesignSystemPayload? ds, {
  required String appearance,
  required String mode,
}) {
  final label = oneUiAppearanceCssLabel(appearance);
  final suffix = _fillSuffixForMode(mode);
  final tokenName = '--$label-Fill-$suffix';
  if (ds != null) {
    final literal = ds.componentCustomProperties[tokenName]?.trim();
    if (literal != null && literal.startsWith('#')) {
      return oneUiHexColor(literal);
    }
    final fromDs = resolveButtonTokenColor(
      context,
      ds,
      '--$label-Fill-$suffix',
      appearance: appearance,
    );
    if (fromDs != null) return fromDs;
    if (mode == 'default') {
      final surfaceDefault = resolveButtonTokenColor(
        context,
        ds,
        '--Surface-Fill-Default',
        appearance: appearance,
      );
      if (surfaceDefault != null) return surfaceDefault;
    }
  }

  final fromRoot = rootOnlyRoleSurfaceFill(
    context,
    appearance: appearance,
    mode: mode,
  );
  if (fromRoot != null) return fromRoot;

  final root = OneUiRootSurfaceScope.maybeOf(context);
  if (root == null) return null;
  final role =
      root.resolvedRoles[appearance] ?? root.resolvedRoles['secondary'];
  if (role == null) return null;
  final hex = role.surfaces[mode] ?? role.surfaces[kSurfaceDefault];
  if (hex == null) return null;
  return oneUiHexColor(hex);
}

/// Root-only role surface hex — never reads nested [OneUiSurfaceScope] remaps.
Color? rootOnlyRoleSurfaceFill(
  BuildContext context, {
  required String appearance,
  required String mode,
}) {
  final root = OneUiRootSurfaceScope.maybeOf(context);
  if (root == null) return null;
  final role = root.resolvedRoles[normalizeAppearanceRoleKey(appearance)] ??
      root.resolvedRoles['secondary'] ??
      root.resolvedRoles['neutral'];
  if (role == null) return null;
  final hex = role.surfaces[mode] ?? role.surfaces[kSurfaceDefault];
  if (hex == null) return null;
  return oneUiHexColor(hex);
}

/// Storybook shell appearance — matches web `<Surface>` default (`appearance="auto"`
/// → `primary` at page root). React stories set `--Surface-Fill-*` → Secondary-Fill,
/// but `Surface.module.css` reads `--Surface-Self-Color` first (primary step colour).
const String kCheckboxStorySurfaceAppearance = 'primary';

/// Checkbox / Radio Themes + Surface Context — mirrors **rendered** React Storybook.
///
/// Stories inline `--Surface-Fill-{Mode}` → `var(--Secondary-Fill-{Mode})`, yet
/// `Surface.module.css` resolves `var(--Surface-Self-Color, var(--Surface-Fill-*))`
/// so the painted shell is the **primary** role at the container step (Jio indigo,
/// not saffron secondary). Checkboxes inside still use `appearance="secondary"`.
///
/// Values come from Convex `rootRoles` at page root — never nested remaps.
Color checkboxStorySurfaceFill(
  BuildContext context, {
  required String mode,
}) {
  final ds = OneUiScope.designSystemOf(context);
  final scheme = Theme.of(context).colorScheme;
  const shell = kCheckboxStorySurfaceAppearance;

  if (mode == 'default') {
    return resolveRoleRootFillColor(
          context,
          ds,
          appearance: 'neutral',
          mode: 'default',
        ) ??
        rootOnlyRoleSurfaceFill(context,
            appearance: 'neutral', mode: 'default') ??
        rootOnlyRoleSurfaceFill(context, appearance: shell, mode: 'default') ??
        scheme.surface;
  }

  if (mode == 'elevated') {
    return resolveRoleRootFillColor(
          context,
          ds,
          appearance: shell,
          mode: 'elevated',
        ) ??
        rootOnlyRoleSurfaceFill(context, appearance: shell, mode: 'elevated') ??
        scheme.surface;
  }

  return resolveRoleRootFillColor(
        context,
        ds,
        appearance: shell,
        mode: mode,
      ) ??
      rootOnlyRoleSurfaceFill(context, appearance: shell, mode: mode) ??
      scheme.surface;
}

/// @deprecated Prefer [checkboxStorySurfaceFill] for storybook shells.
Color secondarySurfaceFillFromRootRoles(
  BuildContext context, {
  required String mode,
  String appearance = 'secondary',
}) {
  if (mode == 'default' || mode == 'elevated') {
    return checkboxStorySurfaceFill(context, mode: mode);
  }
  return checkboxStorySurfaceFill(context, mode: mode);
}

/// Materialize `--{Role}-Fill-{Mode}` literals into designSystem so
/// `resolveRoleRootFillColor` matches web injected brand CSS.
Map<String, String> rootRoleFillPropertiesFromSnapshot(
  Map<String, dynamic>? rootRolesJson,
) {
  final roles = resolvedRolesFromRootRoles(rootRolesJson);
  final out = <String, String>{};
  for (final entry in roles.entries) {
    final label = oneUiAppearanceCssLabel(entry.key);
    for (final surface in entry.value.surfaces.entries) {
      final suffix = _fillSuffixForMode(surface.key);
      out['--$label-Fill-$suffix'] = surface.value;
    }
  }
  return out;
}

/// Demo backgrounds for Radio Surface Context / Themes (web `Radio.showcase.tsx`).
Color roleSurfaceDemoBackground(
  BuildContext context, {
  required String mode,
  String appearance = 'secondary',
}) {
  final ds = OneUiScope.designSystemOf(context);
  if (mode == 'default') {
    return resolveRoleRootFillColor(
          context,
          ds,
          appearance: 'neutral',
          mode: 'default',
        ) ??
        Theme.of(context).colorScheme.surface;
  }
  if (mode == 'elevated') {
    return resolveRoleRootFillColor(
          context,
          ds,
          appearance: appearance,
          mode: 'elevated',
        ) ??
        Theme.of(context).colorScheme.surface;
  }
  return resolveRoleRootFillColor(
        context,
        ds,
        appearance: appearance,
        mode: mode,
      ) ??
      Theme.of(context).colorScheme.surface;
}
