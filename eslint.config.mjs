/**
 * eslint.config.js
 *
 * ESLint 9 flat config. Migrated from the legacy `.eslintrc.json` that
 * ESLint 9 no longer reads. Uses `FlatCompat` to reuse the existing
 * plugin "recommended" presets without rewriting them, then layers on
 * the project-specific rules and ignores.
 *
 * When plugins publish first-class flat-config exports we can drop the
 * FlatCompat wrapper and import them directly. For now this is the
 * minimum-viable migration that unblocks `pnpm lint` in CI.
 */

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import storybook from 'eslint-plugin-storybook';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Global ignores — anything generated, vendored, emitted by a bundler, or
  // utility scripts where strict lint rules add friction without value.
  {
    ignores: [
      '**/dist/**',
      '**/.source/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/storybook-static/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/generated/**',
      '**/*.generated.ts',
      '**/*.tsbuildinfo',
      'apps/platform/src/Jio_Icons/**',
      'apps/platform/src/generated/**',
      'packages/ui/src/icons/sets/**',
      'packages/shared/src/meta/generated/**',
      'scripts/**',
      'docs/**',
      '.claude/**',
    ],
  },

  // Base JS recommended.
  js.configs.recommended,

  // Legacy plugin presets ported through FlatCompat. Order matches the old
  // `.eslintrc.json` `extends` array so rule precedence is preserved.
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ),

  // eslint-plugin-storybook is ESM-only in current versions and cannot be
  // loaded through FlatCompat's CommonJS require path.
  ...storybook.configs['flat/recommended'],

  // Project rules + parser options. Scoped to TS/JS source files so markdown
  // fixtures, JSON, and asset files are untouched.
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Node globals for config/script files.
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Browser globals for web source.
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLLabelElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        PointerEvent: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        // Test globals (Vitest).
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      // Reality check: the legacy `.eslintrc.json` was never read by
      // ESLint 9, so CI has not enforced lint rules in this repo for as
      // long as ESLint has been on 9.x. Turning the preset-recommended
      // rules into `error` now would block every PR on ~2000 pre-existing
      // violations. Strategy: keep the rule set live but downgrade
      // everything noisy to `warn` so violations are visible without
      // blocking merges. Tighten per-package as the backlog is paid down.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'warn',
      // A11y — kept as `warn` across the board while existing violations
      // are addressed. These rules catch real accessibility issues and
      // should tighten to `error` package-by-package over time.
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      // General JS — downgrade the noisy categories.
      'no-unused-expressions': 'warn',
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      'no-empty-pattern': 'warn',
      'no-empty': 'warn',
      'no-constant-condition': 'warn',
      'no-misleading-character-class': 'warn',
      'no-prototype-builtins': 'warn',
      'no-fallthrough': 'warn',
      'no-self-assign': 'warn',
      'no-useless-assignment': 'off', // false positives in render patterns
      'no-irregular-whitespace': 'warn',
      'no-control-regex': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/triple-slash-reference': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'react/no-children-prop': 'warn',
      // `no-undef` is off because TypeScript already provides stronger
      // typed identifier checking.
      'no-undef': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@oneui/ui',
              message:
                'Import from a deep path instead — e.g. `@oneui/ui/components/Button`. Run `pnpm codemod:oneui-barrel` to migrate. The top-level barrel is reserved for backwards compatibility and forces Next.js to walk every component on every import.',
            },
          ],
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
    linterOptions: {
      // Old code has stale `// eslint-disable` directives for rules that
      // are no longer enforced. Reporting those adds noise without
      // signal; cleanup is its own pass.
      reportUnusedDisableDirectives: false,
    },
  },
];
