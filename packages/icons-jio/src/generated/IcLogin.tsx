import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLogin = forwardRef<SVGSVGElement, IconComponentProps>(function IcLogin(
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
            d="M10.29 14.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l3-3a1 1 0 0 0 0-1.42l-3-3a1.004 1.004 0 0 0-1.42 1.42l1.3 1.29H3a1 1 0 0 0 0 2h8.59zM12 2a10.06 10.06 0 0 0-8.09 4.13 1 1 0 0 0 .575 1.565A1 1 0 0 0 5.53 7.31a8 8 0 1 1 0 9.38 1.002 1.002 0 1 0-1.62 1.18A10 10 0 1 0 12 2"
          />
    </svg>
  );
});

IcLogin.displayName = 'IcLogin';
