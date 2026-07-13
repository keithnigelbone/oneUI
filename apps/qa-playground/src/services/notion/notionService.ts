import type {
  BulkBugStatusUpdateResponse,
  BugStatusUpdateResponse,
  NotionBugDetail,
  NotionBugsResponse,
} from './types';

const CACHE_KEY = 'qa-notion-bugs-cache-v2';
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  payload: NotionBugsResponse;
  storedAt: number;
};

function readCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function shouldCache(payload: NotionBugsResponse): boolean {
  if (payload.source === 'notion') return true;
  if (payload.configured && payload.warning) return false;
  return payload.source === 'mock' && !payload.configured;
}

function writeCache(payload: NotionBugsResponse) {
  if (!shouldCache(payload)) return;
  try {
    const entry: CacheEntry = { payload, storedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota exceeded — ignore */
  }
}

export async function fetchBugsFromApi(options?: {
  force?: boolean;
  useCache?: boolean;
}): Promise<NotionBugsResponse> {
  const useCache = options?.useCache !== false;
  const force = options?.force === true;

  if (!force && useCache) {
    const cached = readCache();
    if (cached && Date.now() - cached.storedAt < CACHE_TTL_MS) {
      return cached.payload;
    }
  }

  const res = await fetch('/api/notion/bugs', { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load bugs (${res.status})`);
  }

  const payload = (await res.json()) as NotionBugsResponse;
  writeCache(payload);
  return payload;
}

export function clearBugsCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

async function parseApiError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (body.error) return body.error;
  if (res.status === 403) return 'Notion integration lacks permission to update this bug.';
  if (res.status === 404) return 'Bug record no longer exists in Notion.';
  if (res.status >= 500) return 'Notion service is temporarily unavailable.';
  return `Request failed (${res.status})`;
}

export async function updateBugStatusOnApi(
  pageId: string,
  status: string,
): Promise<BugStatusUpdateResponse> {
  const res = await fetch(`/api/notion/bugs/${encodeURIComponent(pageId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  clearBugsCache();
  return (await res.json()) as BugStatusUpdateResponse;
}

export async function bulkUpdateBugStatusOnApi(
  pageIds: string[],
  status: string,
): Promise<BulkBugStatusUpdateResponse> {
  const res = await fetch('/api/notion/bugs/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageIds, status }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  clearBugsCache();
  return (await res.json()) as BulkBugStatusUpdateResponse;
}

export async function fetchBugDetailFromApi(pageId: string): Promise<NotionBugDetail> {
  const res = await fetch(`/api/notion/bugs/${encodeURIComponent(pageId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as NotionBugDetail;
}
