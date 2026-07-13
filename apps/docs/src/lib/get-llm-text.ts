import { source } from './source';

type SourcePage = ReturnType<typeof source.getPages>[number];

export async function getLLMText(page: SourcePage) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${page.data.description ? `${page.data.description}\n\n` : ''}${processed}`;
}
