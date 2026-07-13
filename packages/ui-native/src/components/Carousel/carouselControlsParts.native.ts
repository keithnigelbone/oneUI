/**
 * carouselControlsParts.native.ts — detect compound control children for layout filtering.
 *
 * Components declare `carouselControlPart` (static + optional prop) instead of
 * WeakSet registration so wrapped consumers can forward the part id.
 */

import { isValidElement, type ReactElement, type ReactNode } from 'react';

export type CarouselControlPart = 'nav-prev' | 'nav-next' | 'selection-rail';

/** Prop / static key for carousel control slot identification. */
export const CAROUSEL_CONTROL_PART = 'carouselControlPart' as const;

export interface CarouselControlPartProps {
  [CAROUSEL_CONTROL_PART]?: CarouselControlPart;
}

type TaggedComponent = { carouselControlPart?: CarouselControlPart };

function unwrapComponentType(type: unknown): unknown {
  if (typeof type !== 'object' || type === null) return type;
  const tagged = type as { render?: unknown; type?: unknown };
  return tagged.render ?? tagged.type ?? type;
}

export function resolveCarouselControlPart(
  type: unknown,
  props?: object,
): CarouselControlPart | undefined {
  if (props && CAROUSEL_CONTROL_PART in props) {
    return (props as CarouselControlPartProps)[CAROUSEL_CONTROL_PART];
  }
  const resolved = unwrapComponentType(type);
  if (typeof resolved === 'function' || typeof resolved === 'object') {
    const part = (resolved as TaggedComponent).carouselControlPart;
    if (part) return part;
  }
  if (resolved !== type) {
    return resolveCarouselControlPart(resolved, props);
  }
  return undefined;
}

/** Tag a carousel sub-component so Controls can filter / order it. */
export function tagCarouselControlPart<P extends object>(
  component: P,
  part: CarouselControlPart,
): P {
  (component as TaggedComponent).carouselControlPart = part;
  return component;
}

/** @deprecated Use {@link tagCarouselControlPart}. */
export function markCarouselNavButton(component: object): void {
  tagCarouselControlPart(component as object, 'nav-prev');
}

/** @deprecated Use {@link tagCarouselControlPart}. */
export function markCarouselSelectionRail(component: object): void {
  tagCarouselControlPart(component as object, 'selection-rail');
}

function isCarouselNavPart(part: CarouselControlPart | undefined): boolean {
  return part === 'nav-prev' || part === 'nav-next';
}

function isCarouselSelectionRailPart(part: CarouselControlPart | undefined): boolean {
  return part === 'selection-rail';
}

export function isCarouselNavArrowChild(child: ReactNode): child is ReactElement {
  if (!isValidElement(child)) return false;
  return isCarouselNavPart(resolveCarouselControlPart(child.type, child.props as object));
}

/** Whether any nav-arrow child (`Carousel.PrevButton` / `NextButton`) is present. */
export function hasNavArrowChild(children: ReactNode[]): boolean {
  return children.some(isCarouselNavArrowChild);
}

export function isCarouselSelectionRailChild(child: ReactNode): child is ReactElement {
  if (!isValidElement(child)) return false;
  return isCarouselSelectionRailPart(resolveCarouselControlPart(child.type, child.props as object));
}

export function isOnMediaSelectionRailChild(child: ReactNode): boolean {
  return (
    isCarouselSelectionRailChild(child) &&
    (child.props as { onMedia?: boolean }).onMedia !== false
  );
}

export function isBelowMediaSelectionRailChild(child: ReactNode): boolean {
  return (
    isCarouselSelectionRailChild(child) &&
    (child.props as { onMedia?: boolean }).onMedia === false
  );
}

/** Figma rail sits below content — render selection rail after other on-media controls. */
export function orderOnMediaControlChildren(children: ReactNode[]): ReactNode[] {
  const leading: ReactNode[] = [];
  const rails: ReactNode[] = [];
  for (const child of children) {
    if (isCarouselSelectionRailChild(child)) {
      rails.push(child);
    } else {
      leading.push(child);
    }
  }
  return [...leading, ...rails];
}

/**
 * Whether ANY selection rail child is present, regardless of its `onMedia` prop.
 * The rail's on-media vs below-media presentation is derived from the parent
 * `Carousel.Controls` `placement`, so detection must be placement-driven.
 */
export function hasSelectionRailChild(children: ReactNode[]): boolean {
  return children.some(isCarouselSelectionRailChild);
}

export function hasOnMediaSelectionRailChild(children: ReactNode[]): boolean {
  return children.some(isOnMediaSelectionRailChild);
}

export function hasBelowMediaSelectionRailChild(children: ReactNode[]): boolean {
  return children.some(isBelowMediaSelectionRailChild);
}
