import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBiography = forwardRef<SVGSVGElement, IconComponentProps>(function IcBiography(
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
            d="M21 13V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v11.5A3.5 3.5 0 0 0 6.5 21H20a1 1 0 0 0 0-2h-1v-3.18A3 3 0 0 0 21 13m-4 6H6.5a1.5 1.5 0 1 1 0-3H17z"
          />
    </svg>
  );
});

IcBiography.displayName = 'IcBiography';
