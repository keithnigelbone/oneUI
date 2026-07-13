import { useCallback, useEffect, useRef, useState } from 'react';

import {
  bulkUpdateBugStatusOnApi,
  fetchBugsFromApi,
  updateBugStatusOnApi,
} from '@/services/notion/notionService';
import type { NotionBug, NotionBugsResponse } from '@/services/notion/types';

const AUTO_REFRESH_MS = 5 * 60 * 1000;

export type UseNotionBugsState = {
  bugs: NotionBug[];
  loading: boolean;
  error: string | null;
  warning: string | null;
  source: NotionBugsResponse['source'];
  configured: boolean;
  fetchedAt: string | null;
  updating: boolean;
  refresh: (force?: boolean) => Promise<void>;
  updateBugStatus: (pageId: string, status: string) => Promise<void>;
  bulkUpdateStatus: (pageIds: string[], status: string) => Promise<{ failed: number }>;
  patchBugLocally: (pageId: string, patch: Partial<NotionBug>) => void;
};

export function useNotionBugs(): UseNotionBugsState {
  const [bugs, setBugs] = useState<NotionBug[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<NotionBugsResponse['source']>('mock');
  const [configured, setConfigured] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const mounted = useRef(true);

  const applyPayload = useCallback((payload: NotionBugsResponse) => {
    setBugs(payload.bugs);
    setSource(payload.source);
    setConfigured(payload.configured);
    setFetchedAt(payload.fetchedAt);
    setWarning(payload.warning ?? null);
    setError(null);
  }, []);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    try {
      const payload = await fetchBugsFromApi({ force, useCache: !force });
      if (mounted.current) applyPayload(payload);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load bugs');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [applyPayload]);

  const patchBugLocally = useCallback((pageId: string, patch: Partial<NotionBug>) => {
    setBugs((prev) =>
      prev.map((bug) => (bug.id === pageId ? { ...bug, ...patch } : bug)),
    );
  }, []);

  const updateBugStatus = useCallback(
    async (pageId: string, status: string) => {
      const previous = bugs.find((bug) => bug.id === pageId);
      if (!previous) throw new Error('Bug record no longer exists.');

      setUpdating(true);
      patchBugLocally(pageId, { status, updatedAt: new Date().toISOString() });

      try {
        const result = await updateBugStatusOnApi(pageId, status);
        patchBugLocally(pageId, { status: result.status, updatedAt: result.updatedAt });
        await refresh(true);
      } catch (err) {
        patchBugLocally(pageId, { status: previous.status, updatedAt: previous.updatedAt });
        throw err;
      } finally {
        if (mounted.current) setUpdating(false);
      }
    },
    [bugs, patchBugLocally, refresh],
  );

  const bulkUpdateStatus = useCallback(
    async (pageIds: string[], status: string) => {
      if (pageIds.length === 0) return { failed: 0 };

      const previous = new Map(bugs.filter((b) => pageIds.includes(b.id)).map((b) => [b.id, b]));
      setUpdating(true);

      for (const pageId of pageIds) {
        patchBugLocally(pageId, { status, updatedAt: new Date().toISOString() });
      }

      try {
        const result = await bulkUpdateBugStatusOnApi(pageIds, status);
        for (const item of result.updated) {
          patchBugLocally(item.pageId, { status: item.status, updatedAt: result.updatedAt });
        }
        for (const item of result.failed) {
          const prev = previous.get(item.pageId);
          if (prev) patchBugLocally(item.pageId, { status: prev.status, updatedAt: prev.updatedAt });
        }
        await refresh(true);
        return { failed: result.failed.length };
      } catch (err) {
        for (const [pageId, prev] of previous) {
          patchBugLocally(pageId, { status: prev.status, updatedAt: prev.updatedAt });
        }
        throw err;
      } finally {
        if (mounted.current) setUpdating(false);
      }
    },
    [bugs, patchBugLocally, refresh],
  );

  useEffect(() => {
    mounted.current = true;
    void refresh(false);

    const timer = window.setInterval(() => {
      void refresh(false);
    }, AUTO_REFRESH_MS);

    return () => {
      mounted.current = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  return {
    bugs,
    loading,
    updating,
    error,
    warning,
    source,
    configured,
    fetchedAt,
    refresh,
    updateBugStatus,
    bulkUpdateStatus,
    patchBugLocally,
  };
}
