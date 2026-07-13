#!/usr/bin/env tsx
/**
 * generate-component.ts
 *
 * Scaffolds a new `@oneui/ui` component that follows the Phase 6 "standard
 * component file set":
 *
 *   packages/ui/src/components/<Name>/
 *     ├─ <Name>.tsx              — React (web) implementation
 *     ├─ <Name>.shared.ts        — Types + optional hooks (platform-agnostic)
 *     ├─ <Name>.module.css       — CSS Module, token-only
 *     ├─ <Name>.stories.tsx      — Storybook stories
 *     ├─ <Name>.test.tsx         — Vitest + RTL + vitest-axe
 *     └─ index.ts                — Public re-exports
 *
 * Why modernise the generator (Phase 6):
 *   - The previous version emitted V3 tokens (`--Surface-Bold`, `--Text-OnBold-High`)
 *     that are flagged as legacy in CLAUDE.md. We now emit V4 role tokens.
 *   - The previous version imported `toHaveNoViolations` directly from
 *     `vitest-axe`; we now use the shared `expectNoA11yViolations` helper
 *     added in Phase 5.
 *   - The previous version imported stories from `@storybook/react`; the
 *     repo uses `@storybook/react-vite` (Storybook 10.x).
 *   - The previous version wrote a native file to a non-existent
 *     `ui-native` package — the monorepo colocates `.native.tsx` in the same
 *     component folder. We drop the native file until a consumer asks for it.
 *
 * Usage:
 *   pnpm scaffold:component <ComponentName>
 *   pnpm scaffold:component <ComponentName> --overwrite
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const positional = args.filter((a) => !a.startsWith('--'));
const componentName = positional[0];

if (!componentName) {
  console.error('Usage: pnpm scaffold:component <ComponentName> [--overwrite]');
  process.exit(1);
}

if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error(
    '❌ Component name must start with an uppercase letter and contain only letters/numbers.',
  );
  process.exit(1);
}

const webDir = join('packages/ui/src/components', componentName);

if (existsSync(webDir) && !overwrite) {
  console.error(
    `❌ ${webDir} already exists. Pass --overwrite to replace the contents.`,
  );
  process.exit(1);
}

mkdirSync(webDir, { recursive: true });

// ---------------------------------------------------------------------------
// Shared types (`<Name>.shared.ts`)
// ---------------------------------------------------------------------------
const sharedTs = `/**
 * ${componentName}.shared.ts
 *
 * Shared types for <${componentName}/>. Keep this file framework-agnostic
 * so a future \`.native.tsx\` implementation can reuse the prop contract.
 */

