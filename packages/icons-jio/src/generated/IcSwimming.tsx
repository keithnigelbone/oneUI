import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSwimming = forwardRef<SVGSVGElement, IconComponentProps>(function IcSwimming(
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
            d="M21 17a5.7 5.7 0 0 0-2.66.59 3.8 3.8 0 0 1-1.84.41 3.84 3.84 0 0 1-1.85-.41A5.66 5.66 0 0 0 12 17a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 7.5 18a3.84 3.84 0 0 1-1.85-.41A5.6 5.6 0 0 0 3 17a1 1 0 0 0 0 2 3.8 3.8 0 0 1 1.84.41c.826.41 1.739.613 2.66.59a5.66 5.66 0 0 0 2.65-.59A3.84 3.84 0 0 1 12 19a3.8 3.8 0 0 1 1.84.41c.825.41 1.739.613 2.66.59a5.7 5.7 0 0 0 2.66-.59A3.8 3.8 0 0 1 21 19a1 1 0 0 0 0-2M8 7h1.59a2 2 0 0 1 1.55.73l1.63 1.89-2.26 1.5A9 9 0 0 1 12 11a7.64 7.64 0 0 1 3.46.76 2 2 0 0 0 1 .24 1.84 1.84 0 0 0 .83-.15l-4.62-5.41A4 4 0 0 0 9.59 5H8a1 1 0 1 0 0 2m9.5 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M3 15a3.8 3.8 0 0 1 1.84.41c.826.41 1.739.613 2.66.59a5.66 5.66 0 0 0 2.65-.59A3.84 3.84 0 0 1 12 15a3.8 3.8 0 0 1 1.84.41c.825.41 1.739.613 2.66.59a5.7 5.7 0 0 0 2.66-.59A3.8 3.8 0 0 1 21 15a1 1 0 0 0 0-2 5.7 5.7 0 0 0-2.66.59 3.8 3.8 0 0 1-1.84.41 3.84 3.84 0 0 1-1.85-.41A5.66 5.66 0 0 0 12 13a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 7.5 14a3.84 3.84 0 0 1-1.85-.41A5.6 5.6 0 0 0 3 13a1 1 0 0 0 0 2"
          />
    </svg>
  );
});

IcSwimming.displayName = 'IcSwimming';
