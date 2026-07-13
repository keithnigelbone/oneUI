/// Maps catalog slugs (kebab-case) to `test/components/` folder names (snake_case).
library;

String qaTestFolderForSlug(String slug) => slug.replaceAll('-', '_');

String qaTestPathForSlug(String slug) => 'test/components/${qaTestFolderForSlug(slug)}';

const List<String> kQaImplementedSlugs = [
  'checkbox',
  'checkbox-field',
  'input',
  'input-field',
  'input-dynamic-text',
  'input-feedback',
  'radio',
  'radio-field',
  'slider',
  'touch-slider',
  'badge',
  'counter-badge',
  'indicator-badge',
  'avatar',
  'text',
  'image',
  'button',
  'chip',
  'chip-group',
  'icon',
  'icon-contained',
  'icon-button',
  'circular-progress-indicator',
  'linear-progress-indicator',
  'bottom-navigation',
];
