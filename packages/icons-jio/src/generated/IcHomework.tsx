import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHomework = forwardRef<SVGSVGElement, IconComponentProps>(function IcHomework(
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
            d="M3 5v14a2 2 0 0 0 2 2h1V3H5a2 2 0 0 0-2 2m16-2H8v18h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-2 7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcHomework.displayName = 'IcHomework';
