import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHotspot = forwardRef<SVGSVGElement, IconComponentProps>(function IcHotspot(
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
            d="M16 14H8a3 3 0 0 0-3 3v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a3 3 0 0 0-3-3m-.82-4.4a1 1 0 1 0 1.6-1.2 6 6 0 0 0-9.56 0 1 1 0 0 0 1.6 1.2 4 4 0 0 1 6.36 0m4.26-4.27a10 10 0 0 0-14.88 0 1.002 1.002 0 0 0 1.49 1.34 8 8 0 0 1 11.9 0 1 1 0 0 0 .75.33 1 1 0 0 0 .66-.26 1 1 0 0 0 .08-1.41M11 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0"
          />
    </svg>
  );
});

IcHotspot.displayName = 'IcHotspot';
