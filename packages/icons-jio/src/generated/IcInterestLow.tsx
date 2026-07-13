import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInterestLow = forwardRef<SVGSVGElement, IconComponentProps>(function IcInterestLow(
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
            d="M16 16.008a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-2 0v.59l-3.29-3.3a1 1 0 0 0-1.42 0L12 12.588l-7.21-9.2a.7.7 0 0 0-.16-.13.5.5 0 0 0-.15-.1 1 1 0 0 0-.17-.06H4l-.12-.09a.7.7 0 0 0-.2 0 .7.7 0 0 0-.19.09h-.11a.7.7 0 0 0-.13.16.5.5 0 0 0-.1.15 1 1 0 0 0-.06.17 1.4 1.4 0 0 0 0 .2l-.09.23v16a1 1 0 0 0 1 1h16a1 1 0 1 0 0-2H5V6.898l6.13 7.81a1 1 0 0 0 .73.38 1 1 0 0 0 .77-.29l2.37-2.38 2.59 2.59H17a1 1 0 0 0-1 1"
          />
    </svg>
  );
});

IcInterestLow.displayName = 'IcInterestLow';
