import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSavings = forwardRef<SVGSVGElement, IconComponentProps>(function IcSavings(
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
            d="M7.92 5h8.16l.8-1.53A1 1 0 0 0 16 2h-2a1 1 0 0 0-.68.27L12.5 3l-.82-.76A1 1 0 0 0 11 2H8a1 1 0 0 0-.88 1.47zm8.26 2H7.82A9.9 9.9 0 0 0 4 15c0 .07.09 7 8 7s8-6.93 8-7a9.9 9.9 0 0 0-3.82-8m-1.68 6a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 14.5 18a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 14h1a1 1 0 1 0 0-2h-2a1 1 0 1 1 0-2h5a1 1 0 1 1 0 2h-.18c.117.32.177.659.18 1"
          />
    </svg>
  );
});

IcSavings.displayName = 'IcSavings';
