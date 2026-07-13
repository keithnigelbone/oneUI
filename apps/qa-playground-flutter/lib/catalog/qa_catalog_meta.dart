import 'qa_catalog.dart';

/// Section accent role — mirrors React `CATALOG_CATEGORY_ACCENT`.
const Map<QaComponentCategory, String> kQaCategoryAccentRole = {
  QaComponentCategory.navigation: 'primary',
  QaComponentCategory.input: 'secondary',
  QaComponentCategory.display: 'sparkle',
  QaComponentCategory.feedback: 'informative',
  QaComponentCategory.action: 'positive',
};

String qaCategoryFilterValue(QaComponentCategory? category) =>
    category?.name ?? 'all';

QaComponentCategory? qaCategoryFromFilterValue(String value) {
  if (value == 'all') return null;
  for (final c in QaComponentCategory.values) {
    if (c.name == value) return c;
  }
  return null;
}

String qaStabilityFilterValue(QaTestStability? stability) {
  if (stability == null) return 'all';
  return switch (stability) {
    QaTestStability.stable => 'stable',
    QaTestStability.unstable => 'unstable',
    QaTestStability.underDevelopment => 'under-development',
  };
}

QaTestStability? qaStabilityFromFilterValue(String value) {
  return switch (value) {
    'stable' => QaTestStability.stable,
    'unstable' => QaTestStability.unstable,
    'under-development' => QaTestStability.underDevelopment,
    _ => null,
  };
}
