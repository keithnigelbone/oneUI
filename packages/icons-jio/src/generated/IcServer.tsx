import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcServer = forwardRef<SVGSVGElement, IconComponentProps>(function IcServer(
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
            d="M6 11h12a4 4 0 1 0 0-8H6a4 4 0 0 0 0 8m0-5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M18 13H6a4 4 0 1 0 0 8h12a4 4 0 1 0 0-8M6 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcServer.displayName = 'IcServer';
