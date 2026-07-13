import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFemale = forwardRef<SVGSVGElement, IconComponentProps>(function IcFemale(
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
            d="M16 16h-3v-2.09a6 6 0 1 0-2 0V16H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 1 0 0-2M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0"
          />
    </svg>
  );
});

IcFemale.displayName = 'IcFemale';
