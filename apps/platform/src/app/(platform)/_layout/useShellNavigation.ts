'use client';

/**
 * Navigation glue for the platform shell.
 *
 *   - Optimistic-path state — instant nav highlight on click; cleared once
 *     the real `pathname` catches up.
 *   - Route prefetch — production: bundled at +1s; dev: staggered every 4s
 *     so Turbopack isn't fighting itself.
 *   - `handleNavigate` / `handleSecondaryTabChange` / `handleModeChange` —
 *     all wrap `startTransition` + optimistic path update, with editor-mode
 *     preservation for `/components/...` routes.
 *
 * Route classification (`currentSection`, `isEditorRoute`) is derived from
 * the displayed path so callers don't have to thread it back into the hook.
 */

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAVIGATION_MODES } from '@/config/navigation';
import type { PlatformModeId } from '@oneui/ui/components/Platform';

const PREFETCH_ROUTES = [
  '/brand/overview',
  '/foundations/color',
  '/foundations/typography',
  '/foundations/surfaces',
  '/foundations/dimension',
  '/foundations/shapes',
  '/foundations/strokes',
  '/foundations/elevation',
  '/foundations/motion',
  '/foundations/icons',
  '/components',
  '/create/projects',
];

const DEV_WARMUP_ROUTES = [
  '/foundations/surfaces',
  '/foundations/color',
  '/foundations/appearance',
  '/brand/overview',
  '/components',
  '/components/button',
  '/components/button/editor',
  '/foundations/typography',
  '/foundations/icons',
];

interface RouteParts {
  pathParts: string[];
  currentSection: string | undefined;
  currentSubSection: string | undefined;
  thirdPart: string | undefined;
  isEditorRoute: boolean;
  // Derived section flags used by the shell render tree.
  isAgentsToneOfVoice: boolean;
  isAgentsDesignComposition: boolean;
  isChatSection: boolean;
  isComponentsSection: boolean;
  isCreateSection: boolean;
  isVoicePlayground: boolean;
  showSecondaryNav: boolean;
}

interface UseShellNavigationResult extends RouteParts {
  pathname: string;
  displayedPath: string;
  isNavigating: boolean;
  optimisticPath: string | null;
  setOptimisticPath: (path: string | null) => void;
  clearOptimisticPath: () => void;
  handleNavigate: (path: string) => void;
  handleSecondaryTabChange: (tabId: string) => void;
  handleModeChange: (mode: PlatformModeId) => void;
}

export function useShellNavigation(): UseShellNavigationResult {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    if (optimisticPath && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  const displayedPath = optimisticPath || pathname;
  const isNavigating = isPending || (optimisticPath !== null && optimisticPath !== pathname);
  const clearOptimisticPath = useCallback(() => setOptimisticPath(null), []);

  const routeParts = useMemo<RouteParts>(() => {
    const pathParts = displayedPath.split('/');
    const currentSection = pathParts[1];
    const currentSubSection = pathParts[2];
    const thirdPart = pathParts[3];
    const isAgentsToneOfVoice =
      currentSection === 'agents' && currentSubSection === 'tone-of-voice';
    const isAgentsDesignComposition =
      currentSection === 'agents' && currentSubSection === 'design-composition';
    const isChatSection = currentSection === 'chat';
    const isComponentsSection = currentSection === 'components';
    const isCreateSection = currentSection === 'create';
    const isVoicePlayground = isAgentsToneOfVoice && thirdPart === 'playground';
    const showSecondaryNav =
      currentSection === 'brand' ||
      currentSection === 'foundations' ||
      isComponentsSection ||
      isCreateSection ||
      isAgentsToneOfVoice ||
      isAgentsDesignComposition ||
      isChatSection;
    return {
      pathParts,
      currentSection,
      currentSubSection,
      thirdPart,
      isEditorRoute: thirdPart === 'editor',
      isAgentsToneOfVoice,
      isAgentsDesignComposition,
      isChatSection,
      isComponentsSection,
      isCreateSection,
      isVoicePlayground,
      showSecondaryNav,
    };
  }, [displayedPath]);

  const { isEditorRoute, currentSection } = routeParts;

  // Route prefetch — production: bundle; dev: opt-in via NEXT_PUBLIC_DEV_ROUTE_WARMUP=1.
  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const devWarmupEnabled = process.env.NEXT_PUBLIC_DEV_ROUTE_WARMUP === '1';
    const routes = isProd ? PREFETCH_ROUTES : (devWarmupEnabled ? DEV_WARMUP_ROUTES : []);
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (routes.length === 0) return undefined;

    if (isProd) {
      timers.push(
        setTimeout(() => {
          routes.forEach((route) => {
            if (route !== pathname) router.prefetch(route);
          });
        }, 1000),
      );
    } else {
      routes.forEach((route, i) => {
        if (route !== pathname) {
          timers.push(setTimeout(() => router.prefetch(route), 3000 + i * 4000));
        }
      });
    }

    return () => timers.forEach(clearTimeout);
  }, [router, pathname]);

  const handleNavigate = useCallback(
    (path: string) => {
      const targetPath =
        isEditorRoute && path.startsWith('/components/') && !path.includes('/editor')
          ? `${path}/editor`
          : path;
      setOptimisticPath(targetPath);
      startTransition(() => {
        router.push(targetPath);
      });
    },
    [router, startTransition, isEditorRoute],
  );

  const handleModeChange = useCallback(
    (mode: PlatformModeId) => {
      const landing = NAVIGATION_MODES[mode].landingRoute;
      setOptimisticPath(landing);
      startTransition(() => {
        router.push(landing);
      });
    },
    [router, startTransition],
  );

  const handleSecondaryTabChange = useCallback(
    (tabId: string) => {
      const isGlobalComponentTheme = currentSection === 'components' && tabId === 'global';
      const suffix =
        currentSection === 'components' && isEditorRoute && !isGlobalComponentTheme
          ? '/editor'
          : '';
      const newPath = isGlobalComponentTheme ? '/components' : `/${currentSection}/${tabId}${suffix}`;
      setOptimisticPath(newPath);
      startTransition(() => {
        router.push(newPath);
      });
    },
    [router, currentSection, isEditorRoute, startTransition],
  );

  return {
    pathname,
    displayedPath,
    isNavigating,
    optimisticPath,
    setOptimisticPath,
    clearOptimisticPath,
    ...routeParts,
    handleNavigate,
    handleSecondaryTabChange,
    handleModeChange,
  };
}
