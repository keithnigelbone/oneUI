import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBeamer = forwardRef<SVGSVGElement, IconComponentProps>(function IcBeamer(
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
            d="M19 7a4.94 4.94 0 0 0-8 0H5a3 3 0 0 0-3 3v4a3 3 0 0 0 2 2.82V18a1 1 0 1 0 2 0v-1h11v1a1 1 0 0 0 2 0v-1a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3m-4 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </svg>
  );
});

IcBeamer.displayName = 'IcBeamer';
