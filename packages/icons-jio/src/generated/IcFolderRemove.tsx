import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFolderRemove = forwardRef<SVGSVGElement, IconComponentProps>(function IcFolderRemove(
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
            d="M21.12 6.88A3 3 0 0 0 19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-.88-2.12M14 14h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFolderRemove.displayName = 'IcFolderRemove';
