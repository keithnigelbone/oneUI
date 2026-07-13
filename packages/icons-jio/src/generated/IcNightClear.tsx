import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNightClear = forwardRef<SVGSVGElement, IconComponentProps>(function IcNightClear(
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
            d="M14.94 8.24c-.5 3.43-3.28 6.2-6.7 6.7-1.74.26-3.38-.05-4.79-.76-.87-.44-1.77.49-1.34 1.35 1.74 3.45 5.42 5.76 9.61 5.48 4.91-.33 8.96-4.37 9.29-9.29a9.98 9.98 0 0 0-5.48-9.61c-.87-.44-1.79.47-1.35 1.34.71 1.41 1.02 3.05.76 4.79"
          />
    </svg>
  );
});

IcNightClear.displayName = 'IcNightClear';
