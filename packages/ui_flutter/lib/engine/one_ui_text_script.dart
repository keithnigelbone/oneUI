/// Script inference — `getScriptIdsFromLang` in `@oneui/shared`.
library;

/// India core script ids (`TypographyScriptId`).
const List<String> kOneUiTypographyScriptIds = [
  'devanagari',
  'bengali',
  'gujarati',
  'gurmukhi',
  'kannada',
  'malayalam',
  'oriya',
  'tamil',
  'telugu',
  'arabic',
];

/// BCP 47 primary language subtag → script id.
const Map<String, String> kOneUiLangTagToScriptId = {
  'hi': 'devanagari',
  'mr': 'devanagari',
  'ne': 'devanagari',
  'sa': 'devanagari',
  'mai': 'devanagari',
  'kok': 'devanagari',
  'doi': 'devanagari',
  'bho': 'devanagari',
  'bn': 'bengali',
  'as': 'bengali',
  'gu': 'gujarati',
  'pa': 'gurmukhi',
  'kn': 'kannada',
  'ml': 'malayalam',
  'or': 'oriya',
  'ta': 'tamil',
  'te': 'telugu',
  'ar': 'arabic',
  'ur': 'arabic',
  'fa': 'arabic',
  'ks': 'arabic',
};

/// Infers script from BCP 47 `lang` (e.g. `hi` → `devanagari`).
String? oneUiScriptIdFromLang(String? lang) {
  if (lang == null || lang.trim().isEmpty) return null;
  final primary = lang.trim().toLowerCase().split('-').first;
  return kOneUiLangTagToScriptId[primary];
}
