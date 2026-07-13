/// QA playground catalog — Flutter components with QA test coverage.
enum QaComponentCategory {
  action('Action'),
  input('Input'),
  display('Display'),
  feedback('Feedback'),
  navigation('Navigation');

  const QaComponentCategory(this.label);
  final String label;
}

/// Catalog filter values — stability is computed at runtime from test reports.
enum QaTestStability {
  stable('Stable'),
  unstable('Unstable'),
  underDevelopment('Under development');

  const QaTestStability(this.label);
  final String label;
}

class QaCatalogEntry {
  const QaCatalogEntry({
    required this.slug,
    required this.name,
    required this.category,
    required this.description,
    this.hasLivePreview = false,
    this.hasFunctionalTests = false,
    this.hasA11yTests = false,
    this.aliases = const [],
  });

  final String slug;
  final String name;
  final QaComponentCategory category;
  final String description;
  final bool hasLivePreview;
  final bool hasFunctionalTests;
  final bool hasA11yTests;
  final List<String> aliases;
}

const List<QaComponentCategory> kQaCategoryOrder = [
  QaComponentCategory.navigation,
  QaComponentCategory.input,
  QaComponentCategory.display,
  QaComponentCategory.feedback,
  QaComponentCategory.action,
];

QaCatalogEntry _catalogEntry({
  required String slug,
  required String name,
  required QaComponentCategory category,
  required String description,
  List<String> aliases = const [],
  bool hasFunctionalTests = true,
  bool hasA11yTests = true,
}) {
  return QaCatalogEntry(
    slug: slug,
    name: name,
    category: category,
    description: description,
    hasLivePreview: true,
    hasFunctionalTests: hasFunctionalTests,
    hasA11yTests: hasA11yTests,
    aliases: aliases,
  );
}

const Map<QaComponentCategory, String> kQaCategoryBlurbs = {
  QaComponentCategory.navigation: 'Wayfinding, tabs, and structural navigation patterns.',
  QaComponentCategory.input: 'Form controls, fields, and data entry compositions.',
  QaComponentCategory.display: 'Typography, media, and read-only presentation.',
  QaComponentCategory.feedback: 'Progress, status, and system response indicators.',
  QaComponentCategory.action: 'Buttons, chips, icons, and interactive affordances.',
};

