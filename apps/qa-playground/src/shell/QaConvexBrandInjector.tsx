/**
 * Same pattern as `apps/button-figma-validation/src/ConvexBrandInjector.tsx` and
 * Storybook `BrandStyleDecorator`: Convex foundations + dimensions + component overrides.
 */

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type {
  DecorationConfig,
  PlatformsFoundationConfig,
  SubBrandAccentFields,
} from '@oneui/shared';
import { applySubBrandAccentsToFoundation, generateDimensionCSS } from '@oneui/shared';
import { BrandLogoContext } from '@oneui-ui-internals/contexts/BrandLogoContext';
import { DecorationProvider } from '@oneui-ui-internals/hooks/useDecorationContext';
import { useBrandCSS } from '@oneui-ui-internals/hooks/useBrandCSS';
import { useBrandFonts } from '@oneui-ui-internals/hooks/useBrandFonts';
import { useStyleInjection } from '@oneui-ui-internals/hooks/useStyleInjection';
import { buildAllComponentCSS, type ComponentOverrideData } from '@oneui-ui-internals/utils/buildComponentOverrideCSS';

const MAIN_STYLE_ID = 'oneui-foundation-tokens';
const DIMENSION_STYLE_ID = 'qa-playground-dimension-tokens';
const COMPONENT_STYLE_ID = 'qa-playground-component-tokens';

export function QaConvexBrandInjector({
  brandId,
  subBrandId,
  theme = 'light',
  children,
}: {
  brandId: string;
  subBrandId?: string;
  theme?: 'light' | 'dark';
  children?: ReactNode;
}) {
  const typedBrandId = brandId as Id<'brands'>;

  const baseFoundationData = useQuery(api.foundations.getBrandOverviewData, { brandId: typedBrandId });
  const subBrand = useQuery(
    api.subBrandConfigs.getById,
    subBrandId ? { id: subBrandId as Id<'subBrandConfigs'> } : 'skip',
  );
  const foundationData = useMemo(
    () =>
      applySubBrandAccentsToFoundation(
        baseFoundationData,
        (subBrand ?? null) as SubBrandAccentFields | null,
      ),
    [baseFoundationData, subBrand],
  );
  const brandData = useQuery(api.brands.get, { id: typedBrandId });

  const decorations: DecorationConfig[] | undefined = foundationData?.decorations as
    | DecorationConfig[]
    | undefined;

  const { cssContent } = useBrandCSS({
    foundationData,
    theme,
    injectionMode: 'global',
    decorations,
  });

  const previousCSSRef = useRef<string>(
    typeof document !== 'undefined'
      ? (document.getElementById(MAIN_STYLE_ID) as HTMLStyleElement | null)?.textContent ?? ''
      : '',
  );
  const effectiveCSS = cssContent ?? previousCSSRef.current;
  useEffect(() => {
    if (cssContent !== null) previousCSSRef.current = cssContent;
  }, [cssContent]);

  useStyleInjection(MAIN_STYLE_ID, effectiveCSS);

  const platformsConfig = foundationData?.platforms?.config as PlatformsFoundationConfig | undefined;
  const dimensionCSS = useMemo(() => {
    if (!platformsConfig) return '';
    const blocks = generateDimensionCSS(platformsConfig);
    if (!blocks) return '';
    return `@layer brand {\n${blocks}\n}`;
  }, [platformsConfig]);
  useStyleInjection(DIMENSION_STYLE_ID, dimensionCSS);

  useBrandFonts(foundationData);

  const decorationMap = useMemo(() => {
    const map = new Map<string, DecorationConfig>();
    if (decorations) {
      for (const d of decorations) {
        map.set(d.componentName, d);
      }
    }
    return map;
  }, [decorations]);

  const brandLogoValue = useMemo(
    () => ({
      logoSvg: brandData?.logoSvg ?? undefined,
      brandName: brandData?.name ?? undefined,
    }),
    [brandData?.logoSvg, brandData?.name],
  );

  useEffect(
    () => () => {
      for (const id of [DIMENSION_STYLE_ID, COMPONENT_STYLE_ID]) {
        document.getElementById(id)?.remove();
      }
    },
    [],
  );

  return (
    <BrandLogoContext.Provider value={brandLogoValue}>
      <DecorationProvider decorations={decorationMap}>
        <QaComponentOverrideInjector brandId={typedBrandId} />
        {children}
      </DecorationProvider>
    </BrandLogoContext.Provider>
  );
}

function QaComponentOverrideInjector({ brandId }: { brandId: Id<'brands'> }) {
  const componentData = useQuery(api.componentTokenOverrides.getAllBrandComponentData, { brandId });

  const cssContent = useMemo(() => {
    if (!componentData) return null;
    return buildAllComponentCSS(componentData as ComponentOverrideData) || '';
  }, [componentData]);

  const previousRef = useRef('');
  const effectiveCSS = cssContent ?? previousRef.current;
  useEffect(() => {
    if (cssContent !== null) previousRef.current = cssContent;
  }, [cssContent]);

  useStyleInjection(COMPONENT_STYLE_ID, effectiveCSS);

  return null;
}
