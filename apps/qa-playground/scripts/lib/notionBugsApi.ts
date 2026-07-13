/**
 * Server-side Notion Bugs database fetcher.
 * Used by the Vite dev middleware — keeps NOTION_API_KEY off the client bundle.
 *
 * Tuned for OneUI v5 bugs database — property names overridable via NOTION_PROP_*.
 */
import { MOCK_NOTION_BUGS } from '../../src/services/notion/mockBugs';
import { getMockBugs } from './mockBugStore';
import { formatFetchError, notionGetJson, notionPostJson } from './notionHttp';
import type { NotionBug, NotionBugsResponse } from '../../src/services/notion/types';

const NOTION_VERSION = '2022-06-28';

const COMPONENT_RELATION_KEYS = [
  'Components OneUi v5 ',
  'Components OneUi v5  1',
  'Components OneUi v5  2',
  'OneUI Components',
] as const;

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
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'people'; people: Array<{ name?: string }> }
  | { type: 'relation'; relation: Array<{ id: string }> }
  | { type: 'unique_id'; unique_id: { prefix: string | null; number: number | null } }
  | { type: 'formula'; formula: { type: string; string?: string | null; number?: number | null } }
  | { type: 'created_time'; created_time: string }
  | { type: 'last_edited_time'; last_edited_time: string }
  | { type: string };

type NotionQueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

export type NotionConfig = {
  apiKey: string;
  databaseId: string;
  props: {
    title: string;
    bugId: string;
    severity: string;
    status: string;
    qaStatus: string;
    devStatus: string;
    platform: string;
    category: string;
    component: string;
    bugType: string;
    assignee: string;
    reportedBy: string;
    release: string;
    createdDate: string;
    modifiedDate: string;
  };
};

type EnvSource = Record<string, string | undefined>;

function envGet(env: EnvSource, key: string): string | undefined {
  return env[key]?.trim() || process.env[key]?.trim();
}

/** @param env Vite `loadEnv` record — required in dev because NOTION_* is outside `envPrefix`. */
export function readNotionConfig(env: EnvSource = process.env): NotionConfig | null {
  const apiKey = envGet(env, 'NOTION_API_KEY');
  const databaseId = envGet(env, 'NOTION_DATABASE_ID');
  if (!apiKey || !databaseId) return null;

  return {
    apiKey,
    databaseId,
    props: {
      title: envGet(env, 'NOTION_PROP_TITLE') ?? 'Bug Title',
      bugId: envGet(env, 'NOTION_PROP_BUG_ID') ?? 'Bug Key',
      severity: envGet(env, 'NOTION_PROP_SEVERITY') ?? 'Severity',
      status: envGet(env, 'NOTION_PROP_STATUS') ?? 'Bug Status',
      qaStatus: envGet(env, 'NOTION_PROP_QA_STATUS') ?? 'QA Status',
      devStatus: envGet(env, 'NOTION_PROP_DEV_STATUS') ?? 'Dev Status',
      platform: envGet(env, 'NOTION_PROP_PLATFORM') ?? 'Platform',
      category: envGet(env, 'NOTION_PROP_CATEGORY') ?? 'Category',
      component: envGet(env, 'NOTION_PROP_COMPONENT') ?? 'Components OneUi v5 ',
      bugType: envGet(env, 'NOTION_PROP_BUG_TYPE') ?? 'Bug type',
      assignee: envGet(env, 'NOTION_PROP_ASSIGNEE') ?? 'Assignee',
      reportedBy: envGet(env, 'NOTION_PROP_REPORTED_BY') ?? 'Reported By',
      release: envGet(env, 'NOTION_PROP_RELEASE') ?? 'Release',
      createdDate: envGet(env, 'NOTION_PROP_CREATED_DATE') ?? 'Create Date',
      modifiedDate: envGet(env, 'NOTION_PROP_MODIFIED_DATE') ?? 'Modified Date',
    },
  };
}

function plainText(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return prop.title.map((t) => t.plain_text).join('');
    case 'rich_text':
      return prop.rich_text.map((t) => t.plain_text).join('');
    case 'formula':
      if (prop.formula.type === 'string') return prop.formula.string ?? '';
      if (prop.formula.type === 'number') return String(prop.formula.number ?? '');
      return '';
    default:
      return '';
  }
}

function selectOrStatusName(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  if (prop.type === 'select' && prop.select) return prop.select.name;
  if (prop.type === 'status' && prop.status) return prop.status.name;
  return '';
}

function multiSelectNames(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((o) => o.name);
}

function uniqueIdText(prop: NotionProperty | undefined): string {
  if (!prop || prop.type !== 'unique_id' || prop.unique_id.number == null) return '';
  const prefix = prop.unique_id.prefix ?? 'BUG';
  return `${prefix}-${prop.unique_id.number}`;
}

function peopleNames(prop: NotionProperty | undefined): string {
  if (!prop || prop.type !== 'people' || prop.people.length === 0) return '';
  return prop.people.map((p) => p.name ?? 'Unknown').join(', ');
}

function relationIds(page: NotionPage): string[] {
  const ids: string[] = [];
  for (const key of COMPONENT_RELATION_KEYS) {
    const prop = page.properties[key];
    if (prop?.type === 'relation') {
      for (const rel of prop.relation) ids.push(rel.id);
    }
  }
  const configured = page.properties;
  return [...new Set(ids)];
}

