/**
 * useDcaRenderer.ts
 *
 * Feature flag for the playground's renderer pipeline. The legacy `'ast'`
 * path runs Claude → JSON AST → ASTRenderer; the new `'sandpack'` path
 * runs Claude → TSX → Sandpack iframe (real React execution). Flag-gated
 * parallel rollout per the migration plan: designers can flip without a
 * redeploy by setting `?renderer=ast` for legacy debugging. Sandpack is
 * the default because it renders real `@oneui/playground` components.
 */

'use client';

import { useEffect, useState } from 'react';

export type DcaRenderer = 'ast' | 'sandpack';

const STORAGE_KEY = 'oneui.dca.renderer';
const QUERY_KEY = 'renderer';

function readInitial(): DcaRenderer {
  if (typeof window === 'undefined') return 'sandpack';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get(QUERY_KEY);
  if (fromQuery === 'sandpack' || fromQuery === 'ast') {
    window.localStorage.setItem(STORAGE_KEY, fromQuery);
    return fromQuery;
  }
  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage === 'sandpack' || fromStorage === 'ast') return fromStorage;
  return 'sandpack';
}

export function useDcaRenderer(): DcaRenderer {
  const [renderer, setRenderer] = useState<DcaRenderer>('sandpack');

  useEffect(() => {
    setRenderer(readInitial());
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === 'sandpack' || event.newValue === 'ast') {
        setRenderer(event.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return renderer;
}
