/**
 * Syntax theme tokens for CodePreview — light and dark palettes.
 * Values match QA Playground / Storybook docs reference screenshots.
 */

export type CodePreviewLanguage = 'jsx' | 'json';

export const CODE_PREVIEW_SYNTAX_VARS = {
  light: {
    surface: '#FFFFFF',
    border: '#E7E7E7',
    text: '#000000',
    component: '#5B3DF5',
    property: '#2E7D32',
    string: '#3D5AFE',
    boolean: '#3D5AFE',
    booleanJson: '#000000',
    null: '#8A8A8A',
    number: '#000000',
    punctuation: '#000000',
    function: '#3D5AFE',
    tabActive: '#5B3DF5',
    tabInactive: '#000000',
  },
  dark: {
    surface: '#1E1E1E',
    border: '#3A3A3A',
    text: '#FFFFFF',
    component: '#A78BFA',
    property: '#6CBF6C',
    string: '#7AA2FF',
    boolean: '#7AA2FF',
    booleanJson: '#FFFFFF',
    null: '#8A8A8A',
    number: '#FFFFFF',
    punctuation: '#FFFFFF',
    function: '#7AA2FF',
    tabActive: '#A78BFA',
    tabInactive: '#FFFFFF',
  },
} as const;
