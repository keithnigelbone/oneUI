import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhoto = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhoto(
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
            d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 9.09-2.79-2.8a1 1 0 0 0-1.42 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.42 0L5 15.09V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcPhoto.displayName = 'IcPhoto';
