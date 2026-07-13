import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { ScrimProps } from '../Scrim/Scrim.shared';

export type CarouselAlign = 'start' | 'center' | 'end';

export interface CarouselOpts {
  /** Wrap from last → first slide (default: false). */
  loop?: boolean;
  /** Slide alignment within the viewport (default: 'start'). */
  align?: CarouselAlign;
  /** Allow free dragging without snap (default: false). */
  dragFree?: boolean;
  /** Number of slides moved per scrollPrev/Next (default: 1). */
  slidesToScroll?: number | 'auto';
  /** Whether dragging is enabled (default: true). */
  watchDrag?: boolean;
  /** Direction of the track (default: 'ltr'). */
  direction?: 'ltr' | 'rtl';
  /** How much of the adjacent slide(s) to peek into the viewport. */
  peek?: 'none' | 'prev' | 'next' | 'both';
  /** Number of slides visible per view (drives CSS flex-basis). */
  slidesPerView?: number;
}

export type CarouselAlignment =
  | 'startBottom'
  | 'startMiddle'
  | 'middleBottom'
  | 'middleMiddle'
  | 'middleTop';

export type CarouselImageAspectRatio =
  | '1:2'
  | '9:16'
  | '3:4'
  | '1:1'
  | '4:3'
  | '5:3'
  | '16:9'
  | '2:1'
  | '21:9'
  | 'flexible';

/** Figma `.CarouselImage/*` variants in design-file order (plus `flexible` = auto). */
export const CAROUSEL_IMAGE_ASPECT_RATIOS = [
  '1:2',
  '9:16',
  '3:4',
  '1:1',
  '4:3',
  '5:3',
  '16:9',
  '2:1',
  '21:9',
  'flexible',
] as const satisfies readonly CarouselImageAspectRatio[];

/** Web default — desktop/tablet hero frame (`16:9`). */
export const CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO = '16:9' as const satisfies CarouselImageAspectRatio;

/** @deprecated Use {@link CarouselImageAspectRatio} — ratios belong on `Slide` / `Slide.Image`. */
export type CarouselAspectRatio = CarouselImageAspectRatio;

/** @deprecated Use {@link CAROUSEL_IMAGE_ASPECT_RATIOS}. */
export const CAROUSEL_ASPECT_RATIOS = CAROUSEL_IMAGE_ASPECT_RATIOS;

/** Figma height axis — `followsAspectRatio` vs fixed `custom` height. */
export type CarouselHeightMode = 'followsAspectRatio' | 'custom';

/**
 * Author-facing boolean mapped to {@link CarouselHeightMode}.
 * `true` (default) → aspect-ratio drives slide height; `false` → use `height` prop.
 */
export type CarouselFollowsAspectRatio = boolean;

/** @deprecated Use {@link CarouselFollowsAspectRatio} — JSON/PDF name is `followsAspectRatio`. */
export type CarouselFollowAspectRatio = CarouselFollowsAspectRatio;

/** Figma `contentWidth` — 12-column grid vocabulary (`fill | s | m | l`). */
export type CarouselContentWidth = 'fill' | 's' | 'm' | 'l';

export type CarouselButtonOrientation = 'horizontal' | 'vertical';

/** Figma `buttonWidth`. */
export type CarouselButtonWidth = 'hug' | 'wide';

/**
 * @deprecated React-only alias — maps to `wide`. Not in Figma JSON.
 */
export type CarouselButtonWidthAlias = 'fill';

/** Figma scrim `position` vocabulary (preserve `centre` spelling). */
export type CarouselScrimPosition = 'bottom' | 'start' | 'top' | 'end' | 'centre';

export type CarouselCornerPlacement = 'start' | 'end';

export type CarouselControlsPlacement = 'below' | 'onMedia';

export type CarouselControlsLayout = 'center' | 'split';

/** Figma `controlsType` — preset control chrome for platform wrappers. */
export type CarouselControlsType =
  | 'none'
  | 'pagination'
  | 'paginationOnMedia'
  | 'selectionRail'
  | 'selectionRailOnMedia';

/** Figma `paginationDots` position — on-media only. */
export type CarouselPaginationAlign = 'start' | 'middle' | 'end';

export type CarouselPlatform = 'desktop' | 'tablet' | 'mobile';

export type CarouselSurface = SurfaceToken;

