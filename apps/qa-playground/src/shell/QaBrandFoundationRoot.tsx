import { useEffect, useRef, type ReactNode } from 'react';

import { useBrandCSS } from '@oneui-ui-internals/hooks/useBrandCSS';
import { useStyleInjection } from '@oneui-ui-internals/hooks/useStyleInjection';

const STYLE_ELEMENT_ID = 'oneui-foundation-tokens';

/**
 * Static foundation so roles resolve (same purple-primary parity shape as
 * `apps/button-figma-validation` / Storybook tests). No Convex required.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QA_PLAYGROUND_FOUNDATION: Record<string, any> = {
  color: {
    config: {
      brandScales: [
        { name: 'Brand', source: 'custom' as const, baseColor: '#3900AD' },
        { name: 'Secondary', source: 'custom' as const, baseColor: '#5C4DFF' },
        { name: 'Neutral', source: 'custom' as const, baseColor: '#6B6B7B' },
        { name: 'Positive', source: 'custom' as const, baseColor: '#008A3A' },
        { name: 'Negative', source: 'custom' as const, baseColor: '#C62828' },
      ],
    },
  },
  appearanceConfig: {
    accentCount: 5,
    background: {
      scaleName: 'Neutral',
      backgroundStep: { light: 2500, dark: 200 },
    },
    accents: [
      { role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: 1500 },
      { role: 'secondary', label: 'Secondary', scaleName: 'Secondary', baseStep: 1500 },
      { role: 'neutral', label: 'Neutral', scaleName: 'Neutral', baseStep: 1500 },
      { role: 'positive', label: 'Positive', scaleName: 'Positive', baseStep: 1500 },
      { role: 'negative', label: 'Negative', scaleName: 'Negative', baseStep: 1500 },
    ],
  },
  presetSelection: null,
  typography: undefined,
  motion: undefined,
};

export function QaBrandFoundationRoot({ children }: { children: ReactNode }) {
  const { cssContent } = useBrandCSS({
    foundationData: QA_PLAYGROUND_FOUNDATION,
    theme: 'light',
    injectionMode: 'global',
  });

  const previousCSSRef = useRef('');
  const effectiveCSS = cssContent ?? previousCSSRef.current;
  useEffect(() => {
    if (cssContent !== null && cssContent !== undefined) {
      previousCSSRef.current = cssContent;
    }
  }, [cssContent]);

  useStyleInjection(STYLE_ELEMENT_ID, effectiveCSS);

  return <>{children}</>;
}
