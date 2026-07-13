/**
 * Notion bug mutations + detail fetch — server-side only.
 */
import { formatFetchError, notionGetJson, notionPatchJson } from './notionHttp';
import { getMockBugDetail, updateMockBugStatus } from './mockBugStore';
import { fetchNotionBugs, readNotionConfig, type NotionConfig } from './notionBugsApi';
import type { NotionBugComment, NotionBugDetail } from '../../src/services/notion/types';

const NOTION_VERSION = '2022-06-28';

type EnvSource = Record<string, string | undefined>;

type NotionPage = {
  id: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
};

type NotionProperty =
  | { type: 'title'; title: Array<{ plain_text: string }> }
  | { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'status'; status: { name: string } | null }
  | { type: 'url'; url: string | null }
  | { type: string };

type NotionBlock = {
  id: string;
  type: string;
  paragraph?: { rich_text: Array<{ plain_text: string }> };
  heading_1?: { rich_text: Array<{ plain_text: string }> };
  heading_2?: { rich_text: Array<{ plain_text: string }> };
  heading_3?: { rich_text: Array<{ plain_text: string }> };
  bulleted_list_item?: { rich_text: Array<{ plain_text: string }> };
  numbered_list_item?: { rich_text: Array<{ plain_text: string }> };
};

type NotionComment = {
  id: string;
  created_time: string;
  created_by?: { name?: string };
  rich_text: Array<{ plain_text: string }>;
};

let cachedStatusFieldType: 'select' | 'status' | null = null;

function envGet(env: EnvSource, key: string, fallback: string): string {
  return env[key]?.trim() || process.env[key]?.trim() || fallback;
}

function notionHeaders(apiKey: string, withJson = false): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_VERSION,
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

function plainText(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  if (prop.type === 'title' && 'title' in prop) {
    return prop.title.map((t) => t.plain_text).join('');
  }
  if (prop.type === 'rich_text' && 'rich_text' in prop) {
    return prop.rich_text.map((t) => t.plain_text).join('');
  }
  return '';
}

function urlText(prop: NotionProperty | undefined): string {
  if (!prop || prop.type !== 'url') return '';
  return prop.url ?? '';
}

function blockText(block: NotionBlock): string {
  const rich =
    block.paragraph?.rich_text ??
    block.heading_1?.rich_text ??
    block.heading_2?.rich_text ??
    block.heading_3?.rich_text ??
    block.bulleted_list_item?.rich_text ??
    block.numbered_list_item?.rich_text ??
    [];
  return rich.map((t) => t.plain_text).join('');
}

async function resolveStatusFieldType(
  config: NotionConfig,
  env: EnvSource,
): Promise<'select' | 'status'> {
  if (cachedStatusFieldType) return cachedStatusFieldType;

  const res = await notionGetJson(
    `https://api.notion.com/v1/databases/${config.databaseId}`,
    notionHeaders(config.apiKey),
    env,
  );

  if (!res.ok) {
    cachedStatusFieldType = 'status';
    return cachedStatusFieldType;
  }

  const data = (await res.json()) as { properties?: Record<string, { type?: string }> };
  const prop = data.properties?.[config.props.status];
  cachedStatusFieldType = prop?.type === 'select' ? 'select' : 'status';
  return cachedStatusFieldType;
}

function buildStatusPayload(
  fieldType: 'select' | 'status',
  propName: string,
  status: string,
): Record<string, unknown> {
  const value =
    fieldType === 'select'
      ? { select: { name: status } }
      : { status: { name: status } };
  return { [propName]: value };
}

function notionErrorMessage(status: number, detail: string): string {
  if (status === 401 || status === 403) {
    return 'Notion rejected the request — check integration permissions for this database.';
  }
  if (status === 404) {
    return 'Bug record no longer exists in Notion.';
  }
  if (status === 400) {
    return `Notion rejected the status value. ${detail.slice(0, 200)}`;
  }
  if (status >= 500) {
    return 'Notion service is temporarily unavailable. Try again shortly.';
  }
  return detail.slice(0, 300) || `Notion API error (${status})`;
}

export type BugUpdateResult = {
  pageId: string;
  status: string;
  updatedAt: string;
};

