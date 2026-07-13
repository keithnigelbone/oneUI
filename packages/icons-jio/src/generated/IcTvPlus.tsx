import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTvPlus = forwardRef<SVGSVGElement, IconComponentProps>(function IcTvPlus(
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
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m6.41-13.41A2 2 0 0 0 20 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-.59-1.41m-1.7 5.12A1 1 0 0 1 19 11h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V8a1 1 0 0 1 2 0v1h1a1 1 0 0 1 .71 1.71"
          />
    </svg>
  );
});

IcTvPlus.displayName = 'IcTvPlus';
