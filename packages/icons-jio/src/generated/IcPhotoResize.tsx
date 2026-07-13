import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhotoResize = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhotoResize(
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
            d="M9 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m9-10H6a3 3 0 0 0-3 3v5.56A3.9 3.9 0 0 1 5 11h4a4 4 0 0 1 4 4v4a3.9 3.9 0 0 1-.56 2H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 6a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L15.59 7H15a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </svg>
  );
});

IcPhotoResize.displayName = 'IcPhotoResize';
