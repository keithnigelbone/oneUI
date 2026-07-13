import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChildrenGame = forwardRef<SVGSVGElement, IconComponentProps>(function IcChildrenGame(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-3 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4M7 8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zm4.14 7.39-.75 1.25a.75.75 0 0 1-.64.36h-1.5a.75.75 0 0 1-.64-.36l-.75-1.25a.73.73 0 0 1 0-.78l.75-1.25a.75.75 0 0 1 .64-.36h1.5a.75.75 0 0 1 .64.36l.75 1.25a.73.73 0 0 1 0 .78M17 16.63a.74.74 0 0 1-.64.37h-2.74a.74.74 0 0 1-.64-1.11l1.37-2.5a.79.79 0 0 1 1.32 0l1.33 2.5a.73.73 0 0 1 0 .74"
          />
    </svg>
  );
});

IcChildrenGame.displayName = 'IcChildrenGame';
