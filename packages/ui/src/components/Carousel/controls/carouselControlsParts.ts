/**
 * carouselControlsParts.ts — detect / tag Carousel control sub-parts for layout.
 */

import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

export type CarouselControlPartKind =
  | 'pagination'
  | 'selection-rail'
  | 'nav-prev'
  | 'nav-next'
  | 'play';

const CONTROL_PART = Symbol('carouselControlPart');

export function tagCarouselControlPart<P>(
  component: (props: P) => React.ReactElement | null,
  kind: CarouselControlPartKind,
): (props: P) => React.ReactElement | null {
  (component as unknown as Record<symbol, CarouselControlPartKind>)[CONTROL_PART] = kind;
  return component;
}

export function getCarouselControlPartKind(
  child: ReactElement,
): CarouselControlPartKind | undefined {
  const type = child.type as unknown as Record<symbol, CarouselControlPartKind>;
  return type[CONTROL_PART];
}

export function isCarouselSelectionRailChild(child: ReactNode): child is ReactElement {
  return isValidElement(child) && getCarouselControlPartKind(child) === 'selection-rail';
}

export function hasSelectionRailChild(children: ReactNode[]): boolean {
  return children.some((child) => isValidElement(child) && isCarouselSelectionRailChild(child));
}

export function hasNavArrowChild(children: ReactNode[]): boolean {
  return children.some((child) => {
    if (!isValidElement(child)) return false;
    const kind = getCarouselControlPartKind(child);
    return kind === 'nav-prev' || kind === 'nav-next';
  });
}

/** On-media: rail first, then dots, then nav, then play (Figma `2818:50556`). */
export function orderOnMediaControlChildren(children: ReactNode[]): ReactNode[] {
  const rails: ReactNode[] = [];
  const dots: ReactNode[] = [];
  const nav: ReactNode[] = [];
  const play: ReactNode[] = [];
  const rest: ReactNode[] = [];

  children.forEach((child) => {
    if (!isValidElement(child)) {
      rest.push(child);
      return;
    }
    const kind = getCarouselControlPartKind(child);
    if (kind === 'selection-rail') rails.push(child);
    else if (kind === 'pagination') dots.push(child);
    else if (kind === 'nav-prev' || kind === 'nav-next') nav.push(child);
    else if (kind === 'play') play.push(child);
    else rest.push(child);
  });

  return [...rails, ...dots, ...nav, ...play, ...rest];
}
