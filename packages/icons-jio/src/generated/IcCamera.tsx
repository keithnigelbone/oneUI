import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCamera = forwardRef<SVGSVGElement, IconComponentProps>(function IcCamera(
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
            d="M19 7h-.9a1 1 0 0 1-.84-.47l-1-1.6a2 2 0 0 0-1.7-.93H9.44a2 2 0 0 0-1.69.93l-1 1.6A1 1 0 0 1 5.9 7H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3m-7 9a3 3 0 1 1 0-5.999A3 3 0 0 1 12 16"
          />
    </svg>
  );
});

IcCamera.displayName = 'IcCamera';
