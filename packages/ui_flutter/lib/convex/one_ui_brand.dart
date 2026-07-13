/// Matches `JIO_ALPHA_BRAND_SLUG` in web `manager.tsx`.
const String kJioAlphaBrandSlug = 'jio-default';

/// Row from Convex `brands:list` — same fields as web Storybook brand picker.
final class OneUiBrand {
  const OneUiBrand({
    required this.id,
    required this.name,
    required this.slug,
    this.primaryHue,
    this.primaryChroma,
  });

  final String id;
  final String name;
  final String slug;
  final double? primaryHue;
  final double? primaryChroma;
}

/// Outcome of [fetchBrandsList] — distinguishes **empty DB** from transport errors.
enum BrandsListStatus {
  /// HTTP + Convex `status: success`; may still be an empty list.
  ok,

  /// Network, non-JSON, or Convex error response.
  error,
}

class BrandsListResult {
  const BrandsListResult({required this.brands, required this.status});

  final List<OneUiBrand> brands;
  final BrandsListStatus status;
}
