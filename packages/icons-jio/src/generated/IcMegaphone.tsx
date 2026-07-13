import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMegaphone = forwardRef<SVGSVGElement, IconComponentProps>(function IcMegaphone(
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
            d="M21 4a1 1 0 0 0-1 1v.5L4 10a1 1 0 0 0-2 0v4a1 1 0 1 0 2 0l3 .85A1 1 0 0 0 7 15a4 4 0 0 0 7.47 2L20 18.5v.5a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1M11 17a2 2 0 0 1-1.95-1.58l3.4 1A2 2 0 0 1 11 17"
          />
    </svg>
  );
});

IcMegaphone.displayName = 'IcMegaphone';
