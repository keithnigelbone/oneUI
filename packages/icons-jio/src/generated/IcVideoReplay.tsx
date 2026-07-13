import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVideoReplay = forwardRef<SVGSVGElement, IconComponentProps>(function IcVideoReplay(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M21.78 8.21a1.508 1.508 0 0 0-1.42-.7c-.28.03-.54.13-.77.29l-2.6 2V9c0-.8-.32-1.56-.88-2.12S14.78 6 13.99 6H5c-.8 0-1.56.32-2.12.88S2 8.21 2 9v6c0 .8.32 1.56.88 2.12S4.21 18 5 18h9c.8 0 1.56-.32 2.12-.88S17 15.79 17 15v-.75l2.6 1.95c.22.17.49.27.77.29a1.51 1.51 0 0 0 1.42-.7c.15-.24.22-.51.22-.79V9c0-.28-.08-.55-.22-.79zM9.5 16c-.88 0-1.7-.29-2.39-.81v.04c0 .1-.07.19-.14.26-.2.2-.55.19-.74 0-.1-.1-.15-.23-.15-.37v-1.16c0-.14.06-.27.15-.37.1-.1.23-.15.37-.15h1.16c.14 0 .27.06.37.15.1.1.15.23.15.37s-.06.27-.15.37c-.08.07-.17.13-.27.14h-.04c.49.34 1.07.52 1.69.52 1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.32 0-2.5.88-2.88 2.14a.51.51 0 0 1-.62.34.505.505 0 0 1-.34-.62A4.03 4.03 0 0 1 9.5 7.99c2.21 0 4 1.79 4 4s-1.79 4-4 4z"
          />
    </svg>
  );
});

IcVideoReplay.displayName = 'IcVideoReplay';
