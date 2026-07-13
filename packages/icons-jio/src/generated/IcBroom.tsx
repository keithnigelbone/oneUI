import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBroom = forwardRef<SVGSVGElement, IconComponentProps>(function IcBroom(
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
            d="M2.84 12a1 1 0 0 0-.55 1.7l1 1A1 1 0 0 0 4 15h1v1a1 1 0 0 0 .29.71l5 5a1 1 0 0 0 1.02.24 1 1 0 0 0 .68-.79l.7-4.23-5.62-5.62zm18.57-9.41a2 2 0 0 0-2.82 0l-7.3 7.29-.58-.59a1.004 1.004 0 1 0-1.42 1.42l4 4a1.002 1.002 0 0 0 1.64-.326 1 1 0 0 0-.22-1.094l-.59-.58 7.29-7.3a2 2 0 0 0 0-2.82"
          />
    </svg>
  );
});

IcBroom.displayName = 'IcBroom';
