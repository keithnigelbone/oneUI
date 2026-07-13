import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhotoAdd = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhotoAdd(
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
            d="M20 10a1 1 0 0 0-1 1v1.09l-2.79-2.8a1 1 0 0 0-1.42 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.42 0L5 15.09V6a1 1 0 0 1 1-1h7a1 1 0 1 0 0-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a1 1 0 0 0-1-1M7 8.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m14-4.38h-1.12V3a1 1 0 0 0-2 0v1.12h-1.12a1 1 0 1 0 0 2h1.12v1.12a1 1 0 0 0 1 1 1 1 0 0 0 .71-.24 1 1 0 0 0 .29-.71V6.12H21a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcPhotoAdd.displayName = 'IcPhotoAdd';
