import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobile = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobile(
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
            d="M15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 18a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"
          />
    </svg>
  );
});

IcMobile.displayName = 'IcMobile';