/** Canonical multi-accent appearance type — re-exported for convenience. */
export type CarouselAppearance = ComponentAppearance;

export type { ComponentAppearance };

// INTENTIONAL-LITERAL: Figma `2775:10379` mobile carousel frame height fallback.
export const CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT = 480;

// INTENTIONAL-LITERAL: floor for author-supplied flexible heights.
export const CAROUSEL_FLEXIBLE_HEIGHT_MIN = 300;

const IMAGE_ASPECT_RATIO_MAP: Record<Exclude<CarouselImageAspectRatio, 'flexible'>, string> = {
  '1:2': '1 / 2',
  '9:16': '9 / 16',
  '3:4': '3 / 4',
  '1:1': '1 / 1',
  '4:3': '4 / 3',
  '5:3': '5 / 3',
  '16:9': '16 / 9',
  '2:1': '2 / 1',
  '21:9': '21 / 9',
};

/** CSS `aspect-ratio` value for a fixed ratio token, or `undefined` for flexible. */
export function resolveCarouselImageAspectRatioCSSValue(
  ratio: CarouselImageAspectRatio,
): string | undefined {
  if (ratio === 'flexible') return undefined;
  return IMAGE_ASPECT_RATIO_MAP[ratio];
}

/** @deprecated Use {@link resolveCarouselImageAspectRatioCSSValue}. */
export function resolveCarouselAspectRatioCSSValue(
  ratio: CarouselImageAspectRatio,
): string | undefined {
  return resolveCarouselImageAspectRatioCSSValue(ratio);
}

const CONTENT_WIDTH_PERCENT: Record<CarouselContentWidth, string> = {
  fill: '100%',
  s: '33%',
  m: '50%',
  l: '66%',
};

export function resolveCarouselContentMaxWidth(width: CarouselContentWidth): string {
  return CONTENT_WIDTH_PERCENT[width];
}

/** Figma gradient scrim position derived from `contentAlignment` (variants table). */
export function resolveGradientScrimPositionFromContentAlignment(
  alignment: CarouselAlignment,
): CarouselScrimPosition {
  switch (alignment) {
    case 'startBottom':
    case 'middleBottom':
      return 'bottom';
    case 'startMiddle':
      return 'start';
    case 'middleTop':
      return 'top';
    case 'middleMiddle':
      return 'bottom';
    default:
      return 'start';
  }
}

/** Maps Figma scrim position tokens to {@link Scrim} web primitive positions. */
export function mapCarouselScrimPositionToScrimProps(
  position: CarouselScrimPosition,
): ScrimProps['position'] | 'center' {
  switch (position) {
    case 'start':
      return 'left';
    case 'end':
      return 'right';
    case 'centre':
      return 'center';
    default:
      return position;
  }
}

/** Author-facing scrim props — accepts Figma `position` vocabulary + {@link ScrimProps}. */
export type CarouselSlideScrimConfig = Omit<ScrimProps, 'position'> & {
  position?: CarouselScrimPosition | ScrimProps['position'];
};

/** Slide image scrim — `true` for Figma defaults, or custom config / {@link ScrimProps}. */
export type CarouselSlideScrim = boolean | CarouselSlideScrimConfig | ScrimProps;

function normalizeCarouselSlideScrimConfig(
  scrim: CarouselSlideScrimConfig | ScrimProps,
): ScrimProps {
  if (scrim.variant === 'overlay') {
    return {
      ...scrim,
      variant: 'overlay',
      attention: scrim.attention ?? 'medium',
    };
  }

  const rawPosition = 'position' in scrim ? scrim.position : undefined;
  const figmaPosition =
    rawPosition === 'left'
      ? 'start'
      : rawPosition === 'right'
        ? 'end'
        : rawPosition === 'center'
          ? 'centre'
          : (rawPosition as CarouselScrimPosition | undefined);

  const mappedPosition = figmaPosition
    ? mapCarouselScrimPositionToScrimProps(figmaPosition)
    : 'left';

  return {
    ...scrim,
    variant: scrim.variant ?? 'gradient',
    attention: scrim.attention ?? 'medium',
    position: mappedPosition === 'center' ? undefined : mappedPosition,
    size: 'size' in scrim && scrim.size ? scrim.size : 'm',
  } as ScrimProps;
}

