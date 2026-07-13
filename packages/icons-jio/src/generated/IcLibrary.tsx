import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLibrary = forwardRef<SVGSVGElement, IconComponentProps>(function IcLibrary(
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
            d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2m11.88 15.32L17.09 5.16a2.001 2.001 0 0 0-3.76 1.37l4.79 13.15a2 2 0 1 0 3.76-1.36"
          />
    </svg>
  );
});

IcLibrary.displayName = 'IcLibrary';
