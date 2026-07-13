import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBeauty = forwardRef<SVGSVGElement, IconComponentProps>(function IcBeauty(
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
            d="M18 11h-2a3 3 0 0 0-3 3v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a3 3 0 0 0-3-3m-8-7a1 1 0 0 0-.55-.89 1 1 0 0 0-1 .09l-4 3A1 1 0 0 0 4 7v4h6zm0 9H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcBeauty.displayName = 'IcBeauty';
