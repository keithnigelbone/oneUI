import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JIO_WEB_ALPHA_COMPONENTS } from '@oneui/ui/registry/jioAlphaCatalog';
import type { ComponentDocumentationSpec } from '@oneui/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = resolve(__dirname, '..');
const repoRoot = resolve(appRoot, '../..');
const outputDir = resolve(appRoot, 'content/docs/components');
const generatedDir = resolve(appRoot, 'src/generated');

function main() {
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });

  const generatedPages = JIO_WEB_ALPHA_COMPONENTS.map((component) => {
    const slug = component.name.toLowerCase();
    const spec = readSpec(component.docsPath);
    const notes = 'notes' in component ? component.notes : undefined;
    const description = notes ?? spec.intentAndPurpose.intent.value;
    const sourcePath = component.docsPath ?? 'docs/components/generated';

    writeFileSync(
      resolve(outputDir, `${slug}.mdx`),
      `---
title: ${component.name}
description: ${escapeFrontmatter(description)}
---

Generated from \`${sourcePath}\` and the Jio web alpha catalog.

<ComponentDoc name="${component.name}" />
`,
      'utf8',
    );

    return slug;
  });

  writeFileSync(
    resolve(generatedDir, 'componentSpecs.ts'),
    buildComponentSpecModule(),
    'utf8',
  );

  writeFileSync(
    resolve(outputDir, 'meta.json'),
    `${JSON.stringify(
      {
        title: 'Components',
        defaultOpen: true,
        pages: ['index', ...generatedPages],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

function buildComponentSpecModule() {
  const imports = JIO_WEB_ALPHA_COMPONENTS.map((component, index) => {
    if (!component.docsPath) {
      throw new Error(`${component.name} is missing docsPath`);
    }

    return `import spec${index} from '../../../../${component.docsPath}';`;
  }).join('\n');

  const entries = JIO_WEB_ALPHA_COMPONENTS.map(
    (component, index) => `  ${JSON.stringify(component.name)}: spec${index} as ComponentDocumentationSpec,`,
  ).join('\n');

  return `${imports}
import type { ComponentDocumentationSpec } from '@oneui/shared';

export const COMPONENT_DOC_SPECS = {
${entries}
} satisfies Record<string, ComponentDocumentationSpec>;
`;
}

function readSpec(docsPath?: string): ComponentDocumentationSpec {
  if (!docsPath) {
    throw new Error('Alpha component is missing docsPath');
  }

  const absolutePath = resolve(repoRoot, docsPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Generated docs not found: ${docsPath}`);
  }

  return JSON.parse(readFileSync(absolutePath, 'utf8')) as ComponentDocumentationSpec;
}

function escapeFrontmatter(value: string) {
  return JSON.stringify(value);
}

main();