/// Components listed here appear in the QA playground catalog.
final List<QaCatalogEntry> kQaCatalogEntries = [
  // Navigation
  QaCatalogEntry(
    slug: 'bottom-navigation',
    name: 'Bottom Navigation',
    category: QaComponentCategory.navigation,
    description: 'Mobile tab bar with 2–5 items, label types, and multi-accent appearances.',
    aliases: ['bottomnavigation'],
    hasLivePreview: true,
    hasFunctionalTests: true,
    hasA11yTests: true,
  ),
  _catalogEntry(
    slug: 'divider',
    name: 'Divider',
    category: QaComponentCategory.display,
    description: 'Horizontal or vertical separator using stroke tokens.',
  ),
  _catalogEntry(
    slug: 'logo',
    name: 'Logo',
    category: QaComponentCategory.display,
    description: 'Brand logo with variant, size, and theme-aware assets.',
  ),
  // Input
  _catalogEntry(
    slug: 'checkbox',
    name: 'Checkbox',
    category: QaComponentCategory.input,
    description:
        'Multi-state control with multi-accent appearance roles and surface context.',
  ),
  _catalogEntry(
    slug: 'checkbox-field',
    name: 'Checkbox Field',
    category: QaComponentCategory.input,
    description: 'Checkbox group with label, description, validation, and feedback.',
    aliases: ['checkboxfield'],
  ),
  _catalogEntry(
    slug: 'input',
    name: 'Input',
    category: QaComponentCategory.input,
    description: 'Text input with sizes, appearances, attention levels, and validation states.',
  ),
  _catalogEntry(
    slug: 'input-field',
    name: 'Input Field',
    category: QaComponentCategory.input,
    description: 'Labelled input with helper text, error state, and feedback slots.',
    aliases: ['inputfield'],
  ),
  _catalogEntry(
    slug: 'input-dynamic-text',
    name: 'Input Dynamic Text',
    category: QaComponentCategory.input,
    description: 'Character count and dynamic helper text for input compositions.',
    aliases: ['inputdynamictext'],
  ),
  _catalogEntry(
    slug: 'input-feedback',
    name: 'Input Feedback',
    category: QaComponentCategory.input,
    description: 'Validation and helper feedback row beneath inputs.',
    aliases: ['inputfeedback'],
  ),
  _catalogEntry(
    slug: 'radio',
    name: 'Radio',
    category: QaComponentCategory.input,
    description: 'Single-select control within a radio group.',
  ),
  _catalogEntry(
    slug: 'radio-field',
    name: 'Radio Field',
    category: QaComponentCategory.input,
    description: 'Radio group with label, description, and field layout.',
    aliases: ['radiofield'],
  ),
  _catalogEntry(
    slug: 'slider',
    name: 'Slider',
    category: QaComponentCategory.input,
    description:
        'Precision range input with knob styles, steps, range mode, and surface context.',
  ),
  _catalogEntry(
    slug: 'touch-slider',
    name: 'Touch Slider',
    category: QaComponentCategory.input,
    description:
        'Chunky fingertip-friendly slider with progress styles and icon slots.',
    aliases: ['touchslider'],
  ),
  // Display
  _catalogEntry(
    slug: 'badge',
    name: 'Badge',
    category: QaComponentCategory.display,
    description: 'Status label with attention levels, sizes, and slot composition.',
  ),
  _catalogEntry(
    slug: 'counter-badge',
    name: 'Counter Badge',
    category: QaComponentCategory.display,
    description: 'Numeric count indicator with motion and appearance roles.',
    aliases: ['counterbadge'],
  ),
  _catalogEntry(
    slug: 'indicator-badge',
    name: 'Indicator Badge',
    category: QaComponentCategory.display,
    description: 'Dot indicator for status or notification presence.',
    aliases: ['indicatorbadge'],
  ),
  _catalogEntry(
    slug: 'avatar',
    name: 'Avatar',
    category: QaComponentCategory.display,
    description: 'User identity with image, initials, icon, and interactive variants.',
  ),
  _catalogEntry(
    slug: 'text',
    name: 'Text',
    category: QaComponentCategory.display,
    description: 'Typography roles, sizes, weights, appearances, and link behaviour.',
  ),
  _catalogEntry(
    slug: 'image',
    name: 'Image',
    category: QaComponentCategory.display,
    description: 'Responsive image with aspect ratio, fit, and fallback states.',
  ),
  // Feedback
  _catalogEntry(
    slug: 'circular-progress-indicator',
    name: 'Circular Progress Indicator',
    category: QaComponentCategory.feedback,
    description: 'Determinate and indeterminate progress ring with a11y value semantics.',
    aliases: ['cpi', 'progress'],
  ),
  _catalogEntry(
    slug: 'linear-progress-indicator',
    name: 'Linear Progress Indicator',
    category: QaComponentCategory.feedback,
    description: 'Horizontal progress bar with determinate and indeterminate modes.',
    aliases: ['lpi', 'progress-bar'],
  ),
  // Action
  _catalogEntry(
    slug: 'button',
    name: 'Button',
    category: QaComponentCategory.action,
    description: 'Primary action control with bold, subtle, and ghost variants.',
  ),
  _catalogEntry(
    slug: 'chip',
    name: 'Chip',
    category: QaComponentCategory.action,
    description: 'Compact filter or action control with selection state.',
  ),
  _catalogEntry(
    slug: 'chip-group',
    name: 'Chip Group',
    category: QaComponentCategory.action,
    description: 'Grouped chips with single or multi selection.',
    aliases: ['chipgroup'],
  ),
  _catalogEntry(
    slug: 'icon',
    name: 'Icon',
    category: QaComponentCategory.action,
    description: 'Semantic icon with size, appearance, and emphasis tokens.',
  ),
  _catalogEntry(
    slug: 'icon-contained',
    name: 'Icon Contained',
    category: QaComponentCategory.action,
    description: 'Icon inside a tinted container with attention levels.',
    aliases: ['iconcontained'],
  ),
  _catalogEntry(
    slug: 'icon-button',
    name: 'Icon Button',
    category: QaComponentCategory.action,
    description: 'Icon-only action with bold, subtle, ghost, and loading states.',
    aliases: ['iconbutton'],
  ),
];

QaCatalogEntry? qaCatalogEntryForSlug(String slug) {
  final normalized = slug.trim().toLowerCase();
  for (final entry in kQaCatalogEntries) {
    if (entry.slug == normalized) return entry;
    if (entry.aliases.contains(normalized)) return entry;
  }
  return null;
}

List<QaCatalogEntry> filterQaCatalog({
  required String query,
  QaComponentCategory? category,
  QaTestStability? stability,
  Map<String, QaTestStability>? stabilityBySlug,
}) {
  final q = query.trim().toLowerCase();
  return kQaCatalogEntries.where((entry) {
    if (category != null && entry.category != category) return false;
    if (stability != null && stabilityBySlug != null) {
      final resolved = stabilityBySlug[entry.slug];
      if (resolved != stability) return false;
    }
    if (q.isEmpty) return true;
    return entry.name.toLowerCase().contains(q) ||
        entry.slug.contains(q) ||
        entry.description.toLowerCase().contains(q) ||
        entry.aliases.any((a) => a.contains(q));
  }).toList();
}

Map<QaComponentCategory, List<QaCatalogEntry>> groupQaCatalogByCategory(
  List<QaCatalogEntry> entries,
) {
  final map = <QaComponentCategory, List<QaCatalogEntry>>{};
  for (final category in kQaCategoryOrder) {
    final rows = entries.where((e) => e.category == category).toList();
    if (rows.isNotEmpty) map[category] = rows;
  }
  return map;
}
