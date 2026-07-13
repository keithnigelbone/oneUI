import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNature = forwardRef<SVGSVGElement, IconComponentProps>(function IcNature(
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
            d="M17.89 9.11q.109-.55.11-1.11A6 6 0 1 0 6 8q.002.56.11 1.11A4 4 0 0 0 7 17h4v3H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-2v-3h4a4 4 0 0 0 .89-7.89"
          />
    </svg>
  );
});

IcNature.displayName = 'IcNature';
