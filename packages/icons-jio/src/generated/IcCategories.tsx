import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCategories = forwardRef<SVGSVGElement, IconComponentProps>(function IcCategories(
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
            d="M11 6h9a1 1 0 1 0 0-2h-9a1 1 0 1 0 0 2M6 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 10H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m14-6h-9a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2m0 6h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2m0 4h-9a1 1 0 0 0 0 2h9a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCategories.displayName = 'IcCategories';
