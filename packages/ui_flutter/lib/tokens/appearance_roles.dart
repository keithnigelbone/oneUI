/// Canonical appearance role id — tolerates legacy Convex / JSON key drift.
String normalizeAppearanceRoleKey(String raw) {
  final k = raw.trim();
  if (k.isEmpty) return k;
  final lower = k.toLowerCase();
  if (lower == 'brand-bg' || lower == 'brandbg' || lower == 'brand_bg') {
    return 'brand-bg';
  }
  if (k == 'Brand-Bg' || k == 'BrandBg') return 'brand-bg';
  if (k == 'Sparkle') return 'sparkle';
  return k;
}

/// Parity with `packages/shared/src/engine/surfaceNew.ts` `APPEARANCE_ROLES`.
const List<String> appearanceRoles = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

String appearanceLabel(String role) {
  if (role == 'brand-bg') return 'Brand-Bg';
  return role[0].toUpperCase() + role.substring(1);
}
