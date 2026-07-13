import { useLayoutEffect, type ReactNode } from 'react';

/**
 * Matches platform Storybook dimension axes so spacing / typography tokens resolve.
 */
export function RootShell({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-Breakpoint', 'L');
    root.setAttribute('data-6-Density', 'default');
    root.setAttribute('data-density', 'default');
    if (!root.getAttribute('data-mode')) {
      root.setAttribute('data-mode', 'light');
    }
  }, []);

  return children;
}
