import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLcvTop = forwardRef<SVGSVGElement, IconComponentProps>(function IcLcvTop(
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
            d="M18.45 6.11 17 5.38V4.5a1 1 0 0 0-.17-.5c-.13-.25-1.39-2-4.83-2S7.3 3.75 7.17 4a1 1 0 0 0-.17.5v.88l-1.45.73A1 1 0 0 0 6 8a.93.93 0 0 0 .45-.11L7 7.62v.14l-.79 1.58a2 2 0 0 0-.21.9V19a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-8.76a2 2 0 0 0-.21-.9L17 7.76v-.14l.55.27A.93.93 0 0 0 18 8a1 1 0 0 0 .45-1.89M10.67 4h2.66A1.67 1.67 0 0 1 15 5.67a.33.33 0 0 1-.33.33H9.33A.33.33 0 0 1 9 5.67 1.67 1.67 0 0 1 10.67 4m3.83 8h-5A1.5 1.5 0 0 1 8 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5 1.5 1.5 0 0 1-1.5 1.5"
          />
    </svg>
  );
});

IcLcvTop.displayName = 'IcLcvTop';
