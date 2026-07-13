import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFashionChild = forwardRef<SVGSVGElement, IconComponentProps>(function IcFashionChild(
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
            d="m20.89 4.21-4-2A1.94 1.94 0 0 0 16 2h-.12a1.35 1.35 0 0 0-1.19.8 3 3 0 0 1-5.38 0A1.35 1.35 0 0 0 8.12 2H8a2 2 0 0 0-.9.21l-4 2a2 2 0 0 0-1 2.42l1 3a2 2 0 0 0 2.39 1.31L7 10.56V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1a2 2 0 0 1 2-2 1 1 0 0 0 1-1v-6.44l1.51.38a2 2 0 0 0 2.39-1.31l1-3a2 2 0 0 0-1.01-2.42"
          />
    </svg>
  );
});

IcFashionChild.displayName = 'IcFashionChild';
