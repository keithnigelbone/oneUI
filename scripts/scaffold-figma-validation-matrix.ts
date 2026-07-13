#!/usr/bin/env node
/**
 * PHASE 2–3 scaffolds — BUILDER (Vite test page) + VALIDATOR (Playwright) templates.
 *
 * Usage (repo root):
 *   pnpm figma-matrix:scaffold Checkbox Checkbox
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

function main(): void {
  const slug = (process.argv[2] ?? '').trim();
  const component = (process.argv[3] ?? slug).trim();
  if (!slug || !component) {
    console.error('Usage: pnpm figma-matrix:scaffold <folderSlug> <ExportedComponentName>');
    console.error('Example: pnpm figma-matrix:scaffold Checkbox Checkbox');
    process.exit(1);
  }

  const base = join(REPO_ROOT, 'packages/ui/src/__tests__', slug);
  const tp = join(base, 'test-page');
  mkdirSync(tp, { recursive: true });

  const viteConfig = `import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(dir, '../../../../');

export default defineConfig({
  plugins: [react()],
  root: dir,
  server: { port: 3333, strictPort: true, open: false },
  resolve: {
    alias: [
      {
        find: '@oneui/ui/styles',
        replacement: path.join(uiRoot, 'src/styles/global.css'),
      },
      { find: '@oneui/ui', replacement: uiRoot },
    ],
  },
});
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${component} — Figma matrix</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`;

  const mainTsx = `/**
 * BUILDER — Vite harness only (not Storybook). Renders every fixture variant with real ${component}.
 */
import '@oneui/ui/styles';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import fixture from '../figma-variant-matrix.fixture.json';
import { ${component} } from '@oneui/ui';
import { mapVariantProps } from '../mapVariantProps';

