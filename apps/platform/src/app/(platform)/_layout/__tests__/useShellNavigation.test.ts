/**
 * useShellNavigation — route classification, optimistic-path, and handler tests.
 *
 * Pure-logic hook with two external deps:
 *   - next/navigation (usePathname, useRouter) — mocked with controllable state
 *   - @/config/navigation (NAVIGATION_MODES) — imported directly
 *
 * No Convex, no Suspense — straightforward to drive with renderHook + act.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const pathnameRef = { current: '/' };
const routerPush = vi.fn();
const routerPrefetch = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({
    push: routerPush,
    prefetch: routerPrefetch,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { useShellNavigation } from '../useShellNavigation';

beforeEach(() => {
  pathnameRef.current = '/';
  routerPush.mockReset();
  routerPrefetch.mockReset();
});

describe('useShellNavigation — route classification', () => {
  it('treats `/` as the home landing (no section flags set)', () => {
    pathnameRef.current = '/';
    const { result } = renderHook(() => useShellNavigation());
    expect(result.current.currentSection).toBe('');
    expect(result.current.isComponentsSection).toBe(false);
    expect(result.current.isCreateSection).toBe(false);
    expect(result.current.showSecondaryNav).toBe(false);
    expect(result.current.isEditorRoute).toBe(false);
  });

  it('flags components section + editor route', () => {
    pathnameRef.current = '/components/button/editor';
    const { result } = renderHook(() => useShellNavigation());
    expect(result.current.currentSection).toBe('components');
    expect(result.current.currentSubSection).toBe('button');
    expect(result.current.thirdPart).toBe('editor');
    expect(result.current.isComponentsSection).toBe(true);
    expect(result.current.isEditorRoute).toBe(true);
    expect(result.current.showSecondaryNav).toBe(true);
  });

  it('flags agents/tone-of-voice + voice-playground', () => {
    pathnameRef.current = '/agents/tone-of-voice/playground';
    const { result } = renderHook(() => useShellNavigation());
    expect(result.current.isAgentsToneOfVoice).toBe(true);
    expect(result.current.isVoicePlayground).toBe(true);
    expect(result.current.showSecondaryNav).toBe(true);
  });

  it('flags agents/design-composition', () => {
    pathnameRef.current = '/agents/design-composition/skills';
    const { result } = renderHook(() => useShellNavigation());
    expect(result.current.isAgentsDesignComposition).toBe(true);
    expect(result.current.isAgentsToneOfVoice).toBe(false);
    expect(result.current.isVoicePlayground).toBe(false);
  });

  it('shows secondary nav for brand + foundations + create + chat', () => {
    for (const path of ['/brand/overview', '/foundations/color', '/create/projects', '/chat']) {
      pathnameRef.current = path;
      const { result } = renderHook(() => useShellNavigation());
      expect(result.current.showSecondaryNav).toBe(true);
    }
  });

  it('does not show secondary nav on unknown roots', () => {
    pathnameRef.current = '/settings';
    const { result } = renderHook(() => useShellNavigation());
    expect(result.current.showSecondaryNav).toBe(false);
  });
});

describe('useShellNavigation — optimistic path', () => {
  it('handleNavigate sets optimisticPath and calls router.push', () => {
    pathnameRef.current = '/';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleNavigate('/foundations/color');
    });

    expect(result.current.optimisticPath).toBe('/foundations/color');
    expect(result.current.displayedPath).toBe('/foundations/color');
    expect(result.current.isNavigating).toBe(true);
    expect(routerPush).toHaveBeenCalledWith('/foundations/color');
  });

  it('handleNavigate appends /editor when leaving an editor route into a /components/* path', () => {
    pathnameRef.current = '/components/button/editor';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleNavigate('/components/select');
    });

    expect(routerPush).toHaveBeenCalledWith('/components/select/editor');
  });

  it('handleNavigate does NOT append /editor when target already includes /editor', () => {
    pathnameRef.current = '/components/button/editor';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleNavigate('/components/select/editor');
    });

    expect(routerPush).toHaveBeenCalledWith('/components/select/editor');
  });

  it('clearOptimisticPath resets optimistic state', () => {
    pathnameRef.current = '/';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.setOptimisticPath('/brand/overview');
    });
    expect(result.current.optimisticPath).toBe('/brand/overview');

    act(() => {
      result.current.clearOptimisticPath();
    });
    expect(result.current.optimisticPath).toBe(null);
  });
});

describe('useShellNavigation — secondary tab + mode change', () => {
  it('handleSecondaryTabChange builds a path under the current section', () => {
    pathnameRef.current = '/foundations/color';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleSecondaryTabChange('typography');
    });

    expect(routerPush).toHaveBeenCalledWith('/foundations/typography');
  });

  it('handleSecondaryTabChange preserves /editor suffix in components-editor mode', () => {
    pathnameRef.current = '/components/button/editor';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleSecondaryTabChange('select');
    });

    expect(routerPush).toHaveBeenCalledWith('/components/select/editor');
  });

  it('handleModeChange routes to the mode landingRoute', () => {
    pathnameRef.current = '/';
    const { result } = renderHook(() => useShellNavigation());

    act(() => {
      result.current.handleModeChange('system');
    });

    expect(routerPush).toHaveBeenCalledWith('/brand/overview');
    expect(result.current.optimisticPath).toBe('/brand/overview');
  });
});
