/// Default light surfaces from `@oneui/tokens` static `tokens.surface` map
/// (foundations preview before live `buildNativeTheme` JSON is wired).
const Map<String, String> defaultLightSurfaces = {
  'default': 'oklch(100% 0 0)',
  'ghost': 'oklch(97% 0 0)',
  'minimal': 'oklch(97% 0 0)',
  'subtle': 'oklch(94% 0 0)',
  'moderate': 'oklch(88% 0 0)',
  'bold': 'oklch(25% 0 0)',
  'elevated': 'oklch(100% 0 0)',
};

const List<String> surfaceModesForFoundations = [
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'ghost',
];

/// Heuristic swatch for Appearance foundations when brand JSON is not loaded.
int appearanceSwatchHue(String role) {
  return switch (role) {
    'primary' => 0xFF1565C0,
    'secondary' => 0xFF6A1B9A,
    'neutral' => 0xFF5F6368,
    'sparkle' => 0xFFE040FB,
    'brand-bg' => 0xFF004D40,
    'positive' => 0xFF2E7D32,
    'negative' => 0xFFC62828,
    'warning' => 0xFFF9A825,
    'informative' => 0xFF0277BD,
    _ => 0xFF757575,
  };
}
