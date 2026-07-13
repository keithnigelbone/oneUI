import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPuzzle = forwardRef<SVGSVGElement, IconComponentProps>(function IcPuzzle(
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
            d="M20 10a2.2 2.2 0 0 0-.63.1A1 1 0 0 1 18 9.2V7a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2.2a1 1 0 0 0 .9-1.37 2 2 0 1 1 3.8 0 1 1 0 0 0 .9 1.37H15a3 3 0 0 0 3-3v-2.2a1 1 0 0 1 1.37-.9q.308.097.63.1a2 2 0 0 0 0-4"
          />
    </svg>
  );
});

IcPuzzle.displayName = 'IcPuzzle';
