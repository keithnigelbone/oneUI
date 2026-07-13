import {
  buildAvailableScales,
  generateGridCSS,
  generateMaterialAssignmentCSS,
  generateMetallicMaterialCSS,
  generateMotionCSS,
  validateBrandCSSSignature,
  validateSurfaceContextCSS,
  wrapCSSForInjection,
} from '@oneui/shared/engine';
import { generateFontRenderingCSS } from '@oneui/shared';
import {
  buildNewPaletteData,
  generateNewAppearanceRedirectCSS,
  generateNewContextBoundaryCSS,
  generateNewContextCSS,
  generateNewRootCSS,
  generateNewStepLookupCSSSplit,
  generateNewTransparentCSS,
} from '@oneui/ui-internal/engine/computeNewStacking';
import {
  generateGoogleFontImports,
  generateTypographyFontCSS,
  generateTypographyFontCSSV2,
  generateTypographyScriptContextCSS,
} from '@oneui/ui-internal/utils/foundationCSS';

type FoundationData = Record<string, unknown> | undefined | null;

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function child(
  source: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  return record(source?.[key]);
}

/**
 * Server-side mirror of the brand CSS path used by `useBrandCSS`.
 *
 * `/internal/render-ast` is embedded in a strict sandboxed iframe, so relying on
 * client-side Convex queries inside the iframe can leave the preview on raw
 * black/white fallback tokens. This generates the initial foundation CSS on the
 * server and inlines it with the render page before the AST paints.
 */
export function generateInitialRenderBrandCSS(
  foundationData: FoundationData,
  theme: 'light' | 'dark',
): string {
  if (!foundationData) return '';

  const colorConfig = child(foundationData, 'color')?.config;
  const presetSelection = foundationData.presetSelection;
  const appearanceConfig = foundationData.appearanceConfig;
  const typographyConfig = child(foundationData, 'typography')?.config;
  const typographyConfigRecord = record(typographyConfig);
  const topLevelTypographyV2 = foundationData.typographyV2;
  const resolvedTypographyV2 = typographyConfigRecord?.typographyV2 ?? topLevelTypographyV2;
  const customFonts = foundationData.customFonts;
  const motionConfig = child(foundationData, 'motion')?.config;
  const gridConfig = child(foundationData, 'grid')?.config;
  const materialConfig = foundationData.materialConfig;

  const availableScales = buildAvailableScales(
    colorConfig as Parameters<typeof buildAvailableScales>[0],
    presetSelection as Parameters<typeof buildAvailableScales>[1],
  );
  const paletteData = buildNewPaletteData(
    availableScales,
    appearanceConfig as Parameters<typeof buildNewPaletteData>[1],
  );
  if (!paletteData) return '';

  const surfaceCSS = generateNewRootCSS(paletteData, theme);
  const surfaceContextCSS = generateNewContextCSS(paletteData, theme);
  const stepLookup = generateNewStepLookupCSSSplit(paletteData);
  const appearanceRedirectCSS = generateNewAppearanceRedirectCSS(paletteData);
  const contextBoundaryCSS = generateNewContextBoundaryCSS(paletteData);
  const transparentMaterialCSS = generateNewTransparentCSS(paletteData, theme);

  const mergedTypographyConfig =
    resolvedTypographyV2 || typographyConfig
      ? { ...(typographyConfigRecord ?? {}), typographyV2: resolvedTypographyV2 }
      : null;
  const typographyCSS = resolvedTypographyV2
    ? generateTypographyFontCSSV2(
        mergedTypographyConfig as Parameters<typeof generateTypographyFontCSSV2>[0],
        customFonts as Parameters<typeof generateTypographyFontCSSV2>[1],
      )
    : generateTypographyFontCSS(
        typographyConfig as Parameters<typeof generateTypographyFontCSS>[0],
        customFonts as Parameters<typeof generateTypographyFontCSS>[1],
      );
  const renderingCSS = resolvedTypographyV2
    ? generateFontRenderingCSS(
        resolvedTypographyV2 as Parameters<typeof generateFontRenderingCSS>[0],
      )
    : '';
  const typographyScriptCSS = resolvedTypographyV2
    ? generateTypographyScriptContextCSS(
        resolvedTypographyV2 as Parameters<typeof generateTypographyScriptContextCSS>[0],
      )
    : '';

  const motionCSS = generateMotionCSS(
    (motionConfig ?? null) as Parameters<typeof generateMotionCSS>[0],
  );
  const materialCSS = generateMetallicMaterialCSS(
    (materialConfig ?? null) as Parameters<typeof generateMetallicMaterialCSS>[0],
  );
  const materialAssignmentCSS = generateMaterialAssignmentCSS(
    (appearanceConfig ?? null) as Parameters<typeof generateMaterialAssignmentCSS>[0],
    (materialConfig ?? null) as Parameters<typeof generateMaterialAssignmentCSS>[1],
  );
  const logoCSS = paletteData.logoCSS;

  const rawCSS = [
    typographyCSS,
    surfaceCSS,
    motionCSS,
    materialCSS,
    materialAssignmentCSS,
    logoCSS,
  ]
    .filter(Boolean)
    .join('\n  ');
  if (!rawCSS) return '';

  const signature = validateBrandCSSSignature(rawCSS);
  if (!signature.valid) return '';

  if (process.env.NODE_ENV === 'development' && surfaceContextCSS) {
    const contextValidation = validateSurfaceContextCSS(surfaceContextCSS);
    if (!contextValidation.valid) {
      console.warn(
        '[render-ast] Surface context CSS has disallowed tokens:',
        contextValidation.disallowedTokens,
      );
    }
  }

  const gridCSS = generateGridCSS(
    (gridConfig ?? null) as Parameters<typeof generateGridCSS>[0],
  );
  const additionalBlocks = [
    surfaceContextCSS,
    stepLookup.dynamicCSS,
    stepLookup.staticCSS,
    appearanceRedirectCSS,
    contextBoundaryCSS,
    transparentMaterialCSS,
    renderingCSS,
    typographyScriptCSS,
    gridCSS,
  ]
    .filter(Boolean)
    .join('\n');
  const wrapped = wrapCSSForInjection(rawCSS, 'global', additionalBlocks || undefined);
  const googleFontImports = generateGoogleFontImports(
    mergedTypographyConfig as Parameters<typeof generateGoogleFontImports>[0],
  );
  return googleFontImports ? `${googleFontImports}\n${wrapped}` : wrapped;
}
