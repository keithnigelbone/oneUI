import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcProfile = forwardRef<SVGSVGElement, IconComponentProps>(function IcProfile(
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
            fillRule="evenodd"
            d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
            clipRule="evenodd"
          />
    </svg>
  );
});

IcProfile.displayName = 'IcProfile';
