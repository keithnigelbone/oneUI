import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHandLuggage = forwardRef<SVGSVGElement, IconComponentProps>(function IcHandLuggage(
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
            d="M16 6V5a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v8a3 3 0 0 0 2 2.82V21a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1.18A3 3 0 0 0 19 17V9a3 3 0 0 0-3-3m-6 10a1 1 0 1 1-2 0v-6a1 1 0 0 1 2 0zm0-11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4zm6 11a1 1 0 0 1-2 0v-6a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcHandLuggage.displayName = 'IcHandLuggage';