/** Default {@link Scrim} props when `scrim={true}` — Figma attention `medium`, variant `gradient`. */
export function buildCarouselDefaultScrimProps(
  contentAlignment: CarouselAlignment = 'startBottom',
): ScrimProps {
  const figmaPosition = resolveGradientScrimPositionFromContentAlignment(contentAlignment);
  const mapped = mapCarouselScrimPositionToScrimProps(figmaPosition);
  if (mapped === 'center') {
    return { variant: 'overlay', attention: 'medium' };
  }
  return {
    variant: 'gradient',
    attention: 'medium',
    position: mapped,
    size: 'm',
  };
}

/** @deprecated Use {@link buildCarouselDefaultScrimProps}. Legacy high-attention bottom preset. */
export const CAROUSEL_SLIDE_SCRIM_PROPS = buildCarouselDefaultScrimProps('startBottom');

export function resolveCarouselSlideScrimProps(
  scrim: CarouselSlideScrim | undefined,
  contentAlignment?: CarouselAlignment,
): ScrimProps | null {
  if (scrim === false || scrim === undefined) return null;
  if (scrim === true) return buildCarouselDefaultScrimProps(contentAlignment);
  return normalizeCarouselSlideScrimConfig(scrim);
}

/** Accepts Figma `wide` / `hug` plus deprecated React alias `fill` → `wide`. */
export function normalizeCarouselButtonWidth(
  width: CarouselButtonWidth | CarouselButtonWidthAlias,
): CarouselButtonWidth {
  return width === 'fill' ? 'wide' : width;
}

export function resolveCarouselHeightCSSValue(height?: number | string): string {
  if (typeof height === 'number') {
    return `${resolveCarouselFlexibleSlideHeight(height)}px`;
  }
  if (typeof height === 'string' && height.trim()) return height;
  return `${CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT}px`;
}

export function resolveCarouselHeightMode(
  followsAspectRatio: CarouselFollowsAspectRatio | undefined,
): CarouselHeightMode {
  return followsAspectRatio === false ? 'custom' : 'followsAspectRatio';
}

/** @deprecated Use {@link resolveCarouselHeightMode} with `followsAspectRatio`. */
export function resolveCarouselHeightModeFromLegacyAlias(
  followAspectRatio: CarouselFollowAspectRatio | undefined,
): CarouselHeightMode {
  return resolveCarouselHeightMode(followAspectRatio);
}

export function resolveCarouselFlexibleSlideHeight(height?: number | string): number {
  if (typeof height === 'string') {
    const parsed = Number.parseInt(height, 10);
    if (Number.isFinite(parsed)) return Math.max(CAROUSEL_FLEXIBLE_HEIGHT_MIN, parsed);
    return CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT;
  }
  const raw = height ?? CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT;
  if (!Number.isFinite(raw)) return CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT;
  const integer = Math.trunc(raw);
  if (integer <= 0) return CAROUSEL_FLEXIBLE_HEIGHT_MIN;
  return Math.max(CAROUSEL_FLEXIBLE_HEIGHT_MIN, integer);
}

export function resolveCarouselLoop(loopProp?: boolean, opts?: CarouselOpts): boolean {
  return loopProp ?? opts?.loop ?? false;
}

export function clampCarouselActivePage(index: number, count: number): number {
  const max = Math.max(0, count - 1);
  return Math.min(Math.max(index, 0), max);
}

/** Figma `activePage` (1-based, min 1) → Embla snap index (0-based). */
export function carouselPageToIndex(page: number, pageCount: number): number {
  if (pageCount <= 0) return 0;
  const clamped = Math.min(Math.max(Math.trunc(page), 1), pageCount);
  return clamped - 1;
}

/** Embla snap index (0-based) → Figma `activePage` (1-based, min 1). */
export function carouselIndexToPage(index: number, pageCount: number): number {
  if (pageCount <= 0) return 1;
  return clampCarouselActivePage(index, pageCount) + 1;
}

/**
 * Figma `controls` gate — `controlsType` applies only when `controls===true`.
 * Returns `null` when controls are hidden (not the same as `controlsType: 'none'`).
 */
export function resolveCarouselControlsGate(
  controls: boolean | undefined,
  controlsType: CarouselControlsType,
): CarouselControlsType | null {
  if (controls !== true) return null;
  return controlsType;
}

export function formatCarouselSlidePosition(position: number, total: number): string {
  return `${position} of ${total}`;
}
