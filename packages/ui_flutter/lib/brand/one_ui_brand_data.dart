/// Offline brand payloads — same shapes as `@oneui/ui-native` `BrandData` / `ThemeData`.
library;

/// Parent brand snapshot: `{ foundation, components? }` from CDN or export.
class OneUiBrandData {
  const OneUiBrandData({
    required this.foundation,
    this.components,
  });

  factory OneUiBrandData.fromJson(Map<String, dynamic> json) {
    return OneUiBrandData(
      foundation: json['foundation'],
      components: json['components'] is Map<String, dynamic>
          ? Map<String, dynamic>.from(json['components'] as Map)
          : (json['components'] is Map
              ? Map<String, dynamic>.from(json['components'] as Map)
              : null),
    );
  }

  final Object? foundation;
  final Map<String, dynamic>? components;

  Map<String, dynamic> toJson() => {
        'foundation': foundation,
        if (components != null) 'components': components,
      };
}

/// Sub-brand accent delta (`theme` prop) — file wrapper or flat Convex shape.
class OneUiThemeData {
  const OneUiThemeData({this.raw});

  factory OneUiThemeData.fromJson(Map<String, dynamic> json) =>
      OneUiThemeData(raw: json);

  final Map<String, dynamic>? raw;
}

/// Resolved brand selection after slug / CDN / default resolution.
class OneUiResolvedBrandSelection {
  const OneUiResolvedBrandSelection({
    required this.brandSlug,
    required this.brandId,
    this.brandName,
    this.themeVariant,
    this.foundationOverview,
  });

  final String brandSlug;
  final String brandId;
  final String? brandName;
  final String? themeVariant;

  /// Foundation envelope for platforms / typography config (from `foundation` field).
  final Map<String, dynamic>? foundationOverview;
}