function TestPage() {
  return (
    <div
      style={{
        padding: 'var(--Spacing-7)',
        fontFamily: 'var(--Typography-Font-Primary)',
        background: 'var(--Neutral-Subtle)',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--Title-L-FontSize)',
          lineHeight: 'var(--Title-L-LineHeight)',
          fontWeight: 'var(--Title-L-FontWeight)',
          color: 'var(--Primary-High)',
          margin: '0 0 var(--Spacing-3-5)',
        }}
      >
        {fixture.meta.componentName} — Figma validation page
      </h1>
      <p
        style={{
          fontSize: 'var(--Body-S-FontSize)',
          lineHeight: 'var(--Body-S-LineHeight)',
          color: 'var(--Primary-Medium-Text)',
          margin: '0 0 var(--Spacing-6)',
        }}
      >
        Figma: {fixture.meta.figmaUrl}
        <br />
        Fetched: {fixture.meta.fetchedAt}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 'var(--Spacing-5)',
        }}
      >
        {fixture.variants.map((variant) => (
          <div
            key={variant.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3-5)',
              padding: 'var(--Spacing-4)',
              borderRadius: 'var(--Shape-4)',
              background: 'var(--Surface-Main)',
            }}
          >
            <div data-testid={variant.id} style={{ display: 'inline-flex' }}>
              <${component} {...mapVariantProps(variant.props)} />
            </div>
            <code
              style={{
                fontSize: 'var(--Label-XS-FontSize)',
                lineHeight: 'var(--Label-XS-LineHeight)',
                color: 'var(--Text-Low)',
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {Object.entries(variant.props)
                .map(([k, v]) => \`\${k}: \${v}\`)
                .join('\\n')}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestPage />
  </StrictMode>,
);
`;

  const mapVariantProps = `/**
 * Map Figma variant key=value props → ${component} props.
 * Adjust when Figma property names differ from React (e.g. selected → checked).
 */
export function mapVariantProps(props: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const get = (key: string) => props[key];

  const bool = (raw: string | undefined) => raw === 'true';

  if (get('selected') !== undefined) out.checked = bool(get('selected'));
  if (get('readOnly') !== undefined) out.readOnly = bool(get('readOnly'));
  if (get('disabled') !== undefined) out.disabled = bool(get('disabled'));
  if (get('indeterminate') !== undefined) out.indeterminate = bool(get('indeterminate'));

  const sizeRaw = get('Size') ?? get('size');
  if (sizeRaw) out.size = String(sizeRaw).toLowerCase() as never;

  const appearance = get('appearance');
  if (appearance) out.appearance = appearance as never;

  for (const [k, v] of Object.entries(props)) {
    if (out[k] !== undefined) continue;
    if (v === 'true') out[k] = true;
    else if (v === 'false') out[k] = false;
    else out[k] = v;
  }

  return out;
}
`;

  const spec = [
    `import { readFileSync, existsSync } from 'node:fs';`,
    `import { dirname, join } from 'node:path';`,
    `import { fileURLToPath } from 'node:url';`,
    ``,
    `import AxeBuilder from '@axe-core/playwright';`,
    `import { expect, test, type Page } from '@playwright/test';`,
    ``,
    `import type { FigmaVariantMatrixFixture } from '../figmaVariantMatrix.types';`,
    ``,
    `const __dirname = dirname(fileURLToPath(import.meta.url));`,
    `const FIXTURE_PATH = join(__dirname, 'figma-variant-matrix.fixture.json');`,
    ``,
    `function loadFixture(): FigmaVariantMatrixFixture {`,
    `  if (!existsSync(FIXTURE_PATH)) {`,
    `    throw new Error(`,
    `      'Missing figma-variant-matrix.fixture.json — run: pnpm figma-matrix:fetch ${slug} "<figma url>"',`,
    `    );`,
    `  }`,
    `  const data = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as FigmaVariantMatrixFixture;`,
    `  if (!data.variants?.length) {`,
    `    throw new Error('Fixture has zero variants — point node-id at a COMPONENT_SET or component.');`,
    `  }`,
    `  return data;`,
    `}`,
    ``,
    `const fixture = loadFixture();`,
    ``,
    `async function getComputedParity(page: Page, testId: string, property: string): Promise<string> {`,
    `  return page.evaluate(`,
    `    ({ testId, property }) => {`,
    `      const host = document.querySelector(\`[data-testid="\${testId}"]\`);`,
    `      if (!host) throw new Error(\`data-testid="\${testId}" not found\`);`,
    `      const label = host.querySelector('label');`,
    `      const el = (label ?? host) as HTMLElement;`,
    `      return getComputedStyle(el).getPropertyValue(property).trim();`,
    `    },`,
    `    { testId, property },`,
    `  );`,
    `}`,
    ``,
    `for (const variant of fixture.variants) {`,
    `  test.describe(variant.id, () => {`,
    `    test.beforeEach(async ({ page }) => {`,
    `      await page.goto('/');`,
    `      await page.getByTestId(variant.id).waitFor({ state: 'visible' });`,
    `    });`,
    ``,
    `    test('background-color matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'background-color');`,
    `      expect(actual, variant.id).toBe(variant.expect.backgroundColor);`,
    `    });`,
    ``,
    `    test('border-radius matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'border-radius');`,
    `      expect(actual).toBe(variant.expect.borderRadius);`,
    `    });`,
    ``,
    `    test('width matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'width');`,
    `      expect(actual).toBe(variant.expect.width);`,
    `    });`,
    ``,
    `    test('height matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'height');`,
    `      expect(actual).toBe(variant.expect.height);`,
    `    });`,
    ``,
    `    test('opacity matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'opacity');`,
    `      expect(actual).toBe(variant.expect.opacity);`,
    `    });`,
    ``,
    `    test('border matches fixture', async ({ page }) => {`,
    `      const actual = await getComputedParity(page, variant.id, 'border');`,
    `      expect(actual).toBe(variant.expect.border);`,
    `    });`,
    ``,
    `    if (variant.expect.icon.visible) {`,
    `      test('icon subtree visible under host', async ({ page }) => {`,
    `        await expect(page.getByTestId(variant.id).locator('svg').first()).toBeVisible();`,
    `      });`,
    ``,
    `      test('icon color matches fixture', async ({ page }) => {`,
    `        const actual = await page.evaluate(({ testId }) => {`,
    `          const host = document.querySelector(\`[data-testid="\${testId}"]\`);`,
    `          if (!host) throw new Error('host');`,
    `          const svg = host.querySelector('svg');`,
    `          if (!svg) throw new Error('svg');`,
    `          return getComputedStyle(svg).color;`,
    `        }, { testId: variant.id });`,
    `        expect(actual).toBe(variant.expect.icon.color);`,
    `      });`,
    `    } else {`,
    `      test('icon hidden when fixture marks invisible', async ({ page }) => {`,
    `        await expect(page.getByTestId(variant.id).locator('svg').first()).toBeHidden();`,
    `      });`,
    `    }`,
    ``,
    `    test('visual snapshot', async ({ page }) => {`,
    `      await expect(page.getByTestId(variant.id)).toHaveScreenshot({ animations: 'disabled' });`,
    `    });`,
    ``,
    `    const p = variant.props;`,
    `    if (p.readOnly === 'true') {`,
    `      test('readOnly — click does not change background-color', async ({ page }) => {`,
    `        const host = page.getByTestId(variant.id);`,
    `        const before = await getComputedParity(page, variant.id, 'background-color');`,
    `        await host.click();`,
    `        const after = await getComputedParity(page, variant.id, 'background-color');`,
    `        expect(after).toBe(before);`,
    `      });`,
    `    }`,
    ``,
    `    const checkedVariant = fixture.variants.find(`,
    `      (v) =>`,
    `        v.props.size === p.size &&`,
    `        v.props.readOnly === 'false' &&`,
    `        v.props.selected === 'true' &&`,
    `        v.props.indeterminate === p.indeterminate,`,
    `    );`,
    ``,
    `    if (p.readOnly === 'false' && p.selected === 'false' && checkedVariant) {`,
    `      test('click moves toward checked fixture state', async ({ page }) => {`,
    `        await page.getByTestId(variant.id).click();`,
    `        const actual = await getComputedParity(page, variant.id, 'background-color');`,
    `        expect(actual).toBe(checkedVariant!.expect.backgroundColor);`,
    `      });`,
    `    }`,
    ``,
    `    test('no critical a11y violations (scoped)', async ({ page }) => {`,
    `      const selector = '[data-testid="' + variant.id + '"]';`,
    `      const results = await new AxeBuilder({ page }).include(selector).analyze();`,
    `      expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);`,
    `    });`,
    `  });`,
    `}`,
    ``,
  ].join('\n');

  const pwConfig = `import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, '../../../..');
const viteConfig = path.join(root, 'test-page', 'vite.config.ts');

export default defineConfig({
  testDir: root,
  testMatch: 'figma-variant-matrix.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3333',
    headless: true,
  },
  webServer: {
    command: \`pnpm exec vite --config \${viteConfig}\`,
    cwd: repoRoot,
    url: 'http://127.0.0.1:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  snapshotPathTemplate: '{testDir}/figma-matrix-snapshots/{testFilePath}-snapshots/{arg}{ext}',
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(root, 'playwright-report-figma-matrix'), open: 'never' }],
    ['json', { outputFile: path.join(root, 'test-results-figma-matrix.json') }],
  ],
});
`;

  writeFileSync(join(tp, 'vite.config.ts'), viteConfig, 'utf8');
  writeFileSync(join(tp, 'index.html'), indexHtml, 'utf8');
  writeFileSync(join(tp, 'main.tsx'), mainTsx, 'utf8');
  writeFileSync(join(base, 'mapVariantProps.ts'), mapVariantProps, 'utf8');
  writeFileSync(join(base, 'figma-variant-matrix.spec.ts'), spec, 'utf8');
  writeFileSync(join(base, 'playwright.figma-matrix.config.ts'), pwConfig, 'utf8');

  console.log(`Scaffolded figma matrix harness under packages/ui/src/__tests__/${slug}/`);
  console.log(`Next: pnpm figma-matrix:fetch ${slug} "<figma url>" && pnpm figma-matrix:test ${slug}`);
}

main();
