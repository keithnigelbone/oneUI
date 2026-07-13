/// Legacy / Material-style semantic icon aliases → canonical `SemanticIconName` keys.
///
/// Canonical names use camelCase (`arrowRight`). Tests and older call sites may
/// still pass Material icon ids (`arrow_forward`).
const Map<String, String> kSemanticIconLegacyAliases = {
  'arrow_forward': 'arrowRight',
  'arrow_back': 'arrowLeft',
  'arrow_upward': 'arrowUp',
  'arrow_downward': 'arrowDown',
  'arrow_left': 'arrowLeft',
  'arrow_right': 'arrowRight',
  'chevron_left': 'chevronLeft',
  'chevron_right': 'chevronRight',
  'chevron_up': 'chevronUp',
  'chevron_down': 'chevronDown',
  'check_circle': 'checkCircle',
  'check_circle_outline': 'checkCircle',
  'more_horiz': 'moreHorizontal',
  'open_in_new': 'externalLink',
  'favorite': 'heartFilled',
  'favorite_border': 'heart',
  'star_outline': 'star',
  'star_border': 'star',
  'visibility': 'eye',
  'visibility_off': 'eyeOff',
  'person_outline': 'user',
  'people_outline': 'users',
  'notifications_outlined': 'notification',
  'mail_outline': 'mail',
};

/// Applies [kSemanticIconLegacyAliases] for snake_case / Material-style inputs.
String normalizeSemanticIconLookupKey(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return trimmed;
  final lower = trimmed.toLowerCase();
  return kSemanticIconLegacyAliases[lower] ?? trimmed;
}
