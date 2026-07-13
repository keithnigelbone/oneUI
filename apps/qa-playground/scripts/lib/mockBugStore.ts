import { MOCK_NOTION_BUGS } from '../../src/services/notion/mockBugs';
import type { NotionBug, NotionBugDetail } from '../../src/services/notion/types';

let bugs: NotionBug[] = MOCK_NOTION_BUGS.map((bug) => ({ ...bug }));

const detailExtras = new Map<string, Partial<NotionBugDetail>>();

export function getMockBugs(): NotionBug[] {
  return bugs;
}

export function resetMockBugs(): void {
  bugs = MOCK_NOTION_BUGS.map((bug) => ({ ...bug }));
  detailExtras.clear();
}

export function updateMockBugStatus(pageId: string, status: string): NotionBug | null {
  let updated: NotionBug | null = null;
  bugs = bugs.map((bug) => {
    if (bug.id !== pageId) return bug;
    updated = { ...bug, status, updatedAt: new Date().toISOString() };
    return updated;
  });
  return updated;
}

export function getMockBugDetail(pageId: string): NotionBugDetail | null {
  const bug = bugs.find((b) => b.id === pageId);
  if (!bug) return null;
  const extras = detailExtras.get(pageId);
  return {
    ...bug,
    description:
      extras?.description ??
      `Demo description for ${bug.bugId}. Configure Notion credentials to load live page content.`,
    prLink: extras?.prLink ?? '',
    devLink: extras?.devLink ?? '',
    comments:
      extras?.comments ??
      [
        {
          id: `${pageId}-comment-1`,
          author: bug.reportedBy !== '—' ? bug.reportedBy : 'QA Reporter',
          text: 'Initial reproduction steps documented in the Notion page.',
          createdAt: bug.createdAt,
        },
      ],
  };
}
