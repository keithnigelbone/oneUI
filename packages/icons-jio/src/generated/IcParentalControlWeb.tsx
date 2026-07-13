import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcParentalControlWeb = forwardRef<SVGSVGElement, IconComponentProps>(function IcParentalControlWeb(
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
            d="M16 16a4 4 0 0 1-4-4v-1H2v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1.55a4 4 0 0 1-2 .55zm-4-9a6 6 0 0 1 .81-3H5a3 3 0 0 0-3 3v2h10zM5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m13-1.72V6a3 3 0 0 0-6 0v.27A2 2 0 0 0 14 8v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8a2 2 0 0 0-1-1.72M18 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-5a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcParentalControlWeb.displayName = 'IcParentalControlWeb';
