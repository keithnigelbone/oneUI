import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCategoriesSub = forwardRef<SVGSVGElement, IconComponentProps>(function IcCategoriesSub(
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
            d="M12 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m-1-8h9a1 1 0 1 0 0-2h-9a1 1 0 1 0 0 2M8 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm12 2h-9a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2m0 6h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2m0 4h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCategoriesSub.displayName = 'IcCategoriesSub';