import type { ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

export type ${componentName}Size = 'small' | 'medium' | 'large';

export interface ${componentName}Props {
  /** Content rendered inside the component. */
  children: ReactNode;
  /** Visual appearance role (primary, secondary, positive, negative, …). */
  appearance?: ComponentAppearance;
  /** Size preset. */
  size?: ${componentName}Size;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Additional class name merged onto the root element. */
  className?: string;
}
`;

// ---------------------------------------------------------------------------
// Web component (`<Name>.tsx`)
// ---------------------------------------------------------------------------
const webTsx = `/**
 * ${componentName}.tsx
 *
 * React (web) implementation for <${componentName}/>. Keep styling in the
 * adjacent CSS Module — this file is wiring + props only.
 */

import type { FC } from 'react';
import styles from './${componentName}.module.css';
import type { ${componentName}Props } from './${componentName}.shared';

export const ${componentName}: FC<${componentName}Props> = ({
  children,
  appearance = 'primary',
  size = 'medium',
  disabled,
  className,
}) => {
  return (
    <div
      className={[
        styles.root,
        styles[\`size_\${size}\`],
        styles[\`appearance_\${appearance}\`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-disabled={disabled ? '' : undefined}
    >
      {children}
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;

// ---------------------------------------------------------------------------
// CSS Module (`<Name>.module.css`)
// ---------------------------------------------------------------------------
const moduleCss = `/*
 * ${componentName}.module.css
 *
 * Token-only styles — no literal colours, pixels, or font values.
 * Validated by: \`pnpm check:literals\`.
 */

.root {
  /* Shape — non-interactive default (Shape-3 = 12px). Buttons use Shape-Pill;
     other interactive elements use Shape-2 (8px). */
  border-radius: var(--Shape-3);

  /* Surface & text — V4 unified role tokens. */
  background-color: var(--Primary-Subtle);
  color: var(--Primary-High);

  /* Spacing — F-scale remapping applies automatically. */
  padding: var(--Spacing-1) var(--Spacing-5);

  /* Typography — always pair size with line-height and font family. */
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Label-S-FontSize);
  line-height: var(--Label-S-LineHeight);
  font-weight: var(--Label-FontWeight-Medium);

  /* Motion */
  transition:
    background-color var(--Motion-Duration-Discreet-Short) var(--Motion-Easing-Transition),
    color var(--Motion-Duration-Discreet-Short) var(--Motion-Easing-Transition);
}

.root[data-disabled] {
  opacity: var(--Opacity-Disabled, 0.4);
  pointer-events: none;
}

/* ---- Size presets ------------------------------------------------------- */
.size_small {
  font-size: var(--Label-XS-FontSize);
  line-height: var(--Label-XS-LineHeight);
  padding: var(--Spacing-0-5) var(--Spacing-4-5);
}

.size_medium {
  /* Inherit defaults from .root */
}

.size_large {
  font-size: var(--Label-M-FontSize);
  line-height: var(--Label-M-LineHeight);
  padding: var(--Spacing-1-5) var(--Spacing-6);
}

/* ---- Appearance roles --------------------------------------------------- */
.appearance_primary {
  background-color: var(--Primary-Subtle);
  color: var(--Primary-High);
}

.appearance_secondary {
  background-color: var(--Secondary-Subtle);
  color: var(--Secondary-High);
}

.appearance_positive {
  background-color: var(--Positive-Subtle);
  color: var(--Positive-High);
}

.appearance_negative {
  background-color: var(--Negative-Subtle);
  color: var(--Negative-High);
}

.appearance_warning {
  background-color: var(--Warning-Subtle);
  color: var(--Warning-High);
}

.appearance_informative {
  background-color: var(--Informative-Subtle);
  color: var(--Informative-High);
}

.appearance_neutral {
  background-color: var(--Neutral-Subtle);
  color: var(--Neutral-High);
}
`;

// ---------------------------------------------------------------------------
// Storybook stories (`<Name>.stories.tsx`)
// ---------------------------------------------------------------------------
const storiesTsx = `/**
 * ${componentName}.stories.tsx
 *
 * Storybook documentation for <${componentName}/>. Storybook 10 uses the
 * \`@storybook/react-vite\` framework entry.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${componentName} } from './${componentName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  args: {
    children: '${componentName}',
    appearance: 'primary',
    size: 'medium',
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Appearances: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
      <${componentName} {...args} appearance="primary">Primary</${componentName}>
      <${componentName} {...args} appearance="secondary">Secondary</${componentName}>
      <${componentName} {...args} appearance="positive">Positive</${componentName}>
      <${componentName} {...args} appearance="negative">Negative</${componentName}>
      <${componentName} {...args} appearance="warning">Warning</${componentName}>
      <${componentName} {...args} appearance="informative">Informative</${componentName}>
      <${componentName} {...args} appearance="neutral">Neutral</${componentName}>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
      <${componentName} {...args} size="small">Small</${componentName}>
      <${componentName} {...args} size="medium">Medium</${componentName}>
      <${componentName} {...args} size="large">Large</${componentName}>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
`;

// ---------------------------------------------------------------------------
// Tests (`<Name>.test.tsx`)
// ---------------------------------------------------------------------------
const testTsx = `/**
 * ${componentName}.test.tsx
 *
 * Smoke + accessibility tests for <${componentName}/>. The a11y helper is the
 * shared wrapper added in Phase 5 of the Component Library audit — it pins
 * axe to WCAG 2.1 AA and filters Base UI focus-guard false positives.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '../../test-utils/a11y';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders children', () => {
    render(<${componentName}>Hello</${componentName}>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies disabled state via data attribute', () => {
    const { container } = render(<${componentName} disabled>Disabled</${componentName}>);
    expect(container.firstChild).toHaveAttribute('data-disabled');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<${componentName}>Label</${componentName}>);
    await expectNoA11yViolations(container);
  });
});
`;

// ---------------------------------------------------------------------------
// Barrel (`index.ts`)
// ---------------------------------------------------------------------------
const indexTs = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props, ${componentName}Size } from './${componentName}.shared';
`;

// ---------------------------------------------------------------------------
// Write all files
// ---------------------------------------------------------------------------
writeFileSync(join(webDir, `${componentName}.shared.ts`), sharedTs);
writeFileSync(join(webDir, `${componentName}.tsx`), webTsx);
writeFileSync(join(webDir, `${componentName}.module.css`), moduleCss);
writeFileSync(join(webDir, `${componentName}.stories.tsx`), storiesTsx);
writeFileSync(join(webDir, `${componentName}.test.tsx`), testTsx);
writeFileSync(join(webDir, 'index.ts'), indexTs);

console.log(`✅ Generated ${componentName} scaffolding in ${webDir}\n`);
console.log('Files:');
console.log(`  - ${webDir}/${componentName}.tsx`);
console.log(`  - ${webDir}/${componentName}.shared.ts`);
console.log(`  - ${webDir}/${componentName}.module.css`);
console.log(`  - ${webDir}/${componentName}.stories.tsx`);
console.log(`  - ${webDir}/${componentName}.test.tsx`);
console.log(`  - ${webDir}/index.ts`);
console.log('\nNext steps:');
console.log('  1. Register the component in packages/ui/src/index.ts (path-based).');
console.log('  2. Run: pnpm check:literals');
console.log('  3. Run: pnpm --filter @oneui/ui test');
console.log('  4. Run: pnpm storybook');
