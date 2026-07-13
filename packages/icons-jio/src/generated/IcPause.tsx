import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPause = forwardRef<SVGSVGElement, IconComponentProps>(function IcPause(
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
            d="M8.5 4A1.5 1.5 0 0 0 7 5.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 8.5 4m7 0A1.5 1.5 0 0 0 14 5.5v13a1.5 1.5 0 1 0 3 0v-13A1.5 1.5 0 0 0 15.5 4"
          />
    </svg>
  );
});

IcPause.displayName = 'IcPause';
