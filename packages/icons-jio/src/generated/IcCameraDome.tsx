import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCameraDome = forwardRef<SVGSVGElement, IconComponentProps>(function IcCameraDome(
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
            d="M12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-2H5zM16 2H8a3 3 0 0 0-3 3v9h14V5a3 3 0 0 0-3-3m-4 9a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11"
          />
    </svg>
  );
});

IcCameraDome.displayName = 'IcCameraDome';
