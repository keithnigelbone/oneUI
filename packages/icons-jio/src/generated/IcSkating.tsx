import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSkating = forwardRef<SVGSVGElement, IconComponentProps>(function IcSkating(
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
            d="M17.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M20 19h-3v-3.93a3 3 0 0 0-1.34-2.5l-1.89-1.26 2-2.71A1 1 0 0 0 15 7H8a1 1 0 0 0 0 2h5l-4.2 5.6a1 1 0 0 1-.8.4H5v-1a1 1 0 1 0-2 0 1 1 0 0 0 0 2v2a1 1 0 0 0 0 2 1 1 0 1 0 2 0v-3h3a3 3 0 0 0 2.4-1.2l2.17-2.89 2 1.33a1 1 0 0 1 .45.83V19H14a1 1 0 0 0 0 2 1 1 0 0 0 2 0h2a1 1 0 0 0 2 0 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcSkating.displayName = 'IcSkating';
