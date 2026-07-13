/// Toolbar state for the Flutter sample demo (brand, theme, platform).
class DemoAppSettings {
  const DemoAppSettings({
    this.convexBrandId,
    this.brandSlug = 'jio',
    this.brandPickerLabel = 'Jio',
    this.themeProp,
    this.mode = 'light',
    this.platformId = 'S-360',
    this.density = 'default',
    this.accentAppearance = 'primary',
  });

  /// Convex `brands` document id — when set, [OneUiBrandScope] loads the brand.
  final String? convexBrandId;
  final String brandSlug;
  final String brandPickerLabel;
  final String? themeProp;
  final String mode;
  final String platformId;
  final String density;
  final String accentAppearance;

  bool get usesConvexBrand =>
      convexBrandId != null && convexBrandId!.isNotEmpty;

  String get providerKey =>
      '${convexBrandId ?? 'cdn:$brandSlug'}-${themeProp ?? 'base'}-$mode-$platformId-$density';

  DemoAppSettings copyWith({
    String? convexBrandId,
    bool clearConvexBrandId = false,
    String? brandSlug,
    String? brandPickerLabel,
    String? themeProp,
    bool clearThemeProp = false,
    String? mode,
    String? platformId,
    String? density,
    String? accentAppearance,
  }) {
    return DemoAppSettings(
      convexBrandId:
          clearConvexBrandId ? null : (convexBrandId ?? this.convexBrandId),
      brandSlug: brandSlug ?? this.brandSlug,
      brandPickerLabel: brandPickerLabel ?? this.brandPickerLabel,
      themeProp: clearThemeProp ? null : (themeProp ?? this.themeProp),
      mode: mode ?? this.mode,
      platformId: platformId ?? this.platformId,
      density: density ?? this.density,
      accentAppearance: accentAppearance ?? this.accentAppearance,
    );
  }
}

/// Curated brand names shown in the demo dropdown (matches QA playground seeds).
const kDemoBrandPickerOptions = <String>[
  'Tira',
  'Jio',
  'Swadesh',
  'One UI Theme',
  'Reliance',
];

/// Pick the first valid accent when the current choice is absent on this brand.
String resolveDemoAccentAppearance(
  String preferred,
  List<String> configuredRoles,
) {
  if (configuredRoles.isEmpty) return preferred;
  if (configuredRoles.contains(preferred)) return preferred;
  if (configuredRoles.contains('primary')) return 'primary';
  // Sub-themes without primary (e.g. JioMart retail) fall back to sparkle.
  if (configuredRoles.contains('sparkle')) return 'sparkle';
  if (configuredRoles.contains('neutral')) return 'neutral';
  return configuredRoles.first;
}

const kDemoPlatformOptions = <({String id, String label})>[
  (id: 'S-360', label: 'Mobile (360)'),
  (id: 'M-768', label: 'Tablet (768)'),
  (id: 'M-1024', label: 'Tablet L (1024)'),
  (id: 'L-1440', label: 'Desktop (1440)'),
  (id: 'L-1920', label: 'Desktop L (1920)'),
];

const kDemoDensityOptions = <({String id, String label})>[
  (id: 'compact', label: 'Compact'),
  (id: 'default', label: 'Default'),
  (id: 'open', label: 'Open'),
];

const kDemoSchemeOptions = <({String id, String label})>[
  (id: 'light', label: 'Light'),
  (id: 'dark', label: 'Dark'),
];

/// CDN slug when Convex is offline.
String cdnBrandSlugForPickerLabel(String label) {
  return switch (label) {
    'Tira' => 'tira',
    'Swadesh' => 'swadesh',
    'Reliance' => 'reliance',
    'One UI Theme' => 'one-ui-theme',
    _ => 'jio',
  };
}