export async function updateNotionBugStatus(
  pageId: string,
  status: string,
  env: EnvSource = process.env,
): Promise<BugUpdateResult> {
  const config = readNotionConfig(env);

  if (!config) {
    const updated = updateMockBugStatus(pageId, status);
    if (!updated) {
      throw new Error('Bug record no longer exists.');
    }
    return { pageId, status, updatedAt: updated.updatedAt };
  }

  const fieldType = await resolveStatusFieldType(config, env);
  const body = {
    properties: buildStatusPayload(fieldType, config.props.status, status),
  };

  const res = await notionPatchJson(
    `https://api.notion.com/v1/pages/${pageId}`,
    notionHeaders(config.apiKey, true),
    body,
    env,
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(notionErrorMessage(res.status, detail));
  }

  const page = (await res.json()) as NotionPage;
  return {
    pageId,
    status,
    updatedAt: page.last_edited_time ?? new Date().toISOString(),
  };
}

export type BulkUpdateResult = {
  updated: Array<{ pageId: string; status: string }>;
  failed: Array<{ pageId: string; error: string }>;
  updatedAt: string;
};

export async function bulkUpdateNotionBugStatus(
  pageIds: string[],
  status: string,
  env: EnvSource = process.env,
): Promise<BulkUpdateResult> {
  const updated: Array<{ pageId: string; status: string }> = [];
  const failed: Array<{ pageId: string; error: string }> = [];

  for (const pageId of pageIds) {
    try {
      await updateNotionBugStatus(pageId, status, env);
      updated.push({ pageId, status });
    } catch (error) {
      failed.push({
        pageId,
        error: error instanceof Error ? error.message : 'Update failed',
      });
    }
  }

  return { updated, failed, updatedAt: new Date().toISOString() };
}

async function fetchPageBlocks(pageId: string, config: NotionConfig, env: EnvSource): Promise<string> {
  const res = await notionGetJson(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=50`,
    notionHeaders(config.apiKey),
    env,
  );
  if (!res.ok) return '';

  const data = (await res.json()) as { results?: NotionBlock[] };
  const parts = (data.results ?? [])
    .map(blockText)
    .map((text) => text.trim())
    .filter(Boolean);
  return parts.join('\n\n');
}

async function fetchPageComments(pageId: string, config: NotionConfig, env: EnvSource): Promise<NotionBugComment[]> {
  const res = await notionGetJson(
    `https://api.notion.com/v1/comments?block_id=${pageId}`,
    notionHeaders(config.apiKey),
    env,
  );
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: NotionComment[] };
  return (data.results ?? []).map((comment) => ({
    id: comment.id,
    author: comment.created_by?.name ?? 'Unknown',
    text: comment.rich_text.map((t) => t.plain_text).join('').trim() || '—',
    createdAt: comment.created_time,
  }));
}

export async function fetchNotionBugDetail(
  pageId: string,
  env: EnvSource = process.env,
): Promise<NotionBugDetail> {
  const config = readNotionConfig(env);

  if (!config) {
    const mock = getMockBugDetail(pageId);
    if (!mock) throw new Error('Bug record no longer exists.');
    return mock;
  }

  try {
    const pageRes = await notionGetJson(
      `https://api.notion.com/v1/pages/${pageId}`,
      notionHeaders(config.apiKey),
      env,
    );

    if (pageRes.status === 404) {
      throw new Error('Bug record no longer exists in Notion.');
    }
    if (!pageRes.ok) {
      const detail = await pageRes.text();
      throw new Error(notionErrorMessage(pageRes.status, detail));
    }

    const page = (await pageRes.json()) as NotionPage;
    const prProp = envGet(env, 'NOTION_PROP_PR_LINK', 'PR Link');
    const devProp = envGet(env, 'NOTION_PROP_DEV_LINK', 'GitHub Link');

    const [description, comments, bugList] = await Promise.all([
      fetchPageBlocks(pageId, config, env),
      fetchPageComments(pageId, config, env),
      fetchNotionBugs(env),
    ]);

    const cached = bugList.bugs.find((bug) => bug.id === pageId);

    const base = cached ?? {
      id: page.id,
      bugId: pageId.slice(0, 8),
      title: plainText(page.properties[config.props.title]) || 'Untitled bug',
      severity: '—',
      status: '—',
      platform: '—',
      platforms: [],
      component: '—',
      assignee: 'Unassigned',
      reportedBy: '—',
      category: '—',
      release: '—',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      notionUrl: page.url,
    };

    return {
      ...base,
      updatedAt: page.last_edited_time,
      notionUrl: page.url,
      description: description || plainText(page.properties['Description']) || 'No description provided.',
      prLink: urlText(page.properties[prProp]) || plainText(page.properties[prProp]),
      devLink: urlText(page.properties[devProp]) || plainText(page.properties[devProp]),
      comments,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('no longer exists')) throw error;
    throw new Error(formatFetchError(error));
  }
}
