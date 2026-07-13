import 'cdn_brand_cache.dart';

/// Selectable sub-brand / parent theme for [OneUiBrandProvider.theme].
class OneUiBrandVariantOption {
  const OneUiBrandVariantOption({
    required this.variant,
    required this.label,
    this.themeProp,
  });

  /// Manifest variant slug (`base`, `jiomart`, …).
  final String variant;

  /// Human label for UI.
  final String label;

  /// Pass to [OneUiBrandProvider.theme] — `null` for parent/base brand.
  final String? themeProp;
}

/// Colour scheme options for [OneUiBrandProvider.mode].
class OneUiBrandModeOption {
  const OneUiBrandModeOption({required this.mode, required this.label});

  final String mode;
  final String label;
}

/// Brand slug + label for the brand picker.
class OneUiBrandSlugOption {
  const OneUiBrandSlugOption({required this.slug, required this.label});

  final String slug;
  final String label;
}

String formatOneUiBrandSlugLabel(String slug) {
  if (slug.isEmpty) return slug;
  if (slug == 'jiomart') return 'JioMart';
  return slug[0].toUpperCase() + slug.substring(1);
}

String formatOneUiBrandVariantLabel(String variant) {
  if (variant == 'base') return 'Base';
  return formatOneUiBrandSlugLabel(variant);
}

/// Whether a CDN snapshot exists for the given selection.
bool oneUiCdnSnapshotAvailable({
  required String brandSlug,
  String? themeProp,
  required String mode,
  String platform = 'mobile',
  String density = 'default',
}) {
  final variant = themeProp == null || themeProp.isEmpty || themeProp == 'base'
      ? 'base'
      : themeProp.toLowerCase();
  final themeMode = mode == 'dim' ? 'dark' : mode.toLowerCase();
  return oneUiCdnManifestEntries.any(
    (e) =>
        e.brand == brandSlug.toLowerCase() &&
        e.variant == variant &&
        e.theme == themeMode &&
        e.platform == platform &&
        e.density == density,
  );
}

/// Brand slugs present in the loaded CDN manifest (sorted).
List<OneUiBrandSlugOption> listOneUiCdnBrandSlugs({
  String platform = 'mobile',
  String density = 'default',
  String mode = 'light',
}) {
  final themeMode = mode == 'dim' ? 'dark' : mode.toLowerCase();
  final slugs = <String>{};
  for (final e in oneUiCdnManifestEntries) {
    if (e.platform != platform ||
        e.density != density ||
        e.theme != themeMode) {
      continue;
    }
    slugs.add(e.brand);
  }
  final sorted = slugs.toList()..sort();
  return sorted
      .map((s) =>
          OneUiBrandSlugOption(slug: s, label: formatOneUiBrandSlugLabel(s)))
      .toList(growable: false);
}

/// Sub-brand variants for [brandSlug] (always includes `base` first when present).
List<OneUiBrandVariantOption> listOneUiCdnBrandVariants(
  String brandSlug, {
  String platform = 'mobile',
  String density = 'default',
  String mode = 'light',
}) {
  final themeMode = mode == 'dim' ? 'dark' : mode.toLowerCase();
  final slug = brandSlug.toLowerCase();
  final variants = <String>{};
  for (final e in oneUiCdnManifestEntries) {
    if (e.brand != slug ||
        e.platform != platform ||
        e.density != density ||
        e.theme != themeMode) {
      continue;
    }
    variants.add(e.variant);
  }
  final ordered = variants.toList()
    ..sort((a, b) {
      if (a == 'base') return -1;
      if (b == 'base') return 1;
      return a.compareTo(b);
    });
  return ordered
      .map(
        (v) => OneUiBrandVariantOption(
          variant: v,
          label: formatOneUiBrandVariantLabel(v),
          themeProp: v == 'base' ? null : v,
        ),
      )
      .toList(growable: false);
}

/// Supported colour schemes from manifest (`light`, `dark`).
List<OneUiBrandModeOption> listOneUiCdnBrandModes({
  String brandSlug = 'jio',
  String? themeProp,
  String platform = 'mobile',
  String density = 'default',
}) {
  final slug = brandSlug.toLowerCase();
  final variant = themeProp == null || themeProp.isEmpty || themeProp == 'base'
      ? 'base'
      : themeProp.toLowerCase();
  final modes = <String>{};
  for (final e in oneUiCdnManifestEntries) {
    if (e.brand != slug ||
        e.variant != variant ||
        e.platform != platform ||
        e.density != density) {
      continue;
    }
    modes.add(e.theme);
  }
  final sorted = modes.toList()..sort();
  return sorted
      .map((m) => OneUiBrandModeOption(
          mode: m, label: m[0].toUpperCase() + m.substring(1)))
      .toList(growable: false);
}

/// Fallback when CDN manifest is empty — bundled Jio light/dark only.
List<OneUiBrandSlugOption> get defaultOneUiBrandSlugOptions => const [
      OneUiBrandSlugOption(slug: 'jio', label: 'Jio'),
    ];

List<OneUiBrandVariantOption> get defaultOneUiBrandVariantOptions => const [
      OneUiBrandVariantOption(variant: 'base', label: 'Base', themeProp: null),
    ];

List<OneUiBrandModeOption> get defaultOneUiBrandModeOptions => const [
      OneUiBrandModeOption(mode: 'light', label: 'Light'),
      OneUiBrandModeOption(mode: 'dark', label: 'Dark'),
    ];
