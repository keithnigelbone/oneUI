import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcClauset = forwardRef<SVGSVGElement, IconComponentProps>(function IcClauset(
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
            d="M4 4v14a2 2 0 0 0 2 2v1a1 1 0 1 0 2 0v-1h3V2H6a2 2 0 0 0-2 2m4 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2m10-8h-5v18h3v1a1 1 0 0 0 2 0v-1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-2 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcClauset.displayName = 'IcClauset';
