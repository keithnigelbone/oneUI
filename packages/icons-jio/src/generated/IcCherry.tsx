import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCherry = forwardRef<SVGSVGElement, IconComponentProps>(function IcCherry(
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
            d="M16.73 11a4.4 4.4 0 0 0-1.27.21L12.38 5h1.9a1 1 0 1 0 0-2h-7a1 1 0 0 0 0 2H9.4L7 12.5a4.25 4.25 0 1 0 2 .35l2-6.19 2.76 5.58a4.26 4.26 0 1 0 3-1.23z"
          />
    </svg>
  );
});

IcCherry.displayName = 'IcCherry';
