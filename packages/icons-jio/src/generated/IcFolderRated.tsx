import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFolderRated = forwardRef<SVGSVGElement, IconComponentProps>(function IcFolderRated(
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
            d="M19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3m-3.62 6.49-1.07 1 .25 1.51a.85.85 0 0 1-1.24.9L12 15.21l-1.32.69a.85.85 0 0 1-1.24-.9l.25-1.47-1.07-1A.86.86 0 0 1 9.1 11l1.47-.22.66-1.33a.86.86 0 0 1 1.54 0l.66 1.33 1.47.22a.86.86 0 0 1 .48 1.49"
          />
    </svg>
  );
});

IcFolderRated.displayName = 'IcFolderRated';
