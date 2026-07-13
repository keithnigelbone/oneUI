import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcViewTile = forwardRef<SVGSVGElement, IconComponentProps>(function IcViewTile(
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
            d="M20 19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2m0-4H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M18 3H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcViewTile.displayName = 'IcViewTile';
