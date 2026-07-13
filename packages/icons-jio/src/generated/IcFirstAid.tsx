import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFirstAid = forwardRef<SVGSVGElement, IconComponentProps>(function IcFirstAid(
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
            d="M19 7h-2V6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-5 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2M9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9z"
          />
    </svg>
  );
});

IcFirstAid.displayName = 'IcFirstAid';
