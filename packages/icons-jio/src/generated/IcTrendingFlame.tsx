import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrendingFlame = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrendingFlame(
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
            d="M15.62 6.54C14 5.17 13 4.27 13 3a1 1 0 0 0-.62-.92 1 1 0 0 0-1.09.21c-.1.11-2.48 2.57-.18 7.16a1.53 1.53 0 0 1-.1 1.83 1.09 1.09 0 0 1-1.25.25c-.56-.28-1.07-1.32-.76-3.39a1 1 0 0 0-1.54-1A8.44 8.44 0 0 0 4 14a7.83 7.83 0 0 0 8 8 7.83 7.83 0 0 0 8-8c0-3.77-2.43-5.82-4.38-7.46"
          />
    </svg>
  );
});

IcTrendingFlame.displayName = 'IcTrendingFlame';
