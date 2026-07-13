import { source } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const body = source
    .getPages()
    .map((page) => `- [${page.data.title}](${page.url}): ${page.data.description ?? ''}`.trim())
    .join('\n');

  return new Response(`# OneUI Design System Docs\n\n${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
