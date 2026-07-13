import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic4K = forwardRef<SVGSVGElement, IconComponentProps>(function Ic4K(
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
            d="M21.12 4.88A3 3 0 0 0 19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12M10.75 14v1a1 1 0 0 1-2 0v-1h-2.5a1 1 0 0 1-.99-1.12l.5-4a1.007 1.007 0 0 1 2 .24L7.38 12h1.37v-1a1 1 0 1 1 2 0v1a1 1 0 0 1 0 2m7.82.43a1 1 0 0 1-1.64 1.14l-1.48-2.1-.7.88V15a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0v2.15L17 8.38a1 1 0 0 1 1.56 1.24l-1.77 2.22z"
          />
    </svg>
  );
});

Ic4K.displayName = 'Ic4K';