function pageTitle(page: NotionPage): string {
  for (const prop of Object.values(page.properties)) {
    if (prop.type === 'title') {
      const text = prop.title.map((t) => t.plain_text).join('').trim();
      if (text) return text;
    }
  }
  return '';
}

function componentFromTitle(title: string): string {
  const segment = title.split('|')[0]?.trim();
  return segment && segment.length > 0 ? segment : 'Other';
}

function resolveBugId(page: NotionPage, config: NotionConfig, title: string): string {
  const fromKey = plainText(page.properties[config.props.bugId]);
  if (fromKey) return fromKey;
  const fromUnique = uniqueIdText(page.properties['Bug ID']);
  if (fromUnique) return fromUnique;
  const fromTitle = title.match(/BUG-[A-Z0-9-]+/i)?.[0];
  if (fromTitle) return fromTitle.toUpperCase();
  return `NOTION-${page.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

/** Dashboard uses Bug Status only — avoids QA/Dev status polluting summary cards. */
function resolveStatus(page: NotionPage, config: NotionConfig): string {
  return selectOrStatusName(page.properties[config.props.status]) || '—';
}

function resolveDate(
  page: NotionPage,
  propName: string,
  fallback: string,
  type: 'created_time' | 'last_edited_time',
): string {
  const prop = page.properties[propName];
  if (prop?.type === type) return prop[type];
  return fallback;
}

async function resolveComponentTitles(
  pages: NotionPage[],
  config: NotionConfig,
  env: EnvSource,
): Promise<Map<string, string>> {
  const ids = new Set<string>();
  for (const page of pages) {
    for (const id of relationIds(page)) ids.add(id);
  }

  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    'Notion-Version': NOTION_VERSION,
  };

  const map = new Map<string, string>();
  const idList = [...ids];
  const chunkSize = 8;

  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const res = await notionGetJson(`https://api.notion.com/v1/pages/${id}`, headers, env);
          if (!res.ok) return;
          const related = (await res.json()) as NotionPage;
          const name = pageTitle(related) || 'Unknown';
          map.set(id, name);
        } catch {
          map.set(id, 'Unknown');
        }
      }),
    );
  }

  return map;
}

function resolveComponent(
  page: NotionPage,
  config: NotionConfig,
  componentTitles: Map<string, string>,
  title: string,
): string {
  const names: string[] = [];
  for (const id of relationIds(page)) {
    const name = componentTitles.get(id);
    if (name && name !== 'Unknown') names.push(name);
  }
  if (names.length > 0) return [...new Set(names)].join(', ');
  return componentFromTitle(title);
}

function mapPage(
  page: NotionPage,
  config: NotionConfig,
  componentTitles: Map<string, string>,
): NotionBug {
  const { props: p } = config;
  const title = plainText(page.properties[p.title]) || 'Untitled bug';
  const bugId = resolveBugId(page, config, title);
  const platforms = multiSelectNames(page.properties[p.platform]);
  const platformDisplay = platforms.length > 0 ? platforms.join(', ') : '—';

  return {
    id: page.id,
    bugId,
    title,
    severity: selectOrStatusName(page.properties[p.severity]) || '—',
    status: resolveStatus(page, config),
    platform: platformDisplay,
    platforms,
    component: resolveComponent(page, config, componentTitles, title),
    assignee: peopleNames(page.properties[p.assignee]) || 'Unassigned',
    reportedBy: peopleNames(page.properties[p.reportedBy]) || '—',
    category: selectOrStatusName(page.properties[p.category]) || '—',
    release: selectOrStatusName(page.properties[p.release]) || '—',
    createdAt: resolveDate(page, p.createdDate, page.created_time, 'created_time'),
    updatedAt: resolveDate(page, p.modifiedDate, page.last_edited_time, 'last_edited_time'),
    notionUrl: page.url,
  };
}

async function queryNotionDatabase(config: NotionConfig, env: EnvSource): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await notionPostJson(
      `https://api.notion.com/v1/databases/${config.databaseId}/query`,
      headers,
      body,
      env,
    );

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Notion API ${res.status}: ${detail.slice(0, 400)}`);
    }

    const data = (await res.json()) as NotionQueryResponse;
    pages.push(...data.results);
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

export async function fetchNotionBugs(env: EnvSource = process.env): Promise<NotionBugsResponse> {
  const config = readNotionConfig(env);
  const fetchedAt = new Date().toISOString();

  if (!config) {
    return {
      bugs: getMockBugs(),
      source: 'mock',
      fetchedAt,
      configured: false,
      warning:
        'Notion is not configured. Set NOTION_API_KEY and NOTION_DATABASE_ID in .env.local. Showing demo data.',
    };
  }

  try {
    const pages = await queryNotionDatabase(config, env);
    const componentTitles = await resolveComponentTitles(pages, config, env);
    const bugs = pages
      .map((page) => mapPage(page, config, componentTitles))
      .filter((bug) => bug.title.trim().length > 0)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return {
      bugs,
      source: 'notion',
      fetchedAt,
      configured: true,
    };
  } catch (error) {
    const message = formatFetchError(error);
    return {
      bugs: getMockBugs(),
      source: 'mock',
      fetchedAt,
      configured: true,
      warning: `Notion API failed — showing demo data. ${message}. If this is a TLS/certificate issue, set NOTION_USE_CURL=1 in .env.local and restart the dev server.`,
    };
  }
}
